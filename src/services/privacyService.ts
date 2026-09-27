import { db, auth, isFirebaseConfigured } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc 
} from 'firebase/firestore';
import { PrivacyRequest, PrivacyRequestStatus, PrivacyRequestType } from '../types/legal';

const LOCAL_STORAGE_KEY = 'taprd_privacy_requests';

function getLocalRequests(): PrivacyRequest[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRequests(requests: PrivacyRequest[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(requests));
  } catch {}
}

export async function createPrivacyRequest(data: {
  userId: string;
  clientId: string;
  clientBusinessName?: string;
  userEmail: string;
  requestType: PrivacyRequestType;
  details: string;
}): Promise<{ success: boolean; request?: PrivacyRequest; error?: string }> {
  try {
    const now = new Date().toISOString();
    const id = `priv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newRequest: PrivacyRequest = {
      id,
      userId: data.userId,
      clientId: data.clientId,
      clientBusinessName: data.clientBusinessName || '',
      userEmail: data.userEmail,
      requestType: data.requestType,
      status: 'pending',
      details: data.details,
      createdAt: now,
      updatedAt: now
    };

    // 1. Guardar en Firestore si está disponible
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'privacyRequests', id), newRequest);
      } catch (dbErr) {
        console.warn('[PrivacyService] Aviso guardando en Firestore:', dbErr);
      }
    }

    // 2. Guardar en copia local
    const local = getLocalRequests();
    local.unshift(newRequest);
    saveLocalRequests(local);

    return { success: true, request: newRequest };
  } catch (err: any) {
    return { success: false, error: err.message || 'No se pudo registrar la solicitud de privacidad.' };
  }
}

export async function getPrivacyRequestsForUser(userId: string): Promise<PrivacyRequest[]> {
  const localList = getLocalRequests().filter(r => r.userId === userId);

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'privacyRequests'),
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      const remoteList = snap.docs.map(d => ({ ...(d.data() as PrivacyRequest), id: d.id }));
      
      // Combinar priorizando remoto
      const map = new Map<string, PrivacyRequest>();
      localList.forEach(r => map.set(r.id, r));
      remoteList.forEach(r => map.set(r.id, r));
      return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('[PrivacyService] Aviso cargando desde Firestore:', err);
    }
  }

  return localList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllPrivacyRequests(): Promise<PrivacyRequest[]> {
  const localList = getLocalRequests();

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'privacyRequests'));
      const remoteList = snap.docs.map(d => ({ ...(d.data() as PrivacyRequest), id: d.id }));
      
      const map = new Map<string, PrivacyRequest>();
      localList.forEach(r => map.set(r.id, r));
      remoteList.forEach(r => map.set(r.id, r));
      return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('[PrivacyService] Aviso cargando solicitudes administrativas:', err);
    }
  }

  return localList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updatePrivacyRequestStatus(
  id: string,
  status: PrivacyRequestStatus,
  notes?: string,
  resolvedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    const updates: Partial<PrivacyRequest> = {
      status,
      updatedAt: now,
      ...(notes !== undefined ? { notes } : {}),
      ...(status === 'completed' || status === 'rejected' ? { resolvedAt: now, resolvedBy: resolvedBy || auth?.currentUser?.uid } : {})
    };

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'privacyRequests', id), updates);
      } catch (err) {
        console.warn('[PrivacyService] Aviso actualizando solicitud en Firestore:', err);
      }
    }

    // Actualizar local
    const local = getLocalRequests();
    const index = local.findIndex(r => r.id === id);
    if (index >= 0) {
      local[index] = { ...local[index], ...updates };
      saveLocalRequests(local);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al actualizar el estado de la solicitud.' };
  }
}
