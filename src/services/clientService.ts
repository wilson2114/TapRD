import { isFirebaseConfigured, auth } from '../lib/firebase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { clientToSupabaseRow } from './supabaseMigrationService';
import { Client, ClientStatus, ClientService } from '../types/client';
import { INITIAL_CLIENTS } from '../data/initialClients';
import { COMPANY_CONFIG } from '../config/company';

const COLLECTION_NAME = 'clients';
const LOCAL_STORAGE_KEY = 'taprd_clients_data_v2';

let inMemoryClients: Client[] = [];
let hasLoadedFromFirestore = false;
let isSeedingInProgress = false;

// Suscriptores al cambio de lista de clientes
type ClientsSubscriber = (clients: Client[]) => void;
const subscribers: Set<ClientsSubscriber> = new Set();

/**
 * Normaliza y genera un slug limpio sin tildes, ñ ni caracteres extraños
 * Ejemplo: "Barbería José & Hijos" -> "barberia-jose-hijos"
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .toLowerCase()
    .replace(/ñ/g, 'n')
    .replace(/&/g, 'y')
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-'); // Guiones duplicados
}

/**
 * Asegura que el slug sea único en la base de datos de Firestore
 */
export async function generateUniqueSlug(
  businessName: string,
  existingClientId?: string
): Promise<string> {
  const baseSlug = generateSlug(businessName) || `negocio-${Date.now().toString(36)}`;
  let candidateSlug = baseSlug;
  let counter = 1;

  // Si Supabase está configurado, verificar existencia
  if (isSupabaseConfigured) {
    try {
      while (true) {
        const { data: rows, error } = await supabase
          .from('clients')
          .select('id')
          .eq('slug', candidateSlug);
        if (error) break;
        const isTaken = (rows || []).some((r: any) => r.id !== existingClientId);
        if (!isTaken) {
          return candidateSlug;
        }
        counter++;
        candidateSlug = `${baseSlug}-${counter}`;
      }
    } catch (err) {
      console.warn('Aviso comprobando slug en Supabase:', err);
    }
  }

  // Fallback con memoria / caché local
  const localList = getClients();
  while (localList.some(c => c.slug === candidateSlug && c.id !== existingClientId)) {
    counter++;
    candidateSlug = `${baseSlug}-${counter}`;
  }

  return candidateSlug;
}

/**
 * Inicializa la memoria desde localStorage
 */
function initMemoryCache(): Client[] {
  if (typeof window === 'undefined') return INITIAL_CLIENTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error leyendo caché local de clientes:', err);
  }
  return INITIAL_CLIENTS;
}

inMemoryClients = initMemoryCache();

function saveLocalCache(list: Client[]) {
  inMemoryClients = list;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }
  notifySubscribers(list);
}

function notifySubscribers(list: Client[]) {
  subscribers.forEach((cb) => {
    try {
      cb(list);
    } catch (err) {
      console.error('Error en suscriptor de clientes:', err);
    }
  });
}

/**
 * Escucha en tiempo real los cambios en la tabla 'clients' de Supabase
 */
export function initFirestoreRealtimeListener(): () => void {
  if (!isSupabaseConfigured || typeof window === 'undefined') {
    return () => {};
  }

  fetchClients().catch(() => undefined);

  try {
    const channel = supabase
      .channel('taprd-clients-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        () => {
          fetchClients().catch(() => undefined);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('No se pudo iniciar listener de Supabase:', err);
    return () => {};
  }
}

if (typeof window !== 'undefined') {
  initFirestoreRealtimeListener();
}

/**
 * Suscribirse a cambios en clientes
 */
export function subscribeToClients(callback: ClientsSubscriber): () => void {
  subscribers.add(callback);
  callback(inMemoryClients);
  return () => {
    subscribers.delete(callback);
  };
}

/**
 * Obtener todos los clientes en memoria/caché
 */
export function getClients(): Client[] {
  return inMemoryClients;
}

/**
 * CONSULTAR CLIENTES DESDE SUPABASE
 * Retorna la lista actualizada de Supabase PostgreSQL
 */
export async function fetchClients(): Promise<Client[]> {
  if (isSupabaseConfigured) {
    try {
      const { data: rows, error } = await supabase
        .from('clients')
        .select('data')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(rows)) {
        const list = rows
          .map((r: any) => r.data as Client)
          .filter((c) => c && (c.businessName || c.slug));
        hasLoadedFromFirestore = true;
        saveLocalCache(list);
        return list;
      }
    } catch (supaErr) {
      console.warn('Error consultando clientes en Supabase:', supaErr);
    }
  }

  return inMemoryClients;
}

/**
 * OBTENER CLIENTE POR ID
 */
export async function getClientById(id: string): Promise<Client | null> {
  const local = inMemoryClients.find(c => c.id === id);
  if (local) return local;

  if (isSupabaseConfigured) {
    try {
      const { data: row, error } = await supabase
        .from('clients')
        .select('data')
        .eq('id', id)
        .limit(1)
        .maybeSingle();
      if (!error && row?.data) {
        return row.data as Client;
      }
    } catch {
      // Ignorar si falla Supabase
    }
  }

  return null;
}

/**
 * OBTENER CLIENTE POR SLUG
 */
const PUBLIC_PROFILE_CACHE_PREFIX = 'taprd_public_profile_';

function savePublicSlugCache(cleanSlug: string, client: Client): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${PUBLIC_PROFILE_CACHE_PREFIX}${cleanSlug}`, JSON.stringify(client));
  } catch {}
}

function readPublicSlugCache(cleanSlug: string): Client | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${PUBLIC_PROFILE_CACHE_PREFIX}${cleanSlug}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Client;
    return parsed && parsed.id ? parsed : null;
  } catch {
    return null;
  }
}

export function getCachedClientBySlug(slug: string): Client | null {
  const cleanSlug = slug.trim().toLowerCase();
  return (
    readPublicSlugCache(cleanSlug) ||
    inMemoryClients.find(c => c.slug.toLowerCase() === cleanSlug) ||
    null
  );
}

const inFlightSlugQueries = new Map<string, Promise<Client | null>>();

export async function getClientBySlug(slug: string): Promise<Client | null> {
  const cleanSlug = slug.trim().toLowerCase();
  const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

  // 1. Si el dispositivo está sin conexión, devolver inmediatamente la copia offline guardada
  if (isOffline) {
    const cachedOffline = readPublicSlugCache(cleanSlug) || inMemoryClients.find(c => c.slug.toLowerCase() === cleanSlug);
    if (cachedOffline) return cachedOffline;
  }

  const existingPromise = inFlightSlugQueries.get(cleanSlug);
  if (existingPromise) return existingPromise;

  const task = (async (): Promise<Client | null> => {
    // 2. Consultar directamente en Supabase PostgreSQL
    if (isSupabaseConfigured) {
      try {
        const { data: row, error } = await supabase
          .from('clients')
          .select('data')
          .eq('slug', cleanSlug)
          .limit(1)
          .maybeSingle();
        if (!error && row?.data) {
          const clientData = row.data as Client;
          const idx = inMemoryClients.findIndex(c => c.id === clientData.id);
          if (idx !== -1) inMemoryClients[idx] = clientData;
          else inMemoryClients = [clientData, ...inMemoryClients];
          savePublicSlugCache(cleanSlug, clientData);
          return clientData;
        }
      } catch {
        // Ignorar si la tabla clients aún no existe en Supabase
      }
    }

    // 4. Respaldo en caché persistente por slug o memoria local
    const cachedSlug = readPublicSlugCache(cleanSlug);
    if (cachedSlug) return cachedSlug;

    const local = inMemoryClients.find(c => c.slug.toLowerCase() === cleanSlug);
    if (local) return local;

    return null;
  })();

  inFlightSlugQueries.set(cleanSlug, task);
  try {
    return await task;
  } finally {
    inFlightSlugQueries.delete(cleanSlug);
  }
}

export const fetchClientBySlug = getClientBySlug;

/**
 * INCREMENTAR VISTAS DE PERFIL
 */
export async function incrementClientViews(clientId: string): Promise<void> {
  // En memoria
  const client = inMemoryClients.find(c => c.id === clientId);
  if (client) {
    client.viewsCount = (client.viewsCount || 0) + 1;
    saveLocalCache(inMemoryClients);
  }

  if (isSupabaseConfigured) {
    supabase
      .rpc('increment_client_views', { target_client_id: clientId })
      .then(() => undefined, () => undefined);
  }
}

/**
 * Limpia recursivamente propiedades undefined para compatibilidad con Cloud Firestore
 */
function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map(item => cleanForFirestore(item)) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

/**
 * CREAR CLIENTE REAL EN CLOUD FIRESTORE
 * 
 * 1. Genera ID único e inmutable
 * 2. Valida y garantiza slug único
 * 3. Asigna createdBy con UID de usuario autenticado
 * 4. Guarda documento en clients/{clientId}
 */
export async function createClient(
  data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Client> {
  const newId = `cli-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  // Asegurar que el estado de autenticación de Firebase esté resuelto
  if (isFirebaseConfigured && typeof (auth as any).authStateReady === 'function') {
    try {
      await (auth as any).authStateReady();
    } catch {}
  }

  const currentUserId = auth.currentUser?.uid || 'admin-local';

  // Slug único
  const finalSlug = await generateUniqueSlug(data.businessName);

  const newClient: Client = {
    ...data,
    id: newId,
    name: data.name || data.ownerName || '',
    ownerName: data.ownerName || data.name || '',
    slug: finalSlug,
    profileSlug: finalSlug,
    active: data.active !== undefined ? data.active : (data.status === 'active'),
    avatarInitials: data.avatarInitials || data.businessName.substring(0, 2).toUpperCase() || 'TR',
    avatarBgColor: data.avatarBgColor || 'bg-blue-600',
    coverGradient: data.coverGradient || 'from-slate-900 via-blue-950 to-slate-900',
    status: data.status || 'active',
    createdBy: currentUserId,
    createdAt: now,
    updatedAt: now,
    // Cumplimiento Legal y Separación de Estados (PARTE 10)
    termsVersion: COMPANY_CONFIG.termsVersion,
    privacyVersion: COMPANY_CONFIG.privacyVersion,
    accountStatus: 'active',
    profileStatus: data.status === 'inactive' ? 'inactive' : 'active',
    contractStatus: data.contractStatus || 'draft',
    contractVersion: data.contractVersion || COMPANY_CONFIG.termsVersion
  };

  // 1. Guardar en memoria local inmediata
  const updated = [newClient, ...inMemoryClients.filter(c => c.id !== newId)];
  saveLocalCache(updated);

  // 2. Persistir en Supabase PostgreSQL
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('clients')
      .upsert(clientToSupabaseRow(newClient), { onConflict: 'id' });
    if (error) {
      throw new Error(error.message || 'No se pudo guardar el cliente en Supabase.');
    }
  }

  return newClient;
}

/**
 * ACTUALIZAR CLIENTE EN CLOUD FIRESTORE
 * 
 * 1. Mantiene inmutables ID y fecha de creación
 * 2. Actualiza fecha updatedAt
 * 3. Persiste en Firestore usando setDoc con merge: true (crea si no existía previamente, como en seed inicial)
 */
export async function updateClient(
  id: string,
  updates: Partial<Client>
): Promise<Client | null> {
  const index = inMemoryClients.findIndex(c => c.id === id);
  const current = index !== -1 ? inMemoryClients[index] : await getClientById(id);

  if (!current) {
    throw new Error('Cliente no encontrado.');
  }

  const now = new Date().toISOString();

  // Asegurar que el estado de autenticación de Firebase esté resuelto
  if (isFirebaseConfigured && typeof (auth as any).authStateReady === 'function') {
    try {
      await (auth as any).authStateReady();
    } catch {}
  }

  // Si se actualizó el nombre o slug, verificar que el slug siga siendo único
  let updatedSlug = updates.slug || current.slug;
  if (updates.slug && updates.slug !== current.slug) {
    updatedSlug = await generateUniqueSlug(updates.slug, id);
  }

  const updatedClient: Client = {
    ...current,
    ...updates,
    name: updates.name || updates.ownerName || current.name || current.ownerName || '',
    ownerName: updates.ownerName || updates.name || current.ownerName || current.name || '',
    slug: updatedSlug,
    profileSlug: updatedSlug,
    active: updates.active !== undefined ? updates.active : (updates.status !== undefined ? updates.status === 'active' : (current.active !== undefined ? current.active : current.status === 'active')),
    profileStatus: updates.profileStatus !== undefined ? updates.profileStatus : (updates.status === 'inactive' ? 'inactive' : (updates.status === 'active' ? 'active' : current.profileStatus || 'active')),
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: now
  };

  // 1. Actualizar memoria y caché
  if (index !== -1) {
    inMemoryClients[index] = updatedClient;
  } else {
    inMemoryClients = [updatedClient, ...inMemoryClients];
  }
  saveLocalCache([...inMemoryClients]);

  if (updatedClient.slug) {
    savePublicSlugCache(updatedClient.slug.toLowerCase(), updatedClient);
  }

  // 2. Actualizar en Supabase PostgreSQL
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('clients')
      .upsert(clientToSupabaseRow(updatedClient), { onConflict: 'id' });
    if (error) {
      throw new Error(error.message || 'No se pudo actualizar el cliente en Supabase.');
    }
  }

  return updatedClient;
}

/**
 * DESACTIVAR CLIENTE (ELIMINACIÓN SUAVE)
 * Establece status = 'inactive' sin borrar datos físicamente
 */
export async function deactivateClient(id: string): Promise<Client | null> {
  return toggleClientStatus(id, 'inactive');
}

/**
 * CAMBIAR ESTADO DEL CLIENTE (active, pending, inactive)
 * Actualiza status, active y profileStatus de forma sincronizada con Firestore y el backend.
 */
export async function toggleClientStatus(
  id: string,
  newStatus: ClientStatus
): Promise<Client | null> {
  const isActive = newStatus === 'active';
  const profStatus = newStatus === 'inactive' ? 'inactive' : 'active';

  // 1. Intentar actualizar a través de la API del backend si el usuario está autenticado
  if (isFirebaseConfigured && auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch('/api/admin/clients/toggle-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId: id,
          status: newStatus
        })
      });
    } catch (apiErr) {
      console.warn('Aviso en endpoint backend /api/admin/clients/toggle-status:', apiErr);
    }
  }

  // 2. Aplicar actualización en Firestore y caché reactivo
  return updateClient(id, { 
    status: newStatus,
    active: isActive,
    profileStatus: profStatus
  });
}

/**
 * ELIMINACIÓN DE CLIENTE
 * Desactiva por defecto (soft delete) para proteger la información del cliente
 */
export async function deleteClient(id: string, hardDelete: boolean = false): Promise<boolean> {
  if (!hardDelete) {
    const result = await deactivateClient(id);
    return Boolean(result);
  }

  // Eliminación física si se solicita explícitamente
  inMemoryClients = inMemoryClients.filter(c => c.id !== id);
  saveLocalCache(inMemoryClients);

  if (isSupabaseConfigured) {
    await supabase.from('clients').delete().eq('id', id);
  }

  return true;
}

/**
 * OBTENER ESTADÍSTICAS REALES PARA EL DASHBOARD
 * Calcula conteo total, activos, pendientes e inactivos reales
 */
export async function getAdminStats(): Promise<{
  totalClients: number;
  activeCount: number;
  pendingCount: number;
  inactiveCount: number;
}> {
  let list = inMemoryClients;
  if (!hasLoadedFromFirestore && isSupabaseConfigured) {
    list = await fetchClients();
  }

  const totalClients = list.length;
  const activeCount = list.filter(c => c.status === 'active').length;
  const pendingCount = list.filter(c => c.status === 'pending').length;
  const inactiveCount = list.filter(c => c.status === 'inactive').length;

  return {
    totalClients,
    activeCount,
    pendingCount,
    inactiveCount
  };
}

/**
 * Obtener datos públicos seguros del cliente
 * Oculta identificadores internos de administración
 */
export function getPublicClientData(client: Client) {
  return {
    id: client.id,
    businessName: client.businessName,
    slug: client.slug,
    category: client.category,
    description: client.description,
    phone: client.phone,
    whatsapp: client.whatsapp,
    email: client.email,
    city: client.city,
    address: client.address,
    logo: client.logoUrl || client.logo,
    logoUrl: client.logoUrl || client.logo,
    avatarInitials: client.avatarInitials,
    avatarBgColor: client.avatarBgColor,
    coverGradient: client.coverGradient,
    socialLinks: client.socialLinks,
    services: client.services
      ? client.services
          .filter(s => s.active !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            price: s.price,
            currency: s.currency || 'DOP',
            imageUrl: s.imageUrl && !s.imageUrl.includes('quarantine') && s.imageStatus !== 'rejected' && s.imageStatus !== 'failed' ? s.imageUrl : undefined,
            thumbnailUrl: s.thumbnailUrl && !s.thumbnailUrl.includes('quarantine') ? s.thumbnailUrl : undefined,
            imagePath: undefined, // No exponer rutas de Storage internas en perfil público
            imageAlt: s.imageAlt || `${s.name} - ${client.businessName}`,
            active: s.active !== false,
            order: s.order ?? 1,
            imageStatus: s.imageStatus === 'approved' ? 'approved' : undefined
          }))
      : [],
    hours: client.hours,
    weeklySchedule: client.weeklySchedule,
    bankAccounts: client.bankAccounts,
    settings: client.settings,
    status: client.status,
    googleReviewsUrl: client.googleReviewsUrl,
    mapsUrl: client.mapsUrl,
    productAssigned: client.productAssigned,
    profileTheme: client.profileTheme,
    qrRedirect: client.qrRedirect
  };
}

/**
 * Lista blanca explícita de campos permitidos para actualización por el cliente (Reglas 16 y 17)
 * Todo campo fuera de esta lista debe rechazarse estrictamente.
 */
export const ALLOWED_CLIENT_FIELDS: (keyof Client)[] = [
  'businessName',
  'description',
  'phone',
  'whatsapp',
  'email',
  'city',
  'address',
  'logoUrl',
  'logo',
  'socialLinks',
  'services',
  'hours',
  'weeklySchedule',
  'bankAccounts',
  'settings',
  'category',
  'mapsUrl',
  'googleReviewsUrl',
  'avatarInitials',
  'avatarBgColor',
  'coverGradient',
  'profileTheme',
  'status',
  'active',
  'profileStatus',
  'qrRedirect'
];

/**
 * ACTUALIZACIÓN SEGURA POR PARTE DEL CLIENTE (updateClientByOwner)
 * Secciones 16 y 17:
 * El cliente solo puede modificar campos de contenido permitidos explícitamente en ALLOWED_CLIENT_FIELDS.
 * Todo campo fuera de esa lista es automáticamente filtrado y rechazado.
 */
export async function updateClientByOwner(
  id: string,
  updates: Partial<Client>
): Promise<Client | null> {
  // Construir objeto limpio aceptando EXCLUSIVAMENTE campos en ALLOWED_CLIENT_FIELDS
  const safeUpdates: Partial<Client> = {};

  for (const key of ALLOWED_CLIENT_FIELDS) {
    if (key in updates && updates[key] !== undefined) {
      (safeUpdates as any)[key] = updates[key];
    }
  }

  // Asegurar fecha de actualización
  safeUpdates.updatedAt = new Date().toISOString();

  // Resolver cliente actual en memoria o Firestore para mantener estado local sincronizado
  const index = inMemoryClients.findIndex(c => c.id === id);
  const current = index !== -1 ? inMemoryClients[index] : await getClientById(id);

  if (!current) {
    throw new Error('Cliente no encontrado.');
  }

  if (isFirebaseConfigured && typeof (auth as any).authStateReady === 'function') {
    try {
      await (auth as any).authStateReady();
    } catch {}
  }

  const updatedClient: Client = {
    ...current,
    ...safeUpdates,
    id: current.id,
    createdAt: current.createdAt
  };

  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('clients')
      .upsert(clientToSupabaseRow(updatedClient), { onConflict: 'id' });
    if (error) {
      throw new Error(error.message || 'No se pudo actualizar el cliente en Supabase.');
    }
  }

  if (index !== -1) {
    inMemoryClients[index] = updatedClient;
  } else {
    inMemoryClients = [updatedClient, ...inMemoryClients];
  }
  saveLocalCache([...inMemoryClients]);
  if (updatedClient.slug) {
    savePublicSlugCache(updatedClient.slug.toLowerCase(), updatedClient);
  }

  // Sincronizar con la sesión local del cliente si existe
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('taprd_client_session', JSON.stringify(updatedClient));
    } catch {}
  }

  return updatedClient;
}

