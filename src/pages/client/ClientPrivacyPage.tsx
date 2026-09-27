import React, { useState, useEffect } from 'react';
import { ClientLayout } from '../../components/client/ClientLayout';
import { useClientAuth } from '../../hooks/useClientAuth';
import { 
  ShieldCheck, 
  Lock, 
  Trash2, 
  FileText, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Send, 
  Loader2, 
  X,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { PrivacyRequest, PrivacyRequestType } from '../../types/legal';
import { createPrivacyRequest, getPrivacyRequestsForUser } from '../../services/privacyService';
import { updateClient } from '../../services/clientService';
import { COMPANY_CONFIG } from '../../config/company';

interface ClientPrivacyPageProps {
  onNavigate: (path: string) => void;
}

export function ClientPrivacyPage({ onNavigate }: ClientPrivacyPageProps) {
  const { client, logout } = useClientAuth();
  
  // Solicitudes
  const [requests, setRequests] = useState<PrivacyRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Formulario de nueva solicitud
  const [requestType, setRequestType] = useState<PrivacyRequestType>('data_correction');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal de Eliminación de Cuenta
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteReason, setDeleteReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const userId = client?.userId || client?.id || 'client-user';

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const list = await getPrivacyRequestsForUser(userId);
        if (isMounted) {
          setRequests(list);
          setLoadingRequests(false);
        }
      } catch (err) {
        console.warn('Aviso cargando solicitudes de privacidad:', err);
        if (isMounted) setLoadingRequests(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [userId]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setFeedback({ type: 'error', message: 'Por favor explica los detalles de tu solicitud.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await createPrivacyRequest({
        userId,
        clientId: client?.id || '',
        clientBusinessName: client?.businessName,
        userEmail: client?.email || client?.clientEmail || '',
        requestType,
        details: details.trim()
      });

      if (res.success && res.request) {
        setRequests(prev => [res.request!, ...prev]);
        setDetails('');
        setFeedback({ 
          type: 'success', 
          message: 'Tu solicitud de privacidad ha sido registrada y enviada al equipo legal y administrativo.' 
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'No se pudo registrar la solicitud.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error de conexión.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessAccountDeletion = async () => {
    if (!client?.id) return;
    setIsDeleting(true);

    try {
      // 1. Crear solicitud de privacidad tipo 'data_deletion'
      await createPrivacyRequest({
        userId,
        clientId: client.id,
        clientBusinessName: client.businessName,
        userEmail: client.email || client.clientEmail || '',
        requestType: 'data_deletion',
        details: `Solicitud directa de baja de cuenta por el usuario. Motivo: ${deleteReason || 'No especificado'}. Confirmación recibida.`
      });

      // 2. Desactivar perfil y suspender acceso de inmediato (PARTE 10 - Separación de estados)
      await updateClient(client.id, {
        status: 'inactive',
        profileStatus: 'inactive',
        accountStatus: 'pending_deletion',
        accessStatus: 'suspended'
      });

      // 3. Cerrar sesión
      await logout();
      alert('Tu solicitud de eliminación ha sido procesada. Tu perfil público ha sido desactivado de inmediato. Gracias por haber formado parte de TapRD.');
      onNavigate('/');
    } catch (err: any) {
      alert(`Error al procesar la baja: ${err.message}`);
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: PrivacyRequest['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">En espera</span>;
      case 'in_review':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">En análisis</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Completada</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">Desestimada</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">Cancelada</span>;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: PrivacyRequestType) => {
    switch (type) {
      case 'data_correction': return 'Corrección de datos erróneos';
      case 'data_update': return 'Actualización de datos desactualizados';
      case 'data_access': return 'Solicitud de información / Copia de datos';
      case 'data_deletion': return 'Solicitud de supresión / Eliminación de datos';
      case 'privacy_inquiry': return 'Consulta o reclamo general de privacidad';
    }
  };

  return (
    <ClientLayout
      currentPath="/cliente/privacidad"
      onNavigate={onNavigate}
      title="Privacidad y Derechos del Usuario"
      subtitle="Gestiona el ejercicio de tus derechos ARCO, rectificación y eliminación de cuenta conforme a la ley dominicana."
    >
      <div className="space-y-8 max-w-4xl">
        
        {/* Banner de Derechos ARCO */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Tus Derechos sobre tus Datos Personales
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Marco de protección de datos personales de República Dominicana y estándares internacionales
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs not-prose">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="font-black text-blue-600 dark:text-blue-400">Acceso:</span>
              <p className="text-slate-600 dark:text-slate-300">Solicitar una copia íntegra de la información almacenada sobre tu negocio.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="font-black text-blue-600 dark:text-blue-400">Rectificación:</span>
              <p className="text-slate-600 dark:text-slate-300">Corregir datos inexactos, erróneos o incompletos en el sistema.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="font-black text-blue-600 dark:text-blue-400">Cancelación:</span>
              <p className="text-slate-600 dark:text-slate-300">Pedir la supresión de datos que ya no resulten necesarios para el servicio.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="font-black text-blue-600 dark:text-blue-400">Oposición:</span>
              <p className="text-slate-600 dark:text-slate-300">Oponerte al tratamiento o publicación de elementos específicos.</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Para consultar nuestra política completa:</span>
            <button
              type="button"
              onClick={() => onNavigate('/privacidad')}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Política de Privacidad TapRD</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Formulario de Solicitud de Privacidad */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Nueva Solicitud de Privacidad o Corrección
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Esta solicitud será registrada directamente en el panel de administración de TapRD
            </p>
          </div>

          {feedback && (
            <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
              feedback.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tipo de solicitud *
              </label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as PrivacyRequestType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="data_correction">Corrección de datos erróneos o inexactos</option>
                <option value="data_update">Actualización de datos desactualizados</option>
                <option value="data_access">Solicitud de información / Copia de datos personales</option>
                <option value="data_deletion">Solicitud de eliminación / Supresión de datos</option>
                <option value="privacy_inquiry">Consulta o duda general sobre privacidad</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Explica tu requerimiento con claridad *
              </label>
              <textarea
                required
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Indica qué dato requieres corregir, qué información solicitas o el motivo de tu consulta..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Respuesta estimada: 1 a 3 días hábiles
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Solicitud ARCO</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Historial de Solicitudes */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Historial de Mis Solicitudes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registro privado y trazable de tus requerimientos de privacidad
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {requests.length} registradas
            </span>
          </div>

          {loadingRequests ? (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span>Cargando solicitudes...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-slate-500">No has registrado ninguna solicitud de privacidad aún.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div 
                  key={req.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {getTypeLabel(req.requestType)}
                    </span>
                    {getStatusBadge(req.status)}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {req.details}
                  </p>
                  {req.notes && (
                    <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 text-[11px]">
                      <strong className="block font-bold">Respuesta del Administrador:</strong>
                      <span>{req.notes}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span>ID: {req.id}</span>
                    <span>Fecha: {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zona de Peligro: Eliminación de Cuenta */}
        <div className="p-6 sm:p-8 rounded-3xl bg-rose-500/5 border border-rose-500/20 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Eliminar mi Cuenta y Negocio de TapRD</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                Si deseas cerrar definitivamente tu negocio en la plataforma, puedes iniciar el proceso de baja formal. Conoce qué ocurre con tu perfil, tus servicios y qué datos deben conservarse por imperativo legal.
              </p>
            </div>

            <button
              type="button"
              onClick={() => { setDeleteModalOpen(true); setDeleteStep(1); }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer shadow-xs"
            >
              Iniciar proceso de baja
            </button>
          </div>
        </div>

      </div>

      {/* Modal de Eliminación de Cuenta */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-slate-100">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Confirmación de Eliminación de Cuenta
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              
              {deleteStep === 1 ? (
                <>
                  <p className="text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                    Antes de confirmar la eliminación de tu cuenta en TapRD, por favor lee detenidamente los efectos legales y técnicos:
                  </p>

                  <div className="space-y-3 not-prose">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">1. Perfil Digital Público (/p/:slug):</span>
                      <p className="text-slate-600 dark:text-slate-400">Tu perfil será desactivado inmediatamente. Cualquier persona que escanee tu tarjeta o código NFC verá un aviso de perfil no disponible.</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">2. Acceso y Credenciales:</span>
                      <p className="text-slate-600 dark:text-slate-400">Tus credenciales de acceso quedarán suspendidas y no podrás volver a ingresar a este portal de cliente.</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 dark:text-white block">3. Servicios Contratados y Suscripciones:</span>
                      <p className="text-slate-600 dark:text-slate-400">Los servicios se darán por finalizados sin derecho a reembolso por períodos ya consumidos.</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-1">
                      <span className="font-bold block">4. Información que se conserva por obligación legal:</span>
                      <p className="text-slate-600 dark:text-slate-300">
                        Conforme a la normativa tributaria y el Código de Comercio de la República Dominicana, TapRD conservará en archivo bloqueado los comprobantes de facturación y transacciones durante el plazo de prescripción legal exigido.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ¿Deseas compartir el motivo de tu baja? (Opcional)
                    </label>
                    <input
                      type="text"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="Ej. Cierre de negocio, cambio de proveedor, etc."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDeleteModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors cursor-pointer"
                    >
                      Continuar a la confirmación final
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 space-y-2">
                    <p className="font-bold">Paso final de confirmación irreversible</p>
                    <p className="leading-relaxed">
                      Para proceder con la baja de <strong>{client?.businessName}</strong>, escribe la palabra <strong className="font-mono uppercase text-rose-500">ELIMINAR</strong> a continuación:
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="Escribe ELIMINAR"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-mono font-bold tracking-widest text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDeleteStep(1)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      disabled={confirmText.trim().toUpperCase() !== 'ELIMINAR' || isDeleting}
                      onClick={handleProcessAccountDeletion}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-md flex items-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Procesando baja...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Confirmar y Eliminar Cuenta</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}
