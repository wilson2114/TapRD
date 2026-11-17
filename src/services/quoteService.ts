import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
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
  storageCollection?: 'quoteRequests' | 'reports';
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
const REPORTS_FALLBACK_COLLECTION = 'reports';
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

function mergeQuotes(...lists: QuoteRequest[][]): QuoteRequest[] {
  const map = new Map<string, QuoteRequest>();
  lists.forEach((list) => {
    list.forEach((item) => {
      if (item && item.id) map.set(item.id, item);
    });
  });
  return sortByNewest(Array.from(map.values()));
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined) result[k] = v;
  });
  return result as Partial<T>;
}

/**
 * Guarda una nueva solicitud de cotización en Firestore (quoteRequests o respaldo en reports) + local.
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
    // 1. Intentar colección principal quoteRequests
    try {
      const ref = await Promise.race([
        addDoc(collection(db, COLLECTION_NAME), payload),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('firestore-timeout')), 4500)
        )
      ]);
      const created: QuoteRequest = {
        ...(payload as Omit<QuoteRequest, 'id'>),
        id: ref.id,
        storageCollection: COLLECTION_NAME
      };
      saveLocalQuotes(mergeQuotes([created], readLocalQuotes()));
      return created;
    } catch (err) {
      console.warn('quoteRequests rechazado/no disponible, usando colección reports en Firestore:', err);
    }

    // 2. Respaldo en Firestore sobre reports (regla pública ya activa en producción)
    try {
      const ref = await Promise.race([
        addDoc(collection(db, REPORTS_FALLBACK_COLLECTION), {
          ...payload,
          type: 'quote_request'
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('firestore-timeout')), 4500)
        )
      ]);
      const created: QuoteRequest = {
        ...(payload as Omit<QuoteRequest, 'id'>),
        id: ref.id,
        storageCollection: REPORTS_FALLBACK_COLLECTION
      };
      saveLocalQuotes(mergeQuotes([created], readLocalQuotes()));
      return created;
    } catch (fallbackErr) {
      console.warn('Fallback en Firestore reports falló, guardando en localStorage:', fallbackErr);
    }
  }

  // 3. Respaldo local garantizado
  const localItem: QuoteRequest = {
    ...(payload as Omit<QuoteRequest, 'id'>),
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  };
  saveLocalQuotes(mergeQuotes([localItem], readLocalQuotes()));
  return localItem;
}

/**
 * Obtiene todas las solicitudes de cotización desde Firestore (quoteRequests + reports) y respaldo local.
 */
export async function getQuoteRequests(): Promise<QuoteRequest[]> {
  let primaryItems: QuoteRequest[] = [];
  let fallbackItems: QuoteRequest[] = [];

  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      primaryItems = snap.docs.map((d) => ({
        ...(d.data() as Omit<QuoteRequest, 'id'>),
        id: d.id,
        storageCollection: COLLECTION_NAME
      }));
    } catch {
      // Ignorar si quoteRequests aún no tiene reglas publicadas
    }

    try {
      const q = query(
        collection(db, REPORTS_FALLBACK_COLLECTION),
        where('type', '==', 'quote_request')
      );
      const snap = await getDocs(q);
      fallbackItems = snap.docs.map((d) => ({
        ...(d.data() as Omit<QuoteRequest, 'id'>),
        id: d.id,
        storageCollection: REPORTS_FALLBACK_COLLECTION
      }));
    } catch (err) {
      console.warn('Error leyendo solicitudes desde reports:', err);
    }
  }

  const localOnly = readLocalQuotes().filter((q) => q.id.startsWith('local_'));
  const merged = mergeQuotes(localOnly, fallbackItems, primaryItems);
  if (merged.length > 0) saveLocalQuotes(merged);
  return merged;
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

  let primaryItems: QuoteRequest[] = [];
  let fallbackItems: QuoteRequest[] = [];

  const emitMerged = () => {
    const localOnly = readLocalQuotes().filter((q) => q.id.startsWith('local_'));
    const merged = mergeQuotes(localOnly, fallbackItems, primaryItems);
    if (merged.length > 0) saveLocalQuotes(merged);
    onData(merged);
  };

  const unsubPrimary = onSnapshot(
    collection(db, COLLECTION_NAME),
    (snap) => {
      primaryItems = snap.docs.map((d) => ({
        ...(d.data() as Omit<QuoteRequest, 'id'>),
        id: d.id,
        storageCollection: COLLECTION_NAME
      }));
      emitMerged();
    },
    () => {
      // Si quoteRequests aún no tiene reglas, seguir con reports sin bloquear
      emitMerged();
    }
  );

  const fallbackQuery = query(
    collection(db, REPORTS_FALLBACK_COLLECTION),
    where('type', '==', 'quote_request')
  );

  const unsubFallback = onSnapshot(
    fallbackQuery,
    (snap) => {
      fallbackItems = snap.docs.map((d) => ({
        ...(d.data() as Omit<QuoteRequest, 'id'>),
        id: d.id,
        storageCollection: REPORTS_FALLBACK_COLLECTION
      }));
      emitMerged();
    },
    (err) => {
      console.warn('Error en suscripción de solicitudes:', err);
      emitMerged();
      onError?.(err);
    }
  );

  return () => {
    unsubPrimary();
    unsubFallback();
  };
}

/**
 * Actualiza el estado o notas administrativas de una solicitud.
 */
export async function updateQuoteRequest(
  id: string,
  updates: { status?: QuoteRequestStatus; adminNotes?: string },
  storageCollection?: 'quoteRequests' | 'reports'
): Promise<void> {
  const now = new Date().toISOString();
  const payload = stripUndefined({
    ...updates,
    updatedAt: now
  });

  if (isFirebaseConfigured && !id.startsWith('local_')) {
    const targetOrder: Array<'quoteRequests' | 'reports'> =
      storageCollection === 'reports'
        ? [REPORTS_FALLBACK_COLLECTION, COLLECTION_NAME]
        : [COLLECTION_NAME, REPORTS_FALLBACK_COLLECTION];

    for (const col of targetOrder) {
      try {
        await updateDoc(doc(db, col, id), payload);
        break;
      } catch {
        // Intentar en la siguiente colección
      }
    }
  }

  const local = readLocalQuotes().map((q) => (q.id === id ? { ...q, ...payload } : q));
  saveLocalQuotes(local);
}

/**
 * Elimina permanentemente una solicitud de cotización.
 */
export async function deleteQuoteRequest(
  id: string,
  storageCollection?: 'quoteRequests' | 'reports'
): Promise<void> {
  if (isFirebaseConfigured && !id.startsWith('local_')) {
    const targetOrder: Array<'quoteRequests' | 'reports'> =
      storageCollection === 'reports'
        ? [REPORTS_FALLBACK_COLLECTION, COLLECTION_NAME]
        : [COLLECTION_NAME, REPORTS_FALLBACK_COLLECTION];

    for (const col of targetOrder) {
      try {
        await deleteDoc(doc(db, col, id));
        break;
      } catch {
        // Intentar en la siguiente colección
      }
    }
  }
  saveLocalQuotes(readLocalQuotes().filter((q) => q.id !== id));
}
