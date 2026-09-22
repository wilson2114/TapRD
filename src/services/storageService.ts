import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isFirebaseConfigured } from '../lib/firebase';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB máximo

export interface UploadLogoResult {
  url: string;
  error?: string;
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
