import { db, auth, isFirebaseConfigured } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updatePassword,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { Client } from '../types/client';
import { AppUser } from '../types/user';

export interface ActivationRecord {
  id?: string;
  token: string;
  clientId: string;
  email: string;
  businessName: string;
  ownerName?: string;
  used: boolean;
  expiresAt: number; // timestamp ms
  createdAt: string;
  usedAt?: string | null;
  activatedUid?: string | null;
}

export interface VerifyTokenResult {
  valid: boolean;
  error?: string;
  email?: string;
  clientId?: string;
  businessName?: string;
  docId?: string;
}

const LOCAL_ACTIVATIONS_KEY = 'taprd_local_activations';

function getLocalActivations(): Record<string, ActivationRecord> {
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalActivation(record: ActivationRecord): void {
  try {
    const all = getLocalActivations();
    all[record.token] = record;
    localStorage.setItem(LOCAL_ACTIVATIONS_KEY, JSON.stringify(all));
  } catch {}
}

/**
 * Genera un token criptográfico seguro de activación
 */
function generateSecureToken(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return `act_${Date.now()}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
}

/**
 * Crea un token de activación seguro para un cliente
 */
export async function createActivationToken(
  clientId: string,
  email: string,
  businessName: string,
  ownerName?: string
): Promise<{ token: string; activationUrl: string }> {
  const token = generateSecureToken();
  const cleanEmail = email.trim().toLowerCase();
  const now = new Date().toISOString();
  // 7 días de validez
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  const record: ActivationRecord = {
    token,
    clientId,
    email: cleanEmail,
    businessName,
    ownerName: ownerName || businessName,
    used: false,
    expiresAt,
    createdAt: now,
    usedAt: null
  };

  // Guardar en Firestore si está configurado
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'activations', token), record);
    } catch (err) {
      console.warn('[ActivationService] Aviso guardando activación en Firestore, guardando local:', err);
      saveLocalActivation(record);
    }
  } else {
    saveLocalActivation(record);
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://taprd.com';
  const activationUrl = `${origin}/activar?token=${token}`;

  return { token, activationUrl };
}

/**
 * Valida si un token de activación es legítimo, no ha expirado y no ha sido utilizado
 */
export async function verifyActivationToken(token: string): Promise<VerifyTokenResult> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    return { valid: false, error: 'Enlace de activación inválido o inexistente.' };
  }

  // 1. Intentar buscar en Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'activations', cleanToken);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data() as ActivationRecord;
        if (data.used) {
          return {
            valid: false,
            error: 'Este enlace de activación ya fue utilizado. Puedes iniciar sesión con tus credenciales.'
          };
        }

        if (data.expiresAt && Date.now() > data.expiresAt) {
          return {
            valid: false,
            error: 'El enlace de activación ha expirado. Por favor solicita un nuevo enlace al administrador de TapRD.'
          };
        }

        return {
          valid: true,
          email: data.email,
          clientId: data.clientId,
          businessName: data.businessName,
          docId: snap.id
        };
      }
    } catch (err) {
      console.warn('[ActivationService] Error consultando token en Firestore:', err);
    }
  }

  // 2. Fallback a almacenamiento local
  const localActivations = getLocalActivations();
  const localRecord = localActivations[cleanToken];

  if (localRecord) {
    if (localRecord.used) {
      return {
        valid: false,
        error: 'Este enlace de activación ya fue utilizado. Puedes iniciar sesión con tus credenciales.'
      };
    }
    if (localRecord.expiresAt && Date.now() > localRecord.expiresAt) {
      return {
        valid: false,
        error: 'El enlace de activación ha expirado. Por favor solicita un nuevo enlace al administrador de TapRD.'
      };
    }

    return {
      valid: true,
      email: localRecord.email,
      clientId: localRecord.clientId,
      businessName: localRecord.businessName,
      docId: cleanToken
    };
  }

  return {
    valid: false,
    error: 'El enlace de activación es inválido o no existe. Verifica la URL recibida por correo.'
  };
}

/**
 * Completa la activación de la cuenta:
 * - Registra la contraseña en Firebase Authentication
 * - Marca la cuenta como activada
 * - Invalida el token para evitar reutilización
 * - Sincroniza users/{uid} y clients/{clientId}
 */
export async function completeActivation(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string; user?: AppUser; client?: Client }> {
  const verification = await verifyActivationToken(token);
  if (!verification.valid || !verification.email || !verification.clientId) {
    return {
      success: false,
      error: verification.error || 'No se puede activar la cuenta con este enlace.'
    };
  }

  const cleanEmail = verification.email.toLowerCase();
  const clientId = verification.clientId;
  const now = new Date().toISOString();

  let authUid = `client_${Date.now()}`;

  // 1. Crear o actualizar usuario en Firebase Authentication
  if (isFirebaseConfigured && auth) {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, newPassword);
      authUid = userCred.user.uid;
    } catch (authErr: any) {
      // Si el usuario ya fue pre-creado en Auth por Admin SDK
      if (authErr.code === 'auth/email-already-in-use') {
        try {
          // Intentar iniciar sesión para actualizar contraseña
          const loginCred = await signInWithEmailAndPassword(auth, cleanEmail, newPassword);
          authUid = loginCred.user.uid;
        } catch {
          // Si la contraseña anterior no coincide, solicitar reset email
          try {
            await sendPasswordResetEmail(auth, cleanEmail);
            return {
              success: false,
              error: 'Ya existe una cuenta con este correo. Se ha enviado un correo adicional de restablecimiento de contraseña para verificar tu identidad.'
            };
          } catch (resetErr: any) {
            return {
              success: false,
              error: 'Esta cuenta ya está registrada. Por favor utiliza la opción "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión.'
            };
          }
        }
      } else {
        return {
          success: false,
          error: authErr.message || 'Error al crear la cuenta en el servicio de autenticación.'
        };
      }
    }
  }

  // 2. Crear / Actualizar documento en users/{uid}
  // Estructura requerida: uid, email, role = 'CLIENT', clientId, active = true, createdAt, updatedAt
  const userDocData: AppUser = {
    uid: authUid,
    email: cleanEmail,
    role: 'CLIENT',
    clientId: clientId,
    active: true,
    displayName: verification.businessName || 'Cliente TapRD',
    createdAt: now,
    updatedAt: now,
    lastLogin: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'users', authUid), {
        uid: authUid,
        email: cleanEmail,
        role: 'CLIENT',
        clientId: clientId,
        active: true,
        displayName: verification.businessName || 'Cliente TapRD',
        createdAt: now,
        updatedAt: now,
        lastLogin: now
      }, { merge: true });
    } catch (userDbErr) {
      console.warn('[ActivationService] Aviso actualizando users/{uid} en Firestore:', userDbErr);
    }

    // 3. Actualizar documento en clients/{clientId}
    try {
      await updateDoc(doc(db, 'clients', clientId), {
        userId: authUid,
        clientEmail: cleanEmail,
        active: true,
        status: 'active',
        accessStatus: 'active',
        updatedAt: now
      });
    } catch (clientDbErr) {
      console.warn('[ActivationService] Aviso actualizando clients/{clientId} en Firestore:', clientDbErr);
    }

    // 4. Invalidar token en Firestore
    try {
      await updateDoc(doc(db, 'activations', token), {
        used: true,
        usedAt: now,
        activatedUid: authUid
      });
    } catch (actErr) {
      console.warn('[ActivationService] Aviso invalidando token en Firestore:', actErr);
    }
  }

  // Actualizar copia local
  const localActivations = getLocalActivations();
  if (localActivations[token]) {
    localActivations[token].used = true;
    localActivations[token].usedAt = now;
    localActivations[token].activatedUid = authUid;
    localStorage.setItem(LOCAL_ACTIVATIONS_KEY, JSON.stringify(localActivations));
  }

  // Recuperar datos completos del cliente para iniciar sesión inmediata
  let clientData: Client | null = null;
  if (isFirebaseConfigured && db) {
    try {
      const cSnap = await getDoc(doc(db, 'clients', clientId));
      if (cSnap.exists()) {
        clientData = { ...(cSnap.data() as Client), id: cSnap.id, active: true, accessStatus: 'active' };
      }
    } catch {}
  }

  // Establecer sesión local para redirección directa
  if (typeof window !== 'undefined') {
    localStorage.setItem('taprd_client_session', JSON.stringify(clientData || {
      id: clientId,
      businessName: verification.businessName || 'Mi Negocio',
      email: cleanEmail,
      active: true,
      accessStatus: 'active'
    }));
    localStorage.setItem('taprd_admin_session', JSON.stringify(userDocData));
    localStorage.setItem('taprd_admin_session_v2', JSON.stringify(userDocData));
  }

  return {
    success: true,
    user: userDocData,
    client: clientData || undefined
  };
}
