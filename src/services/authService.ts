import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail,
  getAuth,
  User as FirebaseUser
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, firebaseConfig } from '../lib/firebase';
import { ADMIN_DEMO_EMAIL } from '../config/constants';
import { translateFirebaseError } from '../utils/firebaseErrors';
import { AppUser, UserRole } from '../types/user';
import { Client, DEFAULT_CLIENT_PERMISSIONS } from '../types/client';
export type { AppUser, UserRole };

const SESSION_STORAGE_KEY = 'taprd_admin_session';

type AuthStateCallback = (user: AppUser | null) => void;
const authSubscribers: Set<AuthStateCallback> = new Set();

let cachedCurrentUser: AppUser | null = null;
let isAuthListenerInitialized = false;
let isActivationInProgress = false;

export function setActivationInProgress(inProgress: boolean): void {
  isActivationInProgress = inProgress;
}

export function syncClientSession(appUser: AppUser, clientData?: Client | null): void {
  cachedCurrentUser = appUser;
  if (typeof window !== 'undefined') {
    if (clientData) {
      localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(clientData));
    }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(appUser));
  }
  notifySubscribers(appUser);
}

export const AUTHORIZED_ADMIN_EMAILS = [
  'wilsonabelinobrito@gmail.com',
  'admin@taprd.com'
];

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.includes(clean);
}
export const isAuthorizedAdmin = isAuthorizedAdminEmail;

/**
 * Inicializa el observador de estado de Firebase Authentication
 */
export function initAuthObserver(): void {
  if (isAuthListenerInitialized || typeof window === 'undefined') return;
  isAuthListenerInitialized = true;

  try {
    firebaseOnAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (isActivationInProgress) {
        return;
      }
      if (fbUser) {
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userRef);
          const now = new Date().toISOString();

          const cleanEmail = fbUser.email?.trim().toLowerCase() || '';
          const isSuperOwner = isAuthorizedAdminEmail(cleanEmail);
          let userRole: UserRole = isSuperOwner ? 'superadmin' : 'client';
          let displayName = fbUser.displayName || (isSuperOwner ? 'Wilson Abelino Brito' : cleanEmail.split('@')[0] || 'Cliente');

          const data = snap.exists() ? snap.data() : null;
          let knownClientId = data?.clientId as string | undefined;

          if (snap.exists() && data) {
            if (isSuperOwner) {
              userRole = 'superadmin';
            } else {
              userRole = 'client';
              // Corregir inmediatamente si tenía 'admin' guardado por error
              if (data.role && (data.role === 'admin' || data.role === 'ADMIN' || data.role === 'superadmin')) {
                updateDoc(userRef, { role: 'CLIENT', updatedAt: now }).catch(() => {});
              }
            }
            if (data.displayName || data.name) displayName = data.displayName || data.name;

            try {
              await updateDoc(userRef, { lastLogin: now, role: isSuperOwner ? 'superadmin' : 'CLIENT' });
            } catch {}
          } else {
            // Crear registro en Firestore con rol estricto
            const newUserData: Record<string, any> = {
              uid: fbUser.uid,
              email: cleanEmail,
              displayName,
              role: isSuperOwner ? 'superadmin' : 'CLIENT',
              createdAt: now,
              lastLogin: now
            };
            try {
              await setDoc(userRef, newUserData, { merge: true });
            } catch {}
          }

          // Si es cliente, sincronizar y asegurar sesión comercial en caché
          let clientData: Client | null = null;
          if (!isSuperOwner) {
            clientData = await findAndLinkClient(fbUser.uid, cleanEmail, knownClientId);
            if (clientData) {
              displayName = clientData.businessName || displayName;
              knownClientId = clientData.id;
            }
          }

          const userObj: AppUser = {
            uid: fbUser.uid,
            email: cleanEmail,
            displayName,
            role: userRole,
            clientId: knownClientId,
            createdAt: snap.exists() ? snap.data()?.createdAt : now,
            lastLogin: now
          };

          cachedCurrentUser = userObj;
          if (clientData) {
            localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(clientData));
          }
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userObj));
          notifySubscribers(userObj);
        } catch (err) {
          console.warn('Aviso sincronizando usuario con Firestore:', err);
        }
      } else {
        cachedCurrentUser = null;
        localStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(CLIENT_SESSION_KEY);
        notifySubscribers(null);
      }
    });
  } catch (err) {
    console.warn('Firebase Auth observer no disponible:', err);
  }
}

// Auto-iniciar observador en cliente
if (typeof window !== 'undefined') {
  initAuthObserver();
}

function notifySubscribers(user: AppUser | null) {
  authSubscribers.forEach((cb) => {
    try {
      cb(user);
    } catch (e) {
      console.error('Error en callback de autenticación:', e);
    }
  });
}

function getStoredSession(): AppUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as AppUser;
    if (user && user.email) {
      const isAdm = isAuthorizedAdminEmail(user.email);
      // Auto-degradar cualquier usuario que no sea el administrador
      if (!isAdm && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'ADMIN' || user.role === 'owner')) {
        user.role = 'CLIENT';
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
        } catch {}
      }
    }
    return user;
  } catch {
    return null;
  }
}

/**
 * Suscribirse a cambios en el estado de autenticación (onAuthStateChanged)
 */
export function onAuthStateChanged(callback: AuthStateCallback): () => void {
  authSubscribers.add(callback);
  // Llamada inmediata con estado actual
  callback(getCurrentUser());
  return () => {
    authSubscribers.delete(callback);
  };
}

/**
 * Obtener usuario actualmente autenticado (getCurrentUser)
 */
export function getCurrentUser(): AppUser | null {
  if (cachedCurrentUser) return cachedCurrentUser;
  cachedCurrentUser = getStoredSession();
  return cachedCurrentUser;
}

export const getCurrentAdminUser = getCurrentUser;

/**
 * Comprobar si existe un usuario autenticado
 */
export function isUserAuthenticated(): boolean {
  return Boolean(getCurrentUser());
}

/**
 * INICIAR SESIÓN DE ADMINISTRADOR (loginAdmin)
 * Valida con Firebase Authentication y corrobora rol en Firestore
 */
export async function loginAdmin(
  email: string,
  pass: string
): Promise<{ success: boolean; error?: string; user?: AppUser }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: 'Por favor ingresa tu correo y contraseña.' };
  }

  // Comprobar si el correo tiene autorización administrativa en TapRD
  if (!isAuthorizedAdminEmail(cleanEmail)) {
    return {
      success: false,
      error: 'Acceso no autorizado. Este correo no cuenta con permisos de administrador en TapRD. Los clientes deben iniciar sesión en su portal comercial.'
    };
  }

  // Autenticación real con Firebase Authentication
  if (!isFirebaseConfigured) {
    return {
      success: false,
      error: 'Firebase no está configurado. Por favor configura las variables de entorno en .env'
    };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
    const fbUser = cred.user;
    const now = new Date().toISOString();

    // Consultar rol en Firestore
    let userRole: UserRole = 'superadmin';
    let displayName = fbUser.displayName || 'Wilson Abelino Brito';

    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const d = snap.data();
        if (d.displayName || d.name) displayName = d.displayName || d.name;
        await updateDoc(userRef, { lastLogin: now, role: 'superadmin' });
      } else {
        await setDoc(userRef, {
          uid: fbUser.uid,
          email: cleanEmail,
          displayName,
          role: 'superadmin',
          createdAt: now,
          lastLogin: now
        });
      }
    } catch (firestoreErr) {
      console.warn('Aviso consultando rol en Firestore:', firestoreErr);
    }

    const appUser: AppUser = {
      uid: fbUser.uid,
      email: cleanEmail,
      displayName,
      role: 'superadmin',
      createdAt: now,
      lastLogin: now
    };

    cachedCurrentUser = appUser;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(appUser));
    notifySubscribers(appUser);

    return { success: true, user: appUser };
  } catch (err: any) {
    console.error('Error al iniciar sesión en Firebase Auth:', err);
    return { success: false, error: translateFirebaseError(err) };
  }
}

/**
 * REGISTRAR NUEVO ADMINISTRADOR (registerAdmin)
 * El registro público está deshabilitado. Solo el dueño autorizado puede auto-crear credenciales si es necesario.
 */
export async function registerAdmin(
  name: string,
  email: string,
  pass: string
): Promise<{ success: boolean; error?: string; user?: AppUser }> {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  // El registro de administradores NO es público
  if (!isAuthorizedAdminEmail(cleanEmail)) {
    return {
      success: false,
      error: 'El registro público de administradores no está permitido. El panel administrativo está reservado para la dirección de TapRD.'
    };
  }

  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: 'Por favor ingresa tu nombre completo.' };
  }

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Por favor ingresa un correo electrónico válido.' };
  }

  if (!cleanPass || cleanPass.length < 6) {
    return { success: false, error: 'La contraseña debe contener al menos 6 caracteres.' };
  }

  if (!isFirebaseConfigured) {
    return {
      success: false,
      error: 'Firebase no está configurado. Por favor configura las variables de entorno en .env'
    };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
    const fbUser = cred.user;
    const now = new Date().toISOString();

    await updateProfile(fbUser, { displayName: cleanName });

    // Crear documento users/{uid} en Cloud Firestore con rol de administración
    const userRef = doc(db, 'users', fbUser.uid);
    const newUserData = {
      uid: fbUser.uid,
      email: cleanEmail,
      displayName: cleanName,
      role: 'superadmin',
      createdAt: now,
      lastLogin: now
    };

    await setDoc(userRef, newUserData);

    const appUser: AppUser = {
      uid: fbUser.uid,
      email: cleanEmail,
      displayName: cleanName,
      role: 'superadmin',
      createdAt: now,
      lastLogin: now
    };

    cachedCurrentUser = appUser;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(appUser));
    notifySubscribers(appUser);

    return { success: true, user: appUser };
  } catch (err: any) {
    if (err?.code === 'auth/email-already-in-use') {
      return { success: false, error: 'Este correo ya tiene una cuenta activa. Por favor inicia sesión.' };
    }
    console.error('Error al registrar usuario en Firebase:', err);
    return { success: false, error: translateFirebaseError(err) };
  }
}

/**
 * CERRAR SESIÓN (logoutAdmin)
 * Ejecuta signOut() en Firebase Auth y limpia sesión local
 */
export async function logoutAdmin(): Promise<void> {
  try {
    if (isFirebaseConfigured && auth.currentUser) {
      await firebaseSignOut(auth);
    }
  } catch (err) {
    console.warn('Aviso en signOut de Firebase:', err);
  } finally {
    cachedCurrentUser = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    notifySubscribers(null);
  }
}

// =========================================================================
// MÉTODOS DE AUTENTICACIÓN PARA EL PORTAL DE CLIENTES (PARTE 7)
// =========================================================================

export const CLIENT_SESSION_KEY = 'taprd_client_session';

/**
 * Busca y auto-vincula el negocio del cliente con máxima resiliencia:
 * 1. Por ID si el documento users/{uid} ya contiene clientId
 * 2. Por coincidencia exacta userId == fbUid
 * 3. Por clientEmail (correo de acceso al portal)
 * 4. Por email comercial del negocio
 * 5. Búsqueda exhaustiva case-insensitive en Firestore
 * 6. Auto-sincroniza en Firestore users/{uid} y clients/{clientId} para que
 *    futuras sesiones e inicios de sesión tras cerrar sesión lo reconozcan de inmediato.
 */
export async function findAndLinkClient(
  fbUid: string,
  userEmail: string,
  knownClientId?: string
): Promise<Client | null> {
  if (!isFirebaseConfigured) return null;
  const cleanEmail = userEmail.trim().toLowerCase();
  const clientsRef = collection(db, 'clients');
  let clientDoc: Client | null = null;

  // 1. Por knownClientId si está disponible
  if (knownClientId) {
    try {
      const cSnap = await getDoc(doc(db, 'clients', knownClientId));
      if (cSnap.exists()) {
        clientDoc = { ...(cSnap.data() as Client), id: cSnap.id };
      }
    } catch (e) {
      console.warn('[authService] Error consultando cliente por knownClientId:', e);
    }
  }

  // 2. Por userId == fbUid
  if (!clientDoc) {
    try {
      const qUser = query(clientsRef, where('userId', '==', fbUid));
      const snapUser = await getDocs(qUser);
      if (!snapUser.empty) {
        clientDoc = { ...(snapUser.docs[0].data() as Client), id: snapUser.docs[0].id };
      }
    } catch (e) {
      console.warn('[authService] Error buscando cliente por userId:', e);
    }
  }

  // 3. Por clientEmail
  if (!clientDoc && cleanEmail) {
    try {
      const qClientEmail = query(clientsRef, where('clientEmail', '==', cleanEmail));
      const snapClientEmail = await getDocs(qClientEmail);
      if (!snapClientEmail.empty) {
        clientDoc = { ...(snapClientEmail.docs[0].data() as Client), id: snapClientEmail.docs[0].id };
      }
    } catch {}
  }

  // 4. Por email general
  if (!clientDoc && cleanEmail) {
    try {
      const qEmail = query(clientsRef, where('email', '==', cleanEmail));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        clientDoc = { ...(snapEmail.docs[0].data() as Client), id: snapEmail.docs[0].id };
      }
    } catch {}
  }

  // 5. Búsqueda exhaustiva case-insensitive en Firestore
  if (!clientDoc && cleanEmail) {
    try {
      const allClientsSnap = await getDocs(clientsRef);
      for (const d of allClientsSnap.docs) {
        const data = d.data() as Client;
        const dClientEmail = (data.clientEmail || '').trim().toLowerCase();
        const dEmail = (data.email || '').trim().toLowerCase();
        if (dClientEmail === cleanEmail || dEmail === cleanEmail || data.userId === fbUid) {
          clientDoc = { ...data, id: d.id };
          break;
        }
      }
    } catch (e) {
      console.warn('[authService] Error en búsqueda exhaustiva de cliente:', e);
    }
  }

  // 6. Si se encontró el cliente, auto-vincular de forma consistente
  if (clientDoc) {
    const now = new Date().toISOString();
    // Auto-vincular en documento clients/{id}
    try {
      if (clientDoc.userId !== fbUid || clientDoc.accessStatus !== 'active' || clientDoc.clientEmail !== cleanEmail) {
        await updateDoc(doc(db, 'clients', clientDoc.id), {
          userId: fbUid,
          clientEmail: cleanEmail,
          accessStatus: clientDoc.accessStatus === 'suspended' ? 'suspended' : 'active',
          updatedAt: now
        });
        clientDoc.userId = fbUid;
        clientDoc.clientEmail = cleanEmail;
        if (clientDoc.accessStatus !== 'suspended') {
          clientDoc.accessStatus = 'active';
        }
      }
    } catch (updateErr) {
      console.warn('[authService] Aviso auto-vinculando cliente en Firestore:', updateErr);
    }

    // Auto-vincular en documento users/{fbUid}
    try {
      const userRef = doc(db, 'users', fbUid);
      await setDoc(userRef, {
        uid: fbUid,
        email: cleanEmail,
        clientId: clientDoc.id,
        role: 'CLIENT',
        active: true,
        updatedAt: now
      }, { merge: true });
    } catch (userErr) {
      console.warn('[authService] Aviso auto-vinculando users/{uid} en Firestore:', userErr);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(clientDoc));
    }
  }

  return clientDoc;
}

/**
 * INICIAR SESIÓN DE CLIENTE (loginClient)
 * Verifica credenciales con Firebase Auth, obtiene su negocio y valida que no esté suspendido.
 */
export async function loginClient(
  email: string,
  pass: string
): Promise<{ success: boolean; error?: string; client?: Client; user?: AppUser }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: 'Por favor ingresa tu correo electrónico y contraseña.' };
  }

  // Fallback de demostración rápida para pruebas (solo en desarrollo local)
  if (import.meta.env.DEV && (cleanEmail === 'cliente@taprd.com' || cleanEmail === 'demo@barberia.com')) {
    const demoClient: Client = {
      id: 'cli-demo-barberia',
      businessName: 'Barbería Wilson',
      ownerName: 'Wilson Abelino',
      slug: 'barberia-wilson',
      category: 'Barbería & Spa',
      description: 'Cortes clásicos y modernos con toques artesanales y toalla caliente en Santo Domingo.',
      phone: '(809) 555-0192',
      whatsapp: '18095550192',
      email: cleanEmail,
      city: 'Santo Domingo',
      address: 'Av. Winston Churchill #1092, Piantini',
      status: 'active',
      accessStatus: 'active',
      plan: 'business',
      subscriptionStatus: 'active',
      permissions: DEFAULT_CLIENT_PERMISSIONS,
      socialLinks: {
        instagram: 'barberia.wilsonrd',
        facebook: 'barberiawilsonrd',
        tiktok: 'barberiawilson',
        website: 'https://taprd.com/p/barberia-wilson'
      },
      services: [
        { id: 'srv-1', name: 'Corte Clásico & Fade', description: 'Lavado, corte personalizado y peinado.', price: 'RD$ 600' },
        { id: 'srv-2', name: 'Arreglo de Barba Tradicional', description: 'Toalla caliente, perfilado con navaja y bálsamo.', price: 'RD$ 400' },
        { id: 'srv-3', name: 'Combo Completo TapRD', description: 'Corte + Barba + Mascarilla exfoliante facial.', price: 'RD$ 900' }
      ],
      hours: [
        { day: 'Lunes', isOpen: true, openTime: '09:00', closeTime: '20:00', display: '9:00 AM - 8:00 PM' },
        { day: 'Martes', isOpen: true, openTime: '09:00', closeTime: '20:00', display: '9:00 AM - 8:00 PM' },
        { day: 'Miércoles', isOpen: true, openTime: '09:00', closeTime: '20:00', display: '9:00 AM - 8:00 PM' },
        { day: 'Jueves', isOpen: true, openTime: '09:00', closeTime: '20:00', display: '9:00 AM - 8:00 PM' },
        { day: 'Viernes', isOpen: true, openTime: '09:00', closeTime: '20:00', display: '9:00 AM - 8:00 PM' },
        { day: 'Sábado', isOpen: true, openTime: '09:00', closeTime: '21:00', display: '9:00 AM - 9:00 PM' },
        { day: 'Domingo', isOpen: false, display: 'Cerrado' }
      ],
      settings: {
        showPhone: true,
        showWhatsapp: true,
        showInstagram: true,
        showFacebook: true,
        showTikTok: true,
        showAddress: true,
        showHours: true,
        showServices: true,
        showReviews: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const demoUser: AppUser = {
      uid: 'demo-client-uid',
      email: cleanEmail,
      displayName: 'Barbería Wilson',
      role: 'client',
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(demoClient));
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(demoUser));
    cachedCurrentUser = demoUser;
    notifySubscribers(demoUser);
    return { success: true, client: demoClient, user: demoUser };
  }

  if (!isFirebaseConfigured) {
    return {
      success: false,
      error: 'Firebase no está configurado.'
    };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
    const fbUser = cred.user;
    const now = new Date().toISOString();

    // 1. Obtener datos de usuario en Firestore
    const userRef = doc(db, 'users', fbUser.uid);
    const userSnap = await getDoc(userRef);
    let userRole: UserRole = 'client';
    let displayName = fbUser.displayName || cleanEmail.split('@')[0];
    let knownClientId: string | undefined = undefined;

    if (userSnap.exists()) {
      const uData = userSnap.data();
      userRole = (uData.role as UserRole) || 'client';
      if (uData.displayName) displayName = uData.displayName;
      knownClientId = uData.clientId;
    }

    // 2. Buscar y vincular el cliente asociado con máxima resiliencia
    const clientDoc = await findAndLinkClient(fbUser.uid, cleanEmail, knownClientId);

    // Si es un administrador intentando acceder al portal de clientes
    if (!clientDoc && (userRole === 'admin' || userRole === 'superadmin')) {
      return {
        success: false,
        error: 'Tu cuenta tiene permisos de administrador. Por favor ingresa desde el panel administrativo (/admin).'
      };
    }

    if (!clientDoc) {
      await firebaseSignOut(auth);
      return {
        success: false,
        error: 'No se encontró un negocio asociado a esta cuenta. Si eres cliente de TapRD, solicita la activación de tu acceso.'
      };
    }

    // Comprobar si el acceso está suspendido por el administrador (Sección 35)
    if (clientDoc.accessStatus === 'suspended') {
      await firebaseSignOut(auth);
      return {
        success: false,
        error: 'Tu acceso al portal ha sido suspendido por el administrador de TapRD. Tu perfil público sigue activo. Por favor comunícate con soporte.'
      };
    }

    const appUser: AppUser = {
      uid: fbUser.uid,
      email: cleanEmail,
      displayName: clientDoc.businessName || displayName,
      role: 'client',
      clientId: clientDoc.id,
      createdAt: now,
      lastLogin: now
    };

    cachedCurrentUser = appUser;
    localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(clientDoc));
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(appUser));
    notifySubscribers(appUser);

    return { success: true, client: clientDoc, user: appUser };
  } catch (err: any) {
    console.error('Error al iniciar sesión de cliente:', err);
    return { success: false, error: translateFirebaseError(err) };
  }
}

/**
 * CERRAR SESIÓN DE CLIENTE (logoutClient)
 */
export async function logoutClient(): Promise<void> {
  try {
    if (isFirebaseConfigured && auth.currentUser) {
      await firebaseSignOut(auth);
    }
  } catch (err) {
    console.warn('Aviso en logoutClient:', err);
  } finally {
    cachedCurrentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CLIENT_SESSION_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    notifySubscribers(null);
  }
}

/**
 * OBTENER EL NEGOCIO ACTUAL DEL CLIENTE (getCurrentClient)
 */
export async function getCurrentClient(): Promise<Client | null> {
  if (isFirebaseConfigured && typeof (auth as any).authStateReady === 'function') {
    try {
      await (auth as any).authStateReady();
    } catch {}
  }

  // En producción con Firebase configurado, exigir sesión real de Firebase Auth y expiración máxima (12h)
  if (isFirebaseConfigured && !import.meta.env.DEV) {
    if (!auth.currentUser) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(CLIENT_SESSION_KEY);
        } catch {}
      }
      return null;
    }

    try {
      const tokenResult = await auth.currentUser.getIdTokenResult();
      const authTimeMs = tokenResult?.authTime ? new Date(tokenResult.authTime).getTime() : 0;
      const MAX_SESSION_MS = 12 * 60 * 60 * 1000;
      if (authTimeMs && Date.now() - authTimeMs > MAX_SESSION_MS) {
        await logoutClient();
        return null;
      }
    } catch {}
  }

  // 1. Si hay sesión en localStorage, refrescar desde Firestore para sincronizar cambios entre dispositivos
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CLIENT_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Client;
        if (parsed && parsed.id) {
          if (auth.currentUser && isFirebaseConfigured) {
            const authEmail = (auth.currentUser.email || '').trim().toLowerCase();
            const clientEmail = (parsed.clientEmail || parsed.email || '').trim().toLowerCase();
            if (parsed.userId === auth.currentUser.uid || (!parsed.userId && authEmail && clientEmail === authEmail)) {
              try {
                const freshSnap = await getDoc(doc(db, 'clients', parsed.id));
                if (freshSnap.exists()) {
                  const freshClient = { ...(freshSnap.data() as Client), id: freshSnap.id };
                  localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(freshClient));
                  return freshClient;
                }
              } catch {
                // Respaldo offline si falla la red
                return parsed;
              }
              return parsed;
            }
          } else if (import.meta.env.DEV) {
            return parsed;
          }
        }
      }
    } catch {}
  }

  // 2. Si no está en caché o necesitamos buscar por el usuario actual autenticado
  if (auth.currentUser && isFirebaseConfigured) {
    const userEmail = auth.currentUser.email || '';
    let knownClientId: string | undefined = undefined;

    try {
      const uSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (uSnap.exists()) {
        knownClientId = uSnap.data()?.clientId;
      }
    } catch {}

    const resolvedClient = await findAndLinkClient(
      auth.currentUser.uid,
      userEmail,
      knownClientId
    );

    if (resolvedClient) {
      return resolvedClient;
    }
  }

  return null;
}

/**
 * RECUPERAR CONTRASEÑA DE CLIENTE (resetClientPassword)
 * Sección 28: No revelar si el correo existe o no
 */
export async function resetClientPassword(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return {
      success: false,
      message: 'Por favor ingresa un correo electrónico válido.'
    };
  }

  try {
    if (isFirebaseConfigured) {
      await sendPasswordResetEmail(auth, cleanEmail);
    }
  } catch (err) {
    console.warn('Aviso enviando correo de recuperación:', err);
  }

  return {
    success: true,
    message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.'
  };
}

/**
 * CREAR ACCESO DE CLIENTE DESDE ADMINISTRACIÓN (createClientAccess)
 * Sección 6 y 7: Vincula usuario Firebase Auth con documento clients/{id}
 * Utiliza una instancia secundaria para no desloguear al administrador.
 */
export async function createClientAccess(
  clientId: string,
  clientEmail: string,
  initialPassword?: string
): Promise<{ success: boolean; error?: string; email?: string }> {
  const cleanEmail = clientEmail.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Por favor ingresa un correo electrónico válido para el cliente.' };
  }

  const passwordToUse = initialPassword?.trim() || `TapRD_${Math.random().toString(36).slice(-6)}!`;
  const now = new Date().toISOString();

  // TODO: implementar sistema de invitaciones por email

  if (!isFirebaseConfigured) {
    return { success: true, email: cleanEmail };
  }

  try {
    let createdUid: string | null = null;
    const tempAppName = `CreateClient_${Date.now()}`;
    const secondaryApp = initializeApp(firebaseConfig, tempAppName);
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, passwordToUse);
      createdUid = userCred.user.uid;
      await updateProfile(userCred.user, { displayName: `Cliente ${cleanEmail.split('@')[0]}` });
    } catch (createErr: any) {
      if (createErr.code === 'auth/email-already-in-use') {
        const usersQ = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const userSnap = await getDocs(usersQ);
        if (!userSnap.empty) {
          createdUid = userSnap.docs[0].id;
        }
      } else {
        await deleteApp(secondaryApp);
        throw createErr;
      }
    } finally {
      try {
        await deleteApp(secondaryApp);
      } catch {}
    }

    if (!createdUid) {
      createdUid = `usr-${Date.now().toString(36)}`;
    }

    // 1. Guardar o actualizar en users/{uid}
    const userRef = doc(db, 'users', createdUid);
    await setDoc(userRef, {
      uid: createdUid,
      email: cleanEmail,
      displayName: `Cliente ${cleanEmail.split('@')[0]}`,
      role: 'client',
      clientId: clientId,
      createdAt: now,
      lastLogin: null
    }, { merge: true });

    // 2. Actualizar el documento en clients/{clientId}
    const clientRef = doc(db, 'clients', clientId);
    await updateDoc(clientRef, {
      userId: createdUid,
      clientEmail: cleanEmail,
      accessStatus: 'active',
      plan: 'starter',
      subscriptionStatus: 'active',
      permissions: DEFAULT_CLIENT_PERMISSIONS,
      updatedAt: now
    });

    // Enviar correo de restablecimiento/invitación para que defina su contraseña
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch {}

    return { success: true, email: cleanEmail };
  } catch (err: any) {
    console.error('Error al crear acceso para el cliente:', err);
    return { success: false, error: translateFirebaseError(err) };
  }
}

/**
 * SUSPENDER / REACTIVAR ACCESO DE CLIENTE (toggleClientAccess)
 * Sección 35: Modifica accessStatus ('active' | 'suspended')
 */
export async function toggleClientAccess(
  clientId: string,
  newAccessStatus: 'active' | 'suspended'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (isFirebaseConfigured) {
      const clientRef = doc(db, 'clients', clientId);
      await updateDoc(clientRef, {
        accessStatus: newAccessStatus,
        updatedAt: new Date().toISOString()
      });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: translateFirebaseError(err) };
  }
}

// Alias para compatibilidad
export const signOut = logoutAdmin;
export const getStoredAdminUser = getCurrentUser;

export interface LoginUserResult {
  success: boolean;
  role?: 'ADMIN' | 'CLIENT';
  user?: AppUser;
  client?: Client;
  error?: string;
}

/**
 * INICIO DE SESIÓN UNIFICADO (loginUser)
 * Autentica mediante Firebase Authentication Email/Password
 * Determina rol: ADMIN o CLIENT
 * Valida estado activo
 * Retorna destino adecuado (/admin o /cliente)
 */
export async function loginUser(email: string, pass: string): Promise<LoginUserResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: 'Por favor ingresa tu correo electrónico y contraseña.' };
  }

  if (!isFirebaseConfigured) {
    return {
      success: false,
      error: 'Firebase no está configurado.'
    };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
    const fbUser = cred.user;
    const now = new Date().toISOString();

    const isOwnerAdmin = isAuthorizedAdminEmail(cleanEmail);

    // 1. Consultar users/{fbUser.uid} en Firestore
    let role: 'ADMIN' | 'CLIENT' = isOwnerAdmin ? 'ADMIN' : 'CLIENT';
    let clientId: string | undefined = undefined;
    let isActive = true;
    let displayName = fbUser.displayName || cleanEmail.split('@')[0];

    const userRef = doc(db, 'users', fbUser.uid);
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data();
        // Solo el propietario verificado puede ser ADMIN
        if (isOwnerAdmin) {
          role = 'ADMIN';
        } else {
          role = 'CLIENT';
          // Corregir de inmediato si tenía un rol erróneo en la base de datos
          if (uData.role && (uData.role === 'admin' || uData.role === 'ADMIN' || uData.role === 'superadmin')) {
            updateDoc(userRef, { role: 'CLIENT', updatedAt: now }).catch(() => {});
          }
        }
        clientId = uData.clientId;
        isActive = uData.active !== false;
        if (uData.displayName) displayName = uData.displayName;
        await updateDoc(userRef, { lastLogin: now, role: role });
      } else {
        // Inicializar documento en users/{uid}
        role = isOwnerAdmin ? 'ADMIN' : 'CLIENT';
        await setDoc(userRef, {
          uid: fbUser.uid,
          email: cleanEmail,
          displayName,
          role: role,
          active: true,
          createdAt: now,
          updatedAt: now,
          lastLogin: now
        }, { merge: true });
      }
    } catch (dbErr) {
      console.warn('[authService] Aviso leyendo users/{uid}:', dbErr);
    }

    if (!isActive) {
      await firebaseSignOut(auth);
      return {
        success: false,
        error: 'Tu cuenta ha sido desactivada o se encuentra en proceso de activación. Por favor comunícate con el soporte de TapRD.'
      };
    }

    // Si es ADMIN
    if (role === 'ADMIN') {
      const appUser: AppUser = {
        uid: fbUser.uid,
        email: cleanEmail,
        displayName,
        role: 'ADMIN',
        active: true,
        createdAt: now,
        lastLogin: now
      };

      cachedCurrentUser = appUser;
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(appUser));
      notifySubscribers(appUser);
      return { success: true, role: 'ADMIN', user: appUser };
    }

    // Si es CLIENT
    // 1. Buscar y auto-vincular el cliente asociado con máxima resiliencia
    const clientDoc = await findAndLinkClient(fbUser.uid, cleanEmail, clientId);

    // Validar si el cliente existe y está suspendido
    if (clientDoc) {
      if (clientDoc.accessStatus === 'suspended') {
        await firebaseSignOut(auth);
        return {
          success: false,
          error: 'Tu acceso al portal de cliente ha sido suspendido por el administrador de TapRD. Por favor comunícate con soporte.'
        };
      }
      if (clientDoc.active === false && clientDoc.status === 'inactive') {
        await firebaseSignOut(auth);
        return {
          success: false,
          error: 'Tu perfil de cliente se encuentra inactivo. Comunícate con el administrador.'
        };
      }
    }

    const appUser: AppUser = {
      uid: fbUser.uid,
      email: cleanEmail,
      displayName: clientDoc?.businessName || displayName,
      role: 'CLIENT',
      clientId: clientDoc?.id || clientId,
      active: true,
      createdAt: now,
      lastLogin: now
    };

    cachedCurrentUser = appUser;
    if (clientDoc) {
      localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(clientDoc));
    }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(appUser));
    notifySubscribers(appUser);

    return { success: true, role: 'CLIENT', user: appUser, client: clientDoc || undefined };
  } catch (err: any) {
    console.error('[authService] Error al iniciar sesión:', err);
    return { success: false, error: translateFirebaseError(err) };
  }
}

/**
 * RECUPERAR CONTRASEÑA
 * Envía correo oficial de restablecimiento a través de Firebase Authentication
 */
export async function sendPasswordReset(email: string): Promise<{ success: boolean; message: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, message: 'Por favor introduce tu correo electrónico.', error: 'Email requerido' };
  }

  if (!isFirebaseConfigured) {
    return {
      success: true,
      message: `(Modo demo) Se ha simulado el envío del correo de recuperación para: ${cleanEmail}`
    };
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return {
      success: true,
      message: 'Te hemos enviado un correo oficial de recuperación. Revisa tu bandeja de entrada o spam para restablecer tu contraseña.'
    };
  } catch (err: any) {
    console.error('[authService] Error enviando correo de recuperación:', err);
    return {
      success: false,
      message: translateFirebaseError(err),
      error: err.message
    };
  }
}

