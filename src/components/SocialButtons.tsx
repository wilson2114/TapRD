import React from 'react';
import { 
  MessageCircle, 
  Phone, 
  Instagram, 
  Facebook, 
  MapPin, 
  Globe, 
  Star, 
  ExternalLink,
  Navigation,
  Video
} from 'lucide-react';
import { DigitalProfile } from '../types';
import { recordInteraction } from '../utils/analytics';

interface SocialButtonsProps {
  profile: DigitalProfile;
  onNotification: (message: string) => void;
}

export function SocialButtons({ profile, onNotification }: SocialButtonsProps) {
  
  const handleWhatsapp = () => {
    recordInteraction(profile.slug, 'whatsapp');
    const msg = encodeURIComponent(profile.whatsappMessage || `¡Hola ${profile.name}! Me contacto desde tu perfil digital TapRD.`);
    window.open(`https://wa.me/${profile.whatsapp}?text=${msg}`, '_blank');
    onNotification('Abriendo WhatsApp...');
  };

  const handleCall = () => {
    recordInteraction(profile.slug, 'call');
    window.location.href = `tel:${profile.phone}`;
    onNotification(`Marcando a ${profile.phone}...`);
  };

  const handleInstagram = () => {
    if (!profile.instagram) return;
    recordInteraction(profile.slug, 'instagram');
    window.open(`https://instagram.com/${profile.instagram}`, '_blank');
    onNotification(`Abriendo Instagram @${profile.instagram}...`);
  };

  const handleFacebook = () => {
    if (!profile.facebook) return;
    recordInteraction(profile.slug, 'tap');
    window.open(`https://facebook.com/${profile.facebook}`, '_blank');
    onNotification(`Abriendo Facebook...`);
  };

  const handleTikTok = () => {
    if (!profile.tiktok) return;
    recordInteraction(profile.slug, 'tap');
    window.open(`https://tiktok.com/@${profile.tiktok}`, '_blank');
    onNotification(`Abriendo TikTok...`);
  };

  const handleMaps = () => {
    recordInteraction(profile.slug, 'directions');
    window.open(profile.mapsUrl, '_blank');
    onNotification(`Abriendo dirección en Google Maps...`);
  };

  const handleWebsite = () => {
    if (!profile.website) return;
    recordInteraction(profile.slug, 'website');
    window.open(profile.website, '_blank');
    onNotification(`Abriendo sitio web...`);
  };

  const handleReviews = () => {
    recordInteraction(profile.slug, 'review');
    if (profile.googleReviewsUrl) {
      window.open(profile.googleReviewsUrl, '_blank');
    }
    onNotification(`Abriendo sección de reseñas de Google...`);
  };

  return (
    <div className="space-y-3.5">
      {/* Primary High-Impact Conversion Buttons (WhatsApp & Call) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* WhatsApp Dominant CTA */}
        <button
          type="button"
          id="btn-profile-whatsapp"
          onClick={handleWhatsapp}
          className="relative group overflow-hidden flex items-center justify-between w-full py-4 px-4.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer border border-emerald-400/40"
        >
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
              <MessageCircle className="w-5 h-5 fill-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight">Chatear por WhatsApp</span>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              </div>
              <p className="text-[11px] text-emerald-100 font-medium">Respuesta directa al instante</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center z-10 group-hover:translate-x-0.5 transition-transform">
            <ExternalLink className="w-4 h-4 text-emerald-100" />
          </div>
        </button>

        {/* Direct Call Button */}
        <button
          type="button"
          id="btn-profile-llamar"
          onClick={handleCall}
          className="flex items-center justify-between w-full py-4 px-4.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md shadow-slate-900/15 active:scale-[0.98] transition-all cursor-pointer border border-slate-800"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 shadow-inner">
              <Phone className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-left">
              <span className="text-sm font-black tracking-tight">Llamar directo</span>
              <p className="text-[11px] text-slate-400 font-medium">{profile.phone}</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </div>
        </button>
      </div>

      {/* Grid of Clean Secondary Action Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        
        {/* Instagram */}
        {profile.instagram && (
          <button
            type="button"
            id="btn-profile-instagram"
            onClick={handleInstagram}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:border-pink-300 dark:hover:border-pink-500/40 active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition-transform">
              <Instagram className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white">Instagram</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-400 truncate max-w-[110px]">@{profile.instagram}</span>
          </button>
        )}

        {/* Cómo Llegar */}
        <button
          type="button"
          id="btn-profile-como-llegar"
          onClick={handleMaps}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:border-blue-300 dark:hover:border-blue-500/40 active:scale-[0.98] transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition-transform">
            <Navigation className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-white">Cómo llegar</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-400">Maps / Waze</span>
        </button>

        {/* Reseñas Google 5 Estrellas */}
        <button
          type="button"
          id="btn-profile-resenas"
          onClick={handleReviews}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:border-amber-300 dark:hover:border-amber-500/40 active:scale-[0.98] transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition-transform">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-white">Calificar</span>
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">
            {profile.reviewScore ? `${profile.reviewScore} ★ Google` : 'Reseñas'}
          </span>
        </button>

        {/* Facebook */}
        {profile.facebook && (
          <button
            type="button"
            id="btn-profile-facebook"
            onClick={handleFacebook}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:border-blue-300 dark:hover:border-blue-500/40 active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition-transform">
              <Facebook className="w-5 h-5 fill-white" />
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white">Facebook</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-400">Página oficial</span>
          </button>
        )}

        {/* TikTok */}
        {profile.tiktok && (
          <button
            type="button"
            id="btn-profile-tiktok"
            onClick={handleTikTok}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:border-slate-400 active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950 dark:bg-slate-900 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition-transform border border-slate-800">
              <Video className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white">TikTok</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-400">@{profile.tiktok}</span>
          </button>
        )}

        {/* Sitio Web Oficial */}
        {profile.website && (
          <button
            type="button"
            id="btn-profile-website"
            onClick={handleWebsite}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:border-slate-400 active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white">Sitio Web</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-400">Portal oficial</span>
          </button>
        )}

      </div>
    </div>
  );
}

