import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { getClientBySlug, getPublicClientData } from './clientService';
import { Client } from '../types/client';
import { recordInteraction, InteractionType } from '../utils/analytics';

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

  if (slug) {
    recordInteraction(slug, mapToLocalInteraction(eventType));
  }

  if (!isFirebaseConfigured || !db) return;

  const payload = {
    type: eventType,
    device: detectDeviceType(),
    createdAt: new Date().toISOString()
  };

  addDoc(collection(db, 'clients', clientId, 'analytics_events'), payload).catch(() => {
    // Silencioso para no interrumpir la navegación del visitante
  });
}

/**
 * Obtiene y agrega las métricas reales de un cliente desde Firestore
 * filtradas por el rango de días permitido en su plan.
 */
export async function fetchClientAnalytics(
  clientId: string,
  maxDays: number = 30
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

  if (!isFirebaseConfigured || !db || !clientId) {
    return summary;
  }

  try {
    const cutoffIso = new Date(Date.now() - maxDays * 24 * 60 * 60 * 1000).toISOString();
    const eventsRef = collection(db, 'clients', clientId, 'analytics_events');
    const q = query(eventsRef, where('createdAt', '>=', cutoffIso));
    const snapshot = await getDocs(q);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const type = data.type as AnalyticsEventType;
      const device = data.device as AnalyticsDeviceType;

      if (device === 'ios') summary.iosCount++;
      else if (device === 'android') summary.androidCount++;
      else if (device === 'desktop') summary.desktopCount++;

      switch (type) {
        case 'profileView':
        case 'nfcScan':
        case 'qrScan':
          summary.totalViews++;
          break;
        case 'whatsappClick':
          summary.whatsappClicks++;
          break;
        case 'phoneClick':
          summary.phoneClicks++;
          break;
        case 'vcardDownload':
          summary.vcardDownloads++;
          break;
        case 'instagramClick':
          summary.instagramClicks++;
          break;
        case 'facebookClick':
          summary.facebookClicks++;
          break;
        case 'tiktokClick':
          summary.tiktokClicks++;
          break;
        case 'websiteClick':
          summary.websiteClicks++;
          break;
        case 'reviewClick':
          summary.reviewClicks++;
          break;
        case 'directionsClick':
          summary.directionsClicks++;
          break;
      }
    });
  } catch (err) {
    console.warn('[Analytics] Error leyendo eventos desde Firestore:', err);
  }

  return summary;
}
