import { Client, QrRedirectMode } from '../types/client';

export interface ResolvedQrTarget {
  mode: QrRedirectMode;
  targetUrl: string | null;
  isExternal: boolean;
  label: string;
}

/**
 * Sanitiza y valida una URL externa permitiendo únicamente protocolos http: y https:.
 * Auto-agrega https:// si el usuario ingresó un dominio sin protocolo.
 */
export function sanitizeExternalUrl(raw?: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Rechazar esquemas peligrosos explícitamente
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return null;
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Resuelve el destino configurado para el Código QR Dinámico de un cliente.
 * Si el destino externo no está configurado o es inválido, retorna isExternal: false
 * para hacer fallback seguro al perfil digital TapRD.
 */
export function resolveQrRedirectTarget(client: Partial<Client>): ResolvedQrTarget {
  const mode: QrRedirectMode = client.qrRedirect?.mode || 'profile';

  switch (mode) {
    case 'whatsapp': {
      const digits = (client.whatsapp || client.phone || '').replace(/\D/g, '');
      if (!digits) {
        return { mode, targetUrl: null, isExternal: false, label: 'WhatsApp' };
      }
      const normalizedDigits = digits.length === 10 ? `1${digits}` : digits;
      const msg = client.qrRedirect?.whatsappMessage?.trim();
      const targetUrl = msg
        ? `https://wa.me/${normalizedDigits}?text=${encodeURIComponent(msg)}`
        : `https://wa.me/${normalizedDigits}`;
      return { mode, targetUrl, isExternal: true, label: 'WhatsApp' };
    }

    case 'instagram': {
      const ig = client.socialLinks?.instagram?.trim();
      if (!ig) {
        return { mode, targetUrl: null, isExternal: false, label: 'Instagram' };
      }
      if (/^https?:\/\//i.test(ig)) {
        const sanitized = sanitizeExternalUrl(ig);
        return {
          mode,
          targetUrl: sanitized,
          isExternal: Boolean(sanitized),
          label: 'Instagram'
        };
      }
      const handle = ig.replace(/^@+/, '').replace(/^instagram\.com\//i, '').replace(/\/+$/, '');
      if (!handle) {
        return { mode, targetUrl: null, isExternal: false, label: 'Instagram' };
      }
      return {
        mode,
        targetUrl: `https://instagram.com/${encodeURIComponent(handle)}`,
        isExternal: true,
        label: 'Instagram'
      };
    }

    case 'reviews': {
      const sanitized = sanitizeExternalUrl(client.googleReviewsUrl);
      return {
        mode,
        targetUrl: sanitized,
        isExternal: Boolean(sanitized),
        label: 'Reseñas de Google'
      };
    }

    case 'maps': {
      const directMaps = sanitizeExternalUrl(client.mapsUrl);
      if (directMaps) {
        return { mode, targetUrl: directMaps, isExternal: true, label: 'Google Maps' };
      }
      const queryParts = [client.businessName, client.address, client.city].filter(Boolean).join(', ');
      if (queryParts) {
        return {
          mode,
          targetUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryParts)}`,
          isExternal: true,
          label: 'Google Maps'
        };
      }
      return { mode, targetUrl: null, isExternal: false, label: 'Google Maps' };
    }

    case 'website': {
      const sanitized = sanitizeExternalUrl(client.socialLinks?.website);
      return {
        mode,
        targetUrl: sanitized,
        isExternal: Boolean(sanitized),
        label: 'Sitio Web'
      };
    }

    case 'custom': {
      const sanitized = sanitizeExternalUrl(client.qrRedirect?.customUrl);
      return {
        mode,
        targetUrl: sanitized,
        isExternal: Boolean(sanitized),
        label: 'Enlace personalizado'
      };
    }

    case 'profile':
    default:
      return {
        mode: 'profile',
        targetUrl: null,
        isExternal: false,
        label: 'Perfil Digital TapRD'
      };
  }
}
