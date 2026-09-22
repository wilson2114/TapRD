/**
 * Firebase Cloud Functions (Callable Functions) para TapRD
 * Implementa el flujo seguro administrativo de creación y gestión de accesos
 * ejecutado exclusivamente desde el entorno backend privilegiado con Firebase Admin SDK.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Inicializar Admin SDK dentro del entorno de Cloud Functions
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const auth = admin.auth();
const db = admin.firestore();

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validador de rol administrativo del solicitante
 */
async function assertIsAdmin(context: functions.https.CallableContext): Promise<{ uid: string; email: string; role: string }> {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Debes estar autenticado para realizar esta operación.'
    );
  }

  const { uid, token } = context.auth;
  const email = token.email || '';
  let role = (token.role as string) || '';

  if (email.toLowerCase() === 'wilsonabelinobrito@gmail.com') {
    role = 'superadmin';
  }

  if (!role) {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      role = userDoc.data()?.role || '';
    }
  }

  if (role !== 'admin' && role !== 'superadmin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'No tienes permisos administrativos para realizar esta acción.'
    );
  }

  return { uid, email, role };
}

/**
 * 1. createClientAccess (Callable Cloud Function)
 */
export const createClientAccess = functions.https.onCall(async (data, context) => {
  // 1, 2, 3. Verificar autenticación y rol
  const adminUser = await assertIsAdmin(context);

  // 4, 5. Recibir y validar clientId y email
  const { clientId, email, ownerName } = data || {};
  if (!clientId || typeof clientId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'El identificador del cliente (clientId) es requerido.');
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
    throw new functions.https.HttpsError('invalid-argument', 'El formato del correo electrónico proporcionado no es válido.');
  }

  // 6, 7. Obtener el cliente desde Firestore y comprobar existencia
  const clientRef = db.collection('clients').doc(clientId);
  const clientDoc = await clientRef.get();
  if (!clientDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'El cliente solicitado no existe en Firestore.');
  }

  const clientData = clientDoc.data() || {};

  // 8. Comprobar que no tenga ya un userId activo
  if (clientData.userId && clientData.accessStatus && clientData.accessStatus !== 'none') {
    throw new functions.https.HttpsError('already-exists', 'Este cliente ya tiene un acceso.');
  }

  // Comprobar si el email ya pertenece a otro usuario de Authentication (Regla 7)
  try {
    const existingUser = await auth.getUserByEmail(cleanEmail);
    if (existingUser) {
      throw new functions.https.HttpsError(
        'already-exists',
        'Ese correo electrónico ya está asociado a una cuenta. Verifica los datos o utiliza otro correo.'
      );
    }
  } catch (err: any) {
    if (err.code !== 'auth/user-not-found' && err.name !== 'HttpsError') {
      console.warn('Verificación de usuario:', err.message);
    }
    if (err instanceof functions.https.HttpsError) {
      throw err;
    }
  }

  // 10. Crear el usuario mediante Firebase Admin SDK (sin contraseña visible por el admin)
  let userRecord;
  try {
    userRecord = await auth.createUser({
      email: cleanEmail,
      displayName: clientData.businessName || ownerName || 'Cliente TapRD',
      emailVerified: false,
      disabled: false
    });
  } catch (authErr: any) {
    console.error('Error al crear usuario en Auth:', authErr);
    throw new functions.https.HttpsError('internal', 'No se pudo crear la cuenta de usuario en Authentication.');
  }

  const nowIso = new Date().toISOString();

  try {
    // 11. Asignar el rol client mediante custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'client',
      clientId: clientId
    });

    // 12, 13. Actualizar documento del cliente y crear documento users/{uid}
    const batch = db.batch();

    const userDocRef = db.collection('users').doc(userRecord.uid);
    batch.set(userDocRef, {
      uid: userRecord.uid,
      email: cleanEmail,
      displayName: clientData.businessName || ownerName || 'Cliente TapRD',
      role: 'client',
      clientId: clientId,
      createdAt: nowIso,
      updatedAt: nowIso
    });

    batch.update(clientRef, {
      userId: userRecord.uid,
      clientEmail: cleanEmail,
      accessStatus: 'pending',
      updatedAt: nowIso
    });

    await batch.commit();

    // 14. Registrar auditoría
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.collection('auditLogs').doc(logId).set({
      id: logId,
      actorUid: adminUser.uid,
      actorRole: adminUser.role,
      action: 'CLIENT_ACCESS_CREATED',
      targetClientId: clientId,
      timestamp: nowIso,
      details: {
        newUid: userRecord.uid,
        email: cleanEmail
      }
    });

    // Generar enlace seguro para activación de contraseña
    let activationLink: string | null = null;
    try {
      activationLink = await auth.generatePasswordResetLink(cleanEmail);
    } catch (linkErr) {
      console.warn('Aviso generando passwordResetLink:', linkErr);
    }

    // TODO: conectar proveedor de correo transaccional para invitaciones
    // 15. Devolver únicamente la información necesaria al frontend
    return {
      success: true,
      clientId,
      userId: userRecord.uid,
      accessStatus: 'pending',
      email: cleanEmail,
      message: 'Acceso creado. El sistema de invitación por correo todavía no está configurado.',
      activationLink: activationLink || null
    };
  } catch (syncErr: any) {
    // Compensación si falla Firestore
    try {
      await auth.deleteUser(userRecord.uid);
    } catch {}
    console.error('Error sincronizando Firestore:', syncErr);
    throw new functions.https.HttpsError('internal', 'El acceso no pudo crearse consistentemente. Se revirtió la operación.');
  }
});

/**
 * 2. resendClientInvitation (Callable Cloud Function)
 */
export const resendClientInvitation = functions.https.onCall(async (data, context) => {
  const adminUser = await assertIsAdmin(context);
  const { clientId } = data || {};

  if (!clientId) {
    throw new functions.https.HttpsError('invalid-argument', 'El clientId es requerido.');
  }

  const clientDoc = await db.collection('clients').doc(clientId).get();
  if (!clientDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Cliente no encontrado.');
  }

  const clientData = clientDoc.data() || {};
  if (!clientData.userId) {
    throw new functions.https.HttpsError('failed-precondition', 'El cliente no tiene un acceso creado.');
  }

  const clientEmail = clientData.clientEmail || clientData.email;
  let activationLink: string | null = null;
  if (clientEmail) {
    try {
      activationLink = await auth.generatePasswordResetLink(clientEmail);
    } catch (err) {
      console.warn('Error generando enlace de restablecimiento:', err);
    }
  }

  const nowIso = new Date().toISOString();
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await db.collection('auditLogs').doc(logId).set({
    id: logId,
    actorUid: adminUser.uid,
    actorRole: adminUser.role,
    action: 'CLIENT_INVITATION_RESENT',
    targetClientId: clientId,
    timestamp: nowIso
  });

  // TODO: conectar proveedor de correo transaccional para invitaciones
  return {
    success: true,
    clientId,
    message: 'Invitación regenerada. El sistema de invitación por correo todavía no está configurado.',
    activationLink: activationLink || null
  };
});

/**
 * 3. suspendClientAccess (Callable Cloud Function)
 */
export const suspendClientAccess = functions.https.onCall(async (data, context) => {
  const adminUser = await assertIsAdmin(context);
  const { clientId } = data || {};

  if (!clientId) {
    throw new functions.https.HttpsError('invalid-argument', 'El clientId es requerido.');
  }

  const clientRef = db.collection('clients').doc(clientId);
  const clientDoc = await clientRef.get();
  if (!clientDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Cliente no encontrado.');
  }

  const clientData = clientDoc.data() || {};
  const userId = clientData.userId;

  // Actualizar accessStatus a suspended en Firestore
  await clientRef.update({
    accessStatus: 'suspended',
    updatedAt: new Date().toISOString()
  });

  // Deshabilitar en Authentication
  if (userId) {
    try {
      await auth.updateUser(userId, { disabled: true });
    } catch (err) {
      console.warn('Aviso deshabilitando en Auth:', err);
    }
  }

  const nowIso = new Date().toISOString();
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await db.collection('auditLogs').doc(logId).set({
    id: logId,
    actorUid: adminUser.uid,
    actorRole: adminUser.role,
    action: 'CLIENT_ACCESS_SUSPENDED',
    targetClientId: clientId,
    timestamp: nowIso
  });

  return {
    success: true,
    clientId,
    accessStatus: 'suspended',
    message: 'El acceso del cliente ha sido suspendido correctamente.'
  };
});

/**
 * 4. reactivateClientAccess (Callable Cloud Function)
 */
export const reactivateClientAccess = functions.https.onCall(async (data, context) => {
  const adminUser = await assertIsAdmin(context);
  const { clientId } = data || {};

  if (!clientId) {
    throw new functions.https.HttpsError('invalid-argument', 'El clientId es requerido.');
  }

  const clientRef = db.collection('clients').doc(clientId);
  const clientDoc = await clientRef.get();
  if (!clientDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Cliente no encontrado.');
  }

  const clientData = clientDoc.data() || {};
  const userId = clientData.userId;

  // Actualizar accessStatus a active en Firestore
  await clientRef.update({
    accessStatus: 'active',
    updatedAt: new Date().toISOString()
  });

  // Reactivar en Authentication
  if (userId) {
    try {
      await auth.updateUser(userId, { disabled: false });
    } catch (err) {
      console.warn('Aviso reactivando en Auth:', err);
    }
  }

  const nowIso = new Date().toISOString();
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await db.collection('auditLogs').doc(logId).set({
    id: logId,
    actorUid: adminUser.uid,
    actorRole: adminUser.role,
    action: 'CLIENT_ACCESS_REACTIVATED',
    targetClientId: clientId,
    timestamp: nowIso
  });

  return {
    success: true,
    clientId,
    accessStatus: 'active',
    message: 'El acceso del cliente ha sido reactivado correctamente.'
  };
});
