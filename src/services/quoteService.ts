import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, isFirebaseConfigured, auth } from '../lib/firebase';

export type QuoteRequestSource = 'contact_form' | 'product_modal' | 'contact_page';
export type QuoteRequestStatus = 'new' | 'contacted' | 'quoted' | 'closed' | 'discarded';

export interface QuoteRequest {
  id: string;
  source: QuoteRequestSource;
  name: string;
  businessName?: string;
  phone?: string;
  email?: string;
  businessType?: string;
  productInterest?: string;
  quantity?: number;
  city?: string;
  needOption?: string;
  message?: string;
  status: QuoteRequestStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateQuoteRequestInput {
  source: QuoteRequestSource;
  name: string;
  businessName?: string;
  phone?: string;
  email?: string;
  businessType?: string;
  productInterest?: string;
  quantity?: number;
  city?: string;
  needOption?: string;
  message?: string;
}

const COLLECTION_NAME = 'quoteRequests';
const LOCAL_STORAGE_KEY = 'taprd_quote_requests_v1';

function readLocalQuotes(): QuoteRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalQuotes(items: QuoteRequest[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignorar errores de cuota de almacenamiento
  }
}

function sortByNewest(items: QuoteRequest[]): QuoteRequest[] {
  return [...items].sort((a, b) => {
    const tA = new Date(a.createdAt || 0).getTime();
    const tB = new Date(b.createdAt || 0).getTime();
    return tB - tA;
  });
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined) result[k] = v;
  });
  return result as Partial<T>;
}

async function getAdminAuthHeaders(): Promise<Record<string, string>> {
  try {
    const token = await auth?.currentUser?.getIdToken?.();
    if (token) {
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };
    }
  } catch {
    // Ignorar si no hay usuario Firebase autenticado
  }
  return { 'Content-Type': 'application/json' };
}

/**
 * Guarda una nueva solicitud de cotización en Firestore (con respaldo automático vía API servidor y local).
 */
export async function createQuoteRequest(input: CreateQuoteRequestInput): Promise<QuoteRequest> {
  const now = new Date().toISOString();
  const payload = stripUndefined({
    source: input.source,
    name: input.name.trim(),
    businessName: input.businessName?.trim() || '',
    phone: input.phone?.trim() || '',
    email: input.email?.trim() || '',
    businessType: input.businessType?.trim() || '',
    productInterest: input.productInterest?.trim() || 'Tap Card',
    quantity: input.quantity && input.quantity > 0 ? input.quantity : 1,
    city: input.city?.trim() || '',
    needOption: input.needOption?.trim() || '',
    message: input.message?.trim() || '',
    status: 'new' as QuoteRequestStatus,
    adminNotes: '',
    createdAt: now,
    updatedAt: now
  });

  // 1. Intentar escritura directa en Firestore
  if (isFirebaseConfigured) {
    try {
      const ref = await Promise.race([
        addDoc(collection(db, COLLECTION_NAME), payload),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('firestore-timeout')), 4500)
        )
      ]);
      const created: QuoteRequest = {
        ...(payload as Omit<QuoteRequest, 'id'>),
        id: ref.id
      };
      const existing = readLocalQuotes();
      saveLocalQuotes([created, ...existing.filter((q) => q.id !== created.id)]);
      return created;
    } catch (err) {
      console.warn('Firestore directo falló para quoteRequests, intentando vía /api/public/quotes:', err);
    }
  }

  // 2. Respaldo automático vía API backend (Firebase Admin SDK)
  try {
    const res = await fetch('/api/public/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const created = (await res.json()) as QuoteRequest;
      const existing = readLocalQuotes();
      saveLocalQuotes([created, ...existing.filter((q) => q.id !== created.id)]);
      return created;
    }
  } catch (apiErr) {
    console.warn('Fallback /api/public/quotes no disponible, guardando respaldo local:', apiErr);
  }

  // 3. Respaldo local garantizado para no bloquear nunca al visitante
  const localItem: QuoteRequest = {
    ...(payload as Omit<QuoteRequest, 'id'>),
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  };
  saveLocalQuotes([localItem, ...readLocalQuotes()]);
  return localItem;
}

/**
 * Obtiene todas las solicitudes de cotización ordenadas de más reciente a más antigua.
 */
export async function getQuoteRequests(): Promise<QuoteRequest[]> {
  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const items: QuoteRequest[] = snap.docs.map((d) => ({
        ...(d.data() as Omit<QuoteRequest, 'id'>),
        id: d.id
      }));
      const sorted = sortByNewest(items);
      saveLocalQuotes(sorted);
      return sorted;
    } catch (err) {
      console.warn('Error cargando solicitudes desde Firestore, intentando /api/admin/quotes:', err);
    }
  }

  try {
    const headers = await getAdminAuthHeaders();
    const res = await fetch('/api/admin/quotes', { headers });
    if (res.ok) {
      const json = (await res.json()) as { items?: QuoteRequest[] };
      const sorted = sortByNewest(json.items || []);
      saveLocalQuotes(sorted);
      return sorted;
    }
  } catch {
    // Usar respaldo local si no hay conexión o endpoint
  }

  return sortByNewest(readLocalQuotes());
}

/**
 * Suscripción en tiempo real a las solicitudes de cotización para la bandeja del Admin.
 */
export function subscribeQuoteRequests(
  onData: (items: QuoteRequest[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!isFirebaseConfigured) {
    onData(sortByNewest(readLocalQuotes()));
    return () => {};
  }

  return onSnapshot(
    collection(db, COLLECTION_NAME),
    (snap) => {
      const items: QuoteRequest[] = snap.docs.map((d) => ({
        ...(d.data() as Omit<QuoteRequest, 'id'>),
        id: d.id
      }));
      const sorted = sortByNewest(items);
      saveLocalQuotes(sorted);
      onData(sorted);
    },
    async (err) => {
      console.warn('Error en suscripción de quoteRequests, usando respaldo API/local:', err);
      try {
        const headers = await getAdminAuthHeaders();
        const res = await fetch('/api/admin/quotes', { headers });
        if (res.ok) {
          const json = (await res.json()) as { items?: QuoteRequest[] };
          const sorted = sortByNewest(json.items || []);
          saveLocalQuotes(sorted);
          onData(sorted);
          return;
        }
      } catch {
        // Ignorar y pasar a respaldo local
      }
      onData(sortByNewest(readLocalQuotes()));
      onError?.(err);
    }
  );
}

/**
 * Actualiza el estado o notas administrativas de una solicitud.
 */
export async function updateQuoteRequest(
  id: string,
  updates: { status?: QuoteRequestStatus; adminNotes?: string }
): Promise<void> {
  const now = new Date().toISOString();
  const payload = stripUndefined({
    ...updates,
    updatedAt: now
  });

  if (isFirebaseConfigured && !id.startsWith('local_')) {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), payload);
    } catch {
      const headers = await getAdminAuthHeaders();
      await fetch(`/api/admin/quotes/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      });
    }
  }

  const local = readLocalQuotes().map((q) => (q.id === id ? { ...q, ...payload } : q));
  saveLocalQuotes(local);
}

/**
 * Elimina permanentemente una solicitud de cotización.
 */
export async function deleteQuoteRequest(id: string): Promise<void> {
  if (isFirebaseConfigured && !id.startsWith('local_')) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch {
      const headers = await getAdminAuthHeaders();
      await fetch(`/api/admin/quotes/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers
      });
    }
  }
  saveLocalQuotes(readLocalQuotes().filter((q) => q.id !== id));
}
