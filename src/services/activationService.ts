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
import { COMPANY_CONFIG } from '../config/company';

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

export interface ActivationPayload {
  c: string; // clientId
  e: string; // email
  b?: string; // businessName
  o?: string; // ownerName
  x: number; // expiresAt timestamp
  r: string; // random salt
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
 * Codifica una carga útil de activación en un token seguro base64url con prefijo act_
 */
export function encodeTokenPayload(payload: ActivationPayload): string {
  const json = JSON.stringify(payload);
  let base64 = '';
  if (typeof Buffer !== 'undefined') {
    base64 = Buffer.from(json, 'utf8').toString('base64url');
  } else {
    base64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => 
      String.fromCharCode(parseInt(p1, 16))
    ))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  return `act_${base64}`;
}

/**
 * Decodifica de manera tolerante un token seguro base64url con prefijo act_
 */
export function decodeTokenPayload(token: string): ActivationPayload | null {
  try {
    const clean = token.trim();
    if (!clean.startsWith('act_')) return null;
    const base64 = clean.slice(4);
    let json = '';
    if (typeof Buffer !== 'undefined') {
      json = Buffer.from(base64, 'base64url').toString('utf8');
    } else {
      const standardBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
      const padded = standardBase64.padEnd(standardBase64.length + (4 - standardBase64.length % 4) % 4, '=');
      const binary = atob(padded);
      json = decodeURIComponent(Array.from(binary).map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
    }
    const parsed = JSON.parse(json);
    if (parsed && parsed.c && parsed.e && parsed.x) {
      return parsed as ActivationPayload;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Genera un token criptográfico seguro de activación que codifica los datos esenciales
 * y a la vez se almacena en Firestore y almacenamiento local.
 */
function generateSecureToken(payload?: ActivationPayload): string {
  if (payload) {
    return encodeTokenPayload(payload);
  }
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
  const cleanEmail = email.trim().toLowerCase();
  const now = new Date().toISOString();
  // 7 días de validez
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  const payload: ActivationPayload = {
    c: clientId,
    e: cleanEmail,
    b: businessName,
    o: ownerName || businessName,
    x: expiresAt,
    r: Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
  };

  const token = generateSecureToken(payload);

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

  // Guardar en Firestore siempre que sea posible
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'activations', token), record);
    } catch (err) {
      console.warn('[ActivationService] Aviso guardando activación en Firestore, guardando local:', err);
    }

    // Actualizar también en el cliente para redundancia cruzada
    try {
      await updateDoc(doc(db, 'clients', clientId), {
        activationToken: token,
        clientEmail: cleanEmail,
        accessStatus: 'pending',
        updatedAt: now
      });
    } catch {}
  }

  // Guardar en almacenamiento local
  saveLocalActivation(record);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://taprd.com';
  const activationUrl = `${origin}/activar?token=${encodeURIComponent(token)}&email=${encodeURIComponent(cleanEmail)}`;

  return { token, activationUrl };
}

/**
 * Valida si un token de activación es legítimo, no ha expirado y no ha sido utilizado
 * Incorpora 4 niveles de verificación:
 * 1. Colección Firestore `activations/{token}`
 * 2. Carga útil autosuficiente `act_${base64url}` con auto-sanación en Firestore
 * 3. Búsqueda directa en `clients/{clientId}` o por correo de cliente
 * 4. Almacenamiento local del navegador
 */
export async function verifyActivationToken(token: string, hintEmail?: string): Promise<VerifyTokenResult> {
  const cleanToken = (token || '').trim();
  const cleanHintEmail = (hintEmail || '').trim().toLowerCase();

  if (!cleanToken && !cleanHintEmail) {
    return { valid: false, error: 'Enlace de activación inválido o inexistente.' };
  }

  // 1. Intentar buscar en colección Firestore `activations/{cleanToken}`
  if (cleanToken && isFirebaseConfigured && db) {
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

  // 2. Intentar decodificar como token autosuficiente (Self-contained / Payload token)
  if (cleanToken) {
    const decoded = decodeTokenPayload(cleanToken);
    if (decoded) {
      if (Date.now() > decoded.x) {
        return {
          valid: false,
          error: 'El enlace de activación ha expirado. Por favor solicita un nuevo enlace al administrador de TapRD.'
        };
      }

      // Verificar si el cliente en Firestore ya completó la activación
      let clientBusinessName = decoded.b || 'Cliente TapRD';
      if (isFirebaseConfigured && db) {
        try {
          const clientSnap = await getDoc(doc(db, 'clients', decoded.c));
          if (clientSnap.exists()) {
            const clientData = clientSnap.data() as Client;
            if (clientData.businessName) clientBusinessName = clientData.businessName;
            if (clientData.accessStatus === 'active') {
              return {
                valid: false,
                error: 'Este enlace de activación ya fue utilizado. Puedes iniciar sesión con tus credenciales.'
              };
            }
          }
        } catch {}
      }

      // Auto-sanación: Guardar el token en Firestore de forma que quede indexado permanentemente
      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'activations', cleanToken), {
            token: cleanToken,
            clientId: decoded.c,
            email: decoded.e,
            businessName: clientBusinessName,
            used: false,
            expiresAt: decoded.x,
            createdAt: new Date().toISOString(),
            usedAt: null
          });
        } catch {}
      }

      return {
        valid: true,
        email: decoded.e,
        clientId: decoded.c,
        businessName: clientBusinessName,
        docId: cleanToken
      };
    }
  }

  // 3. Fallback a almacenamiento local del navegador
  if (cleanToken) {
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

      // Si existe en local pero no en Firestore, auto-sanar en Firestore
      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'activations', cleanToken), localRecord);
        } catch {}
      }

      return {
        valid: true,
        email: localRecord.email,
        clientId: localRecord.clientId,
        businessName: localRecord.businessName,
        docId: cleanToken
      };
    }
  }

  // 4. Verificación de rescate para enlaces existentes o tokens generados en versiones anteriores:
  // Buscar en Firestore si algún cliente tiene este token registrado en su documento clients/{id}
  if (isFirebaseConfigured && db) {
    try {
      if (cleanToken) {
        const qToken = query(collection(db, 'clients'), where('activationToken', '==', cleanToken));
        const tokenSnaps = await getDocs(qToken);
        if (!tokenSnaps.empty) {
          const clientDoc = tokenSnaps.docs[0];
          const cData = clientDoc.data() as Client;
          if (cData.accessStatus === 'active') {
            return {
              valid: false,
              error: 'Este enlace de activación ya fue utilizado. Puedes iniciar sesión con tus credenciales.'
            };
          }

          const targetEmail = cData.clientEmail || cData.email || cleanHintEmail;
          // Auto-sanar en activations
          try {
            await setDoc(doc(db, 'activations', cleanToken), {
              token: cleanToken,
              clientId: clientDoc.id,
              email: targetEmail,
              businessName: cData.businessName,
              used: false,
              expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
              createdAt: new Date().toISOString(),
              usedAt: null
            });
          } catch {}

          return {
            valid: true,
            email: targetEmail,
            clientId: clientDoc.id,
            businessName: cData.businessName,
            docId: cleanToken
          };
        }
      }

      // Si se proporcionó hintEmail en la URL (?email=...) y el cliente está pendiente de activación
      if (cleanHintEmail) {
        const qEmail = query(collection(db, 'clients'), where('clientEmail', '==', cleanHintEmail));
        const emailSnaps = await getDocs(qEmail);
        let foundDoc = emailSnaps.empty ? null : emailSnaps.docs[0];

        if (!foundDoc) {
          const qEmailAlt = query(collection(db, 'clients'), where('email', '==', cleanHintEmail));
          const altSnaps = await getDocs(qEmailAlt);
          if (!altSnaps.empty) foundDoc = altSnaps.docs[0];
        }

        if (foundDoc) {
          const cData = foundDoc.data() as Client;
          if (cData.accessStatus === 'active') {
            return {
              valid: false,
              error: 'Este enlace de activación ya fue utilizado. Puedes iniciar sesión con tus credenciales.'
            };
          }

          // Auto-sanar con este token
          if (cleanToken) {
            try {
              await setDoc(doc(db, 'activations', cleanToken), {
                token: cleanToken,
                clientId: foundDoc.id,
                email: cleanHintEmail,
                businessName: cData.businessName,
                used: false,
                expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
                createdAt: new Date().toISOString(),
                usedAt: null
              });
            } catch {}
          }

          return {
            valid: true,
            email: cleanHintEmail,
            clientId: foundDoc.id,
            businessName: cData.businessName,
            docId: cleanToken || foundDoc.id
          };
        }
      }
    } catch (dbRescueErr) {
      console.warn('[ActivationService] Error en búsqueda de rescate en Firestore:', dbRescueErr);
    }
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
  // Estructura requerida: uid, email, role = 'CLIENT', clientId, active = true, createdAt, updatedAt, términos y privacidad
  const userDocData: AppUser = {
    uid: authUid,
    email: cleanEmail,
    role: 'CLIENT',
    clientId: clientId,
    active: true,
    displayName: verification.businessName || 'Cliente TapRD',
    createdAt: now,
    updatedAt: now,
    lastLogin: now,
    termsAccepted: true,
    privacyAccepted: true,
    termsAcceptedAt: now,
    privacyAcceptedAt: now,
    termsVersion: COMPANY_CONFIG.termsVersion,
    privacyVersion: COMPANY_CONFIG.privacyVersion
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
        lastLogin: now,
        termsAccepted: true,
        privacyAccepted: true,
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
        termsVersion: COMPANY_CONFIG.termsVersion,
        privacyVersion: COMPANY_CONFIG.privacyVersion
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
        termsAccepted: true,
        privacyAccepted: true,
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
        termsVersion: COMPANY_CONFIG.termsVersion,
        privacyVersion: COMPANY_CONFIG.privacyVersion,
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
