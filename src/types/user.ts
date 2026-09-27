export type UserRole = 'ADMIN' | 'CLIENT' | 'admin' | 'client' | 'superadmin' | 'owner';

export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  clientId?: string;
  active?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  photoURL?: string;
  // Cumplimiento Legal y Consentimiento (PARTE 10)
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
  termsAcceptedAt?: string;
  privacyAcceptedAt?: string;
  termsVersion?: string;
  privacyVersion?: string;
}

export function isAdminRole(role?: string): boolean {
  if (!role) return false;
  const r = role.toUpperCase();
  return r === 'ADMIN' || r === 'SUPERADMIN' || r === 'OWNER';
}

export function isClientRole(role?: string): boolean {
  if (!role) return false;
  const r = role.toUpperCase();
  return r === 'CLIENT';
}

// Alias para compatibilidad con código existente
export type AdminUser = AppUser;

