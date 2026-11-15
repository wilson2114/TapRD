import React, { useEffect, useState } from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { ClientLayout } from '../../components/client/ClientLayout';
import { ProfileQRCode } from '../../components/admin/ProfileQRCode';
import { PUBLIC_BASE_URL } from '../../config/constants';
import { QrRedirectMode } from '../../types/client';
import { resolveQrRedirectTarget, sanitizeExternalUrl } from '../../utils/qrRedirect';
import {
  QrCode,
  Radio,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Sparkles,
  Printer,
  MessageCircle,
  Instagram,
  Star,
  MapPin,
  Globe,
  Link2,
  UserCheck,
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface ClientQrPageProps {
  onNavigate: (path: string) => void;
}

const QR_MODES: {
  id: QrRedirectMode;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'profile',
    label: 'Perfil TapRD',
    description: 'Abre tu perfil digital completo',
    icon: UserCheck
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Chat directo con tu negocio',
    icon: MessageCircle
  },
  {
    id: 'reviews',
    label: 'Reseñas Google',
    description: 'Pide calificación 5 estrellas',
    icon: Star
  },
  {
    id: 'instagram',
    label: 'Instagram',
    description: 'Lleva directo a tu perfil IG',
    icon: Instagram
  },
  {
    id: 'maps',
    label: 'Ubicación Maps',
    description: 'Cómo llegar a tu local',
    icon: MapPin
  },
  {
    id: 'website',
    label: 'Sitio Web',
    description: 'Tu página web principal',
    icon: Globe
  },
  {
    id: 'custom',
    label: 'Enlace Libre',
    description: 'Menú PDF, catálogo o promo',
    icon: Link2
  }
];

export function ClientQrPage({ onNavigate }: ClientQrPageProps) {
  const { client, updateClient } = useClientAuth();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [mode, setMode] = useState<QrRedirectMode>('profile');
  const [customUrl, setCustomUrl] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return;
    setMode(client.qrRedirect?.mode || 'profile');
    setCustomUrl(client.qrRedirect?.customUrl || '');
    setWhatsappMessage(client.qrRedirect?.whatsappMessage || '');
  }, [client?.id, client?.qrRedirect?.mode, client?.qrRedirect?.customUrl, client?.qrRedirect?.whatsappMessage]);

  if (!client) return null;

  const profileUrl = `${PUBLIC_BASE_URL}/p/${client.slug}`;
  const dynamicQrUrl = `${PUBLIC_BASE_URL}/q/${client.slug}`;

  const previewClient = {
    ...client,
    qrRedirect: {
      mode,
      customUrl,
      whatsappMessage
    }
  };
  const resolvedPreview = resolveQrRedirectTarget(previewClient);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {}
  };

  const handleSaveQrRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    if (mode === 'custom') {
      const valid = sanitizeExternalUrl(customUrl);
      if (!valid) {
        setSaveError('Ingresa una URL válida (por ejemplo: https://tupagina.com/menu).');
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateClient({
        qrRedirect: {
          mode,
          customUrl: mode === 'custom' ? (sanitizeExternalUrl(customUrl) || customUrl.trim()) : customUrl.trim(),
          whatsappMessage: whatsappMessage.trim(),
          updatedAt: new Date().toISOString()
        }
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'No se pudo guardar la configuración del QR dinámico.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ClientLayout
      currentPath="/cliente/qr"
      onNavigate={onNavigate}
      title="Código QR Dinámico & NFC"
      subtitle="Cambia a dónde apunta tu QR en cualquier momento sin tener que reimprimirlo."
      actions={
        <button
          type="button"
          onClick={() => window.open(dynamicQrUrl, '_blank')}
          className="min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          <span>Probar QR en vivo</span>
        </button>
      }
    >
      <div className="space-y-6">

        {/* Bento Grid Principal: QR a la izquierda, Destino Dinámico + NFC a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Lado Izquierdo: QR Generator Card */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6">
            <div className="text-center space-y-1 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-1">
                <QrCode className="w-3 h-3" />
                <span>QR Dinámico Activo</span>
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Tu Código QR de Alta Calidad</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Imprímelo una sola vez. Siempre apunta a <span className="font-mono text-slate-700 dark:text-slate-300">/q/{client.slug}</span>.
              </p>
            </div>

            <div className="flex justify-center">
              <ProfileQRCode
                url={dynamicQrUrl}
                businessName={client.businessName}
                size={220}
                onOpenProfile={() => window.open(dynamicQrUrl, '_blank')}
              />
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-slate-700 dark:text-slate-300 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold">
                <Printer className="w-4 h-4" />
                <span>Para imprenta o displays:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                El archivo PNG descargado viene a resolución nítida y nunca caduca. Aunque cambies el destino a WhatsApp, tu menú o reseñas, el mismo QR impreso seguirá funcionando.
              </p>
            </div>
          </div>

          {/* Lado Derecho: Destino Dinámico + Enlace NFC y Programación */}
          <div className="lg:col-span-7 space-y-6">

            {/* Tarjeta 0: Configuración de Destino del QR Dinámico */}
            <form
              onSubmit={handleSaveQrRedirect}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">Destino del Código QR Dinámico</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Elige qué se abrirá cuando un cliente escanee tu código QR.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {QR_MODES.map((item) => {
                  const Icon = item.icon;
                  const isSelected = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setMode(item.id);
                        setSaveError(null);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{item.label}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Campo extra para WhatsApp */}
              {mode === 'whatsapp' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mensaje prellenado de WhatsApp (opcional)
                  </label>
                  <input
                    type="text"
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    placeholder="Ej: ¡Hola! Escaneé el código QR y quiero información."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Campo extra para Enlace Libre */}
              {mode === 'custom' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    URL de destino personalizada
                  </label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://tunegocio.com/menu.pdf"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Vista previa del destino resuelto o aviso si falta dato */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Vista previa de redirección
                </span>
                {mode === 'profile' ? (
                  <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">
                    {profileUrl}
                  </p>
                ) : resolvedPreview.isExternal && resolvedPreview.targetUrl ? (
                  <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 break-all">
                    {resolvedPreview.targetUrl}
                  </p>
                ) : (
                  <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-snug">
                      Aún no tienes configurado tu enlace de <strong>{resolvedPreview.label}</strong>. Si lo guardas así, el QR abrirá tu perfil TapRD como respaldo hasta que lo completes en{' '}
                      <button
                        type="button"
                        onClick={() => onNavigate(mode === 'instagram' || mode === 'website' ? '/cliente/redes' : '/cliente/perfil')}
                        className="underline font-bold cursor-pointer"
                      >
                        {mode === 'instagram' || mode === 'website' ? 'Redes Sociales' : 'Editar Perfil'}
                      </button>.
                    </p>
                  </div>
                )}
              </div>

              {saveError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-medium">
                  {saveError}
                </div>
              )}

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>¡Destino del QR Dinámico actualizado al instante!</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => window.open(dynamicQrUrl, '_blank')}
                  className="min-h-[42px] py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Probar QR</span>
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="min-h-[42px] py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar destino del QR</span>
                    </>
                  )}
                </button>
              </div>
            </form>

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
                  className="min-h-[44px] py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
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
