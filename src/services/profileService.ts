import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getClientBySlug, getPublicClientData } from './clientService';
import { Client } from '../types/client';
import { recordInteraction, InteractionType } from '../utils/analytics';
import { trackAnalyticsPayloadSchema } from '../schemas/analyticsSchema';

const RECENT_EVENT_TIMESTAMPS = new Map<string, number>();
const EVENT_COOLDOWN_MS = 4000;

export type PublicProfileStatus = 'found' | 'not_found' | 'inactive';

export interface PublicProfileResult {
  status: PublicProfileStatus;
  client?: ReturnType<typeof getPublicClientData>;
  rawClient?: Client;
  error?: string;
}

/**
 * SERVICIO DE PERFILES PÚBLICOS DIGITALES DE TAPRD
 */
export async function fetchPublicProfile(slug: string): Promise<PublicProfileResult> {
  const cleanSlug = slug.trim().toLowerCase();

  try {
    const client = await getClientBySlug(cleanSlug);

    if (!client) {
      return { status: 'not_found' };
    }

    if (client.status === 'inactive') {
      return {
        status: 'inactive',
        rawClient: client
      };
    }

    trackAnalyticsEvent(client.id, 'profileView', client.slug);

    return {
      status: 'found',
      client: getPublicClientData(client),
      rawClient: client
    };
  } catch (err) {
    console.error(`Error obteniendo perfil público para slug ${cleanSlug}:`, err);
    return { status: 'not_found', error: 'Error al cargar perfil' };
  }
}

export type AnalyticsEventType =
  | 'profileView'
  | 'nfcScan'
  | 'qrScan'
  | 'whatsappClick'
  | 'phoneClick'
  | 'vcardDownload'
  | 'instagramClick'
  | 'facebookClick'
  | 'tiktokClick'
  | 'websiteClick'
  | 'reviewClick'
  | 'directionsClick';

export type AnalyticsDeviceType = 'ios' | 'android' | 'desktop';

export interface ClientAnalyticsSummary {
  totalViews: number;
  whatsappClicks: number;
  phoneClicks: number;
  vcardDownloads: number;
  instagramClicks: number;
  facebookClicks: number;
  tiktokClicks: number;
  websiteClicks: number;
  reviewClicks: number;
  directionsClicks: number;
  iosCount: number;
  androidCount: number;
  desktopCount: number;
}

function detectDeviceType(): AnalyticsDeviceType {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

function mapToLocalInteraction(eventType: AnalyticsEventType): InteractionType {
  switch (eventType) {
    case 'whatsappClick':
      return 'whatsapp';
    case 'phoneClick':
      return 'call';
    case 'vcardDownload':
      return 'vcard';
    case 'instagramClick':
      return 'instagram';
    case 'websiteClick':
      return 'website';
    case 'reviewClick':
      return 'review';
    case 'directionsClick':
      return 'directions';
    default:
      return 'tap';
  }
}

/**
 * Registra un evento real de interacción en Firestore (subcolección clients/{clientId}/analytics_events)
 * y en almacenamiento local como respaldo.
 */
export function trackAnalyticsEvent(
  clientId: string,
  eventType: AnalyticsEventType,
  slug?: string
): void {
  if (!clientId || clientId === 'preview-temp') return;

  const validated = trackAnalyticsPayloadSchema.safeParse({
    clientId,
    type: eventType,
    device: detectDeviceType()
  });
  if (!validated.success) return;

  // Evitar duplicados rápidos o spam accidental en la misma sesión
  const dedupeKey = `${validated.data.clientId}:${validated.data.type}`;
  const now = Date.now();
  const lastAt = RECENT_EVENT_TIMESTAMPS.get(dedupeKey) || 0;
  if (now - lastAt < EVENT_COOLDOWN_MS) return;
  RECENT_EVENT_TIMESTAMPS.set(dedupeKey, now);

  if (slug) {
    recordInteraction(slug, mapToLocalInteraction(validated.data.type));
  }

  if (isSupabaseConfigured) {
    supabase
      .from('analytics_events')
      .insert({
        client_id: validated.data.clientId,
        type: validated.data.type,
        device: validated.data.device,
        created_at: new Date().toISOString()
      })
      .then(() => undefined, () => undefined);
  }

  const writeFirestoreFallback = () => {
    if (!isFirebaseConfigured || !db) return;
    addDoc(collection(db, 'clients', validated.data.clientId, 'analytics_events'), {
      type: validated.data.type,
      device: validated.data.device,
      createdAt: new Date().toISOString()
    }).catch((err) => {
      console.warn('[Analytics] No se pudo registrar el evento en Firestore:', err?.code || err?.message || err);
    });
  };

  if (typeof fetch !== 'undefined') {
    fetch('/api/public/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validated.data),
      keepalive: true
    })
      .then((res) => {
        if (res.status === 404 || res.status === 503) {
          writeFirestoreFallback();
        }
      })
      .catch(() => {
        writeFirestoreFallback();
      });
    return;
  }

  writeFirestoreFallback();
}

/**
 * Obtiene y agrega las métricas reales de un cliente desde Firestore
 * filtradas por el rango de días permitido en su plan (máx. 5000 eventos por consulta).
 */
export async function fetchClientAnalytics(
  clientId: string,
  maxDays: number | null = 30,
  includeAdvanced: boolean = true
): Promise<ClientAnalyticsSummary> {
  const summary: ClientAnalyticsSummary = {
    totalViews: 0,
    whatsappClicks: 0,
    phoneClicks: 0,
    vcardDownloads: 0,
    instagramClicks: 0,
    facebookClicks: 0,
    tiktokClicks: 0,
    websiteClicks: 0,
    reviewClicks: 0,
    directionsClicks: 0,
    iosCount: 0,
    androidCount: 0,
    desktopCount: 0
  };

  if (!clientId) {
    return summary;
  }

  // Intentar primero el endpoint autenticado del servidor (resuelve clientId desde el token, sin IDOR)
  if (auth?.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch('/api/client/analytics', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.summary) {
          return data.summary as ClientAnalyticsSummary;
        }
      } else if (response.status === 401 || response.status === 403) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.error || 'Sesión no autorizada para consultar analytics.');
      }
      // 404 / 503 (e.g. despliegue estático sin Express): continuar al respaldo protegido por Firestore Rules
    } catch (err: any) {
      if (err?.message?.includes('Sesión no autorizada') || err?.message?.includes('suspendido')) {
        throw err;
      }
      // Error de red o servidor no disponible: continuar al respaldo protegido por Firestore Rules
    }
  }

  const safeDays = maxDays === null ? 365 : Math.min(Math.max(1, maxDays), 365);
  const cutoffIso = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000).toISOString();

  const applyEvent = (type: AnalyticsEventType, device: AnalyticsDeviceType) => {
    if (includeAdvanced) {
      if (device === 'ios') summary.iosCount++;
      else if (device === 'android') summary.androidCount++;
      else if (device === 'desktop') summary.desktopCount++;
    }

    switch (type) {
      case 'profileView':
      case 'nfcScan':
      case 'qrScan':
        summary.totalViews++;
        break;
      case 'whatsappClick':
        summary.whatsappClicks++;
        break;
      case 'vcardDownload':
        summary.vcardDownloads++;
        break;
      case 'phoneClick':
        if (includeAdvanced) summary.phoneClicks++;
        break;
      case 'instagramClick':
        if (includeAdvanced) summary.instagramClicks++;
        break;
      case 'facebookClick':
        if (includeAdvanced) summary.facebookClicks++;
        break;
      case 'tiktokClick':
        if (includeAdvanced) summary.tiktokClicks++;
        break;
      case 'websiteClick':
        if (includeAdvanced) summary.websiteClicks++;
        break;
      case 'reviewClick':
        if (includeAdvanced) summary.reviewClicks++;
        break;
      case 'directionsClick':
        if (includeAdvanced) summary.directionsClicks++;
        break;
    }
  };

  let loadedFromFirestore = false;
  if (isFirebaseConfigured && db) {
    try {
      const eventsRef = collection(db, 'clients', clientId, 'analytics_events');
      const q = query(eventsRef, where('createdAt', '>=', cutoffIso), orderBy('createdAt', 'desc'), limit(5000));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        loadedFromFirestore = true;
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          applyEvent(data.type as AnalyticsEventType, data.device as AnalyticsDeviceType);
        });
      }
    } catch {
      // Continuar con respaldo de Supabase
    }
  }

  if (!loadedFromFirestore && isSupabaseConfigured) {
    try {
      const { data: rows, error } = await supabase
        .from('analytics_events')
        .select('type, device')
        .eq('client_id', clientId)
        .gte('created_at', cutoffIso)
        .order('created_at', { ascending: false })
        .limit(5000);
      if (!error && Array.isArray(rows)) {
        rows.forEach((r: any) => {
          applyEvent(r.type as AnalyticsEventType, r.device as AnalyticsDeviceType);
        });
      }
    } catch {
      // Ignorar si falla Supabase
    }
  }

  return summary;
}
