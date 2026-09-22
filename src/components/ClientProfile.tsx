import React, { useState, useMemo } from 'react';
import { Client } from '../types';
import { getWhatsAppUrl } from '../config/constants';
import { downloadClientVCard } from '../utils/vcard';
import { SEOHead } from './SEOHead';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { ClientBankAccountsSection } from './ClientBankAccountsSection';
import { 
  Phone, 
  MessageCircle, 
  Instagram, 
  Facebook, 
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
  CheckCircle2,
  Video
} from 'lucide-react';

interface ClientProfileProps {
  client: Client;
  onNavigateHome?: () => void;
  isPreview?: boolean;
}

export function ClientProfile({ client, onNavigateHome, isPreview = false }: ClientProfileProps) {
  const { isDark: globalDark } = useTheme();

  // Determinar si el perfil debe renderizarse en modo oscuro
  // Si el cliente fijó 'dark' o 'light', se respeta su elección para su marca digital.
  // Si seleccionó 'auto' o no está configurado, sigue el tema global/sistema.
  const isProfileDark = useMemo(() => {
    if (client.profileTheme === 'dark') return true;
    if (client.profileTheme === 'light') return false;
    return globalDark;
  }, [client.profileTheme, globalDark]);

  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
    downloadClientVCard(client);
    showToast(`¡Contacto de ${client.businessName} descargado!`);
  };

  // ESTADO INACTIVO (REGLA 15: Si está desactivado, mostrar mensaje claro)
  if (client.status === 'inactive') {
    return (
      <div className={`${isProfileDark ? 'dark' : ''} min-h-screen w-full flex flex-col items-center`}>
        <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center transition-colors">
          <SEOHead
            title={`${client.businessName} | Perfil No Disponible`}
            description="Este perfil digital no se encuentra disponible temporalmente."
          />
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800/60">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Este perfil no está disponible actualmente
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              El perfil de <span className="font-bold text-slate-800 dark:text-slate-100">{client.businessName}</span> ha sido pausado temporalmente por su administrador.
            </p>
            <div className="pt-2">
              {onNavigateHome && (
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Volver al inicio de TapRD
                </button>
              )}
            </div>
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

  return (
    <div className={`${isProfileDark ? 'dark' : ''} min-h-screen w-full flex flex-col items-center`}>
      <div className="min-h-screen w-full bg-[#f1f5f9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 flex flex-col items-center selection:bg-blue-600 selection:text-white transition-colors duration-200">
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
        <header className="w-full max-w-md sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2.5 border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between shadow-2xs">
          {onNavigateHome ? (
            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1.5 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>TapRD</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Perfil TapRD</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <ThemeToggle id="profile-theme-toggle" className="p-1.5" />
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Compartir perfil"
              aria-label="Compartir perfil"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Profile Container (Mobile-First 440px max width) */}
        <main className="w-full max-w-md px-4 pt-4 space-y-4">

          {/* 1. Header Hero Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
            
            {/* Cover Gradient */}
            <div className={`h-24 sm:h-28 bg-gradient-to-r ${client.coverGradient || 'from-slate-900 via-blue-950 to-slate-900'} relative p-4 flex items-start justify-end`}>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>NFC Verificado</span>
              </div>
            </div>

            {/* Avatar & Basic Info */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="-mt-12 mb-3 flex items-end justify-between">
                {client.logo ? (
                  <img
                    src={client.logo}
                    alt={client.businessName}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-md bg-white dark:bg-slate-800"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`w-20 h-20 rounded-2xl ${client.avatarBgColor || 'bg-blue-600'} text-white font-black text-2xl flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-md tracking-wider`}>
                    {client.avatarInitials || client.businessName.substring(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Status Pill */}
                <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{client.category}</span>
                </div>
              </div>

              <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                {client.businessName}
              </h1>

              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                {client.ownerName ? `Por ${client.ownerName} • ` : ''}{client.city}
              </p>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                {client.description}
              </p>

              {/* Quick Contact Buttons (Mobile Primary) */}
              <div className="mt-5 space-y-2.5">
                
                {/* WhatsApp Button */}
                {settings.showWhatsapp && client.whatsapp && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/25 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Escribir por WhatsApp</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                  </a>
                )}

                {/* Phone Call Button */}
                {settings.showPhone && client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    className="w-full py-3 px-4 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm shadow-xs flex items-center justify-between transition-all border border-transparent dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-cyan-400" />
                      <span>Llamar por teléfono</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-300">{client.phone}</span>
                  </a>
                )}

                {/* Save Contact Button (vCard) */}
                <button
                  type="button"
                  onClick={handleSaveContact}
                  className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Guardar contacto en mi teléfono</span>
                </button>

              </div>

            </div>
          </div>

          {/* 2. Social Media & External Profiles Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Redes Sociales y Enlaces
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {settings.showInstagram && socialLinks?.instagram && (
                <a
                  href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-500/50 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span className="truncate">Instagram</span>
                </a>
              )}

              {settings.showFacebook && socialLinks?.facebook && (
                <a
                  href={`https://facebook.com/${socialLinks.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <Facebook className="w-4 h-4 text-blue-600" />
                  <span className="truncate">Facebook</span>
                </a>
              )}

              {settings.showTikTok && socialLinks?.tiktok && (
                <a
                  href={`https://tiktok.com/@${socialLinks.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <Video className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                  <span className="truncate">TikTok</span>
                </a>
              )}

              {socialLinks?.website && (
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <Globe className="w-4 h-4 text-cyan-600" />
                  <span className="truncate">Sitio Web</span>
                </a>
              )}
            </div>

            {/* Google Reviews Button */}
            {settings.showReviews && (
              <a
                href={client.googleReviewsUrl || `https://maps.google.com/?q=${encodeURIComponent(client.businessName + ' ' + client.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-2 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 dark:from-amber-950/30 to-orange-50 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between text-xs font-black text-amber-950 dark:text-amber-200 hover:border-amber-300 dark:hover:border-amber-700 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <span>Califícanos en Google</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </a>
            )}
          </div>

          {/* 3. Servicios Card */}
          {settings.showServices && client.services && client.services.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Servicios Disponibles
                </h2>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  {client.services.length} opciones
                </span>
              </div>

              <div className="space-y-2.5">
                {client.services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {srv.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {srv.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-2xs block">
                        {srv.price}
                      </span>
                      {client.whatsapp && (
                        <a
                          href={getWhatsAppUrl(client.whatsapp, `Hola, me interesa el servicio: ${srv.name}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline mt-1 inline-block"
                        >
                          Pedir
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Horarios Card */}
          {settings.showHours && client.hours && client.hours.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Horario de Atención
                </h2>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {client.hours.map((h, i) => (
                  <div key={i} className="py-2 flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{h.day}</span>
                    {h.isOpen ? (
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        {h.display || `${h.openTime || '9:00 AM'} – ${h.closeTime || '6:00 PM'}`}
                      </span>
                    ) : (
                      <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded text-[10px] border border-rose-200/60 dark:border-rose-900/40">
                        Cerrado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Cuentas Bancarias para Transferencias */}
          {settings.showBankAccounts !== false && (
            <ClientBankAccountsSection
              accounts={client.bankAccounts}
              legacyBankInfo={client.bankInfo}
            />
          )}

          {/* 6. Dirección y Ubicación Card */}
          {settings.showAddress && (client.address || client.city) && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Ubicación
                </h2>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {client.address}
                {client.city && `, ${client.city}`}
              </p>

              {client.mapsUrl ? (
                <a
                  href={client.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors border border-slate-200/80 dark:border-slate-700"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Cómo llegar en Google Maps</span>
                </a>
              ) : null}
            </div>
          )}

          {/* Footer Brand Credit */}
          <div className="text-center pt-4 pb-2 space-y-1">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Perfil digital inteligente • {client.businessName}
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
              <span>Desarrollado con tecnología NFC por</span>
              <span className="font-black text-slate-700 dark:text-slate-300">TapRD 🇩🇴</span>
            </div>
          </div>

        </main>

        {/* Toast alert notification */}
        {toastMessage && (
          <div className="fixed bottom-6 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-extrabold shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
