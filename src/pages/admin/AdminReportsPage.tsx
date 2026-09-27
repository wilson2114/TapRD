import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { 
  Flag, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Loader2, 
  ExternalLink, 
  Filter, 
  Eye, 
  ShieldAlert, 
  Search,
  MessageSquare,
  Clock
} from 'lucide-react';
import { ContentReport, ReportActionTaken, ReportReason, ReportStatus } from '../../types/legal';
import { getAllReports, updateReportStatus } from '../../services/reportsService';
import { updateClient } from '../../services/clientService';
import { db, isFirebaseConfigured, auth } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AdminReportsPageProps {
  onNavigate: (path: string) => void;
}

export function AdminReportsPage({ onNavigate }: AdminReportsPageProps) {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal de acción / resolución
  const [activeReport, setActiveReport] = useState<ContentReport | null>(null);
  const [actionStatus, setActionStatus] = useState<ReportStatus>('reviewing');
  const [actionTaken, setActionTaken] = useState<ReportActionTaken>('none');
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const loaded = await getAllReports();
        if (isMounted) {
          setReports(loaded);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error cargando reportes:', err);
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const handleOpenActionModal = (report: ContentReport) => {
    setActiveReport(report);
    setActionStatus(report.status);
    setActionTaken(report.actionTaken || 'none');
    setAdminNotes(report.adminNotes || '');
    setFeedback(null);
  };

  const handleApplyAction = async () => {
    if (!activeReport) return;
    setIsProcessing(true);
    setFeedback(null);

    try {
      // 1. Si la acción elegida es suspender el perfil
      if (actionTaken === 'profile_suspended' && activeReport.clientId) {
        await updateClient(activeReport.clientId, {
          status: 'inactive',
          profileStatus: 'suspended'
        });

        // Registrar en auditoría
        try {
          const auditId = `aud_susp_${Date.now()}`;
          if (isFirebaseConfigured && db) {
            await setDoc(doc(db, 'auditLogs', auditId), {
              id: auditId,
              actorUid: auth?.currentUser?.uid || 'admin',
              actorRole: 'admin',
              action: 'PROFILE_SUSPENDED_BY_MODERATION',
              targetClientId: activeReport.clientId,
              timestamp: new Date().toISOString(),
              details: {
                reportId: activeReport.id,
                reason: activeReport.reason,
                adminNotes
              }
            });
          }
        } catch {}
      }

      // 2. Actualizar estado del reporte
      await updateReportStatus(
        activeReport.id, 
        actionStatus, 
        actionTaken, 
        adminNotes, 
        auth?.currentUser?.uid || 'admin'
      );

      // 3. Actualizar estado local
      setReports(prev => prev.map(r => {
        if (r.id === activeReport.id) {
          return {
            ...r,
            status: actionStatus,
            actionTaken,
            adminNotes,
            resolvedAt: actionStatus === 'resolved' || actionStatus === 'dismissed' ? new Date().toISOString() : r.resolvedAt
          };
        }
        return r;
      }));

      setFeedback('Acción y estado actualizados correctamente.');
      setTimeout(() => {
        setActiveReport(null);
      }, 1000);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getReasonLabel = (reason: ReportReason) => {
    switch (reason) {
      case 'incorrect_content': return 'Contenido incorrecto';
      case 'impersonation': return 'Suplantación de identidad';
      case 'illegal_content': return 'Contenido ilegal';
      case 'unauthorized_brand': return 'Infracción de marca';
      case 'spam': return 'Spam / Phishing';
      case 'other': return 'Otro motivo';
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    const cleanSearch = searchQuery.toLowerCase();
    const matchesSearch = !cleanSearch || 
      r.businessName.toLowerCase().includes(cleanSearch) ||
      r.profileSlug.toLowerCase().includes(cleanSearch) ||
      (r.details && r.details.toLowerCase().includes(cleanSearch)) ||
      (r.reporterEmail && r.reporterEmail.toLowerCase().includes(cleanSearch));
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout
      currentPath="/admin/reportes"
      onNavigate={onNavigate}
      title="Moderación de Reportes y Seguridad"
      subtitle="Revisa y gestiona las alertas de contenido ilícito, suplantación o spam reportadas en perfiles públicos."
    >
      <div className="space-y-6">
        
        {/* Controles y Filtros */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por negocio o slug..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Estado:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="all">Todos ({reports.length})</option>
              <option value="pending">Pendientes ({reports.filter(r => r.status === 'pending').length})</option>
              <option value="reviewing">En revisión</option>
              <option value="resolved">Resueltos</option>
              <option value="dismissed">Desestimados</option>
            </select>
          </div>
        </div>

        {/* Lista de Reportes */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span>Cargando reportes de moderación...</span>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No hay reportes en este estado
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Todos los perfiles públicos se encuentran sin alertas activas de infracción en esta vista.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      report.status === 'pending' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      <Flag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {report.businessName}
                        </h4>
                        <span className="text-xs font-mono text-slate-400">
                          @{report.profileSlug}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        Motivo: {getReasonLabel(report.reason)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      report.status === 'pending' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800' :
                      report.status === 'reviewing' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800' :
                      report.status === 'resolved' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {report.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenActionModal(report)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Moderar
                    </button>
                  </div>
                </div>

                {/* Detalles del reporte */}
                <div className="text-xs space-y-2">
                  <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 leading-relaxed">
                    "{report.details}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 pt-1">
                    <div className="flex items-center gap-3">
                      <span>ID: {report.id}</span>
                      {report.reporterEmail && (
                        <span>Denunciante: {report.reporterEmail}</span>
                      )}
                      <span>Fecha: {new Date(report.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/p/${report.profileSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Inspeccionar perfil público</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {report.adminNotes && (
                    <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 text-[11px] text-blue-900 dark:text-blue-200 space-y-0.5">
                      <strong className="block font-bold">Nota de moderación:</strong>
                      <span>{report.adminNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal de Moderación */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 text-xs">
            
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Panel de Moderación: {activeReport.businessName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReport(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {feedback && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold">
                  {feedback}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Estado de la Moderación:
                </label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value as ReportStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="pending">Pendiente de revisión (pending)</option>
                  <option value="reviewing">En investigación / contacto (reviewing)</option>
                  <option value="resolved">Resuelto / Acción aplicada (resolved)</option>
                  <option value="dismissed">Desestimado sin mérito (dismissed)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Medida Técnica a Aplicar:
                </label>
                <select
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value as ReportActionTaken)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-rose-600 dark:text-rose-400"
                >
                  <option value="none">Ninguna / Solo seguimiento</option>
                  <option value="warning_issued">Emitir advertencia previa al cliente</option>
                  <option value="profile_suspended">⚠️ SUSPENDER PERFIL INMEDIATAMENTE (Pausar /p/:slug)</option>
                  <option value="content_edited">Contenido editado / Subsanado</option>
                  <option value="dismissed">Desestimar denuncia (Falsa alarma o sin infracción)</option>
                </select>
                {actionTaken === 'profile_suspended' && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">
                    Atención: El perfil pasará a inactivo y el enlace NFC mostrará aviso de pausa de servicio. Se registrará en la auditoría.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Notas de resolución / Bitácora:
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Detalles de la decisión, contacto realizado con el cliente o dictamen legal..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleApplyAction}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Guardar Resolución</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </AdminLayout>
  );
}
