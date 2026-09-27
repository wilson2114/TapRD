/**
 * ADAPTADOR DE COMPATIBILIDAD Y SEGURIDAD ADMINISTRATIVA
 * Re-exporta los métodos centralizados desde authService.ts
 */
export * from './authService';
import { getCurrentUser, isAuthorizedAdminEmail, AUTHORIZED_ADMIN_EMAILS } from './authService';

export const getCurrentAdminUser = getCurrentUser;

interface AdminListItem {
  name: string;
  email: string;
  role: string;
}

const AUTHORIZED_ADMINS: AdminListItem[] = [
  { name: 'Wilson Abelino Brito', email: 'wilsonabelinobrito@gmail.com', role: 'superadmin' },
  { name: 'Administrador Principal TapRD', email: 'admin@taprd.com', role: 'superadmin' }
];

export function getRegisteredAdmins(): AdminListItem[] {
  // Los administradores autorizados provienen exclusivamente de identidades verificadas
  return AUTHORIZED_ADMINS;
}

export async function createAdminUser(
  name: string,
  email: string,
  pass: string,
  _role: 'admin' | 'superadmin' = 'admin'
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = (email || '').trim().toLowerCase();
  
  if (!name || !cleanEmail || !pass) {
    return { success: false, error: 'Todos los campos son obligatorios.' };
  }

  // Prevenir escalamiento de privilegios por parte de clientes o terceros no autorizados
  if (!isAuthorizedAdminEmail(cleanEmail)) {
    return { 
      success: false, 
      error: 'Operación no permitida. Solo las cuentas corporativas autorizadas por la dirección de TapRD pueden ser registradas como administradores.' 
    };
  }

  return { 
    success: false, 
    error: 'La creación de administradores debe realizarse mediante Firebase Console o el backend de Cloud Functions con Custom Claims.' 
  };
}
