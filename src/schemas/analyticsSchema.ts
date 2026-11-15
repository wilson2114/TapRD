import { z } from 'zod';

export const ANALYTICS_EVENT_TYPES = [
  'profileView',
  'nfcScan',
  'qrScan',
  'whatsappClick',
  'phoneClick',
  'vcardDownload',
  'instagramClick',
  'facebookClick',
  'tiktokClick',
  'websiteClick',
  'reviewClick',
  'directionsClick'
] as const;

export const ANALYTICS_DEVICE_TYPES = ['ios', 'android', 'desktop'] as const;
export const ANALYTICS_SOURCES = ['nfc', 'qr', 'link', 'direct'] as const;

/**
 * Normaliza y sanea cadenas de texto provenientes del cliente (User-Agent, referrer, UTM)
 * eliminando caracteres de control y truncando a longitud segura.
 */
export function sanitizeAnalyticsText(value: string, maxLength: number = 120): string {
  return value
    .replace(/[\u0000-\u001F\u007F<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

export const trackAnalyticsPayloadSchema = z
  .object({
    clientId: z
      .string()
      .trim()
      .min(1)
      .max(128)
      .regex(/^[A-Za-z0-9_-]+$/, 'clientId inválido'),
    type: z.enum(ANALYTICS_EVENT_TYPES),
    device: z.enum(ANALYTICS_DEVICE_TYPES),
    source: z.enum(ANALYTICS_SOURCES).optional()
  })
  .strict();

export type TrackAnalyticsPayload = z.infer<typeof trackAnalyticsPayloadSchema>;
