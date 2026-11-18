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
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  storageCollection?: 'supabase' | 'quoteRequests' | 'reports';
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
const SUPABASE_TABLE = 'quote_requests';
const LOCAL_STORAGE_KEY = 'taprd_quote_requests_v1';

function mapSupabaseRow(row: any): QuoteRequest {
  return {
    id: row.id,
    source: row.source || 'contact_form',
    name: row.name || '',
    businessName: row.business_name || '',
    phone: row.phone || '',
    email: row.email || '',
    businessType: row.business_type || '',
    productInterest: row.product_interest || 'Tap Card',
    quantity: Number(row.quantity) || 1,
    city: row.city || '',
    needOption: row.need_option || '',
    message: row.message || '',
    status: row.status || 'new',
    adminNotes: row.admin_notes || '',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at,
    storageCollection: 'supabase'
  };
}

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
 * Guarda una nueva solicitud de cotización en Supabase (primario) o Firestore (respaldo) + local.
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

  // 1. Intentar Supabase PostgreSQL primero
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .insert({
          source: payload.source,
          name: payload.name,
          business_name: payload.businessName,
          phone: payload.phone,
          email: payload.email,
          business_type: payload.businessType,
          product_interest: payload.productInterest,
          quantity: payload.quantity,
          city: payload.city,
          need_option: payload.needOption,
          message: payload.message,
          status: 'new',
          admin_notes: '',
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (!error && data) {
        const created = mapSupabaseRow(data);
        saveLocalQuotes(mergeQuotes([created], readLocalQuotes()));
        return created;
      }
    } catch (supaErr) {
      console.warn('Supabase quote_requests aún no disponible, usando respaldo Firestore:', supaErr);
    }
  }

  // 2. Respaldo Firestore (quoteRequests -> reports)
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
        id: ref.id,
        storageCollection: COLLECTION_NAME
      };
      saveLocalQuotes(mergeQuotes([created], readLocalQuotes()));
      return created;
    } catch {
      // Fallback a reports
    }

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
    } catch {
      // Fallback a localStorage
    }
  }

  const localItem: QuoteRequest = {
    ...(payload as Omit<QuoteRequest, 'id'>),
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  };
  saveLocalQuotes(mergeQuotes([localItem], readLocalQuotes()));
  return localItem;
}

/**
 * Obtiene todas las solicitudes de cotización desde Supabase + Firestore + local.
 */
export async function getQuoteRequests(): Promise<QuoteRequest[]> {
  let supaItems: QuoteRequest[] = [];
  let primaryItems: QuoteRequest[] = [];
  let fallbackItems: QuoteRequest[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        supaItems = data.map(mapSupabaseRow);
      }
    } catch {
      // Ignorar si la tabla aún no existe
    }
  }

  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      primaryItems = snap.docs.map((d) => ({
        ...(d.data() as Omit<QuoteRequest, 'id'>),
        id: d.id,
        storageCollection: COLLECTION_NAME
      }));
    } catch {
      // Ignorar
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
    } catch {
      // Ignorar
    }
  }

  const localOnly = readLocalQuotes().filter((q) => q.id.startsWith('local_'));
  const merged = mergeQuotes(localOnly, fallbackItems, primaryItems, supaItems);
  if (merged.length > 0) saveLocalQuotes(merged);
  return merged;
}

/**
 * Suscripción en tiempo real (Supabase + Firestore) a las solicitudes de cotización.
 */
export function subscribeQuoteRequests(
  onData: (items: QuoteRequest[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  let supaItems: QuoteRequest[] = [];
  let primaryItems: QuoteRequest[] = [];
  let fallbackItems: QuoteRequest[] = [];
  let disposed = false;

  const emitMerged = () => {
    if (disposed) return;
    const localOnly = readLocalQuotes().filter((q) => q.id.startsWith('local_'));
    const merged = mergeQuotes(localOnly, fallbackItems, primaryItems, supaItems);
    if (merged.length > 0) saveLocalQuotes(merged);
    onData(merged);
  };

  const loadSupabase = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        supaItems = data.map(mapSupabaseRow);
        emitMerged();
      }
    } catch {
      // Tabla aún no creada
    }
  };

  loadSupabase();

  let supaChannel: ReturnType<typeof supabase.channel> | null = null;
  if (isSupabaseConfigured) {
    try {
      supaChannel = supabase
        .channel('taprd-quote-requests')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: SUPABASE_TABLE },
          () => {
            loadSupabase();
          }
        )
        .subscribe();
    } catch {
      // Ignorar si Realtime no está habilitado
    }
  }

  let unsubPrimary: Unsubscribe = () => {};
  let unsubFallback: Unsubscribe = () => {};

  if (isFirebaseConfigured) {
    unsubPrimary = onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        primaryItems = snap.docs.map((d) => ({
          ...(d.data() as Omit<QuoteRequest, 'id'>),
          id: d.id,
          storageCollection: COLLECTION_NAME
        }));
        emitMerged();
      },
      () => emitMerged()
    );

    const fallbackQuery = query(
      collection(db, REPORTS_FALLBACK_COLLECTION),
      where('type', '==', 'quote_request')
    );

    unsubFallback = onSnapshot(
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
        emitMerged();
        onError?.(err);
      }
    );
  } else if (!isSupabaseConfigured) {
    onData(sortByNewest(readLocalQuotes()));
  }

  return () => {
    disposed = true;
    unsubPrimary();
    unsubFallback();
    if (supaChannel) {
      supabase.removeChannel(supaChannel);
    }
  };
}

/**
 * Actualiza el estado o notas administrativas de una solicitud.
 */
export async function updateQuoteRequest(
  id: string,
  updates: { status?: QuoteRequestStatus; adminNotes?: string },
  storageCollection?: 'supabase' | 'quoteRequests' | 'reports'
): Promise<void> {
  const now = new Date().toISOString();
  const payload = stripUndefined({
    ...updates,
    updatedAt: now
  });

  if (isSupabaseConfigured && (storageCollection === 'supabase' || !storageCollection)) {
    try {
      const supaUpdates: Record<string, unknown> = { updated_at: now };
      if (updates.status !== undefined) supaUpdates.status = updates.status;
      if (updates.adminNotes !== undefined) supaUpdates.admin_notes = updates.adminNotes;
      const { error } = await supabase.from(SUPABASE_TABLE).update(supaUpdates).eq('id', id);
      if (!error && storageCollection === 'supabase') {
        const local = readLocalQuotes().map((q) => (q.id === id ? { ...q, ...payload } : q));
        saveLocalQuotes(local);
        return;
      }
    } catch {
      // Continuar con Firestore si aplica
    }
  }

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
  storageCollection?: 'supabase' | 'quoteRequests' | 'reports'
): Promise<void> {
  if (isSupabaseConfigured && (storageCollection === 'supabase' || !storageCollection)) {
    try {
      const { error } = await supabase.from(SUPABASE_TABLE).delete().eq('id', id);
      if (!error && storageCollection === 'supabase') {
        saveLocalQuotes(readLocalQuotes().filter((q) => q.id !== id));
        return;
      }
    } catch {
      // Continuar con Firestore si aplica
    }
  }

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
