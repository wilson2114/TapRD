import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import appletConfigJson from '../../firebase-applet-config.json';

// Cargar configuración local de AI Studio (manejando importación directa o default)
const rawConfig: any = appletConfigJson;
const appletConfig: Record<string, string> =
  (rawConfig && typeof rawConfig === 'object' && 'default' in rawConfig && rawConfig.default ? rawConfig.default : rawConfig) || {};

// Configuración predeterminada del proyecto Firebase de TapRD
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDm3XT6W0wgfPUX6REwaxElCWuUbIncOkM',
  authDomain: 'taprd-16064.firebaseapp.com',
  projectId: 'taprd-16064',
  storageBucket: 'taprd-16064.firebasestorage.app',
  messagingSenderId: '330761712548',
  appId: '1:330761712548:web:77b91a807243df13fdc731',
  firestoreDatabaseId: '(default)'
};

// Resolver clave API válida (priorizando claves legítimas de Google que comienzan con AIza)
const resolveApiKey = (): string => {
  if (appletConfig.apiKey && appletConfig.apiKey.startsWith('AIza')) {
    return appletConfig.apiKey;
  }
  const envKey = import.meta.env.VITE_FIREBASE_API_KEY as string;
  if (envKey && envKey.startsWith('AIza')) {
    return envKey;
  }
  if (DEFAULT_FIREBASE_CONFIG.apiKey && DEFAULT_FIREBASE_CONFIG.apiKey.startsWith('AIza')) {
    return DEFAULT_FIREBASE_CONFIG.apiKey;
  }
  return appletConfig.apiKey || envKey || DEFAULT_FIREBASE_CONFIG.apiKey || '';
};

// Resolver databaseId de Firestore (evitando valores erróneos de storage)
const resolveDatabaseId = (): string => {
  const cfgDbId = appletConfig.firestoreDatabaseId;
  if (cfgDbId && !cfgDbId.includes('firebasestorage')) {
    return cfgDbId;
  }
  const envDbId = import.meta.env.VITE_FIREBASE_DATABASE_ID as string;
  if (envDbId && !envDbId.includes('firebasestorage') && !envDbId.includes('.')) {
    return envDbId;
  }
  return '(default)';
};

/**
 * CONFIGURACIÓN CENTRALIZADA DE FIREBASE
 * Prioriza valores válidos de appletConfig (firebase-applet-config.json) y variables de entorno Vite.
 */
export const firebaseConfig = {
  apiKey: resolveApiKey(),
  authDomain: appletConfig.authDomain || (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: appletConfig.projectId || (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: appletConfig.storageBucket || (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: appletConfig.messagingSenderId || (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: appletConfig.appId || (import.meta.env.VITE_FIREBASE_APP_ID as string) || DEFAULT_FIREBASE_CONFIG.appId,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== ''
);

// Inicializar la aplicación Firebase como singleton seguro
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Authentication
export const auth = getAuth(app);

// Cloud Firestore con soporte de base de datos '(default)'
const databaseId = resolveDatabaseId();

export const db = (databaseId && databaseId !== '(default)')
  ? getFirestore(app, databaseId)
  : getFirestore(app);

// Firebase Storage para logotipos y recursos multimedia
export const storage = getStorage(app);

export default app;
