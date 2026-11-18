import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  validateServiceImageFile, 
  reprocessAndSanitizeImage, 
  logSecurityEvent,
  ProcessedImageResult
} from './imageSecurityService';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB máximo

export interface UploadLogoResult {
  url: string;
  error?: string;
}

export interface UploadServiceImageResult {
  imageUrl: string;
  thumbnailUrl: string;
  imagePath: string;
  thumbnailPath?: string;
  imageStatus: 'approved' | 'rejected' | 'failed';
  dimensions: { width: number; height: number };
}

/**
 * Valida formato y tamaño del archivo de imagen
 */
export function validateLogoFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Formato no permitido. Por favor sube una imagen en formato JPG, PNG o WEBP.'
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'El archivo excede el tamaño máximo permitido (5 MB). Por favor optimiza la imagen.'
    };
  }

  return { valid: true };
}

/**
 * Convierte un archivo a Data URL (base64) como fallback local o previsualización inmediata
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * SUBIR LOGO DEL CLIENTE A FIREBASE STORAGE
 * 
 * 1. Valida formato y tamaño
 * 2. Sube a /clients/{clientId}/logo_{timestamp}
 * 3. Reporta progreso en tiempo real si se provee callback
 * 4. Retorna la URL pública de descarga (getDownloadURL)
 */
export async function uploadClientLogo(
  file: File,
  clientId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  // 1. Validación estricta
  const validation = validateLogoFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Archivo de imagen no válido');
  }

  // 2. Intentar subir a Supabase Storage (bucket taprd-media)
  if (isSupabaseConfigured) {
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'png';
      const timestamp = Date.now();
      const cleanClientId = clientId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const supaPath = `clients/${cleanClientId}/logo_${timestamp}.${fileExtension}`;
      if (onProgress) onProgress(30);
      const { error: uploadErr } = await supabase.storage
        .from('taprd-media')
        .upload(supaPath, file, { contentType: file.type, upsert: true });
      if (!uploadErr) {
        const { data: pub } = supabase.storage.from('taprd-media').getPublicUrl(supaPath);
        if (pub?.publicUrl) {
          if (onProgress) onProgress(100);
          return pub.publicUrl;
        }
      }
    } catch (supaErr) {
      console.warn('Supabase Storage upload falló, intentando Firebase Storage:', supaErr);
    }
  }

  // 3. Fallback a DataURL si Supabase no está disponible
  if (onProgress) onProgress(100);
  return fileToDataUrl(file);
}

/**
 * ELIMINAR LOGO DE FIREBASE STORAGE
 * Elimina el archivo anterior cuando se reemplaza o remueve el logo
 */
export async function deleteClientLogo(logoUrl: string): Promise<boolean> {
  if (!logoUrl) return false;

  if (isSupabaseConfigured && logoUrl.includes('/storage/v1/object/public/taprd-media/')) {
    try {
      const path = logoUrl.split('/storage/v1/object/public/taprd-media/')[1]?.split('?')[0];
      if (path) {
        await supabase.storage.from('taprd-media').remove([decodeURIComponent(path)]);
        return true;
      }
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Convierte un Blob a DataURL (para fallback offline / previsualización)
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * SUBIR Y PROCESAR FOTOGRAFÍA DE SERVICIO
 * 
 * Flujo de seguridad multicapa:
 * 1. Validación de tamaño, MIME, extensiones y Magic Bytes (binario)
 * 2. Validación de dimensiones y mitigación de pixel floods
 * 3. Reprocesamiento y re-encoding a WebP limpio (eliminación de EXIF/metadatos)
 * 4. Generación de miniatura (thumbnail) de 400px
 * 5. Carga a Storage con identificadores aleatorios UUID v4 (evita path traversal)
 * 6. Registro de auditoría
 */
export async function uploadServiceImage(
  file: File,
  clientId: string,
  serviceId: string,
  onProgress?: (percent: number) => void
): Promise<UploadServiceImageResult> {
  if (onProgress) onProgress(10);

  // 1. Validación estricta profunda
  const validation = await validateServiceImageFile(file, clientId);
  if (!validation.valid) {
    await logSecurityEvent({
      clientId,
      action: 'SERVICE_IMAGE_VALIDATION_REJECTED',
      reason: validation.error,
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeDeclared: file.type
    });
    throw new Error(validation.error || 'La imagen no cumple con las directivas de seguridad.');
  }

  if (onProgress) onProgress(30);

  // 2. Reprocesamiento y re-encoding (Elimina EXIF, scripts incrustados y metadatos)
  let processed: ProcessedImageResult;
  try {
    processed = await reprocessAndSanitizeImage(file, clientId, serviceId);
  } catch (procErr: any) {
    await logSecurityEvent({
      clientId,
      action: 'SERVICE_IMAGE_PROCESSING_FAILED',
      reason: procErr.message,
      fileName: file.name
    });
    throw new Error('No se pudo procesar la imagen de forma segura. Intenta con otra imagen.');
  }

  if (onProgress) onProgress(60);

  // 3. Subir a Supabase Storage (bucket taprd-media)
  if (isSupabaseConfigured) {
    try {
      const [mainRes, thumbRes] = await Promise.all([
        supabase.storage.from('taprd-media').upload(processed.approvedPath, processed.mainBlob, {
          contentType: processed.mimeType,
          upsert: true
        }),
        supabase.storage.from('taprd-media').upload(processed.approvedThumbPath, processed.thumbBlob, {
          contentType: processed.mimeType,
          upsert: true
        })
      ]);

      if (!mainRes.error && !thumbRes.error) {
        const { data: mainPub } = supabase.storage.from('taprd-media').getPublicUrl(processed.approvedPath);
        const { data: thumbPub } = supabase.storage.from('taprd-media').getPublicUrl(processed.approvedThumbPath);

        if (mainPub?.publicUrl && thumbPub?.publicUrl) {
          await logSecurityEvent({
            clientId,
            action: 'SERVICE_IMAGE_APPROVED',
            fileName: file.name,
            fileSizeBytes: processed.mainBlob.size,
            detectedFormat: processed.mimeType
          });

          if (onProgress) onProgress(100);

          return {
            imageUrl: mainPub.publicUrl,
            thumbnailUrl: thumbPub.publicUrl,
            imagePath: processed.approvedPath,
            thumbnailPath: processed.approvedThumbPath,
            imageStatus: 'approved',
            dimensions: { width: processed.width, height: processed.height }
          };
        }
      }
    } catch (supaErr) {
      console.warn('Supabase Storage upload falló para servicio, usando DataURL sanitizado:', supaErr);
    }
  }

  // 4. Fallback a DataURL sanitizado
  const [mainDataUrl, thumbDataUrl] = await Promise.all([
    blobToDataUrl(processed.mainBlob),
    blobToDataUrl(processed.thumbBlob)
  ]);

  await logSecurityEvent({
    clientId,
    action: 'SERVICE_IMAGE_APPROVED_LOCAL',
    fileName: file.name,
    fileSizeBytes: processed.mainBlob.size,
    detectedFormat: processed.mimeType
  });

  if (onProgress) onProgress(100);

  return {
    imageUrl: mainDataUrl,
    thumbnailUrl: thumbDataUrl,
    imagePath: processed.approvedPath,
    thumbnailPath: processed.approvedThumbPath,
    imageStatus: 'approved',
    dimensions: { width: processed.width, height: processed.height }
  };
}

/**
 * ELIMINAR FOTOGRAFÍA DE SERVICIO DE SUPABASE STORAGE
 * Elimina la imagen principal y su miniatura cuando el servicio es eliminado o la foto reemplazada
 */
export async function deleteServiceImage(imagePathOrUrl?: string, thumbPathOrUrl?: string): Promise<boolean> {
  if (!imagePathOrUrl && !thumbPathOrUrl) return false;

  const pathsToDelete = [imagePathOrUrl, thumbPathOrUrl].filter(Boolean) as string[];

  for (const item of pathsToDelete) {
    if (item.startsWith('data:')) continue;

    if (isSupabaseConfigured) {
      try {
        const supaPath = item.includes('/storage/v1/object/public/taprd-media/')
          ? decodeURIComponent(item.split('/storage/v1/object/public/taprd-media/')[1]?.split('?')[0] || '')
          : item;
        if (supaPath && !supaPath.startsWith('http')) {
          await supabase.storage.from('taprd-media').remove([supaPath]);
        }
      } catch {
        // Ignorar si no existe en Supabase
      }
    }
  }

  return true;
}
