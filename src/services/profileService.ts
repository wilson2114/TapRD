import { getClientBySlug, getPublicClientData } from './clientService';
import { Client } from '../types/client';

export type PublicProfileStatus = 'found' | 'not_found' | 'inactive';

export interface PublicProfileResult {
  status: PublicProfileStatus;
  client?: ReturnType<typeof getPublicClientData>;
  rawClient?: Client;
  error?: string;
}

/**
 * SERVICIO DE PERFILES PÚBLICOS DIGITALES DE TAPRD
 * 
 * Consulta Firestore mediante el slug y valida el estado del perfil.
 * - Si no existe: status = 'not_found'
 * - Si existe y status == 'inactive': status = 'inactive'
 * - Si está activo: status = 'found' y provee datos limpios
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

    // Registrar vista de perfil (Arquitectura preparada para Analytics)
    trackAnalyticsEvent(client.id, 'profileView');

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

/**
 * ARQUITECTURA PREPARADA PARA ANALYTICS (Sección 30)
 * Registra métricas de interacción con el perfil NFC / QR.
 */
export type AnalyticsEventType = 
  | 'profileView' 
  | 'nfcScan' 
  | 'qrScan' 
  | 'whatsappClick' 
  | 'phoneClick' 
  | 'instagramClick' 
  | 'websiteClick';

export function trackAnalyticsEvent(clientId: string, eventType: AnalyticsEventType): void {
  // TODO: Implementar registro duradero en Firestore subcolección `clients/{clientId}/analytics_events`
  // TODO: Incrementar contadores atómicos con FieldValue.increment(1) para:
  // - profileViews
  // - nfcScans
  // - qrScans
  // - whatsappClicks
  // - phoneClicks
  // - instagramClicks
  // - websiteClicks
  if (process.env.NODE_ENV === 'development') {
    // Registro liviano en consola durante desarrollo
    // console.log(`[Analytics Event] ${eventType} para cliente ${clientId}`);
  }
}
