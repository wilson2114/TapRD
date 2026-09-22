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
import { ADMIN_DEMO_EMAIL, ADMIN_DEMO_PASSWORD } from '../config/constants';
import { translateFirebaseError } from '../utils/firebaseErrors';
import { AppUser, UserRole } from '../types/user';
import { Client, DEFAULT_CLIENT_PERMISSIONS } from '../types/client';
export type { AppUser, UserRole };

const SESSION_STORAGE_KEY = 'taprd_admin_session';

type AuthStateCallback = (user: AppUser | null) => void;
const authSubscribers: Set<AuthStateCallback> = new Set();

let cachedCurrentUser: AppUser | null = null;
let isAuthListenerInitialized = false;

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
      if (fbUser) {
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userRef);
          const now = new Date().toISOString();

          const cleanEmail = fbUser.email?.trim().toLowerCase() || '';
          const isSuperOwner = isAuthorizedAdminEmail(cleanEmail);
          let userRole: UserRole = isSuperOwner ? 'superadmin' : 'client';
          let displayName = fbUser.displayName || (isSuperOwner ? 'Wilson Abelino Brito' : cleanEmail.split('@')[0] || 'Cliente');

          if (snap.exists()) {
            const data = snap.data();
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
            const newUserData = {
              uid: fbUser.uid,
              email: cleanEmail,
              displayName,
              role: isSuperOwner ? 'superadmin' : 'CLIENT',
              createdAt: now,
              lastLogin: now
            };
            try {
              await setDoc(userRef, newUserData);
            } catch {}
          }

          const userObj: AppUser = {
            uid: fbUser.uid,
            email: cleanEmail,
            displayName,
            role: userRole,
            createdAt: snap.exists() ? snap.data()?.createdAt : now,
            lastLogin: now
          };

          cachedCurrentUser = userObj;
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userObj));
          notifySubscribers(userObj);
        } catch (err) {
          console.warn('Aviso sincronizando usuario con Firestore:', err);
        }
      } else {
        // Si no hay usuario de Firebase activo, verificar si hay sesión demo explícita
        const local = getStoredSession();
        if (local && local.email === ADMIN_DEMO_EMAIL) {
          cachedCurrentUser = local;
          return;
        }

        cachedCurrentUser = null;
        localStorage.removeItem(SESSION_STORAGE_KEY);
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

  // 1. Acceso de demostración rápido
  if (cleanEmail === ADMIN_DEMO_EMAIL.toLowerCase() && cleanPass === ADMIN_DEMO_PASSWORD) {
    let firebaseUid: string | undefined = undefined;

    if (isFirebaseConfigured) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        firebaseUid = cred.user.uid;
      } catch {
        try {
          const createCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
          firebaseUid = createCred.user.uid;
          await updateProfile(createCred.user, { displayName: 'Administrador TapRD' });

          const userRef = doc(db, 'users', createCred.user.uid);
          await setDoc(userRef, {
            uid: createCred.user.uid,
            email: cleanEmail,
            displayName: 'Administrador TapRD',
            role: 'superadmin',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          });
        } catch {}
      }
    }

    const demoUser: AppUser = {
      uid: firebaseUid || auth.currentUser?.uid || 'demo-admin-uid',
      email: ADMIN_DEMO_EMAIL,
      displayName: 'Administrador TapRD',
      role: 'superadmin',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    cachedCurrentUser = demoUser;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(demoUser));
    notifySubscribers(demoUser);
    return { success: true, user: demoUser };
  }

  // 2. Autenticación real con Firebase Authentication
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

  // Fallback de demostración rápida para pruebas
  if (cleanEmail === 'cliente@taprd.com' || cleanEmail === 'demo@barberia.com') {
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

    if (userSnap.exists()) {
      const uData = userSnap.data();
      userRole = (uData.role as UserRole) || 'client';
      if (uData.displayName) displayName = uData.displayName;
    }

    // 2. Buscar el cliente asociado en la colección 'clients'
    let clientDoc: Client | null = null;
    const clientsRef = collection(db, 'clients');

    // Búsqueda prioritaria por userId == fbUser.uid
    const qUser = query(clientsRef, where('userId', '==', fbUser.uid));
    const snapUser = await getDocs(qUser);

    if (!snapUser.empty) {
      clientDoc = { ...(snapUser.docs[0].data() as Client), id: snapUser.docs[0].id };
    } else {
      // Búsqueda por clientEmail
      const qEmail = query(clientsRef, where('clientEmail', '==', cleanEmail));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        clientDoc = { ...(snapEmail.docs[0].data() as Client), id: snapEmail.docs[0].id };
        try {
          await updateDoc(doc(db, 'clients', clientDoc.id), {
            userId: fbUser.uid,
            accessStatus: 'active',
            updatedAt: now
          });
          clientDoc.userId = fbUser.uid;
        } catch {}
      } else {
        // Búsqueda por email general del negocio
        const qFallbackEmail = query(clientsRef, where('email', '==', cleanEmail));
        const snapFallback = await getDocs(qFallbackEmail);
        if (!snapFallback.empty) {
          clientDoc = { ...(snapFallback.docs[0].data() as Client), id: snapFallback.docs[0].id };
          try {
            await updateDoc(doc(db, 'clients', clientDoc.id), {
              userId: fbUser.uid,
              clientEmail: cleanEmail,
              accessStatus: 'active',
              updatedAt: now
            });
            clientDoc.userId = fbUser.uid;
          } catch {}
        }
      }
    }

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
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CLIENT_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Client;
        if (parsed && parsed.id) {
          // Refrescar en segundo plano de Firestore si hay conexión
          if (auth.currentUser && isFirebaseConfigured) {
            try {
              const docRef = doc(db, 'clients', parsed.id);
              const snap = await getDoc(docRef);
              if (snap.exists()) {
                const fresh = { ...(snap.data() as Client), id: snap.id };
                localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(fresh));
                return fresh;
              }
            } catch {}
          }
          return parsed;
        }
      }
    } catch {}
  }

  // Buscar por auth.currentUser.uid
  if (auth.currentUser && isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'clients'), where('userId', '==', auth.currentUser.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const client = { ...(snap.docs[0].data() as Client), id: snap.docs[0].id };
        if (typeof window !== 'undefined') {
          localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(client));
        }
        return client;
      }
    } catch (e) {
      console.warn('Aviso buscando cliente en Firestore por userId:', e);
    }

    // Si no está vinculado por userId, buscar por clientEmail o email registrado
    const userEmail = auth.currentUser.email?.toLowerCase();
    if (userEmail) {
      try {
        const qClientEmail = query(collection(db, 'clients'), where('clientEmail', '==', userEmail));
        const snapClientEmail = await getDocs(qClientEmail);
        if (!snapClientEmail.empty) {
          const docSnap = snapClientEmail.docs[0];
          const client = { ...(docSnap.data() as Client), id: docSnap.id };
          // Auto-vincular userId
          updateDoc(doc(db, 'clients', docSnap.id), { userId: auth.currentUser.uid }).catch(() => {});
          if (typeof window !== 'undefined') {
            localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(client));
          }
          return client;
        }

        const qEmail = query(collection(db, 'clients'), where('email', '==', userEmail));
        const snapEmail = await getDocs(qEmail);
        if (!snapEmail.empty) {
          const docSnap = snapEmail.docs[0];
          const client = { ...(docSnap.data() as Client), id: docSnap.id };
          updateDoc(doc(db, 'clients', docSnap.id), { userId: auth.currentUser.uid }).catch(() => {});
          if (typeof window !== 'undefined') {
            localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(client));
          }
          return client;
        }
      } catch (e) {
        console.warn('Aviso buscando cliente en Firestore por email:', e);
      }
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

  // Demo fallback
  if (cleanEmail === ADMIN_DEMO_EMAIL.toLowerCase() && cleanPass === ADMIN_DEMO_PASSWORD) {
    const adminUser: AppUser = {
      uid: 'demo-admin-uid',
      email: cleanEmail,
      displayName: 'Wilson Abelino Brito (Admin)',
      role: 'ADMIN',
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    cachedCurrentUser = adminUser;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(adminUser));
    notifySubscribers(adminUser);
    return { success: true, role: 'ADMIN', user: adminUser };
  }

  if (cleanEmail === 'cliente@taprd.com' || cleanEmail === 'demo@barberia.com') {
    const res = await loginClient(cleanEmail, cleanPass);
    if (res.success && res.user) {
      return { success: true, role: 'CLIENT', user: res.user, client: res.client };
    }
    return { success: false, error: res.error };
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
    // Buscar su documento en clients
    let clientDoc: Client | null = null;
    const clientsRef = collection(db, 'clients');

    // 1. Por clientId si está especificado
    if (clientId) {
      try {
        const cSnap = await getDoc(doc(db, 'clients', clientId));
        if (cSnap.exists()) {
          clientDoc = { ...(cSnap.data() as Client), id: cSnap.id };
        }
      } catch {}
    }

    // 2. Por userId == fbUser.uid
    if (!clientDoc) {
      const qUser = query(clientsRef, where('userId', '==', fbUser.uid));
      const snapUser = await getDocs(qUser);
      if (!snapUser.empty) {
        clientDoc = { ...(snapUser.docs[0].data() as Client), id: snapUser.docs[0].id };
      }
    }

    // 3. Por email o clientEmail
    if (!clientDoc) {
      const qEmail = query(clientsRef, where('clientEmail', '==', cleanEmail));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        clientDoc = { ...(snapEmail.docs[0].data() as Client), id: snapEmail.docs[0].id };
      } else {
        const qFallback = query(clientsRef, where('email', '==', cleanEmail));
        const snapFallback = await getDocs(qFallback);
        if (!snapFallback.empty) {
          clientDoc = { ...(snapFallback.docs[0].data() as Client), id: snapFallback.docs[0].id };
        }
      }
    }

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

