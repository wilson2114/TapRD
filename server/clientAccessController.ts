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
function getRequestOrigin(req: Request): string {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto)?.split(',')[0]?.trim() || req.protocol || 'https';
  const forwardedHost = req.headers['x-forwarded-host'];
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost)?.split(',')[0]?.trim() || req.get('host') || 'taprd.com';
  return `${proto}://${host}`;
}

function encodeTokenPayload(payload: { c: string; e: string; b?: string; o?: string; x: number; r: string }): string {
  const json = JSON.stringify(payload);
  const base64 = Buffer.from(json, 'utf8').toString('base64url');
  return `act_${base64}`;
}

function decodeTokenPayload(token: string): any {
  try {
    const clean = (token || '').trim();
    if (!clean.startsWith('act_')) return null;
    const base64 = clean.substring(4);
    const json = Buffer.from(base64, 'base64url').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

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

      if (role === 'admin' || role === 'superadmin' || role === 'ADMIN') {
        return {
          uid: decoded.uid,
          email,
          role
        };
      }
      return null;
    } catch (err) {
      console.warn('[AdminAuth] Token inválido o expirado al verificar con Firebase:', err);
      return null;
    }
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

  const { auth, db, isConfigured, hasServiceAccount } = getFirebaseAdmin();
  if (!isConfigured || !hasServiceAccount || !auth || !db) {
    res.status(503).json({
      error: 'Firebase Admin SDK no cuenta con credenciales de cuenta de servicio en este entorno.',
      code: 'ADMIN_SDK_UNAVAILABLE'
    });
    return;
  }

  try {
    let clientData: any = null;

    // 4. Obtener el cliente desde Firestore y verificar existencia (Regla 6 y 7)
    const clientDoc = await db.collection('clients').doc(clientId).get();
    if (!clientDoc.exists) {
      res.status(404).json({ error: 'El cliente especificado no existe en la base de datos.' });
      return;
    }
    clientData = clientDoc.data();

    // 5. Comprobar si ya tiene un acceso activo (permitir regenerar si estaba en 'none')
    if (clientData.userId && !String(clientData.userId).startsWith('client_') && clientData.accessStatus === 'active') {
      res.status(409).json({
        error: 'Este cliente ya tiene un acceso activo configurado.',
        userId: clientData.userId,
        accessStatus: clientData.accessStatus
      });
      return;
    }

    // 6. Comprobar si el email ya pertenece a otro usuario en Authentication (Regla 7 y 22)
    let existingAuthUser = null;
    try {
      existingAuthUser = await auth.getUserByEmail(cleanEmail);
    } catch (err: any) {
      if (err.code !== 'auth/user-not-found') {
        console.warn('[AdminAccess] Comprobación de usuario:', err.message);
      }
    }

    let newUid = '';
    let activationLink: string | null = null;

    if (existingAuthUser) {
      newUid = existingAuthUser.uid;
      await auth.setCustomUserClaims(newUid, {
        role: 'CLIENT',
        clientId: clientId
      });
    } else {
      try {
        const createdUser = await auth.createUser({
          email: cleanEmail,
          emailVerified: false,
          displayName: clientData.businessName || ownerName || 'Cliente TapRD',
          disabled: false
        });
        newUid = createdUser.uid;

        await auth.setCustomUserClaims(newUid, {
          role: 'CLIENT',
          clientId: clientId
        });
        console.log(`[AdminAccess] Custom Claims asignadas al UID ${newUid}: { role: 'CLIENT', clientId: '${clientId}' }`);
      } catch (authCreateErr: any) {
        console.error('[AdminAccess] Error creando usuario en Firebase Auth:', authCreateErr);
        res.status(503).json({
          error: 'No se pudo crear la cuenta de autenticación desde el servidor.',
          code: 'ADMIN_SDK_UNAVAILABLE'
        });
        return;
      }
    }

    const nowIso = new Date().toISOString();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const activationToken = encodeTokenPayload({
      c: clientId,
      e: cleanEmail,
      b: clientData.businessName || ownerName || 'Cliente TapRD',
      o: ownerName || clientData.businessName,
      x: expiresAt,
      r: crypto.randomBytes(12).toString('hex')
    });
    const origin = getRequestOrigin(req);
    const customActivationLink = `${origin}/activar?token=${encodeURIComponent(activationToken)}&email=${encodeURIComponent(cleanEmail)}`;

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

    // 11. Actualizar documento clients/{clientId} con userId, activationToken y accessStatus = 'pending'
    const clientUpdates = {
      userId: newUid,
      clientEmail: cleanEmail,
      accessStatus: 'pending',
      activationToken,
      updatedAt: nowIso
    };

    try {
      const batch = db.batch();
      const userRef = db.collection('users').doc(newUid);
      const clientRef = db.collection('clients').doc(clientId);
      const activationRef = db.collection('activations').doc(activationToken);

      batch.set(userRef, userDocData, { merge: true });
      batch.update(clientRef, clientUpdates);
      batch.set(activationRef, {
        token: activationToken,
        clientId,
        email: cleanEmail,
        businessName: clientData.businessName || ownerName || 'Cliente TapRD',
        used: false,
        expiresAt,
        createdAt: nowIso,
        usedAt: null
      });

      await batch.commit();
      console.log(`[AdminAccess] Documentos actualizados consistentemente para clientId: ${clientId}`);
    } catch (dbErr) {
      console.error('[AdminAccess] Error actualizando Firestore tras crear Auth:', dbErr);
      if (!existingAuthUser && newUid) {
        try {
          await auth.deleteUser(newUid);
        } catch {}
      }
      res.status(503).json({
        error: 'No se pudo vincular la cuenta en Firestore desde el servidor.',
        code: 'ADMIN_SDK_UNAVAILABLE'
      });
      return;
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
      activationToken,
      message: 'Acceso creado exitosamente. Enlace de activación listo para enviar al cliente.',
      activationLink: customActivationLink || activationLink || null
    });
  } catch (err: any) {
    console.error('[AdminAccess] Error inesperado en createClientAccess:', err);
    res.status(503).json({
      error: 'El acceso no pudo crearse en el servidor. Aplicando respaldo directo.',
      code: 'ADMIN_SDK_UNAVAILABLE'
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

  const { auth, db, isConfigured, hasServiceAccount } = getFirebaseAdmin();
  if (!isConfigured || !hasServiceAccount || !db) {
    res.status(503).json({
      error: 'Admin SDK sin credenciales de servicio.',
      code: 'ADMIN_SDK_UNAVAILABLE'
    });
    return;
  }

  try {
    let clientEmail = '';
    let userId = '';
    let businessName = 'Cliente TapRD';

    const clientDoc = await db.collection('clients').doc(clientId).get();
    if (!clientDoc.exists) {
      res.status(404).json({ error: 'Cliente no encontrado.' });
      return;
    }
    const data = clientDoc.data() || {};
    userId = data.userId || '';
    clientEmail = (data.clientEmail || data.email || '').trim().toLowerCase();
    businessName = data.businessName || 'Cliente TapRD';

    if (!clientEmail) {
      res.status(400).json({ error: 'Este cliente no tiene un correo electrónico configurado.' });
      return;
    }

    let activationLink: string | null = null;
    let customActivationLink: string | null = null;
    let activationToken = typeof req.body.token === 'string' && req.body.token.trim() ? req.body.token.trim() : '';

    if (!activationToken) {
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      activationToken = encodeTokenPayload({
        c: clientId,
        e: clientEmail,
        b: businessName,
        x: expiresAt,
        r: crypto.randomBytes(12).toString('hex')
      });
    }

    const origin = getRequestOrigin(req);
    customActivationLink = `${origin}/activar?token=${encodeURIComponent(activationToken)}&email=${encodeURIComponent(clientEmail)}`;

    try {
      await db.collection('activations').doc(activationToken).set({
        token: activationToken,
        clientId,
        email: clientEmail,
        businessName,
        used: false,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        createdAt: new Date().toISOString(),
        usedAt: null
      }, { merge: true });

      await db.collection('clients').doc(clientId).set({
        activationToken,
        clientEmail,
        accessStatus: data.accessStatus === 'active' ? 'active' : 'pending',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (actDbErr) {
      console.warn('[AdminAccess] Error guardando token de activación en Firestore:', actDbErr);
    }

    if (auth && clientEmail) {
      try {
        activationLink = await auth.generatePasswordResetLink(clientEmail);
      } catch (err) {
        console.warn('[AdminAccess] Error generando link de activación:', err);
      }
    }

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
      activationToken,
      message: 'Invitación regenerada exitosamente.',
      activationLink: customActivationLink || activationLink || null
    });
  } catch (err) {
    res.status(503).json({
      error: 'No se pudo reenviar la invitación en el servidor.',
      code: 'ADMIN_SDK_UNAVAILABLE'
    });
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
 * 4. reactivateClientAccess / activateClientAccess
 * Activa o reactiva el acceso del cliente al portal (Regla 14).
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
    let targetEmail = '';
    const nowIso = new Date().toISOString();

    if (isConfigured && db) {
      const clientDoc = await db.collection('clients').doc(clientId).get();
      if (!clientDoc.exists) {
        res.status(404).json({ error: 'Cliente no encontrado.' });
        return;
      }
      const cData = clientDoc.data() || {};
      userId = cData.userId;
      targetEmail = (cData.clientEmail || cData.email || '').trim().toLowerCase();

      // Si no tiene userId en el documento, buscar por email en Auth o users
      if (!userId && targetEmail && auth) {
        try {
          const authUser = await auth.getUserByEmail(targetEmail);
          if (authUser) {
            userId = authUser.uid;
          }
        } catch {}
      }

      if (!userId && targetEmail) {
        try {
          const uQuery = await db.collection('users').where('email', '==', targetEmail).limit(1).get();
          if (!uQuery.empty) {
            userId = uQuery.docs[0].id;
          }
        } catch {}
      }

      // Actualizar accessStatus a active en Firestore
      const clientUpdates: Record<string, any> = {
        accessStatus: 'active',
        active: true,
        updatedAt: nowIso
      };
      if (userId) {
        clientUpdates.userId = userId;
      }
      if (targetEmail) {
        clientUpdates.clientEmail = targetEmail;
      }
      await db.collection('clients').doc(clientId).update(clientUpdates);

      // Si existe documento en users/{userId}, asegurar active: true
      if (userId) {
        try {
          await db.collection('users').doc(userId).set({
            active: true,
            role: 'CLIENT',
            clientId,
            updatedAt: nowIso
          }, { merge: true });
        } catch {}
      }

      // Si existía un token de activación no consumido, marcarlo como usado
      if (cData.activationToken) {
        try {
          await db.collection('activations').doc(cData.activationToken).update({
            used: true,
            usedAt: nowIso,
            activatedUid: userId || 'admin_activation'
          });
        } catch {}
      }
    }

    // Habilitar / Desbloquear usuario en Firebase Authentication
    if (isConfigured && auth && userId) {
      try {
        await auth.updateUser(userId, { disabled: false });
        console.log(`[AdminAccess] Usuario ${userId} activado/reactivado en Firebase Auth`);
      } catch (err) {
        console.warn('[AdminAccess] Aviso actualizando usuario en Auth:', err);
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
      userId,
      accessStatus: 'active',
      message: 'El acceso del cliente ha sido activado correctamente.'
    });
  } catch (err) {
    console.error('[AdminAccess] Error al activar acceso:', err);
    res.status(500).json({ error: 'No se pudo activar el acceso del cliente.' });
  }
}

/**
 * 5. verifyClientAccessStatusHandler
 * Comprueba el estado real de un cliente consultando Firebase Authentication y Firestore.
 * Si el usuario ya existe en Auth, está activo y vinculado, actualiza clients/{clientId} a 'active'.
 */
export async function verifyClientAccessStatusHandler(req: Request, res: Response): Promise<void> {
  const adminUser = await verifyAdminAuth(req);
  if (!adminUser) {
    res.status(403).json({ error: 'No tienes permisos administrativos para verificar accesos.' });
    return;
  }

  const { clientId, userId, email } = req.body;
  if (!clientId) {
    res.status(400).json({ error: 'El identificador del cliente (clientId) es obligatorio.' });
    return;
  }

  const { auth, db, isConfigured, hasServiceAccount } = getFirebaseAdmin();
  if (!isConfigured || !hasServiceAccount || !db) {
    res.status(503).json({
      error: 'Admin SDK sin credenciales de servicio.',
      code: 'ADMIN_SDK_UNAVAILABLE'
    });
    return;
  }

  try {
    let clientData: any = null;
    let targetUserId = userId;
    let targetEmail = email ? email.trim().toLowerCase() : '';

    const clientDoc = await db.collection('clients').doc(clientId).get();
    if (clientDoc.exists) {
      clientData = clientDoc.data();
      if (!targetUserId) targetUserId = clientData.userId;
      if (!targetEmail) targetEmail = (clientData.clientEmail || clientData.email || '').trim().toLowerCase();
    }

    // 1. Si está explícitamente suspendido por el administrador
    if (clientData?.accessStatus === 'suspended') {
      res.status(200).json({
        success: true,
        clientId,
        accessStatus: 'suspended',
        userId: targetUserId,
        email: targetEmail
      });
      return;
    }

    // 2. Verificar si existe un token de activación pendiente SIN USAR antes de marcar como activo
    let hasUnusedPendingToken = false;
    if (clientData?.activationToken && clientData?.accessStatus === 'pending') {
      try {
        const actSnap = await db.collection('activations').doc(clientData.activationToken).get();
        if (!actSnap.exists || actSnap.data()?.used === false) {
          hasUnusedPendingToken = true;
        }
      } catch {
        hasUnusedPendingToken = true;
      }
    }

    let authUser: any = null;
    if (auth) {
      if (targetUserId && !String(targetUserId).startsWith('client_')) {
        try {
          authUser = await auth.getUser(targetUserId);
        } catch {}
      }
      if (!authUser && targetEmail) {
        try {
          authUser = await auth.getUserByEmail(targetEmail);
          if (authUser && !targetUserId) targetUserId = authUser.uid;
        } catch {}
      }
    }

    let userDocData: any = null;
    if (targetUserId) {
      try {
        const uDoc = await db.collection('users').doc(targetUserId).get();
        if (uDoc.exists) {
          userDocData = uDoc.data();
        }
      } catch {}
    }

    let realStatus: 'none' | 'pending' | 'active' | 'suspended' = 'none';

    if (authUser && (authUser.disabled || userDocData?.active === false)) {
      realStatus = 'suspended';
    } else if (hasUnusedPendingToken && !authUser?.metadata?.lastSignInTime && !clientData?.termsAccepted) {
      realStatus = 'pending';
    } else if (authUser && (authUser.metadata?.lastSignInTime || clientData?.termsAccepted || clientData?.accessStatus === 'active')) {
      realStatus = 'active';
    } else if (clientData?.accessStatus === 'pending' || clientData?.activationToken) {
      realStatus = 'pending';
    } else if (clientData?.accessStatus === 'active') {
      realStatus = 'active';
    } else if (userDocData && userDocData.active !== false && (userDocData.role === 'CLIENT' || userDocData.role === 'client') && clientData?.termsAccepted) {
      realStatus = 'active';
    } else {
      realStatus = 'none';
    }

    if (clientData && realStatus === 'active' && clientData.accessStatus !== 'active') {
      try {
        const updates: Record<string, any> = {
          accessStatus: 'active',
          updatedAt: new Date().toISOString()
        };
        if (targetUserId && clientData.userId !== targetUserId) {
          updates.userId = targetUserId;
        }
        if (authUser?.email && clientData.clientEmail !== authUser.email) {
          updates.clientEmail = authUser.email;
        }
        await db.collection('clients').doc(clientId).update(updates);
      } catch (syncErr) {
        console.warn('[AdminAccess] Aviso actualizando client doc en verify:', syncErr);
      }
    }

    res.status(200).json({
      success: true,
      clientId,
      accessStatus: realStatus,
      userId: targetUserId || authUser?.uid,
      email: targetEmail || authUser?.email
    });
  } catch (err: any) {
    console.error('[AdminAccess] Error en verifyClientAccessStatusHandler:', err);
    res.status(503).json({
      error: 'Error al verificar el estado del cliente.',
      code: 'ADMIN_SDK_UNAVAILABLE'
    });
  }
}

/**
 * 6. batchVerifyClientAccessStatusesHandler
 * Verifica en lote el estado real de múltiples clientes.
 */
export async function batchVerifyClientAccessStatusesHandler(req: Request, res: Response): Promise<void> {
  const adminUser = await verifyAdminAuth(req);
  if (!adminUser) {
    res.status(403).json({ error: 'No tienes permisos administrativos.' });
    return;
  }

  const { clients } = req.body;
  if (!Array.isArray(clients) || clients.length === 0) {
    res.status(400).json({ error: 'Se requiere una lista de clientes para verificar.' });
    return;
  }

  const { auth, db, isConfigured, hasServiceAccount } = getFirebaseAdmin();
  if (!isConfigured || !hasServiceAccount || !db) {
    res.status(503).json({
      error: 'Admin SDK sin credenciales de servicio.',
      code: 'ADMIN_SDK_UNAVAILABLE'
    });
    return;
  }

  const statuses: Record<string, 'none' | 'pending' | 'active' | 'suspended'> = {};

  try {
    for (const c of clients) {
      if (!c.id) continue;
      let targetUserId = c.userId;
      let targetEmail = (c.email || c.clientEmail || '').trim().toLowerCase();
      let currentAccessStatus = c.accessStatus;

      if (currentAccessStatus === 'suspended') {
        statuses[c.id] = 'suspended';
        continue;
      }

      let clientDocData: any = null;
      try {
        const cSnap = await db.collection('clients').doc(c.id).get();
        if (cSnap.exists) clientDocData = cSnap.data();
      } catch {}

      let hasUnusedPendingToken = false;
      const tokenToCheck = clientDocData?.activationToken || c.activationToken;
      if (tokenToCheck && (currentAccessStatus === 'pending' || clientDocData?.accessStatus === 'pending')) {
        try {
          const actSnap = await db.collection('activations').doc(tokenToCheck).get();
          if (!actSnap.exists || actSnap.data()?.used === false) {
            hasUnusedPendingToken = true;
          }
        } catch {
          hasUnusedPendingToken = true;
        }
      }

      let authUser: any = null;
      let userDoc: any = null;

      if (targetUserId && !String(targetUserId).startsWith('client_')) {
        try {
          const uSnap = await db.collection('users').doc(targetUserId).get();
          if (uSnap.exists) userDoc = uSnap.data();
        } catch {}
      }

      if (auth) {
        if (targetUserId && !String(targetUserId).startsWith('client_')) {
          try {
            authUser = await auth.getUser(targetUserId);
          } catch {}
        }
        if (!authUser && targetEmail) {
          try {
            authUser = await auth.getUserByEmail(targetEmail);
            if (authUser && !targetUserId) targetUserId = authUser.uid;
          } catch {}
        }
      }

      let realStatus: 'none' | 'pending' | 'active' | 'suspended' = 'none';

      if (authUser && (authUser.disabled || userDoc?.active === false)) {
        realStatus = 'suspended';
      } else if (hasUnusedPendingToken && !authUser?.metadata?.lastSignInTime && !clientDocData?.termsAccepted) {
        realStatus = 'pending';
      } else if (authUser && (authUser.metadata?.lastSignInTime || clientDocData?.termsAccepted || currentAccessStatus === 'active')) {
        realStatus = 'active';
      } else if (currentAccessStatus === 'pending' || tokenToCheck) {
        realStatus = 'pending';
      } else if (currentAccessStatus === 'active') {
        realStatus = 'active';
      } else {
        realStatus = 'none';
      }

      statuses[c.id] = realStatus;

      if (realStatus === 'active' && currentAccessStatus !== 'active') {
        try {
          const syncUpdates: Record<string, any> = {
            accessStatus: 'active',
            updatedAt: new Date().toISOString()
          };
          if (targetUserId && c.userId !== targetUserId) {
            syncUpdates.userId = targetUserId;
          }
          await db.collection('clients').doc(c.id).update(syncUpdates);
        } catch {}
      }
    }

    res.status(200).json({
      success: true,
      statuses
    });
  } catch (err: any) {
    console.error('[AdminAccess] Error en batchVerifyClientAccessStatusesHandler:', err);
    res.status(503).json({
      error: 'Error verificando lote de clientes.',
      code: 'ADMIN_SDK_UNAVAILABLE'
    });
  }
}

/**
 * 7. completeActivationHandler
 * Completa la activación de un cliente mediante el token seguro.
 * Asigna la contraseña elegida en Firebase Authentication usando Admin SDK.
 */
export async function completeActivationHandler(req: Request, res: Response): Promise<void> {
  const rawToken = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
  const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';
  if (!rawToken || !newPassword) {
    res.status(400).json({ error: 'Token y contraseña son obligatorios.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    return;
  }

  const { auth, db, isConfigured, hasServiceAccount } = getFirebaseAdmin();
  if (!isConfigured || !hasServiceAccount || !auth || !db) {
    res.status(503).json({
      error: 'El servicio Admin SDK no está disponible en este entorno.',
      code: 'ADMIN_SDK_UNAVAILABLE'
    });
    return;
  }

  try {
    // 1. Verificar token
    let tokenData: any = null;
    const actDoc = await db.collection('activations').doc(rawToken).get();
    if (actDoc.exists) {
      tokenData = actDoc.data();
      if (tokenData.used) {
        res.status(400).json({
          error: 'Este enlace de activación ya fue utilizado previamente.',
          code: 'TOKEN_ALREADY_USED'
        });
        return;
      }
      if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
        res.status(400).json({
          error: 'Este enlace de activación ha expirado. Solicita una nueva invitación.',
          code: 'TOKEN_EXPIRED'
        });
        return;
      }
    } else {
      // Intentar decodificar payload autosuficiente
      const payload = decodeTokenPayload(rawToken);
      if (payload && payload.c && payload.e) {
        tokenData = {
          clientId: payload.c,
          email: payload.e,
          businessName: payload.b,
          expiresAt: payload.x
        };
        if (payload.x && Date.now() > payload.x) {
          res.status(400).json({
            error: 'Este enlace de activación ha expirado.',
            code: 'TOKEN_EXPIRED'
          });
          return;
        }
      }
    }

    if (!tokenData || !tokenData.email || !tokenData.clientId) {
      res.status(400).json({ error: 'Enlace de activación inválido.', code: 'TOKEN_INVALID' });
      return;
    }

    const cleanEmail = tokenData.email.trim().toLowerCase();
    const clientId = tokenData.clientId;
    const nowIso = new Date().toISOString();

    const clientRef = db.collection('clients').doc(clientId);
    const clientSnap = await clientRef.get();
    if (!clientSnap.exists) {
      res.status(400).json({
        error: 'El perfil comercial asociado a este enlace no existe o fue eliminado.',
        code: 'TOKEN_INVALID'
      });
      return;
    }

    // 2. Buscar o crear usuario en Firebase Authentication
    let authUser: any = null;
    try {
      authUser = await auth.getUserByEmail(cleanEmail);
    } catch {}

    let authUid = '';
    if (authUser) {
      authUid = authUser.uid;
      await auth.updateUser(authUid, {
        password: newPassword,
        disabled: false
      });
    } else {
      const created = await auth.createUser({
        email: cleanEmail,
        password: newPassword,
        displayName: tokenData.businessName || 'Cliente TapRD',
        disabled: false
      });
      authUid = created.uid;
    }

    try {
      await auth.setCustomUserClaims(authUid, {
        role: 'CLIENT',
        clientId
      });
    } catch {}

    // 3. Actualizar Firestore
    const batch = db.batch();
    const userRef = db.collection('users').doc(authUid);
    const actRef = db.collection('activations').doc(rawToken);

    batch.set(clientRef, {
      userId: authUid,
      clientEmail: cleanEmail,
      active: true,
      status: 'active',
      accessStatus: 'active',
      termsAccepted: true,
      privacyAccepted: true,
      termsAcceptedAt: nowIso,
      privacyAcceptedAt: nowIso,
      updatedAt: nowIso
    }, { merge: true });

    batch.set(userRef, {
      uid: authUid,
      email: cleanEmail,
      displayName: tokenData.businessName || 'Cliente TapRD',
      role: 'CLIENT',
      clientId,
      active: true,
      termsAccepted: true,
      privacyAccepted: true,
      termsAcceptedAt: nowIso,
      privacyAcceptedAt: nowIso,
      updatedAt: nowIso
    }, { merge: true });

    batch.set(actRef, {
      token: rawToken,
      clientId,
      email: cleanEmail,
      used: true,
      usedAt: nowIso,
      activatedUid: authUid
    }, { merge: true });

    await batch.commit();

    res.status(200).json({
      success: true,
      userId: authUid,
      clientId,
      email: cleanEmail,
      message: 'Cuenta activada correctamente.'
    });
  } catch (err: any) {
    console.error('[AdminAccess] Error en completeActivationHandler:', err);
    res.status(503).json({
      error: 'El servicio Admin SDK no pudo completar la activación en servidor.',
      code: 'ADMIN_SDK_UNAVAILABLE'
    });
  }
}

/**
 * 8. toggleClientProfileStatusHandler
 * Permite al administrador o propietario pausar o reactivar el perfil público de un cliente (/p/:slug)
 * Actualiza en Firestore tanto status como active y profileStatus de forma atómica.
 */
export async function toggleClientProfileStatusHandler(req: Request, res: Response): Promise<void> {
  const adminUser = await verifyAdminAuth(req);
  if (!adminUser) {
    res.status(403).json({ error: 'No tienes permisos administrativos para realizar esta operación.' });
    return;
  }

  const { clientId, status } = req.body;
  if (!clientId || !status || !['active', 'inactive', 'pending'].includes(status)) {
    res.status(400).json({ error: 'Parámetros inválidos. clientId y status son requeridos.' });
    return;
  }

  const { db, isConfigured } = getFirebaseAdmin();
  const nowIso = new Date().toISOString();
  const isActive = status === 'active';
  const profileStatus = status === 'inactive' ? 'inactive' : 'active';

  try {
    if (isConfigured && db) {
      const clientDoc = await db.collection('clients').doc(clientId).get();
      if (!clientDoc.exists) {
        res.status(404).json({ error: 'Cliente no encontrado.' });
        return;
      }

      await db.collection('clients').doc(clientId).set({
        status,
        active: isActive,
        profileStatus,
        updatedAt: nowIso
      }, { merge: true });
    }

    await logAuditEvent({
      actorUid: adminUser.uid,
      actorRole: adminUser.role,
      action: status === 'inactive' ? 'CLIENT_PROFILE_PAUSED' : 'CLIENT_PROFILE_ACTIVATED',
      targetClientId: clientId,
      details: { newStatus: status, active: isActive, profileStatus }
    });

    res.status(200).json({
      success: true,
      clientId,
      status,
      active: isActive,
      profileStatus,
      message: status === 'inactive' 
        ? 'Perfil pausado correctamente. Ya no estará visible públicamente.' 
        : 'Perfil activado correctamente.'
    });
  } catch (err: any) {
    console.error('[AdminAccess] Error en toggleClientProfileStatusHandler:', err);
    res.status(500).json({ error: err.message || 'Error al cambiar estado del perfil.' });
  }
}

