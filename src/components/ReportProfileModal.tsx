import React, { useState } from 'react';
import { 
  X, 
  Flag, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Info 
} from 'lucide-react';
import { ReportReason } from '../types/legal';
import { createContentReport } from '../services/reportsService';

interface ReportProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileSlug: string;
  clientId: string;
  businessName: string;
}

export function ReportProfileModal({
  isOpen,
  onClose,
  profileSlug,
  clientId,
  businessName
}: ReportProfileModalProps) {
  const [reason, setReason] = useState<ReportReason>('incorrect_content');
  const [details, setDetails] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setError('Por favor describe brevemente el motivo del reporte.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await createContentReport({
        profileSlug,
        clientId,
        businessName,
        reason,
        details: details.trim(),
        reporterEmail: reporterEmail.trim() || undefined
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.error || 'No se pudo enviar el reporte. Inténtalo más tarde.');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonOptions: { value: ReportReason; label: string; desc: string }[] = [
    { 
      value: 'incorrect_content', 
      label: 'Contenido incorrecto o desactualizado', 
      desc: 'Información falsa, números equivocados o datos engañosos' 
    },
    { 
      value: 'impersonation', 
      label: 'Suplantación de identidad o negocio', 
      desc: 'El perfil finge ser una persona, empresa o marca que no le pertenece' 
    },
    { 
      value: 'illegal_content', 
      label: 'Contenido ilegal o prohibido', 
      desc: 'Venta de productos restringidos o actividades ilícitas' 
    },
    { 
      value: 'unauthorized_brand', 
      label: 'Uso no autorizado de marca / copyright', 
      desc: 'Uso indebido de logotipos o nombres registrados sin permiso' 
    },
    { 
      value: 'spam', 
      label: 'Spam o enlaces sospechosos (Phishing)', 
      desc: 'Enlaces externos engañosos o captación sospechosa de claves' 
    },
    { 
      value: 'other', 
      label: 'Otro motivo de seguridad o conducta', 
      desc: 'Cualquier otra infracción a la Política de Uso Aceptable' 
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Reportar este perfil digital
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {businessName} (@{profileSlug})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Reporte recibido por moderación
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Gracias por colaborar en la seguridad de la comunidad TapRD. Nuestro equipo revisará el perfil y tomará las medidas oportunas de forma confidencial.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                Cerrar ventana
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Explicación de confidencialidad */}
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Privacidad garantizada:</strong> Tu reporte es confidencial. El propietario del perfil nunca tendrá acceso a tus datos personales ni sabrá quién realizó la notificación.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Selector de motivo */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ¿Cuál es el motivo principal del reporte? *
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {reasonOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        reason === opt.value
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={opt.value}
                        checked={reason === opt.value}
                        onChange={() => setReason(opt.value)}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {opt.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Detalles */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Describe detalladamente la infracción *
                </label>
                <textarea
                  required
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Explica qué elemento específico infringe los términos o resulta sospechoso..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Correo opcional del denunciante */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tu correo electrónico (Opcional)
                </label>
                <input
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="Para notificarte si el equipo requiere información adicional"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Botones de acción */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Flag className="w-3.5 h-3.5" />
                      <span>Enviar Reporte</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
