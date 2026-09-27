import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Clock, 
  Mail, 
  User, 
  FileText 
} from 'lucide-react';
import { PrivacyRequest, PrivacyRequestStatus, PrivacyRequestType } from '../../types/legal';
import { getAllPrivacyRequests, updatePrivacyRequestStatus } from '../../services/privacyService';
import { auth, db, isFirebaseConfigured } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AdminPrivacyPageProps {
  onNavigate: (path: string) => void;
}

export function AdminPrivacyPage({ onNavigate }: AdminPrivacyPageProps) {
  const [requests, setRequests] = useState<PrivacyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal de resolución
  const [activeRequest, setActiveRequest] = useState<PrivacyRequest | null>(null);
  const [statusVal, setStatusVal] = useState<PrivacyRequestStatus>('in_review');
  const [notesVal, setNotesVal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const loaded = await getAllPrivacyRequests();
        if (isMounted) {
          setRequests(loaded);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error cargando solicitudes de privacidad:', err);
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const handleOpenModal = (req: PrivacyRequest) => {
    setActiveRequest(req);
    setStatusVal(req.status);
    setNotesVal(req.notes || '');
    setFeedback(null);
  };

  const handleSaveResolution = async () => {
    if (!activeRequest) return;
    setIsProcessing(true);
    setFeedback(null);

    try {
      const currentActor = auth?.currentUser?.uid || 'admin';
      await updatePrivacyRequestStatus(activeRequest.id, statusVal, notesVal, currentActor);

      // Registrar en auditLogs
      try {
        const auditId = `aud_priv_${Date.now()}`;
        if (isFirebaseConfigured && db) {
          await setDoc(doc(db, 'auditLogs', auditId), {
            id: auditId,
            actorUid: currentActor,
            actorRole: 'admin',
            action: 'PRIVACY_REQUEST_UPDATED',
            targetClientId: activeRequest.clientId,
            timestamp: new Date().toISOString(),
            details: {
              requestId: activeRequest.id,
              requestType: activeRequest.requestType,
              newStatus: statusVal,
              notes: notesVal
            }
          });
        }
      } catch {}

      // Actualizar local
      setRequests(prev => prev.map(r => {
        if (r.id === activeRequest.id) {
          return {
            ...r,
            status: statusVal,
            notes: notesVal,
            updatedAt: new Date().toISOString()
          };
        }
        return r;
      }));

      setFeedback('Resolución guardada correctamente.');
      setTimeout(() => {
        setActiveRequest(null);
      }, 1000);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeLabel = (type: PrivacyRequestType) => {
    switch (type) {
      case 'data_correction': return 'Corrección de datos erróneos';
      case 'data_update': return 'Actualización de datos desactualizados';
      case 'data_access': return 'Copia o portabilidad de datos';
      case 'data_deletion': return 'Eliminación / Supresión de cuenta';
      case 'privacy_inquiry': return 'Consulta de privacidad';
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    const cleanSearch = searchQuery.toLowerCase();
    const matchesSearch = !cleanSearch ||
      r.userEmail.toLowerCase().includes(cleanSearch) ||
      (r.clientBusinessName && r.clientBusinessName.toLowerCase().includes(cleanSearch)) ||
      (r.details && r.details.toLowerCase().includes(cleanSearch));
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout
      currentPath="/admin/privacidad"
      onNavigate={onNavigate}
      title="Solicitudes de Privacidad y Derechos ARCO"
      subtitle="Revisa, atiende y responde las peticiones de rectificación, acceso o supresión de datos de los clientes."
    >
      <div className="space-y-6">
        
        {/* Controles de Filtro */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por correo o negocio..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Estado:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
            >
              <option value="all">Todas ({requests.length})</option>
              <option value="pending">Pendientes ({requests.filter(r => r.status === 'pending').length})</option>
              <option value="in_review">En análisis</option>
              <option value="completed">Completadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>
        </div>

        {/* Lista de Solicitudes */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span>Cargando solicitudes ARCO...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No hay solicitudes en este estado
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No se han recibido solicitudes de privacidad pendientes con los filtros actuales.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {getTypeLabel(req.requestType)}
                        </h4>
                        {req.requestType === 'data_deletion' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase">
                            Baja Solicitada
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {req.clientBusinessName ? `${req.clientBusinessName} • ` : ''}{req.userEmail}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      req.status === 'pending' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800' :
                      req.status === 'in_review' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800' :
                      req.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                      'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    }`}>
                      {req.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenModal(req)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Atender
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-2">
                  <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 leading-relaxed">
                    "{req.details}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 pt-1">
                    <span>ID: {req.id}</span>
                    <span>Cliente ID: {req.clientId}</span>
                    <span>Fecha: {new Date(req.createdAt).toLocaleString()}</span>
                  </div>

                  {req.notes && (
                    <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 text-[11px] text-blue-900 dark:text-blue-200 space-y-0.5">
                      <strong className="block font-bold">Respuesta Registrada:</strong>
                      <span>{req.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal de Atención ARCO */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 text-xs">
            
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Atención de Solicitud ARCO
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveRequest(null)}
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
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Actualizar Estado de la Petición:
                </label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as PrivacyRequestStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="pending">En espera (pending)</option>
                  <option value="in_review">En análisis interno (in_review)</option>
                  <option value="completed">Completada y notificada (completed)</option>
                  <option value="rejected">Rechazada con justificación (rejected)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Respuesta o Notas de Resolución (Visible para el usuario):
                </label>
                <textarea
                  rows={4}
                  value={notesVal}
                  onChange={(e) => setNotesVal(e.target.value)}
                  placeholder="Detalla las medidas tomadas o el fundamento de la respuesta legal..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveRequest(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSaveResolution}
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
