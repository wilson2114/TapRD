import React from 'react';
import { CreditCard, Smartphone, QrCode, Radio, Star, Sparkles, Wifi, Check, ExternalLink } from 'lucide-react';

interface ProductMockupProps {
  type: 'card' | 'plate' | 'star' | 'sticker';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export function ProductMockup({ type, size = 'md', interactive = true }: ProductMockupProps) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  if (type === 'card') {
    return (
      <div className={`relative flex items-center justify-center select-none ${isLarge ? 'p-6 sm:p-10' : 'p-4'}`}>
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-2xl -z-10" />

        {/* Realistic Card Container */}
        <div 
          className={`relative w-full aspect-[1.586/1] max-w-sm rounded-2xl bg-gradient-to-br from-slate-900 via-zinc-900 to-black text-white p-5 sm:p-6 shadow-2xl border border-slate-700/60 overflow-hidden flex flex-col justify-between transition-transform duration-300 ${
            interactive ? 'hover:scale-102 hover:shadow-blue-500/20' : ''
          }`}
        >
          {/* Subtle glossy sheen */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-white/15 to-transparent rounded-full blur-xl pointer-events-none" />

          {/* Top Bar: Brand & NFC Signal */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm shadow-md">
                T
              </div>
              <div>
                <span className="text-sm font-black tracking-tight text-white">Tap<span className="text-blue-400">RD</span></span>
                <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold">NFC Smart Card</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/10 text-[10px] font-mono text-cyan-300">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>NTAG216</span>
            </div>
          </div>

          {/* Center: Gold Contactless Chip */}
          <div className="my-auto py-2 z-10 flex items-center justify-between">
            <div className="w-11 h-9 rounded-md bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 p-0.5 shadow-md border border-amber-500/50 flex flex-col justify-between">
              <div className="h-2 border-b border-amber-600/30 flex items-center justify-center">
                <div className="w-4 h-1 bg-amber-600/20 rounded" />
              </div>
              <div className="h-2 border-b border-amber-600/30" />
              <div className="h-1.5" />
            </div>

            <div className="text-right">
              <p className="text-[11px] font-mono tracking-widest text-slate-300">•••• •••• •••• 2026</p>
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">República Dominicana</p>
            </div>
          </div>

          {/* Bottom Bar: Client Name & QR */}
          <div className="flex items-end justify-between z-10 pt-2 border-t border-white/10">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Titular Profesional</p>
              <p className="text-xs sm:text-sm font-extrabold tracking-tight text-white">WILSON BRITO</p>
              <p className="text-[10px] text-blue-400 font-medium">Bienes Raíces & Comercial</p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-white p-1 shadow-inner flex items-center justify-center">
              <QrCode className="w-full h-full text-slate-900" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'plate') {
    return (
      <div className={`relative flex items-center justify-center select-none ${isLarge ? 'p-6 sm:p-10' : 'p-4'}`}>
        <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-2xl -z-10" />

        {/* Acrylic Desk Stand Plaque */}
        <div className="relative w-full max-w-xs flex flex-col items-center">
          
          {/* Standing Plaque Body */}
          <div 
            className={`w-full aspect-[1/1.3] rounded-2xl bg-white/95 backdrop-blur-md p-5 shadow-2xl border-2 border-slate-200/90 flex flex-col justify-between relative overflow-hidden transition-transform duration-300 ${
              interactive ? 'hover:-translate-y-1' : ''
            }`}
          >
            {/* Acrylic edge glass reflection */}
            <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />

            {/* Top Logo & Call to Action */}
            <div className="text-center space-y-1 z-10">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg mx-auto flex items-center justify-center shadow-md">
                T
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                BARBERÍA WILSON
              </h4>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Menú & Catálogo Digital
              </p>
            </div>

            {/* Middle: NFC Wave + Phone Touch Simulation */}
            <div className="my-auto py-3 text-center z-10 flex flex-col items-center justify-center">
              <div className="relative w-16 h-16 rounded-full bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-sm">
                <Radio className="w-7 h-7 animate-pulse text-blue-600" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <p className="mt-2 text-[11px] font-extrabold text-slate-800">
                Acerca tu teléfono aquí
              </p>
              <p className="text-[9px] text-slate-500 font-medium">
                Sin descargar aplicaciones
              </p>
            </div>

            {/* Bottom: Backup QR Code */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between z-10">
              <div className="text-left">
                <p className="text-[9px] text-slate-400 font-medium">O escanea con cámara</p>
                <p className="text-[10px] font-extrabold text-slate-800">Menú / WhatsApp</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-900 p-1 flex items-center justify-center text-white">
                <QrCode className="w-full h-full text-white" />
              </div>
            </div>
          </div>

          {/* Wooden/Metallic Base Stand */}
          <div className="w-[110%] h-4 -mt-1 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 rounded-b-xl shadow-lg border-t border-amber-600/40 relative z-20 flex items-center justify-center">
            <span className="w-16 h-0.5 bg-amber-400/40 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'star') {
    return (
      <div className={`relative flex items-center justify-center select-none ${isLarge ? 'p-6 sm:p-10' : 'p-4'}`}>
        <div className="absolute inset-0 bg-amber-500/10 rounded-3xl blur-2xl -z-10" />

        {/* Review Plaque */}
        <div 
          className={`relative w-full max-w-xs aspect-[1/1.25] rounded-3xl bg-white p-6 shadow-2xl border border-slate-200/90 flex flex-col justify-between text-center transition-transform duration-300 ${
            interactive ? 'hover:scale-102' : ''
          }`}
        >
          {/* Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[10px] font-black uppercase">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Google Reseñas</span>
            </div>
            <h4 className="text-base font-black text-slate-950 mt-1">
              ¿Disfrutaste tu visita?
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Comparte tu experiencia con nosotros
            </p>
          </div>

          {/* 5 Big Gold Stars */}
          <div className="py-2 flex items-center justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-6 h-6 fill-amber-400 text-amber-400 drop-shadow-xs" />
            ))}
          </div>

          {/* NFC Touch Mark */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900">Toca con tu móvil</p>
              <p className="text-[10px] text-slate-500 font-medium">Abre la pantalla de reseña</p>
            </div>
          </div>

          {/* QR Backup */}
          <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>Powered by TapRD</span>
            <div className="flex items-center gap-1 font-bold text-slate-700">
              <QrCode className="w-3.5 h-3.5" />
              <span>QR directo</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sticker
  return (
    <div className={`relative flex items-center justify-center select-none ${isLarge ? 'p-6 sm:p-10' : 'p-4'}`}>
      <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-2xl -z-10" />

      {/* 3D Round Epoxy Domed NFC Sticker */}
      <div 
        className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-6 shadow-2xl border-4 border-slate-700/60 flex flex-col items-center justify-between transition-transform duration-300 ${
          interactive ? 'hover:scale-105 hover:rotate-1' : ''
        }`}
      >
        {/* Epoxy bubble reflection */}
        <div className="absolute top-2 left-6 w-24 h-12 bg-white/20 rounded-full blur-xs -rotate-25 pointer-events-none" />

        {/* Top brand */}
        <div className="text-center pt-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">
            NFC SMART STICKER
          </span>
        </div>

        {/* Center Icon */}
        <div className="w-14 h-14 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg border border-blue-400/40">
          <Radio className="w-7 h-7 animate-pulse text-white" />
        </div>

        {/* Bottom Call to Action */}
        <div className="text-center pb-2">
          <p className="text-xs font-black tracking-tight text-white">TAP TO CONNECT</p>
          <p className="text-[8px] font-mono text-slate-400">Anti-metal • 3M Adhesive</p>
        </div>
      </div>
    </div>
  );
}
