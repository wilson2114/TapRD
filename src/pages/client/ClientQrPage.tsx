import React, { useState } from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { ClientLayout } from '../../components/client/ClientLayout';
import { ProfileQRCode } from '../../components/admin/ProfileQRCode';
import { PUBLIC_BASE_URL } from '../../config/constants';
import { 
  QrCode, 
  Radio, 
  Copy, 
  Check, 
  ExternalLink, 
  Smartphone, 
  Sparkles, 
  CheckCircle2,
  Printer,
  Compass
} from 'lucide-react';

interface ClientQrPageProps {
  onNavigate: (path: string) => void;
}

export function ClientQrPage({ onNavigate }: ClientQrPageProps) {
  const { client } = useClientAuth();
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!client) return null;

  const profileUrl = `${PUBLIC_BASE_URL}/p/${client.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {}
  };

  return (
    <ClientLayout
      currentPath="/cliente/qr"
      onNavigate={onNavigate}
      title="Código QR & Enlace NFC"
      subtitle="Descarga tu código para imprimir o programa una nueva tarjeta inteligente TapRD."
      actions={
        <button
          type="button"
          onClick={() => window.open(profileUrl, '_blank')}
          className="py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          <span>Probar perfil en vivo</span>
        </button>
      }
    >
      <div className="space-y-6">

        {/* Bento Grid Principal: QR a la izquierda, NFC y Enlace a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Lado Izquierdo: QR Generator Card */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6">
            <div className="text-center space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Tu Código QR de Alta Calidad</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Listo para descargar e imprimir en tus materiales publicitarios.</p>
            </div>

            <div className="flex justify-center">
              <ProfileQRCode
                url={profileUrl}
                businessName={client.businessName}
                size={220}
                onOpenProfile={() => window.open(profileUrl, '_blank')}
              />
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-slate-700 dark:text-slate-300 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold">
                <Printer className="w-4 h-4" />
                <span>Para imprenta o displays:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                El archivo PNG descargado viene a resolución nítida. Puedes entregarlo a tu diseñador para afiches, cartas de menú, acrílicos para el mostrador o tarjetas de presentación.
              </p>
            </div>
          </div>

          {/* Lado Derecho: Enlace NFC y Programación */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tarjeta 1: Enlace NFC */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">Enlace NFC Permanente</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Este enlace está grabado en el chip de tu tarjeta física.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 font-mono text-xs text-slate-800 dark:text-slate-200">
                <span className="truncate">{profileUrl}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                No cambies el slug o identificador de tu negocio sin consultar a TapRD, para evitar desvincular tus tarjetas físicas ya impresas.
              </p>
            </div>

            {/* Tarjeta 2: Guía de Grabado NFC */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">¿Cómo programar un nuevo chip o sticker NFC?</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Instrucciones simples en 4 pasos usando tu teléfono.</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">1</span>
                  <p><strong className="text-slate-900 dark:text-white">Descarga "NFC Tools":</strong> Disponible gratis en App Store (iPhone) y Google Play Store (Android).</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">2</span>
                  <p><strong className="text-slate-900 dark:text-white">Copia tu enlace:</strong> Haz clic en el botón <span className="font-bold text-blue-600 dark:text-blue-400">"Copiar"</span> de la caja superior.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">3</span>
                  <p><strong className="text-slate-900 dark:text-white">Selecciona Escribir / Añadir registro:</strong> Elige la opción <span className="font-bold text-slate-900 dark:text-white">URL / URI</span> y pega tu enlace.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">4</span>
                  <p><strong className="text-slate-900 dark:text-white">Acerca tu tarjeta:</strong> Presiona <span className="font-bold text-slate-900 dark:text-white">"Escribir"</span> y acerca tu tarjeta TapRD a la parte superior de tu teléfono hasta escuchar la vibración de éxito.</p>
                </div>
              </div>
            </div>

            {/* Tarjeta 3: Dónde ubicar tus códigos en el negocio */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <h3 className="font-black text-xs uppercase tracking-wider">Ubicaciones Estratégicas para tu QR</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <strong className="text-white block mb-0.5">Caja / Mostrador de Cobro</strong>
                  <span>El momento perfecto para solicitar su reseña de 5 estrellas o agregar a WhatsApp.</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <strong className="text-white block mb-0.5">Espejos o Mesas</strong>
                  <span>En barberías o restaurantes, los clientes tienen sus teléfonos en mano mientras esperan.</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </ClientLayout>
  );
}
