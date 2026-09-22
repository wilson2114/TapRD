import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db, isFirebaseConfigured, auth } from '../lib/firebase';
import { Client, ClientStatus, ClientService } from '../types/client';
import { INITIAL_CLIENTS } from '../data/initialClients';

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

  // Si Firestore está configurado, verificar existencia
  if (isFirebaseConfigured) {
    try {
      while (true) {
        const q = query(
          collection(db, COLLECTION_NAME),
          where('slug', '==', candidateSlug)
        );
        const snapshot = await getDocs(q);

        // Si no hay documentos o el único encontrado es el mismo cliente en edición
        const isTaken = snapshot.docs.some(d => d.id !== existingClientId);
        if (!isTaken) {
          return candidateSlug;
        }

        counter++;
        candidateSlug = `${baseSlug}-${counter}`;
      }
    } catch (err) {
      console.warn('Aviso comprobando slug en Firestore:', err);
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
 * Escucha en tiempo real los cambios en la colección 'clients' de Cloud Firestore
 */
export function initFirestoreRealtimeListener(): () => void {
  if (!isFirebaseConfigured || typeof window === 'undefined') {
    return () => {};
  }

  try {
    const clientsCol = collection(db, COLLECTION_NAME);
    const unsubscribe = onSnapshot(
      clientsCol,
      (snapshot) => {
        if (snapshot.empty && !hasLoadedFromFirestore && !isSeedingInProgress) {
          seedInitialClientsToFirestore();
          return;
        }

        if (!snapshot.empty) {
          const list: Client[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as Client;
            list.push({ ...data, id: d.id });
          });

          // Ordenar por fecha de creación descendente
          list.sort((a, b) => {
            const timeA = new Date(b.createdAt || 0).getTime();
            const timeB = new Date(a.createdAt || 0).getTime();
            return timeA - timeB;
          });

          hasLoadedFromFirestore = true;
          saveLocalCache(list);
        }
      },
      (error) => {
        console.warn('Aviso en onSnapshot de Firestore (utilizando caché local):', error.message);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('No se pudo iniciar listener de Firestore:', err);
    return () => {};
  }
}

if (typeof window !== 'undefined') {
  initFirestoreRealtimeListener();
}

/**
 * Sembrar datos iniciales si Firestore está completamente vacío
 */
async function seedInitialClientsToFirestore() {
  if (isSeedingInProgress || !isFirebaseConfigured) return;
  isSeedingInProgress = true;

  try {
    for (const client of INITIAL_CLIENTS) {
      const docRef = doc(db, COLLECTION_NAME, client.id);
      await setDoc(docRef, client);
    }
    hasLoadedFromFirestore = true;
  } catch (err) {
    console.warn('Aviso al sembrar clientes en Firestore:', err);
  } finally {
    isSeedingInProgress = false;
  }
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
 * CONSULTAR CLIENTES DESDE FIRESTORE
 * Retorna la lista actualizada de Cloud Firestore
 */
export async function fetchClients(): Promise<Client[]> {
  if (!isFirebaseConfigured) {
    return inMemoryClients;
  }

  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (!snap.empty) {
      const list: Client[] = [];
      snap.forEach((d) => {
        list.push({ ...(d.data() as Client), id: d.id });
      });

      list.sort((a, b) => {
        const timeA = new Date(b.createdAt || 0).getTime();
        const timeB = new Date(a.createdAt || 0).getTime();
        return timeA - timeB;
      });

      hasLoadedFromFirestore = true;
      saveLocalCache(list);
      return list;
    }
  } catch (err) {
    console.warn('Error consultando clientes de Firestore:', err);
  }

  return inMemoryClients;
}

/**
 * OBTENER CLIENTE POR ID
 */
export async function getClientById(id: string): Promise<Client | null> {
  const local = inMemoryClients.find(c => c.id === id);
  if (local) return local;

  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = { ...(snap.data() as Client), id: snap.id };
        return data;
      }
    } catch (err) {
      console.warn(`Error buscando cliente ${id} en Firestore:`, err);
    }
  }

  return null;
}

/**
 * OBTENER CLIENTE POR SLUG
 */
export async function getClientBySlug(slug: string): Promise<Client | null> {
  const cleanSlug = slug.trim().toLowerCase();

  // 1. Buscar en memoria
  const local = inMemoryClients.find(c => c.slug.toLowerCase() === cleanSlug);
  if (local) return local;

  // 2. Consultar directamente en Firestore
  if (isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('slug', '==', cleanSlug)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const first = snap.docs[0];
        const data = { ...(first.data() as Client), id: first.id };
        return data;
      }
    } catch (err) {
      console.warn(`Error buscando slug ${cleanSlug} en Firestore:`, err);
    }
  }

  return null;
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

  // En Firestore
  if (isFirebaseConfigured) {
    try {
      const { increment: firestoreIncrement } = await import('firebase/firestore');
      const docRef = doc(db, COLLECTION_NAME, clientId);
      await updateDoc(docRef, {
        viewsCount: firestoreIncrement(1)
      });
    } catch {
      // Ignorar si no tiene permisos de escritura anónima
    }
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
    updatedAt: now
  };

  // 1. Guardar en memoria local inmediata
  const updated = [newClient, ...inMemoryClients.filter(c => c.id !== newId)];
  saveLocalCache(updated);

  // 2. Persistir en Cloud Firestore
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, COLLECTION_NAME, newId);
      const cleanedClient = cleanForFirestore(newClient);
      await setDoc(docRef, cleanedClient);
    } catch (err: any) {
      console.warn('Aviso al persistir cliente en Firestore (datos respaldados en caché local):', err);
      const isPermError = err?.code === 'permission-denied' || 
                          (err?.message && err.message.toLowerCase().includes('permission'));
      if (!isPermError) {
        throw new Error(err.message || 'No se pudo guardar el cliente en Firestore.');
      }
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

  // 2. Actualizar en Firestore con merge: true para permitir actualización o creación si no existía
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const fullDoc = cleanForFirestore(updatedClient);
      await setDoc(docRef, fullDoc, { merge: true });
    } catch (err: any) {
      console.warn(`Aviso actualizando cliente ${id} en Firestore (datos respaldados en caché local):`, err);
      const isPermError = err?.code === 'permission-denied' || 
                          (err?.message && err.message.toLowerCase().includes('permission'));
      if (!isPermError) {
        throw new Error(err.message || 'No se pudo actualizar el cliente en Firestore.');
      }
    }
  }

  return updatedClient;
}

/**
 * DESACTIVAR CLIENTE (ELIMINACIÓN SUAVE)
 * Establece status = 'inactive' sin borrar datos físicamente
 */
export async function deactivateClient(id: string): Promise<Client | null> {
  return updateClient(id, { status: 'inactive' });
}

/**
 * CAMBIAR ESTADO DEL CLIENTE (active, pending, inactive)
 */
export async function toggleClientStatus(
  id: string,
  newStatus: ClientStatus
): Promise<Client | null> {
  return updateClient(id, { status: newStatus });
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

  if (isFirebaseConfigured) {
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (err) {
      console.error('Error al eliminar físicamente de Firestore:', err);
    }
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
  // Asegurar carga reciente si es posible
  let list = inMemoryClients;
  if (!hasLoadedFromFirestore && isFirebaseConfigured) {
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
    services: client.services,
    hours: client.hours,
    weeklySchedule: client.weeklySchedule,
    settings: client.settings,
    status: client.status,
    googleReviewsUrl: client.googleReviewsUrl,
    mapsUrl: client.mapsUrl,
    productAssigned: client.productAssigned,
    profileTheme: client.profileTheme
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
  'settings',
  'category',
  'mapsUrl',
  'googleReviewsUrl',
  'avatarInitials',
  'avatarBgColor',
  'coverGradient',
  'profileTheme'
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

  const result = await updateClient(id, safeUpdates);

  // Sincronizar con la sesión local del cliente si existe
  if (result && typeof window !== 'undefined') {
    try {
      localStorage.setItem('taprd_client_session', JSON.stringify(result));
    } catch {}
  }

  return result;
}

