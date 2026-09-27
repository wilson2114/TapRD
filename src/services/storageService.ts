import { ref, uploadBytesResumable, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isFirebaseConfigured } from '../lib/firebase';
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

  // 2. Si Firebase no está completamente configurado en el entorno, usar fallback DataURL
  if (!isFirebaseConfigured) {
    if (onProgress) onProgress(100);
    return fileToDataUrl(file);
  }

  try {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'png';
    const timestamp = Date.now();
    const cleanClientId = clientId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const storagePath = `clients/${cleanClientId}/logo_${timestamp}.${fileExtension}`;
    const storageRef = ref(storage, storagePath);

    const metadata = {
      contentType: file.type,
      customMetadata: {
        clientId: cleanClientId,
        uploadedAt: new Date().toISOString()
      }
    };

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            onProgress(percent);
          }
        },
        async (error) => {
          console.warn('Advertencia en Firebase Storage upload (utilizando DataURL de contingencia):', error.message);
          try {
            const fallbackUrl = await fileToDataUrl(file);
            resolve(fallbackUrl);
          } catch (fbErr) {
            reject(new Error('No se pudo subir la imagen. Por favor intenta de nuevo.'));
          }
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve(downloadUrl);
          } catch (urlErr) {
            const fallbackUrl = await fileToDataUrl(file);
            resolve(fallbackUrl);
          }
        }
      );
    });
  } catch (err: any) {
    console.warn('Error inicializando upload de Storage:', err);
    return fileToDataUrl(file);
  }
}

/**
 * ELIMINAR LOGO DE FIREBASE STORAGE
 * Elimina el archivo anterior cuando se reemplaza o remueve el logo
 */
export async function deleteClientLogo(logoUrl: string): Promise<boolean> {
  if (!logoUrl || !isFirebaseConfigured) return false;

  // Solo intentar eliminar si es una URL de Firebase Storage
  if (!logoUrl.includes('firebasestorage.googleapis.com')) {
    return true;
  }

  try {
    const storageRef = ref(storage, logoUrl);
    await deleteObject(storageRef);
    return true;
  } catch (err) {
    console.warn('Aviso al eliminar logo anterior de Storage (puede ya haber sido removido):', err);
    return false;
  }
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

  // 3. Si Firebase Storage no está configurado, usar DataURL sanitizado
  if (!isFirebaseConfigured) {
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

  // 4. Subida a Firebase Storage bajo rutas canónicas seguras
  try {
    // Metadata segura
    const mainMetadata = {
      contentType: processed.mimeType,
      customMetadata: {
        clientId: processed.approvedPath.split('/')[1] || clientId,
        serviceId: processed.approvedPath.split('/')[2] || serviceId,
        processedAt: new Date().toISOString(),
        sanitized: 'true'
      }
    };

    const thumbMetadata = {
      contentType: processed.mimeType,
      customMetadata: {
        clientId: processed.approvedPath.split('/')[1] || clientId,
        serviceId: processed.approvedPath.split('/')[2] || serviceId,
        isThumbnail: 'true',
        sanitized: 'true'
      }
    };

    // Referencias de Storage
    const mainRef = ref(storage, processed.approvedPath);
    const thumbRef = ref(storage, processed.approvedThumbPath);

    // Subir imagen principal y miniatura
    const [mainUploadResult, thumbUploadResult] = await Promise.all([
      uploadBytes(mainRef, processed.mainBlob, mainMetadata),
      uploadBytes(thumbRef, processed.thumbBlob, thumbMetadata)
    ]);

    if (onProgress) onProgress(85);

    // Obtener URLs públicas de descarga
    const [imageUrl, thumbnailUrl] = await Promise.all([
      getDownloadURL(mainUploadResult.ref),
      getDownloadURL(thumbUploadResult.ref)
    ]);

    // Registro de éxito en auditoría
    await logSecurityEvent({
      clientId,
      action: 'SERVICE_IMAGE_APPROVED',
      fileName: file.name,
      fileSizeBytes: processed.mainBlob.size,
      detectedFormat: processed.mimeType
    });

    if (onProgress) onProgress(100);

    return {
      imageUrl,
      thumbnailUrl,
      imagePath: processed.approvedPath,
      thumbnailPath: processed.approvedThumbPath,
      imageStatus: 'approved',
      dimensions: { width: processed.width, height: processed.height }
    };
  } catch (storageErr: any) {
    console.warn('Error subiendo a Storage (fallback a DataURL sanitizado):', storageErr.message);

    // Fallback a DataURL reprocesado
    const [mainDataUrl, thumbDataUrl] = await Promise.all([
      blobToDataUrl(processed.mainBlob),
      blobToDataUrl(processed.thumbBlob)
    ]);

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
}

/**
 * ELIMINAR FOTOGRAFÍA DE SERVICIO DE FIREBASE STORAGE
 * Elimina la imagen principal y su miniatura cuando el servicio es eliminado o la foto reemplazada
 */
export async function deleteServiceImage(imagePathOrUrl?: string, thumbPathOrUrl?: string): Promise<boolean> {
  if (!imagePathOrUrl && !thumbPathOrUrl) return false;
  if (!isFirebaseConfigured) return true;

  let success = true;

  const pathsToDelete = [imagePathOrUrl, thumbPathOrUrl].filter(Boolean) as string[];

  for (const item of pathsToDelete) {
    // Si es DataURL, no hay nada que borrar en Storage
    if (item.startsWith('data:')) continue;

    try {
      const storageRef = ref(storage, item);
      await deleteObject(storageRef);
    } catch (err: any) {
      // Ignorar si el archivo ya no existe
      if (!err.message?.includes('object-not-found')) {
        console.warn('Aviso eliminando imagen de servicio de Storage:', err.message);
        success = false;
      }
    }
  }

  return success;
}
