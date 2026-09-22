import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;
let initAttempted = false;
let initFailed = false;

/**
 * Inicialización perezosa (lazy) de Firebase Admin SDK.
 * Garantiza que la aplicación nunca se caiga en el arranque si las credenciales aún no están presentes.
 */
export function getFirebaseAdmin() {
  if (adminApp && adminAuth && adminDb) {
    return {
      app: adminApp,
      auth: adminAuth,
      db: adminDb,
      isConfigured: true
    };
  }

  const existingApps = getApps();
  if (existingApps.length > 0 && existingApps[0]) {
    adminApp = existingApps[0];
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    return {
      app: adminApp,
      auth: adminAuth,
      db: adminDb,
      isConfigured: true
    };
  }

  if (initAttempted && initFailed) {
    return {
      app: null,
      auth: null as any,
      db: null as any,
      isConfigured: false
    };
  }

  initAttempted = true;

  try {
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountEnv) {
      try {
        const serviceAccount = JSON.parse(serviceAccountEnv);
        adminApp = initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || 'taprd-16064'
        });
        adminAuth = getAuth(adminApp);
        adminDb = getFirestore(adminApp);
        console.log('[FirebaseAdmin] Inicializado con Service Account Key personalizada');
        return {
          app: adminApp,
          auth: adminAuth,
          db: adminDb,
          isConfigured: true
        };
      } catch (parseErr) {
        console.warn('[FirebaseAdmin] Error al parsear FIREBASE_SERVICE_ACCOUNT_KEY:', parseErr);
      }
    }

    // Si no se cuenta con FIREBASE_SERVICE_ACCOUNT_KEY explícita, no activar Admin SDK remoto
    // para evitar fallos gRPC (PERMISSION_DENIED) en entornos sin IAM del proyecto
    initFailed = true;
    console.log('[FirebaseAdmin] Modo seguro activado: Admin SDK en fallback (sin FIREBASE_SERVICE_ACCOUNT_KEY)');
    return {
      app: null,
      auth: null as any,
      db: null as any,
      isConfigured: false
    };
  } catch (err: any) {
    console.warn('[FirebaseAdmin] Aviso inicializando Admin SDK (modo fallback activo):', err.message || err);
    initFailed = true;
    return {
      app: null,
      auth: null as any,
      db: null as any,
      isConfigured: false
    };
  }
}
