import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Client } from '../types';
import { getWhatsAppUrl } from '../config/constants';
import { downloadClientVCard } from '../utils/vcard';
import { trackAnalyticsEvent, AnalyticsEventType } from '../services/profileService';
import { groupBusinessHours, getCurrentOpenStatus } from '../utils/schedule';
import { SEOHead } from './SEOHead';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { ClientBankAccountsSection } from './ClientBankAccountsSection';
import { ProtectedImage } from './ProtectedImage';
import {
  Phone,
  MessageCircle,
  Globe,
  MapPin,
  Star,
  Clock,
  UserPlus,
  Share2,
  Check,
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Radio,
  Flag,
  Briefcase
} from 'lucide-react';
import { ReportProfileModal } from './ReportProfileModal';

interface ClientProfileProps {
  client: Client;
  onNavigateHome?: () => void;
  isPreview?: boolean;
}

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
    </svg>
  );
}

function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z" />
    </svg>
  );
}

export function ClientProfile({ client, onNavigateHome, isPreview = false }: ClientProfileProps) {
  const { isDark: globalDark } = useTheme();
  const initialGlobalDark = useRef(globalDark);
  const [userToggledTheme, setUserToggledTheme] = useState(false);

  useEffect(() => {
    if (globalDark !== initialGlobalDark.current) {
      setUserToggledTheme(true);
    }
  }, [globalDark]);

  // Respeta la preferencia inicial del cliente (si fijó 'dark' o 'light'),
  // pero si el visitante pulsa el interruptor ThemeToggle, responde en tiempo real.
  const isProfileDark = useMemo(() => {
    if (userToggledTheme) return globalDark;
    if (client.profileTheme === 'dark') return true;
    if (client.profileTheme === 'light') return false;
    return globalDark;
  }, [client.profileTheme, globalDark, userToggledTheme]);

  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const trackEvent = (type: AnalyticsEventType) => {
    if (isPreview) return;
    trackAnalyticsEvent(client.id, type, client.slug);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: client.businessName,
          text: `${client.businessName} - ${client.category}. Perfil digital TapRD`,
          url
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast('¡Enlace del perfil copiado al portapapeles!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Enlace listo.');
    }
  };

  const handleSaveContact = () => {
    trackEvent('vcardDownload');
    downloadClientVCard(client);
    showToast(`¡Contacto de ${client.businessName} descargado!`);
  };

  // ESTADO INACTIVO
  if (client.status === 'inactive' || client.profileStatus === 'inactive' || client.active === false) {
    return (
      <div className={`${isProfileDark ? 'dark' : ''} min-h-screen w-full flex flex-col items-center`}>
        <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0B1120] flex flex-col items-center justify-center p-4 text-center transition-colors">
          <SEOHead
            title={`${client.businessName} | Perfil No Disponible`}
            description="Este perfil digital no se encuentra disponible temporalmente."
          />
          <div className="bg-white dark:bg-slate-900/65 dark:backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-slate-200/80 dark:border-white/10 shadow-[0_8px_32px_rgba(15,23,42,0.08)] space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200/80 dark:border-amber-400/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-[#0F172A] dark:text-white">
              Este perfil no está disponible actualmente
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              El perfil de <span className="font-bold text-[#0F172A] dark:text-white">{client.businessName}</span> ha sido pausado temporalmente por su administrador.
            </p>
            {onNavigateHome && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  Volver al inicio de TapRD
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { settings, socialLinks } = client;
  const whatsappUrl = getWhatsAppUrl(
    client.whatsapp,
    `¡Hola! Me comunico desde el perfil digital de ${client.businessName}.`
  );

  const activeServices = (client.services || [])
    .filter((srv) => srv.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const hasInstagram = Boolean(settings.showInstagram && socialLinks?.instagram);
  const hasFacebook = Boolean(settings.showFacebook && socialLinks?.facebook);
  const hasTikTok = Boolean(settings.showTikTok && socialLinks?.tiktok);
  const hasWebsite = Boolean(socialLinks?.website);
  const hasAnySocial = hasInstagram || hasFacebook || hasTikTok || hasWebsite;
  const showSocialCard = hasAnySocial || Boolean(settings.showReviews);

  const groupedHours = useMemo(() => groupBusinessHours(client.hours), [client.hours]);
  const liveOpenStatus = useMemo(() => getCurrentOpenStatus(client.hours), [client.hours]);

  const cardSurface =
    'bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/70 dark:border-white/10 shadow-[0_8px_32px_-6px_rgba(15,23,42,0.09)] dark:shadow-[0_14px_40px_-8px_rgba(0,0,0,0.5)] transition-colors duration-200';

  return (
    <div className={`${isProfileDark ? 'dark' : ''} min-h-screen w-full flex flex-col items-center font-['Plus_Jakarta_Sans',Inter,sans-serif]`}>
      <div className="relative min-h-screen w-full bg-[#F8FAFC]/80 dark:bg-[#0B1120]/85 text-[#0F172A] dark:text-slate-100 pb-16 flex flex-col items-center selection:bg-emerald-500 selection:text-white transition-colors duration-300 overflow-x-hidden">
        {/* Glow ambiental sutil en modo oscuro */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.08),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.16),transparent_65%)]"
        />

        {/* SEO Metadata */}
        <SEOHead
          title={`${client.businessName} | Perfil Digital TapRD`}
          description={`${client.businessName} (${client.category}) en ${client.city}. ${client.description}`}
        />

        {/* Floating Preview Badge if in Admin */}
        {isPreview && (
          <div className="sticky top-0 z-50 w-full max-w-md bg-blue-600 text-white text-xs font-black py-2 px-4 text-center shadow-md flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>MODO VISTA PREVIA (Administrador)</span>
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase">
              {client.status === 'active' ? 'Activo' : 'Pendiente'}
            </span>
          </div>
        )}

        {/* Top Floating App Bar */}
        <header className="w-full max-w-md sticky top-0 z-40 bg-[#F8FAFC]/85 dark:bg-[#0B1120]/80 backdrop-blur-xl px-4 py-2.5 border-b border-slate-200/70 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#0F172A] dark:text-slate-200 px-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>TapRD</span>
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle
              id="profile-theme-toggle"
              className="p-2 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center hover:bg-slate-200/60 dark:hover:bg-white/10 transition-all active:scale-95"
            />
            <button
              type="button"
              onClick={handleShare}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
              title="Compartir perfil"
              aria-label="Compartir perfil"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Profile Container (Mobile-First) */}
        <main className="relative z-10 w-full max-w-md px-4 pt-4 space-y-4">
          {!isOnline && (
            <div className="px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200/80 dark:border-amber-400/25 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-center gap-2 text-center">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>Modo sin conexión • Mostrando última versión guardada</span>
            </div>
          )}
          {/* 1. Cabecera (Hero Section) Dinámica y Adaptable */}
          <section className={`${cardSurface} overflow-hidden`}>
            {/* Franja superior personalizable */}
            <div className={`h-28 bg-gradient-to-r ${client.coverGradient || 'from-slate-900 via-blue-950 to-slate-900'} relative`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
              {/* Insignia NFC Verificado minimalista */}
              <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/35 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-wide">
                <Radio className="w-3 h-3 text-cyan-300 animate-pulse" />
                <span>NFC Verificado</span>
              </div>
            </div>

            {/* Avatar centrado + Identidad + CTAs */}
            <div className="px-5 sm:px-6 pb-6 -mt-14 sm:-mt-16 relative flex flex-col items-center text-center">
              {/* Avatar / Logo centrado con borde sutil personalizable */}
              <div className={`p-1 rounded-3xl bg-gradient-to-br ${client.coverGradient || 'from-blue-500/40 to-cyan-400/40'} shadow-lg`}>
                {client.logo ? (
                  <ProtectedImage
                    wrapperClassName="w-28 h-28 sm:w-32 sm:h-32 rounded-[20px] border-[3px] border-white dark:border-[#0B1120] bg-white dark:bg-slate-900"
                    src={client.logo}
                    alt={client.businessName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className={`w-28 h-28 sm:w-32 sm:h-32 rounded-[20px] ${client.avatarBgColor || 'bg-blue-600'} text-white font-black text-3xl flex items-center justify-center border-[3px] border-white dark:border-[#0B1120] tracking-wider`}
                  >
                    {client.avatarInitials || client.businessName.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Etiqueta de categoría / especialidad */}
              {client.category && (
                <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-400/20">
                  <span>{client.category}</span>
                </div>
              )}

              {/* Nombre o marca principal */}
              <h1 className="mt-2.5 text-2xl font-black text-[#0F172A] dark:text-white tracking-tight leading-tight">
                {client.businessName}
              </h1>

              {/* Subtítulo: Propietario y Ubicación (si están configurados) */}
              {(client.ownerName || client.city) && (
                <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {client.ownerName && <span>{client.ownerName}</span>}
                  {client.ownerName && client.city && <span aria-hidden="true">•</span>}
                  {client.city && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>{client.city}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Descripción (si existe) */}
              {client.description && client.description.trim() && (
                <p className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-white/10 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed w-full">
                  {client.description}
                </p>
              )}

              {/* Jerarquía de Botones de Acción (CTA) */}
              <div className="mt-5 w-full space-y-2.5">
                {/* Acción Primaria: WhatsApp */}
                {settings.showWhatsapp && client.whatsapp && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('whatsappClick')}
                    className="w-full min-h-[52px] py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-between transition-all duration-200"
                  >
                    <span className="flex items-center gap-2.5">
                      <MessageCircle className="w-5 h-5 fill-white/20" />
                      <span>Escribir por WhatsApp</span>
                    </span>
                    <ExternalLink className="w-4 h-4 text-emerald-100" />
                  </a>
                )}

                {/* Acción Secundaria: Guardar contacto en mi teléfono */}
                <button
                  type="button"
                  onClick={handleSaveContact}
                  className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] active:scale-[0.98] text-[#0F172A] dark:text-white font-bold text-xs sm:text-sm border border-slate-200/90 dark:border-white/15 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-slate-600 dark:text-cyan-300" />
                  <span>Guardar contacto en mi teléfono</span>
                </button>

                {/* Acción de apoyo: Llamada telefónica (si está habilitada) */}
                {settings.showPhone && client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    onClick={() => trackEvent('phoneClick')}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-transparent hover:bg-slate-100/70 dark:hover:bg-white/[0.05] active:scale-[0.98] text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200/70 dark:border-white/10 flex items-center justify-between transition-all duration-200"
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                      <span>Llamar por teléfono</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {client.phone}
                    </span>
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* 2. Redes Sociales, Enlaces y Reseñas */}
          {showSocialCard && (
            <section className={`${cardSurface} p-5 space-y-3.5`}>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Redes Sociales y Enlaces
              </h2>

              {hasAnySocial && (
                <div className="grid grid-cols-2 gap-2.5">
                  {hasInstagram && (
                    <a
                      href={`https://instagram.com/${socialLinks.instagram!.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('instagramClick')}
                      className="min-h-[48px] px-3.5 py-2.5 rounded-2xl bg-[#F8FAFC] dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 hover:border-pink-300 dark:hover:border-pink-500/40 hover:bg-pink-50/60 dark:hover:bg-pink-500/10 active:scale-[0.98] flex items-center gap-2.5 text-xs font-bold text-[#0F172A] dark:text-slate-100 transition-all duration-200"
                    >
                      <span className="w-7 h-7 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                        <InstagramIcon className="w-4 h-4" />
                      </span>
                      <span className="truncate">Instagram</span>
                    </a>
                  )}

                  {hasFacebook && (
                    <a
                      href={`https://facebook.com/${socialLinks.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('facebookClick')}
                      className="min-h-[48px] px-3.5 py-2.5 rounded-2xl bg-[#F8FAFC] dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/40 hover:bg-blue-50/60 dark:hover:bg-blue-500/10 active:scale-[0.98] flex items-center gap-2.5 text-xs font-bold text-[#0F172A] dark:text-slate-100 transition-all duration-200"
                    >
                      <span className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <FacebookIcon className="w-4 h-4" />
                      </span>
                      <span className="truncate">Facebook</span>
                    </a>
                  )}

                  {hasTikTok && (
                    <a
                      href={`https://tiktok.com/@${socialLinks.tiktok!.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('tiktokClick')}
                      className="min-h-[48px] px-3.5 py-2.5 rounded-2xl bg-[#F8FAFC] dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/25 hover:bg-slate-100 dark:hover:bg-white/[0.08] active:scale-[0.98] flex items-center gap-2.5 text-xs font-bold text-[#0F172A] dark:text-slate-100 transition-all duration-200"
                    >
                      <span className="w-7 h-7 rounded-xl bg-slate-900/10 dark:bg-white/10 text-[#0F172A] dark:text-white flex items-center justify-center shrink-0">
                        <TikTokIcon className="w-4 h-4" />
                      </span>
                      <span className="truncate">TikTok</span>
                    </a>
                  )}

                  {hasWebsite && (
                    <a
                      href={socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('websiteClick')}
                      className="min-h-[48px] px-3.5 py-2.5 rounded-2xl bg-[#F8FAFC] dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 hover:border-cyan-300 dark:hover:border-cyan-500/40 hover:bg-cyan-50/60 dark:hover:bg-cyan-500/10 active:scale-[0.98] flex items-center gap-2.5 text-xs font-bold text-[#0F172A] dark:text-slate-100 transition-all duration-200"
                    >
                      <span className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                        <Globe className="w-4 h-4" />
                      </span>
                      <span className="truncate">Sitio Web</span>
                    </a>
                  )}
                </div>
              )}

              {/* Tarjeta destacada de Reseñas en Google */}
              {settings.showReviews && (
                <a
                  href={client.googleReviewsUrl || `https://maps.google.com/?q=${encodeURIComponent(client.businessName + ' ' + client.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('reviewClick')}
                  className="w-full min-h-[52px] p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-50/70 to-orange-50 dark:from-amber-500/15 dark:via-amber-500/10 dark:to-orange-500/10 border border-amber-200/80 dark:border-amber-400/25 flex items-center justify-between gap-3 hover:border-amber-300 dark:hover:border-amber-400/45 active:scale-[0.98] transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                    <span className="text-xs font-extrabold text-amber-950 dark:text-amber-200 truncate">
                      Califícanos en Google
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-300 shrink-0" />
                </a>
              )}
            </section>
          )}

          {/* 3. Catálogo de Servicios / Productos */}
          {settings.showServices && activeServices.length > 0 && (
            <section className={`${cardSurface} p-5 space-y-4`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] dark:text-white">
                    Servicios y Productos
                  </h2>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-white/10">
                  {activeServices.length} {activeServices.length === 1 ? 'opción' : 'opciones'}
                </span>
              </div>

              <div className="space-y-3">
                {activeServices.map((srv) => {
                  const hasValidPhoto = Boolean(
                    srv.imageUrl &&
                      !srv.imageUrl.includes('quarantine') &&
                      srv.imageStatus !== 'rejected' &&
                      srv.imageStatus !== 'failed'
                  );
                  const photoSrc = srv.thumbnailUrl || srv.imageUrl;
                  const altText = srv.imageAlt || `${srv.name} - ${client.businessName}`;

                  return (
                    <div
                      key={srv.id}
                      className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 hover:border-blue-200 dark:hover:border-cyan-400/25 transition-all space-y-3"
                    >
                      <div className="flex items-start gap-3.5">
                        {hasValidPhoto && (
                          <ProtectedImage
                            wrapperClassName="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shrink-0 group overflow-hidden"
                            src={photoSrc}
                            alt={altText}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white leading-snug">
                              {srv.name}
                            </h3>
                            {srv.price && (
                              <span className="shrink-0 text-xs font-black text-blue-700 dark:text-cyan-300 font-mono bg-blue-50 dark:bg-cyan-500/15 px-2.5 py-1 rounded-xl border border-blue-200/70 dark:border-cyan-400/25">
                                {srv.currency && srv.currency !== 'DOP' && !srv.price.includes(srv.currency)
                                  ? `${srv.currency} `
                                  : ''}
                                {srv.price}
                              </span>
                            )}
                          </div>

                          {srv.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                              {srv.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {client.whatsapp && (
                        <div className="flex justify-end pt-1">
                          <a
                            href={getWhatsAppUrl(client.whatsapp, `Hola, me interesa solicitar: ${srv.name}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent('whatsappClick')}
                            className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300 hover:text-white border border-emerald-500/25 font-extrabold text-xs inline-flex items-center gap-1.5 transition-all duration-200 active:scale-95"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Solicitar</span>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 4. Horario de Atención Inteligente */}
          {settings.showHours && groupedHours.length > 0 && (
            <section className={`${cardSurface} p-5 space-y-3.5`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] dark:text-white">
                    Horario de Atención
                  </h2>
                </div>

                {liveOpenStatus.known && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                      liveOpenStatus.isOpenNow
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/25'
                        : 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/25'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        liveOpenStatus.isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    <span>{liveOpenStatus.isOpenNow ? 'Abierto ahora' : 'Cerrado ahora'}</span>
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {groupedHours.map((group, idx) => (
                  <div
                    key={idx}
                    className={`px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs border transition-colors ${
                      group.includesToday
                        ? 'bg-blue-50/70 dark:bg-cyan-500/10 border-blue-200/80 dark:border-cyan-400/25'
                        : 'bg-[#F8FAFC] dark:bg-white/[0.03] border-slate-200/70 dark:border-white/10'
                    }`}
                  >
                    <span className="font-bold text-[#0F172A] dark:text-slate-100">
                      {group.label}
                    </span>
                    {group.isOpen ? (
                      <span className="font-semibold text-slate-600 dark:text-slate-300 text-right">
                        {group.hoursText}
                      </span>
                    ) : (
                      <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/15 px-2.5 py-0.5 rounded-full text-[10px] border border-rose-200/70 dark:border-rose-400/20">
                        Cerrado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. Cuentas Bancarias para Transferencias */}
          {settings.showBankAccounts !== false && (
            <ClientBankAccountsSection
              accounts={client.bankAccounts}
              legacyBankInfo={client.bankInfo}
            />
          )}

          {/* 6. Dirección y Ubicación */}
          {settings.showAddress && (client.address || client.city) && (
            <section className={`${cardSurface} p-5 space-y-3.5`}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] dark:text-white">
                  Ubicación
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {client.address}
                {client.address && client.city ? ', ' : ''}
                {client.city}
              </p>

              {client.mapsUrl && (
                <a
                  href={client.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('directionsClick')}
                  className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] active:scale-[0.98] font-bold text-xs text-[#0F172A] dark:text-white flex items-center justify-center gap-2 transition-all duration-200 border border-slate-200/80 dark:border-white/15"
                >
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>Cómo llegar en Google Maps</span>
                </a>
              )}
            </section>
          )}

          {/* Footer Brand Credit */}
          <footer className="text-center pt-4 pb-2 space-y-1.5">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Perfil digital inteligente • {client.businessName}
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
              <span>Tecnología NFC por</span>
              <span className="font-black text-[#0F172A] dark:text-slate-300">TapRD 🇩🇴</span>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer py-1.5 px-3 rounded-xl hover:bg-slate-200/60 dark:hover:bg-white/5"
                title="Reportar este perfil por suplantación, contenido indebido o spam"
              >
                <Flag className="w-3 h-3" />
                <span>Reportar este perfil</span>
              </button>
            </div>
          </footer>
        </main>

        {/* Modal de Reporte de Contenido */}
        <ReportProfileModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          profileSlug={client.slug || client.id}
          clientId={client.id}
          businessName={client.businessName}
        />

        {/* Toast alert notification */}
        {toastMessage && (
          <div className="fixed bottom-6 z-50 px-4 py-2.5 rounded-2xl bg-[#0F172A]/95 dark:bg-slate-800/95 text-white text-xs font-extrabold shadow-xl backdrop-blur-md border border-white/10">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
