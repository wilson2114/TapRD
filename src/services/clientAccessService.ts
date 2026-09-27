import { auth } from '../lib/firebase';
import { getCurrentAdminUser } from './authService';
import { updateClient, getClientById } from './clientService';
import { createActivationToken } from './activationService';

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
 * Parsea con seguridad la respuesta HTTP para evitar errores de sintaxis JSON
 * si el backend o proxy devuelve HTML (como 404, 502 o Vite SPA index.html)
 */
async function parseSafeResponse(response: Response): Promise<{ isJson: boolean; data: any; rawText: string }> {
  try {
    const text = await response.text();
    const trimmed = text.trim();
    const contentType = response.headers.get('content-type') || '';

    if (
      contentType.includes('application/json') || 
      (trimmed.startsWith('{') && trimmed.endsWith('}')) || 
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      const parsed = JSON.parse(trimmed);
      return { isJson: true, data: parsed, rawText: text };
    }
    return { isJson: false, data: null, rawText: text };
  } catch (err) {
    return { isJson: false, data: null, rawText: '' };
  }
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

  return headers;
}

/**
 * 1. Crear acceso seguro para cliente (Regla 1-12)
 * Intenta invocar el backend de administración; si el backend no está disponible
 * o devuelve una respuesta no-JSON, utiliza el fallback directo en Firestore/activations.
 */
export async function createClientAccess(
  clientId: string,
  email: string,
  ownerName?: string
): Promise<CreateClientAccessResult> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const headers = await getAdminHeaders();
    const response = await fetch('/api/admin/client-access/create', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        clientId,
        email: cleanEmail,
        ownerName
      })
    });

    const { isJson, data } = await parseSafeResponse(response);

    if (isJson && data) {
      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'No se pudo crear el acceso para el cliente.',
          error: data.error
        };
      }

      // Asegurar que el token de activación esté SIEMPRE registrado en Firestore y sea verificable
      const act = await createActivationToken(
        data.clientId || clientId,
        cleanEmail,
        ownerName || 'Cliente TapRD',
        ownerName
      );

      const targetUid = data.userId || `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      try {
        await updateClient(data.clientId || clientId, {
          userId: targetUid,
          clientEmail: cleanEmail,
          accessStatus: data.accessStatus || 'pending',
          activationToken: act.token
        });
      } catch (syncErr) {
        console.warn('[clientAccessService] Aviso sincronizando cliente en Firestore/local:', syncErr);
      }

      return {
        success: true,
        clientId: data.clientId || clientId,
        userId: targetUid,
        accessStatus: data.accessStatus || 'pending',
        email: cleanEmail,
        message: data.message || 'Acceso creado exitosamente. Enlace de activación listo para enviar al cliente.',
        activationLink: act.activationUrl
      };
    }

    // Si la respuesta no es JSON (ej. servidor dev reiniciando o proxy devolviendo HTML),
    // ejecutar fallback directo en Firestore de forma transparente
    console.info('[clientAccessService] Ejecutando fallback directo para creación de acceso en cliente...');
    return await fallbackCreateClientAccess(clientId, cleanEmail, ownerName);
  } catch (err: any) {
    console.warn('[clientAccessService] Error de red llamando API backend, aplicando fallback:', err.message);
    return await fallbackCreateClientAccess(clientId, cleanEmail, ownerName);
  }
}

/**
 * Fallback directo para crear acceso utilizando el servicio de activación local/Firestore
 */
async function fallbackCreateClientAccess(
  clientId: string,
  cleanEmail: string,
  ownerName?: string
): Promise<CreateClientAccessResult> {
  try {
    const client = await getClientById(clientId);
    const businessName = client?.businessName || ownerName || 'Cliente TapRD';

    const { token, activationUrl } = await createActivationToken(
      clientId,
      cleanEmail,
      businessName,
      ownerName
    );

    const generatedUid = client?.userId || `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await updateClient(clientId, {
      userId: generatedUid,
      clientEmail: cleanEmail,
      accessStatus: 'pending',
      activationToken: token
    });

    return {
      success: true,
      clientId,
      userId: generatedUid,
      accessStatus: 'pending',
      email: cleanEmail,
      message: 'Acceso creado exitosamente. Enlace de activación listo para enviar al cliente.',
      activationLink: activationUrl
    };
  } catch (fallbackErr: any) {
    console.error('[clientAccessService] Error en fallbackCreateClientAccess:', fallbackErr);
    return {
      success: false,
      message: 'Error al procesar el acceso del cliente. Por favor inténtalo de nuevo.',
      error: fallbackErr.message
    };
  }
}

/**
 * 2. Reenviar invitación de acceso (Regla 20)
 */
export async function resendClientInvitation(clientId: string): Promise<ClientAccessActionResult> {
  try {
    const client = await getClientById(clientId);
    const targetEmail = (client?.clientEmail || client?.email || '').trim().toLowerCase();
    if (!targetEmail) {
      return { success: false, message: 'El cliente no tiene un correo registrado para enviar la invitación.' };
    }

    const { token, activationUrl } = await createActivationToken(
      clientId,
      targetEmail,
      client?.businessName || 'Cliente TapRD',
      client?.ownerName
    );

    try {
      await updateClient(clientId, {
        activationToken: token,
        clientEmail: targetEmail,
        accessStatus: client?.accessStatus === 'active' ? 'active' : 'pending'
      });
    } catch {}

    // Intentar también notificar al backend si está disponible
    try {
      const headers = await getAdminHeaders();
      await fetch('/api/admin/client-access/resend', {
        method: 'POST',
        headers,
        body: JSON.stringify({ clientId })
      });
    } catch {}

    return {
      success: true,
      clientId,
      message: 'Invitación regenerada correctamente.',
      activationLink: activationUrl
    };
  } catch (err: any) {
    console.warn('[clientAccessService] Error al reenviar invitación:', err);
    return {
      success: false,
      message: 'Error al generar la invitación. Por favor intenta de nuevo.',
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

    const { isJson, data } = await parseSafeResponse(response);

    if (isJson && data) {
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
    }

    // Fallback directo
    await updateClient(clientId, { accessStatus: 'suspended' });
    return {
      success: true,
      clientId,
      accessStatus: 'suspended',
      message: 'El acceso ha sido suspendido.'
    };
  } catch (err: any) {
    console.warn('[clientAccessService] Error de red al suspender en API, aplicando actualización local:', err);
    try {
      await updateClient(clientId, { accessStatus: 'suspended' });
      return {
        success: true,
        clientId,
        accessStatus: 'suspended',
        message: 'El acceso ha sido suspendido.'
      };
    } catch (dbErr: any) {
      return {
        success: false,
        message: 'Error al suspender el acceso.',
        error: dbErr.message
      };
    }
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

    const { isJson, data } = await parseSafeResponse(response);

    if (isJson && data) {
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
    }

    // Fallback directo
    await updateClient(clientId, { accessStatus: 'active' });
    return {
      success: true,
      clientId,
      accessStatus: 'active',
      message: 'El acceso ha sido reactivado.'
    };
  } catch (err: any) {
    console.warn('[clientAccessService] Error de red al reactivar en API, aplicando actualización local:', err);
    try {
      await updateClient(clientId, { accessStatus: 'active' });
      return {
        success: true,
        clientId,
        accessStatus: 'active',
        message: 'El acceso ha sido reactivado.'
      };
    } catch (dbErr: any) {
      return {
        success: false,
        message: 'Error al reactivar el acceso.',
        error: dbErr.message
      };
    }
  }
}
