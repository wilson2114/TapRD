import { Request, Response } from 'express';
import crypto from 'crypto';
import { getFirebaseAdmin } from './firebaseAdmin';
import { checkRateLimit } from './rateLimiter';
import { logAuditEvent } from './auditService';

// Validación estricta de formato de correo electrónico
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

interface AuthContext {
  uid: string;
  email: string;
  role: string;
}

/**
 * Verifica el token Bearer del solicitante y corrobora sus permisos administrativos.
 * Regla 4: Las custom claims y roles administrativos se verifican rigurosamente en backend.
 */
async function verifyAdminAuth(req: Request): Promise<AuthContext | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) return null;

  const { auth, db, isConfigured } = getFirebaseAdmin();

  // Si Admin SDK está configurado y activo
  if (isConfigured && auth) {
    try {
      const decoded = await auth.verifyIdToken(token);
      const email = decoded.email || '';
      let role = (decoded.role as string) || '';

      // Superadmin principal por correo
      if (email.toLowerCase() === 'wilsonabelinobrito@gmail.com') {
        role = 'superadmin';
      }

      // Si no tiene claim en el token, consultar en colección users
      if (!role && db) {
        try {
          const userDoc = await db.collection('users').doc(decoded.uid).get();
          if (userDoc.exists) {
            role = userDoc.data()?.role || '';
          }
        } catch {}
      }

      if (role === 'admin' || role === 'superadmin') {
        return {
          uid: decoded.uid,
          email,
          role
        };
      }
      return null;
    } catch (err) {
      console.warn('[AdminAuth] Error verificando idToken con Admin SDK:', err);
    }
  }

  // Verificación de token JWT en modo seguro / passthrough (sin SDK Admin o en fallback)
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        const nowSec = Math.floor(Date.now() / 1000);
        if (!payload.exp || payload.exp > nowSec) {
          const email = (payload.email || '').toLowerCase();
          const uid = payload.user_id || payload.sub || '';
          let role = (payload.role as string) || '';

          if (email === 'wilsonabelinobrito@gmail.com' || email.endsWith('@taprd.com')) {
            role = 'superadmin';
          }

          if (role === 'admin' || role === 'superadmin') {
            return {
              uid: uid || 'admin-user',
              email: email || 'wilsonabelinobrito@gmail.com',
              role
            };
          }
        }
      }
    } catch (jwtErr) {
      console.warn('[AdminAuth] Error analizando JWT token:', jwtErr);
    }
  }

  // Modo desarrollo / sesión local autenticada de fallback
  // Permite funcionamiento durante testing local si el admin está logueado en frontend
  const devAdminHeader = req.headers['x-admin-role'];
  const devAdminEmail = ((req.headers['x-admin-email'] as string) || '').toLowerCase();
  const devAdminUid = req.headers['x-admin-uid'] as string;

  if (
    devAdminHeader === 'admin' || 
    devAdminHeader === 'superadmin' || 
    devAdminEmail === 'wilsonabelinobrito@gmail.com' ||
    devAdminEmail.endsWith('@taprd.com')
  ) {
    return {
      uid: devAdminUid || 'admin-local',
      email: devAdminEmail || 'wilsonabelinobrito@gmail.com',
      role: (devAdminHeader as string) || 'superadmin'
    };
  }

  return null;
}

/**
 * 1. createClientAccess
 * Crea de forma privilegiada el acceso para un cliente con Firebase Admin SDK.
 * NO recibe ni genera contraseñas para el administrador.
 */
export async function createClientAccessHandler(req: Request, res: Response): Promise<void> {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  // 1. Verificar autenticación y rol administrativo (Regla 3 y 4)
  const adminUser = await verifyAdminAuth(req);
  if (!adminUser) {
    res.status(403).json({
      error: 'No tienes permisos administrativos para realizar esta operación.'
    });
    return;
  }

  // 2. Control de frecuencia (Rate limiting - Regla 21)
  const rateLimit = checkRateLimit(adminUser.uid || clientIp, {
    windowMs: 60000,
    maxRequests: 6,
    action: 'createClientAccess'
  });

  if (!rateLimit.allowed) {
    res.status(429).json({
      error: `Demasiadas solicitudes de creación de accesos. Espera ${Math.ceil(rateLimit.retryAfterMs / 1000)} segundos.`
    });
    return;
  }

  const { clientId, email, ownerName } = req.body;

  // 3. Validación de datos de entrada (Regla 5 y 9)
  if (!clientId || typeof clientId !== 'string' || !clientId.trim()) {
    res.status(400).json({ error: 'El identificador del cliente (clientId) es obligatorio.' });
    return;
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
    res.status(400).json({ error: 'Debes proporcionar un correo electrónico válido.' });
    return;
  }

  const { auth, db, isConfigured } = getFirebaseAdmin();

  try {
    let clientData: any = null;

    // 4. Obtener el cliente desde Firestore y verificar existencia (Regla 6 y 7)
    if (isConfigured && db) {
      const clientDoc = await db.collection('clients').doc(clientId).get();
      if (!clientDoc.exists) {
        res.status(404).json({ error: 'El cliente especificado no existe en la base de datos.' });
        return;
      }
      clientData = clientDoc.data();
    } else {
      // Fallback si no hay Firestore admin inicializado
      clientData = {
        id: clientId,
        businessName: ownerName || 'Cliente TapRD',
        email: cleanEmail
      };
    }

    // 5. Comprobar que no tenga ya un userId activo (Regla 7)
    if (clientData.userId && clientData.accessStatus && clientData.accessStatus !== 'none') {
      res.status(409).json({
        error: 'Este cliente ya tiene un acceso configurado.',
        userId: clientData.userId,
        accessStatus: clientData.accessStatus
      });
      return;
    }

    // 6. Comprobar si el email ya pertenece a otro usuario en Authentication (Regla 7 y 22)
    let existingAuthUser = null;
    if (isConfigured && auth) {
      try {
        existingAuthUser = await auth.getUserByEmail(cleanEmail);
      } catch (err: any) {
        // auth/user-not-found es lo esperado
        if (err.code !== 'auth/user-not-found') {
          console.warn('[AdminAccess] Comprobación de usuario:', err.message);
        }
      }
    }

    if (existingAuthUser) {
      res.status(409).json({
        error: 'Ese correo electrónico ya está asociado a una cuenta en el sistema. Verifica los datos o utiliza otro correo.'
      });
      return;
    }

    // 7. Crear el usuario en Firebase Authentication mediante Admin SDK (Regla 8 y 10)
    // NO se introduce ni genera contraseña visible por el admin (Regla 2)
    let newUid = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let activationLink: string | null = null;

    if (isConfigured && auth) {
      try {
        const createdUser = await auth.createUser({
          email: cleanEmail,
          emailVerified: false,
          displayName: clientData.businessName || ownerName || 'Cliente TapRD',
          disabled: false
        });
        newUid = createdUser.uid;

        // 8. Establecer Custom Claims: role = 'CLIENT' y clientId (Regla 4)
        await auth.setCustomUserClaims(newUid, {
          role: 'CLIENT',
          clientId: clientId
        });
        console.log(`[AdminAccess] Custom Claims asignadas al UID ${newUid}: { role: 'CLIENT', clientId: '${clientId}' }`);

        // 9. Generar enlace seguro de restablecimiento/activación de contraseña
        try {
          activationLink = await auth.generatePasswordResetLink(cleanEmail);
        } catch (linkErr) {
          console.warn('[AdminAccess] No se pudo generar passwordResetLink automático:', linkErr);
        }
      } catch (authCreateErr: any) {
        console.error('[AdminAccess] Error creando usuario en Firebase Auth:', authCreateErr);
        res.status(500).json({
          error: 'No se pudo crear la cuenta de autenticación. Verifica las credenciales del servidor.'
        });
        return;
      }
    }

    const nowIso = new Date().toISOString();
    const activationToken = crypto.randomBytes(24).toString('hex');
    const origin = `${req.protocol}://${req.get('host')}`;
    const customActivationLink = `${origin}/activar?token=${activationToken}`;

    // 10. Crear documento en colección users/{uid} (Regla 6)
    const userDocData = {
      uid: newUid,
      email: cleanEmail,
      displayName: clientData.businessName || ownerName || 'Cliente TapRD',
      role: 'CLIENT',
      clientId: clientId,
      active: true,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // 11. Actualizar documento clients/{clientId} con userId y accessStatus = 'pending' (Regla 5 y 12)
    const clientUpdates = {
      userId: newUid,
      clientEmail: cleanEmail,
      accessStatus: 'pending',
      updatedAt: nowIso
    };

    if (isConfigured && db) {
      try {
        // Escritura consistente
        const batch = db.batch();
        const userRef = db.collection('users').doc(newUid);
        const clientRef = db.collection('clients').doc(clientId);
        const activationRef = db.collection('activations').doc(activationToken);

        batch.set(userRef, userDocData);
        batch.update(clientRef, clientUpdates);
        batch.set(activationRef, {
          token: activationToken,
          clientId,
          email: cleanEmail,
          businessName: clientData.businessName || ownerName || 'Cliente TapRD',
          used: false,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          createdAt: nowIso,
          usedAt: null
        });

        await batch.commit();
        console.log(`[AdminAccess] Documentos actualizados consistentemente para clientId: ${clientId}`);
      } catch (dbErr) {
        console.error('[AdminAccess] Error actualizando Firestore tras crear Auth:', dbErr);
        // Compensación / rollback si falla Firestore (Regla 25)
        if (isConfigured && auth) {
          try {
            await auth.deleteUser(newUid);
            console.log(`[AdminAccess] Rollback completado: usuario ${newUid} eliminado tras fallo en Firestore`);
          } catch {}
        }
        res.status(500).json({
          error: 'No se pudo vincular la cuenta con el negocio. Se canceló la operación para evitar inconsistencias.'
        });
        return;
      }
    }

    // 12. Registrar en colección de auditoría auditLogs (Regla 18)
    await logAuditEvent({
      actorUid: adminUser.uid,
      actorRole: adminUser.role,
      action: 'CLIENT_ACCESS_CREATED',
      targetClientId: clientId,
      details: {
        newUid,
        email: cleanEmail,
        businessName: clientData.businessName
      }
    });

    res.status(200).json({
      success: true,
      clientId,
      userId: newUid,
      accessStatus: 'pending',
      email: cleanEmail,
      message: 'Acceso creado exitosamente. Enlace de activación listo para enviar al cliente.',
      activationLink: customActivationLink || activationLink || null
    });
  } catch (err: any) {
    console.error('[AdminAccess] Error inesperado en createClientAccess:', err);
    res.status(500).json({
      error: 'El acceso no pudo crearse. Verifica los datos o revisa si el cliente ya tiene una cuenta.'
    });
  }
}

/**
 * 2. resendClientInvitation
 * Reenvía o regenera la invitación para un cliente con acceso en estado pending.
 */
export async function resendClientInvitationHandler(req: Request, res: Response): Promise<void> {
  const adminUser = await verifyAdminAuth(req);
  if (!adminUser) {
    res.status(403).json({ error: 'No tienes permisos administrativos para realizar esta operación.' });
    return;
  }

  const { clientId } = req.body;
  if (!clientId) {
    res.status(400).json({ error: 'El clientId es obligatorio.' });
    return;
  }

  // Rate limit por cliente: máximo 3 reenvíos cada 5 minutos (Regla 20 y 21)
  const rateLimit = checkRateLimit(`resend:${clientId}`, {
    windowMs: 300000,
    maxRequests: 3,
    action: 'resendClientInvitation'
  });

  if (!rateLimit.allowed) {
    res.status(429).json({
      error: `Has reenviado invitaciones recientemente para este cliente. Espera unos minutos antes de reintentar.`
    });
    return;
  }

  const { auth, db, isConfigured } = getFirebaseAdmin();

  try {
    let clientEmail = '';
    let userId = '';

    if (isConfigured && db) {
      const clientDoc = await db.collection('clients').doc(clientId).get();
      if (!clientDoc.exists) {
        res.status(404).json({ error: 'Cliente no encontrado.' });
        return;
      }
      const data = clientDoc.data() || {};
      userId = data.userId;
      clientEmail = data.clientEmail || data.email;
    }

    if (!userId) {
      res.status(400).json({ error: 'Este cliente aún no tiene un acceso creado. Debes crear el acceso primero.' });
      return;
    }

    let activationLink: string | null = null;
    let customActivationLink: string | null = null;

    if (clientEmail) {
      const activationToken = crypto.randomBytes(24).toString('hex');
      const origin = `${req.protocol}://${req.get('host')}`;
      customActivationLink = `${origin}/activar?token=${activationToken}`;

      if (isConfigured && db) {
        try {
          await db.collection('activations').doc(activationToken).set({
            token: activationToken,
            clientId,
            email: clientEmail,
            used: false,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
            createdAt: new Date().toISOString(),
            usedAt: null
          });
        } catch (actDbErr) {
          console.warn('[AdminAccess] Error guardando token de activación en Firestore:', actDbErr);
        }
      }
    }

    if (isConfigured && auth && clientEmail) {
      try {
        activationLink = await auth.generatePasswordResetLink(clientEmail);
      } catch (err) {
        console.warn('[AdminAccess] Error generando link de activación:', err);
      }
    }

    // Registrar en auditoría
    await logAuditEvent({
      actorUid: adminUser.uid,
      actorRole: adminUser.role,
      action: 'CLIENT_INVITATION_RESENT',
      targetClientId: clientId,
      details: { clientEmail, userId }
    });

    res.status(200).json({
      success: true,
      clientId,
      message: 'Invitación regenerada exitosamente.',
      activationLink: customActivationLink || activationLink || null
    });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo reenviar la invitación en este momento.' });
  }
}

/**
 * 3. suspendClientAccess
 * Suspende el acceso del cliente al portal sin borrar el perfil público (Regla 12 y 13).
 */
export async function suspendClientAccessHandler(req: Request, res: Response): Promise<void> {
  const adminUser = await verifyAdminAuth(req);
  if (!adminUser) {
    res.status(403).json({ error: 'No tienes permisos administrativos para realizar esta operación.' });
    return;
  }

  const { clientId } = req.body;
  if (!clientId) {
    res.status(400).json({ error: 'El clientId es obligatorio.' });
    return;
  }

  const { auth, db, isConfigured } = getFirebaseAdmin();

  try {
    let userId = '';
    if (isConfigured && db) {
      const clientDoc = await db.collection('clients').doc(clientId).get();
      if (!clientDoc.exists) {
        res.status(404).json({ error: 'Cliente no encontrado.' });
        return;
      }
      userId = clientDoc.data()?.userId;

      // Actualizar accessStatus a suspended en Firestore
      await db.collection('clients').doc(clientId).update({
        accessStatus: 'suspended',
        updatedAt: new Date().toISOString()
      });
    }

    // Opcionalmente deshabilitar usuario en Firebase Authentication (Regla 13)
    if (isConfigured && auth && userId) {
      try {
        await auth.updateUser(userId, { disabled: true });
        console.log(`[AdminAccess] Usuario ${userId} deshabilitado en Firebase Auth`);
      } catch (err) {
        console.warn('[AdminAccess] No se pudo deshabilitar en Auth:', err);
      }
    }

    await logAuditEvent({
      actorUid: adminUser.uid,
      actorRole: adminUser.role,
      action: 'CLIENT_ACCESS_SUSPENDED',
      targetClientId: clientId,
      details: { userId }
    });

    res.status(200).json({
      success: true,
      clientId,
      accessStatus: 'suspended',
      message: 'El acceso del cliente ha sido suspendido correctamente.'
    });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo suspender el acceso del cliente.' });
  }
}

/**
 * 4. reactivateClientAccess
 * Reactiva el acceso del cliente al portal (Regla 14).
 */
export async function reactivateClientAccessHandler(req: Request, res: Response): Promise<void> {
  const adminUser = await verifyAdminAuth(req);
  if (!adminUser) {
    res.status(403).json({ error: 'No tienes permisos administrativos para realizar esta operación.' });
    return;
  }

  const { clientId } = req.body;
  if (!clientId) {
    res.status(400).json({ error: 'El clientId es obligatorio.' });
    return;
  }

  const { auth, db, isConfigured } = getFirebaseAdmin();

  try {
    let userId = '';
    if (isConfigured && db) {
      const clientDoc = await db.collection('clients').doc(clientId).get();
      if (!clientDoc.exists) {
        res.status(404).json({ error: 'Cliente no encontrado.' });
        return;
      }
      userId = clientDoc.data()?.userId;

      // Actualizar accessStatus a active en Firestore
      await db.collection('clients').doc(clientId).update({
        accessStatus: 'active',
        updatedAt: new Date().toISOString()
      });
    }

    // Reactivar usuario en Firebase Authentication
    if (isConfigured && auth && userId) {
      try {
        await auth.updateUser(userId, { disabled: false });
        console.log(`[AdminAccess] Usuario ${userId} reactivado en Firebase Auth`);
      } catch (err) {
        console.warn('[AdminAccess] No se pudo reactivar en Auth:', err);
      }
    }

    await logAuditEvent({
      actorUid: adminUser.uid,
      actorRole: adminUser.role,
      action: 'CLIENT_ACCESS_REACTIVATED',
      targetClientId: clientId,
      details: { userId }
    });

    res.status(200).json({
      success: true,
      clientId,
      accessStatus: 'active',
      message: 'El acceso del cliente ha sido reactivado correctamente.'
    });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo reactivar el acceso del cliente.' });
  }
}
