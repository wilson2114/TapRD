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
import { db, isFirebaseConfigured } from '../lib/firebase';

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

/**
 * Guarda una nueva solicitud de cotización en Firestore (y respaldo local).
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

  if (isFirebaseConfigured) {
    try {
      const ref = await addDoc(collection(db, COLLECTION_NAME), payload);
      const created: QuoteRequest = {
        ...(payload as Omit<QuoteRequest, 'id'>),
        id: ref.id
      };
      const existing = readLocalQuotes();
      saveLocalQuotes([created, ...existing.filter((q) => q.id !== created.id)]);
      return created;
    } catch (err) {
      console.error('Error guardando solicitud de cotización en Firestore:', err);
      throw err;
    }
  }

  // Respaldo local si Firebase no está configurado
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
      console.warn('Error cargando solicitudes desde Firestore, usando respaldo local:', err);
    }
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
    (err) => {
      console.warn('Error en suscripción de quoteRequests:', err);
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
    await updateDoc(doc(db, COLLECTION_NAME, id), payload);
  }

  const local = readLocalQuotes().map((q) => (q.id === id ? { ...q, ...payload } : q));
  saveLocalQuotes(local);
}

/**
 * Elimina permanentemente una solicitud de cotización.
 */
export async function deleteQuoteRequest(id: string): Promise<void> {
  if (isFirebaseConfigured && !id.startsWith('local_')) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  }
  saveLocalQuotes(readLocalQuotes().filter((q) => q.id !== id));
}
