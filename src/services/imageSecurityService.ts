/**
 * SISTEMA DE SEGURIDAD Y PROCESAMIENTO DE IMÁGENES TAPRD
 * 
 * Implementa defensa en profundidad:
 * 1. Validación de extensión y MIME declarado.
 * 2. Validación profunda de firmas binarias (Magic Bytes).
 * 3. Detección y rechazo de ejecutables, scripts (SVG, HTML, PHP, JS) y exploits.
 * 4. Límites estrictos de tamaño (máx 5 MB) y dimensiones (máx 4096x4096px / 16 MP).
 * 5. Reprocesamiento y re-encoding completo mediante Canvas aislado.
 * 6. Eliminación total de metadatos (EXIF, IPTC, XMP, comentarios maliciosos).
 * 7. Conversión a formato seguro WebP + generación de miniatura (thumbnail ~400px).
 * 8. Rutas protegidas y nombres criptográficos aleatorios (UUID v4) contra path traversal.
 * 9. Separación de almacenamiento: cuarentena vs imágenes aprobadas.
 * 10. Rate limiting contra abuso.
 */

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

// =============================================================================
// CONSTANTES DE SEGURIDAD
// =============================================================================

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MIN_FILE_SIZE_BYTES = 100; // Archivo mínimo válido
export const MAX_IMAGE_WIDTH = 4096;
export const MAX_IMAGE_HEIGHT = 4096;
export const MIN_IMAGE_WIDTH = 50;
export const MIN_IMAGE_HEIGHT = 50;
export const MAX_TOTAL_PIXELS = 16 * 1024 * 1024; // 16 Megapíxeles (Previene Pixel Floods)

export const OPTIMIZED_MAX_WIDTH = 1280; // Ancho máximo para perfil
export const THUMBNAIL_MAX_WIDTH = 400;  // Ancho para miniatura del servicio
export const WEBP_QUALITY = 0.85;
export const THUMB_QUALITY = 0.80;

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Rate limit: Máximo 10 subidas por minuto por cliente
const MAX_UPLOADS_PER_WINDOW = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const uploadTimestamps: { [clientId: string]: number[] } = {};

// =============================================================================
// INTERFACES
// =============================================================================

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  detectedFormat?: 'jpeg' | 'png' | 'webp';
  dimensions?: { width: number; height: number };
}

export interface ProcessedImageResult {
  mainBlob: Blob;
  thumbBlob: Blob;
  width: number;
  height: number;
  mimeType: 'image/webp' | 'image/jpeg';
  fileUuid: string;
  quarantinePath: string;
  approvedPath: string;
  approvedThumbPath: string;
  originalNameSanitized: string;
}

export interface SecurityLogEntry {
  clientId: string;
  action: string;
  reason?: string;
  fileName?: string;
  fileSizeBytes?: number;
  mimeDeclared?: string;
  detectedFormat?: string;
  timestamp?: string;
}

// =============================================================================
// 1. GENERACIÓN DE IDENTIFICADORES SEGUROS
// =============================================================================

export function generateSecureUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback seguro criptográfico
  const buffer = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(buffer);
  } else {
    for (let i = 0; i < 16; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
  }
  buffer[6] = (buffer[6] & 0x0f) | 0x40; // Version 4
  buffer[8] = (buffer[8] & 0x3f) | 0x80; // Variant 10
  const hex = Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function sanitizePathSegment(segment: string): string {
  if (!segment) return 'unknown';
  // Elimina cualquier intento de path traversal (../, ..\, /) y caracteres especiales
  return segment
    .replace(/\.\./g, '')
    .replace(/[/\\]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 64);
}

// =============================================================================
// 2. VERIFICACIÓN DE FIRMA BINARIA (MAGIC BYTES)
// =============================================================================

export async function checkMagicBytes(file: File): Promise<{
  valid: boolean;
  detectedFormat?: 'jpeg' | 'png' | 'webp';
  error?: string;
}> {
  try {
    const headerBuffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(headerBuffer);

    if (bytes.length < 12) {
      return { valid: false, error: 'El archivo está truncado o es demasiado pequeño para ser una imagen.' };
    }

    // 1. JPEG Magic Bytes: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return { valid: true, detectedFormat: 'jpeg' };
    }

    // 2. PNG Magic Bytes: 89 50 4E 47 0D 0A 1A 0A
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 && // P
      bytes[2] === 0x4e && // N
      bytes[3] === 0x47 && // G
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    ) {
      return { valid: true, detectedFormat: 'png' };
    }

    // 3. WEBP Magic Bytes: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
    if (
      bytes[0] === 0x52 && // R
      bytes[1] === 0x49 && // I
      bytes[2] === 0x46 && // F
      bytes[3] === 0x46 && // F
      bytes[8] === 0x57 && // W
      bytes[9] === 0x45 && // E
      bytes[10] === 0x42 && // B
      bytes[11] === 0x50    // P
    ) {
      return { valid: true, detectedFormat: 'webp' };
    }

    // Análisis de firmas maliciosas conocidas (ejecutables o scripts enmascarados)
    // DOS/PE Executable: MZ (4D 5A)
    if (bytes[0] === 0x4d && bytes[1] === 0x5a) {
      return { valid: false, error: 'Archivo ejecutable no permitido por motivos de seguridad.' };
    }

    // Linux ELF: 7F 45 4C 46
    if (bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46) {
      return { valid: false, error: 'Binario no permitido por motivos de seguridad.' };
    }

    // ZIP / JAR / Office macro: PK (50 4B 03 04)
    if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
      return { valid: false, error: 'Archivos comprimidos no permitidos en este formulario.' };
    }

    // Escanear los primeros 512 bytes buscando scripts SVG, HTML o PHP incrustados
    const textSample = new TextDecoder('utf-8', { fatal: false }).decode(
      new Uint8Array(await file.slice(0, 512).arrayBuffer())
    ).toLowerCase();

    if (
      textSample.includes('<svg') ||
      textSample.includes('<?xml') ||
      textSample.includes('<html') ||
      textSample.includes('<script') ||
      textSample.includes('<?php') ||
      textSample.includes('javascript:')
    ) {
      return { valid: false, error: 'Formato SVG o script no permitido en fotografías de servicios.' };
    }

    return {
      valid: false,
      error: 'La firma del archivo no corresponde a una imagen válida (JPG, PNG o WEBP).'
    };
  } catch (err: any) {
    return {
      valid: false,
      error: 'Error al verificar la estructura binaria del archivo.'
    };
  }
}

// =============================================================================
// 3. RATE LIMITING DE SUBIDAS
// =============================================================================

export function checkUploadRateLimit(clientId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const safeId = sanitizePathSegment(clientId);
  
  if (!uploadTimestamps[safeId]) {
    uploadTimestamps[safeId] = [];
  }

  // Filtrar timestamps fuera de la ventana
  uploadTimestamps[safeId] = uploadTimestamps[safeId].filter(
    ts => now - ts < RATE_LIMIT_WINDOW_MS
  );

  if (uploadTimestamps[safeId].length >= MAX_UPLOADS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  uploadTimestamps[safeId].push(now);
  return {
    allowed: true,
    remaining: MAX_UPLOADS_PER_WINDOW - uploadTimestamps[safeId].length
  };
}

// =============================================================================
// 4. VALIDACIÓN INTEGRAL DE ARCHIVO (FRONTEND & BACKEND LOGIC)
// =============================================================================

export async function validateServiceImageFile(
  file: File,
  clientId?: string
): Promise<ImageValidationResult> {
  // 1. Verificación de existencia y tipo File
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'No se ha seleccionado ningún archivo válido.' };
  }

  // 2. Rate limiting
  if (clientId) {
    const rateCheck = checkUploadRateLimit(clientId);
    if (!rateCheck.allowed) {
      return {
        valid: false,
        error: 'Has alcanzado el límite de intentos de subida. Por favor espera un minuto.'
      };
    }
  }

  // 3. Tamaño del archivo
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const mbSize = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `El archivo supera el tamaño máximo permitido de 5 MB (actual: ${mbSize} MB).`
    };
  }

  if (file.size < MIN_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'El archivo es demasiado pequeño o está dañado.'
    };
  }

  // 4. Extensión declarada en el nombre del archivo
  const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: 'Extensión no permitida. Solo se aceptan fotografías en formato JPG, PNG o WEBP.'
    };
  }

  // 5. MIME declarado por el navegador
  const declaredMime = file.type.toLowerCase();
  if (declaredMime && !ALLOWED_MIME_TYPES.includes(declaredMime)) {
    return {
      valid: false,
      error: 'Tipo de contenido no permitido. Solo se aceptan imágenes JPEG, PNG o WEBP.'
    };
  }

  // 6. Validación de Magic Bytes
  const magicCheck = await checkMagicBytes(file);
  if (!magicCheck.valid) {
    return {
      valid: false,
      error: magicCheck.error || 'La imagen no cumple con las firmas de seguridad requeridas.'
    };
  }

  // 7. Decodificación y validación de dimensiones en memoria
  try {
    const dimensions = await getImageDimensions(file);

    if (dimensions.width < MIN_IMAGE_WIDTH || dimensions.height < MIN_IMAGE_HEIGHT) {
      return {
        valid: false,
        error: `Las dimensiones de la imagen (${dimensions.width}x${dimensions.height}px) son demasiado pequeñas. Mínimo 50x50px.`
      };
    }

    if (dimensions.width > MAX_IMAGE_WIDTH || dimensions.height > MAX_IMAGE_HEIGHT) {
      return {
        valid: false,
        error: `Las dimensiones de la imagen superan el máximo permitido (${MAX_IMAGE_WIDTH}x${MAX_IMAGE_HEIGHT}px).`
      };
    }

    const totalPixels = dimensions.width * dimensions.height;
    if (totalPixels > MAX_TOTAL_PIXELS) {
      return {
        valid: false,
        error: 'La imagen contiene una cantidad excesiva de píxeles para procesamiento seguro.'
      };
    }

    return {
      valid: true,
      detectedFormat: magicCheck.detectedFormat,
      dimensions
    };
  } catch (err: any) {
    return {
      valid: false,
      error: 'No se pudo decodificar el archivo como imagen. El contenido puede estar corrupto.'
    };
  }
}

/**
 * Obtiene dimensiones reales decodificando la imagen en memoria
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Fallo al renderizar la imagen'));
    };

    img.src = url;
  });
}

// =============================================================================
// 5. REPROCESAMIENTO, STRIP DE METADATOS Y CONVERSIÓN A WEBP
// =============================================================================

/**
 * Reprocesa la imagen a través de Canvas:
 * - Desecha cualquier metadato EXIF, ICC o script incrustado.
 * - Genera imagen optimizada en formato WebP limpio.
 * - Genera miniatura (thumbnail) de 400px.
 * - Genera identificadores y rutas seguros (cuarentena y final).
 */
export async function reprocessAndSanitizeImage(
  file: File,
  clientId: string,
  serviceId: string
): Promise<ProcessedImageResult> {
  const safeClientId = sanitizePathSegment(clientId);
  const safeServiceId = sanitizePathSegment(serviceId);
  const fileUuid = generateSecureUUID();

  // Rutas canónicas
  const quarantinePath = `uploads/quarantine/${safeClientId}/${safeServiceId}_${fileUuid}.bin`;
  const approvedPath = `services/${safeClientId}/${safeServiceId}/${fileUuid}.webp`;
  const approvedThumbPath = `services/${safeClientId}/${safeServiceId}/${fileUuid}_thumb.webp`;

  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Fallo al cargar la imagen para reprocesamiento.'));
      image.src = objectUrl;
    });

    const origWidth = img.naturalWidth || img.width;
    const origHeight = img.naturalHeight || img.height;

    // 1. Calcular dimensiones optimizadas para imagen principal
    let mainWidth = origWidth;
    let mainHeight = origHeight;
    if (mainWidth > OPTIMIZED_MAX_WIDTH) {
      mainHeight = Math.round((OPTIMIZED_MAX_WIDTH / mainWidth) * mainHeight);
      mainWidth = OPTIMIZED_MAX_WIDTH;
    }

    // 2. Renderizar imagen principal en Canvas limpio (Elimina EXIF)
    const mainCanvas = document.createElement('canvas');
    mainCanvas.width = mainWidth;
    mainCanvas.height = mainHeight;
    const mainCtx = mainCanvas.getContext('2d');
    if (!mainCtx) throw new Error('No se pudo inicializar contexto 2D para renderizado seguro.');
    
    // Relleno de fondo blanco si contiene transparencias alfa para consistencia
    mainCtx.drawImage(img, 0, 0, mainWidth, mainHeight);

    // 3. Renderizar miniatura (Thumbnail)
    let thumbWidth = origWidth;
    let thumbHeight = origHeight;
    if (thumbWidth > THUMBNAIL_MAX_WIDTH) {
      thumbHeight = Math.round((THUMBNAIL_MAX_WIDTH / thumbWidth) * thumbHeight);
      thumbWidth = THUMBNAIL_MAX_WIDTH;
    }

    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = thumbWidth;
    thumbCanvas.height = thumbHeight;
    const thumbCtx = thumbCanvas.getContext('2d');
    if (!thumbCtx) throw new Error('No se pudo inicializar contexto 2D para miniatura.');
    thumbCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);

    // 4. Exportar a Blob WebP (con fallback a JPEG si WebP no es compatible)
    const [mainBlob, thumbBlob] = await Promise.all([
      canvasToWebpBlob(mainCanvas, WEBP_QUALITY),
      canvasToWebpBlob(thumbCanvas, THUMB_QUALITY)
    ]);

    const mimeType: 'image/webp' | 'image/jpeg' = 
      mainBlob.type.includes('webp') ? 'image/webp' : 'image/jpeg';

    return {
      mainBlob,
      thumbBlob,
      width: mainWidth,
      height: mainHeight,
      mimeType,
      fileUuid,
      quarantinePath,
      approvedPath,
      approvedThumbPath,
      originalNameSanitized: file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100)
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function canvasToWebpBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          // Fallback a JPEG si WebP falla en el navegador
          canvas.toBlob(
            (fallbackBlob) => {
              if (fallbackBlob) resolve(fallbackBlob);
              else reject(new Error('Fallo al codificar los píxeles de la imagen.'));
            },
            'image/jpeg',
            quality
          );
        }
      },
      'image/webp',
      quality
    );
  });
}

// =============================================================================
// 6. REGISTRO SEGURO DE EVENTOS (AUDITORÍA & ANTIMALWARE LOGS)
// =============================================================================

export async function logSecurityEvent(entry: SecurityLogEntry): Promise<void> {
  try {
    const payload = {
      clientId: sanitizePathSegment(entry.clientId),
      action: entry.action,
      reason: entry.reason || 'none',
      fileName: entry.fileName ? entry.fileName.slice(0, 80) : undefined,
      fileSizeBytes: entry.fileSizeBytes || 0,
      mimeDeclared: entry.mimeDeclared || 'unknown',
      detectedFormat: entry.detectedFormat || 'unknown',
      timestamp: new Date().toISOString()
    };

    // Guardar en Firestore si está disponible
    if (isFirebaseConfigured) {
      try {
        await addDoc(collection(db, 'securityLogs'), {
          ...payload,
          createdAt: serverTimestamp()
        });
      } catch {
        // Silencioso para evitar romper flujo si no hay reglas de escritura directa
      }
    }

    // Registro seguro en auditoría local
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('taprd_security_events');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(payload);
        if (list.length > 50) list.pop();
        localStorage.setItem('taprd_security_events', JSON.stringify(list));
      } catch {}
    }
  } catch (err) {
    console.warn('Registro de seguridad informativo:', err);
  }
}
