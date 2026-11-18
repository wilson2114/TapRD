import { auth } from '../lib/firebase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ContentReport, ReportActionTaken, ReportReason, ReportStatus } from '../types/legal';

const LOCAL_STORAGE_KEY = 'taprd_content_reports';

function getLocalReports(): ContentReport[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReports(reports: ContentReport[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
  } catch {}
}

export async function createContentReport(data: {
  profileSlug: string;
  clientId: string;
  businessName: string;
  reason: ReportReason;
  details: string;
  reporterEmail?: string;
}): Promise<{ success: boolean; report?: ContentReport; error?: string }> {
  try {
    const now = new Date().toISOString();
    const id = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newReport: ContentReport = {
      id,
      profileSlug: data.profileSlug,
      clientId: data.clientId,
      businessName: data.businessName,
      reason: data.reason,
      details: data.details,
      reporterEmail: data.reporterEmail?.trim() || undefined,
      status: 'pending',
      actionTaken: 'none',
      createdAt: now
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('reports').upsert({
          id: newReport.id,
          profile_slug: newReport.profileSlug,
          client_id: newReport.clientId,
          business_name: newReport.businessName,
          reason: newReport.reason,
          details: newReport.details,
          reporter_email: newReport.reporterEmail || '',
          status: newReport.status,
          action_taken: newReport.actionTaken || 'none',
          created_at: now,
          updated_at: now
        }, { onConflict: 'id' });
      } catch (dbErr) {
        console.warn('[ReportsService] Aviso guardando reporte en Supabase:', dbErr);
      }
    }

    const local = getLocalReports();
    local.unshift(newReport);
    saveLocalReports(local);

    return { success: true, report: newReport };
  } catch (err: any) {
    return { success: false, error: err.message || 'No se pudo enviar el reporte.' };
  }
}

export async function getAllReports(): Promise<ContentReport[]> {
  const localList = getLocalReports();

  if (isSupabaseConfigured) {
    try {
      const { data: rows, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(rows)) {
        const remoteList: ContentReport[] = rows.map((r: any) => ({
          id: r.id,
          profileSlug: r.profile_slug || '',
          clientId: r.client_id || '',
          businessName: r.business_name || '',
          reason: r.reason || 'other',
          details: r.details || '',
          reporterEmail: r.reporter_email || undefined,
          status: r.status || 'pending',
          actionTaken: r.action_taken || 'none',
          adminNotes: r.admin_notes || undefined,
          createdAt: r.created_at || new Date().toISOString()
        }));

        const map = new Map<string, ContentReport>();
        localList.forEach(r => map.set(r.id, r));
        remoteList.forEach(r => map.set(r.id, r));
        return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      console.warn('[ReportsService] Aviso cargando reportes de Supabase:', err);
    }
  }

  return localList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus,
  actionTaken?: ReportActionTaken,
  adminNotes?: string,
  resolvedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    const updates: Partial<ContentReport> = {
      status,
      ...(actionTaken ? { actionTaken } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {}),
      ...(status === 'resolved' || status === 'dismissed' ? {
        resolvedAt: now,
        resolvedBy: resolvedBy || auth?.currentUser?.uid || 'admin'
      } : {})
    };

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('reports')
          .update({
            status,
            ...(actionTaken ? { action_taken: actionTaken } : {}),
            ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}),
            updated_at: now
          })
          .eq('id', id);
      } catch (err) {
        console.warn('[ReportsService] Aviso actualizando reporte en Supabase:', err);
      }
    }

    const local = getLocalReports();
    const index = local.findIndex(r => r.id === id);
    if (index >= 0) {
      local[index] = { ...local[index], ...updates };
      saveLocalReports(local);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al actualizar el estado del reporte.' };
  }
}
