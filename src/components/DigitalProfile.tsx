import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Share2, 
  Sparkles, 
  BarChart2, 
  ArrowLeft, 
  Check, 
  Radio, 
  Wifi, 
  CreditCard,
  Building,
  Info,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { DigitalProfile as DigitalProfileType } from '../types';
import { SocialButtons } from './SocialButtons';
import { ServiceList } from './ServiceList';
import { BusinessHours } from './BusinessHours';
import { LocationSection } from './LocationSection';
import { SaaSDemoModal } from './SaaSDemoModal';
import { downloadVCard } from '../utils/vcard';
import { recordInteraction } from '../utils/analytics';
import { SEOHead } from './SEOHead';
import { ThemeToggle } from './ThemeToggle';

interface DigitalProfileProps {
  profile: DigitalProfileType;
  onNavigateHome: () => void;
  onSelectDemoProfile?: (slug: string) => void;
}

export function DigitalProfile({ profile, onNavigateHome, onSelectDemoProfile }: DigitalProfileProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSaaSModal, setShowSaaSModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Record visit tap
    recordInteraction(profile.slug, 'tap');
    window.scrollTo(0, 0);
  }, [profile.slug]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSaveContact = () => {
    recordInteraction(profile.slug, 'vcard');
    downloadVCard(profile);
    showToast(`¡Contacto de ${profile.name} descargado en formato .vcf!`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile.name,
          text: `${profile.name} - ${profile.tagline}`,
          url
        });
        return;
      } catch {}
    }
    // Fallback copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showToast('¡Enlace del perfil copiado al portapapeles!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      showToast('Enlace listo para compartir.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 flex flex-col items-center selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Dynamic SEO Meta */}
      <SEOHead
        title={`${profile.name} | Perfil Digital TapRD`}
        description={`${profile.name} - ${profile.tagline}. Contacta por WhatsApp, consulta servicios, horarios y ubicación en República Dominicana.`}
      />

      {/* Top Floating Bar with Quick Controls */}
      <header className="w-full max-w-md sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2.5 border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1.5 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>TapRD Inicio</span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Theme switcher */}
          <ThemeToggle id="digital-profile-theme-toggle" className="p-1.5" />

          {/* SaaS Preview Trigger */}
          <button
            type="button"
            onClick={() => setShowSaaSModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-black bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Ver estadísticas y estructura SaaS"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Métricas</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Compartir perfil"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Demo Selector Strip if demo profile */}
      {profile.isDemo && onSelectDemoProfile && (
        <div className="w-full max-w-md bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-3 py-1.5 text-xs font-black flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="uppercase text-[10px] tracking-wider text-slate-900">DEMOS DISPONIBLES:</span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => onSelectDemoProfile('barberia-wilson')}
              className={`px-2 py-0.5 rounded-md transition-all ${profile.slug === 'barberia-wilson' ? 'bg-slate-950 text-white font-bold shadow-xs' : 'hover:bg-amber-400 font-semibold'}`}
            >
              Barbería
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onSelectDemoProfile('restaurante')}
              className={`px-2 py-0.5 rounded-md transition-all ${profile.slug === 'restaurante' ? 'bg-slate-950 text-white font-bold shadow-xs' : 'hover:bg-amber-400 font-semibold'}`}
            >
              Restaurante
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onSelectDemoProfile('inmobiliaria')}
              className={`px-2 py-0.5 rounded-md transition-all ${profile.slug === 'inmobiliaria' ? 'bg-slate-950 text-white font-bold shadow-xs' : 'hover:bg-amber-400 font-semibold'}`}
            >
              Inmobiliaria
            </button>
          </div>
        </div>
      )}

      {/* Main Profile Canvas (Smartphone width: max-w-md) */}
      <main className="w-full max-w-md bg-white dark:bg-slate-900 sm:shadow-2xl sm:border sm:border-slate-200/90 dark:sm:border-slate-800 sm:my-4 sm:rounded-[2.5rem] overflow-hidden flex flex-col transition-colors duration-200">
        
        {/* Cover Graphic / Header with Glass Glow */}
        <div className={`relative h-38 sm:h-44 bg-gradient-to-r ${profile.coverGradient} p-4 flex items-end justify-between overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-3 left-3 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white/80 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Perfil Verificado República Dominicana</span>
          </div>

          <div className="absolute bottom-2.5 right-3.5 flex items-center gap-1.5 text-[10px] font-bold text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
            <Radio className="w-3 h-3 text-cyan-300 animate-pulse" />
            <span>NFC TapRD</span>
          </div>
        </div>

        {/* Profile Card Header Info */}
        <div className="px-5 pt-0 pb-4 relative">
          {/* Avatar / Logo overlapping cover */}
          <div className="flex justify-between items-end -mt-14 mb-3">
            <div className={`w-26 h-26 rounded-3xl ${profile.avatarBgColor} text-white font-black text-2xl flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl shadow-slate-900/15`}>
              <span>{profile.avatarInitials}</span>
            </div>

            {/* Top Quick Guardar Contacto CTA */}
            <button
              type="button"
              id="btn-save-contact-top"
              onClick={handleSaveContact}
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>

          {/* Business Name, Category & Verified Badge */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                {profile.name}
              </h1>
              {profile.verified && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black shrink-0 shadow-xs" title="Perfil verificado TapRD">
                  ✓
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {profile.category}
              </p>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {profile.city}
              </span>
            </div>

            {profile.tagline && (
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 pt-0.5 leading-snug">
                {profile.tagline}
              </p>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
              {profile.description}
            </p>
          </div>
        </div>

        {/* Content Body Modules */}
        <div className="px-4.5 space-y-4 pb-6">
          
          {/* Big Action Buttons (WhatsApp, Llamar, Redes, Reseñas, Maps) */}
          <SocialButtons
            profile={profile}
            onNotification={showToast}
          />

          {/* Services Section */}
          <ServiceList
            services={profile.services}
            onSelectService={(s) => {
              showToast(`Servicio seleccionado: ${s.name} (${s.price})`);
            }}
          />

          {/* Business Hours */}
          <BusinessHours hours={profile.hours} />

          {/* Location Section */}
          <LocationSection
            address={profile.address}
            city={profile.city}
            mapsUrl={profile.mapsUrl}
            wazeUrl={profile.wazeUrl}
            onOpenMap={() => showToast('Abriendo navegación GPS...')}
          />

          {/* WiFi Details (If available) */}
          {profile.wifi && (
            <div className="bg-[#f8fafc] dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white">WiFi de Clientes</p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{profile.wifi.ssid}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                {profile.wifi.note || 'Pide la clave en mostrador'}
              </span>
            </div>
          )}

          {/* Bank Info for Direct Transfers in RD */}
          {profile.bankInfo && (
            <div className="bg-[#f8fafc] dark:bg-slate-800/60 rounded-2xl p-4.5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2.5 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h4 className="font-black text-slate-900 dark:text-white">
                  Transferencias Bancarias (RD$)
                </h4>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700 font-mono text-[11px] space-y-1.5 text-slate-800 dark:text-slate-200 shadow-2xs">
                <p><span className="font-sans font-bold text-slate-500 dark:text-slate-400">Banco:</span> {profile.bankInfo.bank}</p>
                <p><span className="font-sans font-bold text-slate-500 dark:text-slate-400">Cuenta:</span> {profile.bankInfo.accountNumber} ({profile.bankInfo.accountType})</p>
                <p><span className="font-sans font-bold text-slate-500 dark:text-slate-400">Titular:</span> {profile.bankInfo.holder}</p>
                {profile.bankInfo.rncOrCedula && (
                  <p><span className="font-sans font-bold text-slate-500 dark:text-slate-400">RNC / Cédula:</span> {profile.bankInfo.rncOrCedula}</p>
                )}
              </div>
            </div>
          )}

          {/* Bottom Primary "Guardar contacto" full-width button */}
          <div className="pt-2">
            <button
              type="button"
              id="btn-profile-guardar-contacto-big"
              onClick={handleSaveContact}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <UserPlus className="w-5 h-5" />
              <span>Guardar contacto en mi teléfono</span>
            </button>
            <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2">
              Descarga directa de tarjeta de contacto (.vcf compatible con iOS y Android)
            </p>
          </div>

          {/* Footer brand mark */}
          <div className="pt-6 pb-2 text-center border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 space-y-1">
            <p className="font-medium text-slate-500 dark:text-slate-400">
              Perfil tecnológico potenciado por{' '}
              <span className="font-black text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" onClick={onNavigateHome}>
                TapRD
              </span>
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Soluciones NFC para negocios en República Dominicana
            </p>
          </div>

        </div>
      </main>

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 z-50 px-4 py-2.5 bg-slate-950 text-white text-xs font-bold rounded-2xl shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SaaS Architecture / Analytics Preview Modal */}
      <SaaSDemoModal
        profile={profile}
        isOpen={showSaaSModal}
        onClose={() => setShowSaaSModal(false)}
      />
    </div>
  );
}

