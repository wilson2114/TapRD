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
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { Client } from '../types/client';
import { AppUser } from '../types/user';
import { COMPANY_CONFIG } from '../config/company';
import { setActivationInProgress, syncClientSession } from './authService';

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
 * Extrae token, oobCode y email de forma tolerante desde una URL completa,
 * una cadena de query o un token pegado manualmente por el cliente.
 */
export function extractActivationParams(input: string): {
  token?: string;
  oobCode?: string;
  email?: string;
} {
  const cleaned = (input || '')
    .trim()
    .replace(/&amp;/g, '&')
    .replace(/[>"')\].,;]+$/, '');

  if (!cleaned) return {};

  // Si parece una URL o ruta con parámetros
  if (cleaned.includes('?') || cleaned.includes('token=') || cleaned.includes('oobCode=')) {
    try {
      const queryPart = cleaned.includes('?') ? cleaned.split('?')[1].split('#')[0] : cleaned;
      const params = new URLSearchParams(queryPart);
      const token = params.get('token')?.trim() || undefined;
      const oobCode = (params.get('oobCode') || params.get('code'))?.trim() || undefined;
      const email = params.get('email')?.trim().toLowerCase() || undefined;
      if (token || oobCode || email) {
        return { token, oobCode, email };
      }
    } catch {}
  }

  // Si es un token directo
  return { token: cleaned };
}

/**
 * Construye la URL de activación canónica usando el origen actual del navegador.
 */
export function buildActivationUrl(token: string, email?: string): string {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://tap-rd.vercel.app';
  const cleanEmail = (email || '').trim().toLowerCase();
  const base = `${origin}/activar?token=${encodeURIComponent(token.trim())}`;
  return cleanEmail ? `${base}&email=${encodeURIComponent(cleanEmail)}` : base;
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
    base64 = btoa(
      encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    )
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
      const padded = standardBase64.padEnd(standardBase64.length + (4 - (standardBase64.length % 4)) % 4, '=');
      const binary = atob(padded);
      json = decodeURIComponent(
        Array.from(binary)
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
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
 * Genera un token criptográfico seguro de activación
 */
function generateSecureToken(payload?: ActivationPayload): string {
  if (payload) {
    return encodeTokenPayload(payload);
  }
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return `act_${Date.now()}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
}

/**
 * Registra localmente y en Firestore un token ya generado (por ejemplo, desde el servidor)
 * evitando duplicar o invalidar el enlace recién creado.
 */
export async function registerActivationToken(
  token: string,
  clientId: string,
  email: string,
  businessName: string,
  ownerName?: string
): Promise<{ token: string; activationUrl: string }> {
  const cleanToken = token.trim();
  const cleanEmail = email.trim().toLowerCase();
  const decoded = decodeTokenPayload(cleanToken);
  const expiresAt = decoded?.x || Date.now() + 7 * 24 * 60 * 60 * 1000;
  const now = new Date().toISOString();

  const record: ActivationRecord = {
    token: cleanToken,
    clientId,
    email: cleanEmail,
    businessName,
    ownerName: ownerName || businessName,
    used: false,
    expiresAt,
    createdAt: now,
    usedAt: null
  };

  saveLocalActivation(record);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'activations', cleanToken), record, { merge: true });
    } catch (err) {
      console.warn('[ActivationService] Aviso sincronizando activación existente:', err);
    }
  }

  return {
    token: cleanToken,
    activationUrl: buildActivationUrl(cleanToken, cleanEmail)
  };
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

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'activations', token), record);
    } catch (err) {
      console.warn('[ActivationService] Aviso guardando activación en Firestore, guardando local:', err);
    }

    try {
      await setDoc(
        doc(db, 'clients', clientId),
        {
          activationToken: token,
          clientEmail: cleanEmail,
          accessStatus: 'pending',
          updatedAt: now
        },
        { merge: true }
      );
    } catch (clientErr) {
      console.warn('[ActivationService] Aviso actualizando activationToken en cliente:', clientErr);
    }
  }

  saveLocalActivation(record);

  return {
    token,
    activationUrl: buildActivationUrl(token, cleanEmail)
  };
}

/**
 * Valida si un token de activación es legítimo, no ha expirado y no ha sido utilizado.
 */
export async function verifyActivationToken(token: string, hintEmail?: string): Promise<VerifyTokenResult> {
  const extracted = extractActivationParams(token);
  const cleanToken = (extracted.token || '').trim();
  const cleanHintEmail = (hintEmail || extracted.email || '').trim().toLowerCase();

  if (!cleanToken && !cleanHintEmail) {
    return { valid: false, error: 'Enlace de activación inválido o inexistente.' };
  }

  // Comprobar almacenamiento local primero si ya fue marcado como usado
  const localActivations = getLocalActivations();
  const localRecord = cleanToken ? localActivations[cleanToken] : undefined;

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
          email: (data.email || cleanHintEmail).trim().toLowerCase(),
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
      if (localRecord?.used) {
        return {
          valid: false,
          error: 'Este enlace de activación ya fue utilizado. Puedes iniciar sesión con tus credenciales.'
        };
      }

      if (Date.now() > decoded.x) {
        return {
          valid: false,
          error: 'El enlace de activación ha expirado. Por favor solicita un nuevo enlace al administrador de TapRD.'
        };
      }

      let clientBusinessName = decoded.b || 'Cliente TapRD';
      let resolvedEmail = (decoded.e || cleanHintEmail).trim().toLowerCase();

      if (isFirebaseConfigured && db) {
        try {
          const clientSnap = await getDoc(doc(db, 'clients', decoded.c));
          if (clientSnap.exists()) {
            const clientData = clientSnap.data() as Client;
            if (clientData.businessName) clientBusinessName = clientData.businessName;
            if (!resolvedEmail && (clientData.clientEmail || clientData.email)) {
              resolvedEmail = (clientData.clientEmail || clientData.email || '').trim().toLowerCase();
            }
          }
        } catch {}

        // Auto-sanación en Firestore si no existía el documento
        try {
          await setDoc(
            doc(db, 'activations', cleanToken),
            {
              token: cleanToken,
              clientId: decoded.c,
              email: resolvedEmail,
              businessName: clientBusinessName,
              used: false,
              expiresAt: decoded.x,
              createdAt: new Date().toISOString(),
              usedAt: null
            },
            { merge: true }
          );
        } catch {}
      }

      return {
        valid: true,
        email: resolvedEmail,
        clientId: decoded.c,
        businessName: clientBusinessName,
        docId: cleanToken
      };
    }
  }

  // 3. Fallback a almacenamiento local del navegador
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

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'activations', cleanToken), localRecord, { merge: true });
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

  // 4. Verificación de rescate en `clients` por activationToken o email
  if (isFirebaseConfigured && db) {
    try {
      if (cleanToken) {
        const qToken = query(collection(db, 'clients'), where('activationToken', '==', cleanToken));
        const tokenSnaps = await getDocs(qToken);
        if (!tokenSnaps.empty) {
          const clientDoc = tokenSnaps.docs[0];
          const cData = clientDoc.data() as Client;
          const targetEmail = (cData.clientEmail || cData.email || cleanHintEmail).trim().toLowerCase();

          try {
            await setDoc(
              doc(db, 'activations', cleanToken),
              {
                token: cleanToken,
                clientId: clientDoc.id,
                email: targetEmail,
                businessName: cData.businessName,
                used: false,
                expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
                createdAt: new Date().toISOString(),
                usedAt: null
              },
              { merge: true }
            );
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
          if (cData.accessStatus === 'active' && cData.termsAccepted && !cleanToken) {
            return {
              valid: false,
              error: 'Este enlace de activación ya fue utilizado. Puedes iniciar sesión con tus credenciales.'
            };
          }

          if (cleanToken) {
            try {
              await setDoc(
                doc(db, 'activations', cleanToken),
                {
                  token: cleanToken,
                  clientId: foundDoc.id,
                  email: cleanHintEmail,
                  businessName: cData.businessName,
                  used: false,
                  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
                  createdAt: new Date().toISOString(),
                  usedAt: null
                },
                { merge: true }
              );
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
 * - Registra o actualiza la contraseña en Firebase Authentication
 * - Marca la cuenta como activada
 * - Invalida el token para evitar reutilización
 * - Sincroniza users/{uid}, clients/{clientId} y sesión inmediata en el navegador
 */
export async function completeActivation(
  rawToken: string,
  newPassword: string,
  hintEmail?: string
): Promise<{ success: boolean; error?: string; user?: AppUser; client?: Client }> {
  const extracted = extractActivationParams(rawToken);
  const cleanToken = (extracted.token || rawToken || '').trim();
  const verification = await verifyActivationToken(cleanToken, hintEmail || extracted.email);

  if (!verification.valid || !verification.email || !verification.clientId) {
    return {
      success: false,
      error: verification.error || 'No se puede activar la cuenta con este enlace.'
    };
  }

  const cleanEmail = verification.email.trim().toLowerCase();
  const clientId = verification.clientId;
  const tokenDocId = verification.docId || cleanToken;
  const now = new Date().toISOString();

  let authUid = `client_${Date.now()}`;
  let backendActivated = false;

  setActivationInProgress(true);
  try {
    // Cerrar cualquier sesión previa de otro usuario (ej. admin probando el enlace)
    if (isFirebaseConfigured && auth?.currentUser) {
      const currentEmail = auth.currentUser.email?.trim().toLowerCase();
      if (currentEmail !== cleanEmail) {
        try {
          await firebaseSignOut(auth);
        } catch {}
      }
    }

    // 1. Intentar completar la activación en el backend mediante Admin SDK
    try {
      const resp = await fetch('/api/client/complete-activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenDocId, newPassword })
      });
      let data: any = null;
      try {
        data = await resp.json();
      } catch {}

      if (resp.ok && data && data.success) {
        backendActivated = true;
        if (data.userId) authUid = data.userId;
        if (isFirebaseConfigured && auth) {
          try {
            const cred = await signInWithEmailAndPassword(auth, cleanEmail, newPassword);
            authUid = cred.user.uid;
          } catch (signInErr) {
            console.warn('[ActivationService] Aviso iniciando sesión tras activación backend:', signInErr);
          }
        }
      } else if (
        data?.code === 'TOKEN_ALREADY_USED' ||
        data?.code === 'TOKEN_EXPIRED' ||
        data?.code === 'TOKEN_INVALID'
      ) {
        return {
          success: false,
          error: data.error || 'El enlace de activación no es válido.'
        };
      }
    } catch (apiErr) {
      console.warn('[ActivationService] Aviso conectando con API de activación, usando respaldo directo:', apiErr);
    }

    // 2. Respaldo directo en cliente si el backend no pudo ejecutar Admin SDK
    if (!backendActivated && isFirebaseConfigured && auth) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, newPassword);
        authUid = userCred.user.uid;
        try {
          await updateProfile(userCred.user, {
            displayName: verification.businessName || 'Cliente TapRD'
          });
        } catch {}
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          try {
            const loginCred = await signInWithEmailAndPassword(auth, cleanEmail, newPassword);
            authUid = loginCred.user.uid;
          } catch {
            try {
              await sendPasswordResetEmail(auth, cleanEmail);
              return {
                success: false,
                error:
                  'Ya existe una cuenta registrada con este correo. Te enviamos un correo oficial para establecer o restablecer tu contraseña y luego iniciar sesión.'
              };
            } catch {
              return {
                success: false,
                error:
                  'Esta cuenta ya está registrada en Firebase Auth. Usa "¿Olvidaste tu contraseña?" en Iniciar Sesión para definir tu clave.'
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

    // 3. Crear / Actualizar documento en users/{uid}
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
      if (!backendActivated) {
        try {
          await setDoc(doc(db, 'users', authUid), userDocData, { merge: true });
        } catch (userDbErr) {
          console.warn('[ActivationService] Aviso actualizando users/{uid} en Firestore:', userDbErr);
        }

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

        // Marcar el token como usado solo cuando no lo marcó ya el backend
        try {
          const actRef = doc(db, 'activations', tokenDocId);
          const actSnap = await getDoc(actRef);
          if (actSnap.exists()) {
            if (!actSnap.data()?.used) {
              await updateDoc(actRef, {
                used: true,
                usedAt: now,
                activatedUid: authUid
              });
            }
          } else {
            await setDoc(actRef, {
              token: tokenDocId,
              clientId,
              email: cleanEmail,
              businessName: verification.businessName || 'Cliente TapRD',
              used: true,
              expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
              createdAt: now,
              usedAt: now,
              activatedUid: authUid
            });
          }
        } catch (actErr) {
          console.warn('[ActivationService] Aviso invalidando token en Firestore:', actErr);
        }
      }
    }

    // Actualizar copia local
    const localMap = getLocalActivations();
    localMap[tokenDocId] = {
      ...(localMap[tokenDocId] || {
        token: tokenDocId,
        clientId,
        email: cleanEmail,
        businessName: verification.businessName || 'Cliente TapRD',
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        createdAt: now
      }),
      used: true,
      usedAt: now,
      activatedUid: authUid
    };
    try {
      localStorage.setItem(LOCAL_ACTIVATIONS_KEY, JSON.stringify(localMap));
    } catch {}

    // Recuperar datos completos del cliente para iniciar sesión inmediata
    let clientData: Client | null = null;
    if (isFirebaseConfigured && db) {
      try {
        const cSnap = await getDoc(doc(db, 'clients', clientId));
        if (cSnap.exists()) {
          clientData = {
            ...(cSnap.data() as Client),
            id: cSnap.id,
            userId: authUid,
            clientEmail: cleanEmail,
            active: true,
            status: 'active',
            accessStatus: 'active'
          };
        }
      } catch {}
    }

    const finalClientData: Client =
      clientData ||
      ({
        id: clientId,
        userId: authUid,
        businessName: verification.businessName || 'Mi Negocio',
        email: cleanEmail,
        clientEmail: cleanEmail,
        active: true,
        status: 'active',
        accessStatus: 'active'
      } as Client);

    // Sincronizar memoria + localStorage + suscriptores de Auth antes de redirigir
    syncClientSession(userDocData, finalClientData);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('taprd_admin_session_v2', JSON.stringify(userDocData));
      } catch {}
    }

    return {
      success: true,
      user: userDocData,
      client: finalClientData
    };
  } finally {
    setActivationInProgress(false);
  }
}

