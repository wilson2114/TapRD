/**
 * Traductor amigable de códigos de error de Firebase Authentication y Cloud Firestore
 */
export function translateFirebaseError(error: any): string {
  if (!error) return 'Ha ocurrido un error inesperado.';

  const code = typeof error === 'string' ? error : error.code || error.message || '';

  // Errores comunes de Firebase Authentication
  if (code.includes('auth/email-already-in-use')) {
    return 'Este correo electrónico ya está registrado en Firebase. Por favor inicia sesión o utiliza otro correo.';
  }
  if (code.includes('auth/invalid-email')) {
    return 'El formato del correo electrónico no es válido.';
  }
  if (code.includes('auth/weak-password')) {
    return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
  }
  if (code.includes('auth/wrong-password') || code.includes('auth/invalid-credential')) {
    return 'Credenciales inválidas. Correo electrónico o contraseña incorrectos.';
  }
  if (code.includes('auth/user-not-found')) {
    return 'No existe ninguna cuenta registrada con este correo electrónico.';
  }
  if (code.includes('auth/network-request-failed')) {
    return 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.';
  }
  if (code.includes('auth/too-many-requests')) {
    return 'Demasiados intentos fallidos. Por seguridad, espera unos minutos antes de volver a intentar.';
  }
  if (code.includes('auth/user-disabled')) {
    return 'Esta cuenta de usuario ha sido deshabilitada por el administrador.';
  }
  if (code.includes('auth/operation-not-allowed')) {
    return 'El proveedor de inicio de sesión con correo y contraseña no está habilitado en la consola de Firebase.';
  }
  if (code.includes('auth/api-key-not-valid') || code.includes('api-key-not-valid')) {
    return 'La clave de API (Web API Key) de Firebase no es válida. En firebase-applet-config.json debes colocar tu clave real de Firebase (comienza con "AIzaSy...").';
  }

  // Errores de Cloud Firestore
  if (code.includes('permission-denied')) {
    return 'Permiso denegado por las reglas de seguridad de Firestore.';
  }
  if (code.includes('unavailable')) {
    return 'El servicio de base de datos no está disponible en este momento.';
  }
  if (code.includes('not-found')) {
    return 'El registro solicitado no fue encontrado en la base de datos.';
  }
  if (code.includes('already-exists')) {
    return 'El registro ya existe en la base de datos.';
  }

  if (error.message && typeof error.message === 'string') {
    return error.message;
  }

  return 'Ocurrió un error al comunicarse con Firebase. Por favor inténtalo de nuevo.';
}
