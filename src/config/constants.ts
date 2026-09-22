/**
 * TapRD - Configuración centralizada
 * 
 * IMPORTANTE:
 * Reemplazar con el número de WhatsApp oficial de TapRD antes de publicar en producción.
 */
export const WHATSAPP_NUMBER = "18090000000";

/**
 * URL base pública para los perfiles digitales NFC.
 * NOTA: El dominio taprd.com es conceptual por ahora.
 * Permite cambiar fácilmente la URL base cuando se configure el dominio definitivo.
 */
export const PUBLIC_BASE_URL = "https://taprd.com";

/**
 * Credenciales de demostración para el panel de administración.
 * ATENCIÓN: Estas credenciales son SOLAMENTE para DEMO y deben eliminarse
 * cuando se implemente autenticación real con Firebase / Supabase o backend propio.
 */
export const ADMIN_DEMO_EMAIL = "admin@taprd.com";
export const ADMIN_DEMO_PASSWORD = "123456";

/**
 * Genera el enlace dinámico de WhatsApp para un número y mensaje opcional.
 * Formato estándar: https://wa.me/NUMERO?text=...
 */
export function getWhatsAppUrl(phone: string, text?: string): string {
  // Limpiar caracteres no numéricos
  const cleanNumber = phone.replace(/[^0-9]/g, '');
  const baseUrl = `https://wa.me/${cleanNumber}`;
  if (text) {
    return `${baseUrl}?text=${encodeURIComponent(text)}`;
  }
  return baseUrl;
}

/**
 * Genera el enlace de WhatsApp preformateado para solicitud de productos o cotizaciones.
 */
export function createProductWhatsAppUrl(
  productName: string,
  details?: {
    name?: string;
    businessName?: string;
    quantity?: string;
    city?: string;
  }
): string {
  const message = `Hola, quiero información sobre ${productName}.

Mi nombre es: ${details?.name || ''}
Mi negocio es: ${details?.businessName || ''}
Cantidad: ${details?.quantity || '1'}
Ciudad: ${details?.city || 'Santo Domingo'}`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message.trim())}`;
}

/**
 * Enlace genérico de WhatsApp para atención rápida de TapRD
 */
export function createGeneralWhatsAppUrl(customMessage?: string): string {
  const message = customMessage || '¡Hola TapRD! Me gustaría recibir información sobre sus soluciones NFC para negocios en República Dominicana.';
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
