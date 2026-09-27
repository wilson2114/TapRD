import { db, auth, isFirebaseConfigured } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc 
} from 'firebase/firestore';
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

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'reports', id), newReport);
      } catch (dbErr) {
        console.warn('[ReportsService] Aviso guardando reporte en Firestore:', dbErr);
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

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'reports'));
      const remoteList = snap.docs.map(d => ({ ...(d.data() as ContentReport), id: d.id }));
      
      const map = new Map<string, ContentReport>();
      localList.forEach(r => map.set(r.id, r));
      remoteList.forEach(r => map.set(r.id, r));
      return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('[ReportsService] Aviso cargando reportes de Firestore:', err);
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

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'reports', id), updates);
      } catch (err) {
        console.warn('[ReportsService] Aviso actualizando reporte en Firestore:', err);
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
