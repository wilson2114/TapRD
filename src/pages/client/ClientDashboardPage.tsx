import React, { useState } from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { ClientLayout } from '../../components/client/ClientLayout';
import { PUBLIC_BASE_URL } from '../../config/constants';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Store, 
  Briefcase, 
  Clock, 
  Share2, 
  QrCode, 
  Radio, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Phone,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

interface ClientDashboardPageProps {
  onNavigate: (path: string) => void;
}

export function ClientDashboardPage({ onNavigate }: ClientDashboardPageProps) {
  const { client } = useClientAuth();
  const [copiedLink, setCopiedLink] = useState(false);

  if (!client) return null;

  const profileUrl = `${PUBLIC_BASE_URL}/p/${client.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  return (
    <ClientLayout
      currentPath="/cliente/dashboard"
      onNavigate={onNavigate}
      title="Panel de Control"
      subtitle={`Bienvenido, ${client.ownerName || client.businessName}. Gestiona el perfil que ven tus clientes al tocar tu tarjeta TapRD.`}
      actions={
        <button
          type="button"
          onClick={() => window.open(profileUrl, '_blank')}
          className="py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ver mi perfil público</span>
        </button>
      }
    >
      <div className="space-y-6">

        {/* Banner de Enlace Público NFC */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-bold">
                <Radio className="w-3.5 h-3.5" />
                <span>Tarjeta Digital NFC Activa</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Tu perfil digital está listo para compartir
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Este es el enlace al que tus clientes acceden instantáneamente al tocar tu tarjeta o escanear tu código QR.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 text-xs font-mono select-all flex items-center justify-between gap-3">
                <span className="truncate max-w-[200px] sm:max-w-xs">{profileUrl}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                  title="Copiar enlace"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar enlace</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tarjetas de Estadísticas / Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Estado del Perfil */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Estado del Perfil</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white capitalize">
                {client.status === 'active' ? 'Activo' : client.status}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                Público y listo para recibir toques
              </p>
            </div>
          </div>

          {/* Card 2: Plan Contratado */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Plan TapRD</span>
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white capitalize">
                Plan {client.plan || 'Business'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Suscripción al día
              </p>
            </div>
          </div>

          {/* Card 3: Servicios Registrados */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Catálogo de Servicios</span>
              <Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {client.services?.length || 0} Servicios
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/cliente/servicios')}
                className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline mt-0.5 cursor-pointer"
              >
                Editar servicios &rarr;
              </button>
            </div>
          </div>

          {/* Card 4: Código QR & NFC */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Código QR & NFC</span>
              <QrCode className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white">Listo para Imprimir</p>
              <button
                type="button"
                onClick={() => onNavigate('/cliente/qr')}
                className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline mt-0.5 cursor-pointer"
              >
                Descargar código QR &rarr;
              </button>
            </div>
          </div>

        </div>

        {/* Bento de Acceso Rápido */}
        <div className="space-y-3">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            ¿Qué deseas actualizar hoy?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Opción 1: Datos de Negocio */}
            <div 
              onClick={() => onNavigate('/cliente/perfil')}
              className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Información y Logo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Cambia el nombre, logo, descripción, dirección y teléfono de tu negocio.
                </p>
              </div>
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <span>Modificar datos</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Opción 2: Servicios y Precios */}
            <div 
              onClick={() => onNavigate('/cliente/servicios')}
              className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Servicios y Precios
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Agrega nuevos tratamientos, productos o actualiza los precios vigentes.
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>Gestionar catálogo</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Opción 3: Horarios y Redes */}
            <div 
              onClick={() => onNavigate('/cliente/horarios')}
              className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Horarios y Apertura
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Configura tus horas de atención para cada día de la semana.
                </p>
              </div>
              <div className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <span>Editar horarios</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>

        {/* Sección de Consejos TapRD */}
        <div className="bg-slate-100/80 dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-black text-slate-900 dark:text-white text-sm">
              Consejos para aprovechar al máximo tu tarjeta TapRD
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/80 space-y-1.5">
              <p className="font-bold text-slate-900 dark:text-white">1. Coloca el QR en tu mostrador</p>
              <p className="leading-relaxed">
                Descarga el código QR desde la sección QR e imprímelo para que tus clientes lo escaneen mientras pagan.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/80 space-y-1.5">
              <p className="font-bold text-slate-900 dark:text-white">2. Activa tu botón de WhatsApp</p>
              <p className="leading-relaxed">
                Asegúrate de que tu número de WhatsApp esté actualizado para que recibas reservas y consultas al instante.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/80 space-y-1.5">
              <p className="font-bold text-slate-900 dark:text-white">3. Solicita reseñas de Google</p>
              <p className="leading-relaxed">
                Configura tu enlace de Google Reviews para que cada cliente satisfecho pueda dejarte 5 estrellas con 1 solo toque.
              </p>
            </div>
          </div>
        </div>

      </div>
    </ClientLayout>
  );
}
