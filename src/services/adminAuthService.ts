/**
 * ADAPTADOR DE COMPATIBILIDAD
 * Re-exporta los métodos centralizados desde authService.ts
 */
export * from './authService';
import { getCurrentUser, registerAdmin } from './authService';

export const getCurrentAdminUser = getCurrentUser;

interface AdminListItem {
  name: string;
  email: string;
  role: string;
}

const DEFAULT_ADMINS: AdminListItem[] = [
  { name: 'Wilson Abelino Brito', email: 'wilsonabelinobrito@gmail.com', role: 'superadmin' },
  { name: 'Administrador Principal TapRD', email: 'admin@taprd.com', role: 'superadmin' }
];

export function getRegisteredAdmins(): AdminListItem[] {
  try {
    const raw = localStorage.getItem('taprd_registered_admins_v2');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return DEFAULT_ADMINS;
}

export function createAdminUser(
  name: string,
  email: string,
  pass: string,
  role: 'admin' | 'superadmin' = 'admin'
): { success: boolean; error?: string } {
  if (!name || !email || !pass) {
    return { success: false, error: 'Todos los campos son obligatorios.' };
  }

  const current = getRegisteredAdmins();
  if (current.some(a => a.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'Ya existe un administrador registrado con ese correo.' };
  }

  const updated: AdminListItem[] = [...current, { name, email, role }];
  try {
    localStorage.setItem('taprd_registered_admins_v2', JSON.stringify(updated));
  } catch {}

  // Intenta registrar en Firebase en segundo plano si está disponible
  registerAdmin(name, email, pass).catch(() => {});

  return { success: true };
}
