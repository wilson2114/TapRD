import React from 'react';
import { ClientLayout } from '../../components/client/ClientLayout';
import { useClientAuth } from '../../hooks/useClientAuth';
import { 
  FileText, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Calendar,
  Building,
  HelpCircle,
  Download
} from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/company';

interface ClientContractPageProps {
  onNavigate: (path: string) => void;
}

export function ClientContractPage({ onNavigate }: ClientContractPageProps) {
  const { client } = useClientAuth();

  const contractStatus = client?.contractStatus || 'draft';
  const contractVersion = client?.contractVersion || COMPANY_CONFIG.termsVersion;
  const contractAcceptedAt = client?.contractAcceptedAt;
  const contractSignedAt = client?.contractSignedAt;
  const contractExpiresAt = client?.contractExpiresAt;
  const contractDocumentUrl = client?.contractDocumentUrl;
  const contractNotes = client?.contractNotes;

  const getStatusDisplay = () => {
    switch (contractStatus) {
      case 'signed':
        return {
          label: 'Firmado Formalmente',
          badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          desc: 'Tu contrato de prestación de servicios se encuentra debidamente formalizado.'
        };
      case 'accepted':
        return {
          label: 'Aceptado en Plataforma',
          badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          desc: 'Has aceptado los términos de servicio vigentes al momento de la activación.'
        };
      case 'pending':
        return {
          label: 'Pendiente de Formalización',
          badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          desc: 'El contrato se encuentra en trámite de revisión o firma.'
        };
      case 'expired':
        return {
          label: 'Vencido / Expirado',
          badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
          desc: 'El plazo convenido ha expirado y requiere renovación.'
        };
      case 'cancelled':
        return {
          label: 'Cancelado',
          badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          desc: 'El contrato fue rescindido o cancelado.'
        };
      case 'draft':
      default:
        return {
          label: 'Borrador en Preparación',
          badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          desc: 'El expediente del cliente está en estructuración inicial.'
        };
    }
  };

  const statusInfo = getStatusDisplay();

  return (
    <ClientLayout
      currentPath="/cliente/contrato"
      onNavigate={onNavigate}
      title="Contrato del Cliente & Expediente Legal"
      subtitle="Consulta el estado legal y contractual de la prestación de servicios con TapRD."
    >
      <div className="space-y-6 max-w-4xl">

        {/* Card Principal de Estado */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Contrato de Prestación de Servicios
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {client?.businessName || 'Mi Negocio'} • Versión {contractVersion}
                </p>
              </div>
            </div>

            <div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-black border ${statusInfo.badgeClass}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            {statusInfo.desc}
          </p>

          {/* Grid de Fechas y Datos del Contrato */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs not-prose">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-400 block font-bold">Fecha de Aceptación:</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {contractAcceptedAt ? new Date(contractAcceptedAt).toLocaleDateString() : 'Pendiente'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-400 block font-bold">Fecha de Firma Formal:</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {contractSignedAt ? new Date(contractSignedAt).toLocaleDateString() : 'No registrada'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-400 block font-bold">Vigencia / Vencimiento:</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {contractExpiresAt ? new Date(contractExpiresAt).toLocaleDateString() : 'Suscripción Activa'}
              </span>
            </div>
          </div>

          {/* Documento Adjunto Privado */}
          {contractDocumentUrl && (
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Documento de Contrato Privado
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-xs sm:max-w-md">
                    {contractDocumentUrl}
                  </p>
                </div>
              </div>

              <a
                href={contractDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ver archivo</span>
              </a>
            </div>
          )}

          {contractNotes && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">Anotaciones del expediente:</span>
              <p className="text-slate-600 dark:text-slate-400">{contractNotes}</p>
            </div>
          )}

          {/* Advertencia Legal Obligatoria (PARTE 10 - Sección 11) */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Aviso Informativo sobre Validez Contractual</span>
            </div>
            <p>
              El registro en la plataforma documenta la aceptación de las condiciones técnicas de servicio. Conforme a las leyes vigentes de la República Dominicana, los contratos comerciales corporativos que requieran fe pública o fuerza ejecutiva se formalizan mediante acuerdo físico o firma digital calificada independiente.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 border-t border-slate-100 dark:border-slate-800">
            <span>Para dudas contractuales o copias físicas:</span>
            <button
              type="button"
              onClick={() => onNavigate('/contacto')}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
            >
              Contactar con el área legal ({COMPANY_CONFIG.legalEmail})
            </button>
          </div>

        </div>

      </div>
    </ClientLayout>
  );
}
