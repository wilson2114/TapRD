import { auth } from '../lib/firebase';
import { getCurrentAdminUser } from './authService';
import { updateClient } from './clientService';

export interface CreateClientAccessResult {
  success: boolean;
  clientId?: string;
  userId?: string;
  accessStatus?: 'pending' | 'active' | 'suspended';
  email?: string;
  message: string;
  activationLink?: string | null;
  error?: string;
}

export interface ClientAccessActionResult {
  success: boolean;
  clientId?: string;
  accessStatus?: 'pending' | 'active' | 'suspended';
  message: string;
  activationLink?: string | null;
  error?: string;
}

/**
 * Obtiene los headers de autorización para las peticiones administrativas al backend
 */
async function getAdminHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  try {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('[clientAccessService] Error obteniendo ID token:', err);
  }

  // Complemento de contexto de sesión administrativa
  const currentAdmin = getCurrentAdminUser();
  if (currentAdmin) {
    headers['x-admin-role'] = currentAdmin.role;
    headers['x-admin-email'] = currentAdmin.email;
    headers['x-admin-uid'] = currentAdmin.uid;
  }

  return headers;
}

/**
 * 1. Crear acceso seguro para cliente (Regla 1-12)
 * Invoca el backend privilegiado (Firebase Admin SDK).
 * El frontend NUNCA solicita ni genera contraseñas.
 */
export async function createClientAccess(
  clientId: string,
  email: string,
  ownerName?: string
): Promise<CreateClientAccessResult> {
  try {
    const headers = await getAdminHeaders();
    const response = await fetch('/api/admin/client-access/create', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        clientId,
        email: email.trim().toLowerCase(),
        ownerName
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'No se pudo crear el acceso para el cliente.',
        error: data.error
      };
    }

    if (data.clientId && data.userId) {
      try {
        await updateClient(data.clientId, {
          userId: data.userId,
          clientEmail: data.email || email.trim().toLowerCase(),
          accessStatus: data.accessStatus || 'pending'
        });
      } catch (syncErr) {
        console.warn('[clientAccessService] Aviso sincronizando cliente en Firestore/local:', syncErr);
      }
    }

    return {
      success: true,
      clientId: data.clientId,
      userId: data.userId,
      accessStatus: data.accessStatus || 'pending',
      email: data.email,
      message: data.message || 'Acceso creado. El sistema de invitación por correo todavía no está configurado.',
      activationLink: data.activationLink
    };
  } catch (err: any) {
    console.error('[clientAccessService] Error de red en createClientAccess:', err);
    return {
      success: false,
      message: 'Error de conexión con el servidor. Verifica tu conexión e inténtalo de nuevo.',
      error: err.message
    };
  }
}

/**
 * 2. Reenviar invitación de acceso (Regla 20)
 */
export async function resendClientInvitation(clientId: string): Promise<ClientAccessActionResult> {
  try {
    const headers = await getAdminHeaders();
    const response = await fetch('/api/admin/client-access/resend', {
      method: 'POST',
      headers,
      body: JSON.stringify({ clientId })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'No se pudo reenviar la invitación.',
        error: data.error
      };
    }

    return {
      success: true,
      clientId: data.clientId,
      message: data.message || 'Invitación regenerada correctamente.',
      activationLink: data.activationLink
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Error de red al reenviar la invitación.',
      error: err.message
    };
  }
}

/**
 * 3. Suspender acceso del cliente (Regla 13)
 */
export async function suspendClientAccess(clientId: string): Promise<ClientAccessActionResult> {
  try {
    const headers = await getAdminHeaders();
    const response = await fetch('/api/admin/client-access/suspend', {
      method: 'POST',
      headers,
      body: JSON.stringify({ clientId })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'No se pudo suspender el acceso.',
        error: data.error
      };
    }

    if (data.clientId) {
      try {
        await updateClient(data.clientId, { accessStatus: 'suspended' });
      } catch {}
    }

    return {
      success: true,
      clientId: data.clientId,
      accessStatus: 'suspended',
      message: data.message || 'El acceso ha sido suspendido.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Error de red al suspender el acceso.',
      error: err.message
    };
  }
}

/**
 * 4. Reactivar acceso del cliente (Regla 14)
 */
export async function reactivateClientAccess(clientId: string): Promise<ClientAccessActionResult> {
  try {
    const headers = await getAdminHeaders();
    const response = await fetch('/api/admin/client-access/reactivate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ clientId })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'No se pudo reactivar el acceso.',
        error: data.error
      };
    }

    if (data.clientId) {
      try {
        await updateClient(data.clientId, { accessStatus: 'active' });
      } catch {}
    }

    return {
      success: true,
      clientId: data.clientId,
      accessStatus: 'active',
      message: data.message || 'El acceso ha sido reactivado.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Error de red al reactivar el acceso.',
      error: err.message
    };
  }
}
