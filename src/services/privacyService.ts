import { auth } from '../lib/firebase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PrivacyRequest, PrivacyRequestStatus, PrivacyRequestType } from '../types/legal';

const LOCAL_STORAGE_KEY = 'taprd_privacy_requests';

function getLocalRequests(): PrivacyRequest[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRequests(requests: PrivacyRequest[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(requests));
  } catch {}
}

export async function createPrivacyRequest(data: {
  userId: string;
  clientId: string;
  clientBusinessName?: string;
  userEmail: string;
  requestType: PrivacyRequestType;
  details: string;
}): Promise<{ success: boolean; request?: PrivacyRequest; error?: string }> {
  try {
    const now = new Date().toISOString();
    const id = `priv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newRequest: PrivacyRequest = {
      id,
      userId: data.userId,
      clientId: data.clientId,
      clientBusinessName: data.clientBusinessName || '',
      userEmail: data.userEmail,
      requestType: data.requestType,
      status: 'pending',
      details: data.details,
      createdAt: now,
      updatedAt: now
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('privacy_requests').upsert({
          id: newRequest.id,
          user_id: newRequest.userId,
          client_id: newRequest.clientId,
          request_type: newRequest.requestType,
          details: newRequest.details,
          status: newRequest.status,
          created_at: now,
          updated_at: now
        }, { onConflict: 'id' });
      } catch (dbErr) {
        console.warn('[PrivacyService] Aviso guardando en Supabase:', dbErr);
      }
    }

    const local = getLocalRequests();
    local.unshift(newRequest);
    saveLocalRequests(local);

    return { success: true, request: newRequest };
  } catch (err: any) {
    return { success: false, error: err.message || 'No se pudo registrar la solicitud de privacidad.' };
  }
}

function mapSupabasePrivacyRow(r: any): PrivacyRequest {
  return {
    id: r.id,
    userId: r.user_id || '',
    clientId: r.client_id || '',
    clientBusinessName: '',
    userEmail: '',
    requestType: r.request_type || 'access',
    status: r.status || 'pending',
    details: r.details || '',
    notes: r.admin_notes || undefined,
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || r.created_at || new Date().toISOString()
  };
}

export async function getPrivacyRequestsForUser(userId: string): Promise<PrivacyRequest[]> {
  const localList = getLocalRequests().filter(r => r.userId === userId);

  if (isSupabaseConfigured) {
    try {
      const { data: rows, error } = await supabase
        .from('privacy_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(rows)) {
        const remoteList = rows.map(mapSupabasePrivacyRow);
        const map = new Map<string, PrivacyRequest>();
        localList.forEach(r => map.set(r.id, r));
        remoteList.forEach(r => map.set(r.id, r));
        return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      console.warn('[PrivacyService] Aviso cargando desde Supabase:', err);
    }
  }

  return localList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllPrivacyRequests(): Promise<PrivacyRequest[]> {
  const localList = getLocalRequests();

  if (isSupabaseConfigured) {
    try {
      const { data: rows, error } = await supabase
        .from('privacy_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(rows)) {
        const remoteList = rows.map(mapSupabasePrivacyRow);
        const map = new Map<string, PrivacyRequest>();
        localList.forEach(r => map.set(r.id, r));
        remoteList.forEach(r => map.set(r.id, r));
        return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      console.warn('[PrivacyService] Aviso cargando solicitudes administrativas:', err);
    }
  }

  return localList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updatePrivacyRequestStatus(
  id: string,
  status: PrivacyRequestStatus,
  notes?: string,
  resolvedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    const updates: Partial<PrivacyRequest> = {
      status,
      updatedAt: now,
      ...(notes !== undefined ? { notes } : {}),
      ...(status === 'completed' || status === 'rejected' ? { resolvedAt: now, resolvedBy: resolvedBy || auth?.currentUser?.uid } : {})
    };

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('privacy_requests')
          .update({
            status,
            ...(notes !== undefined ? { admin_notes: notes } : {}),
            updated_at: now
          })
          .eq('id', id);
      } catch (err) {
        console.warn('[PrivacyService] Aviso actualizando solicitud en Supabase:', err);
      }
    }

    // Actualizar local
    const local = getLocalRequests();
    const index = local.findIndex(r => r.id === id);
    if (index >= 0) {
      local[index] = { ...local[index], ...updates };
      saveLocalRequests(local);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al actualizar el estado de la solicitud.' };
  }
}
