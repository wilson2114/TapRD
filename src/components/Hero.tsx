import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Sparkles, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';
import { NfcTouchDemo } from './NfcTouchDemo';

interface HeroProps {
  onViewProducts: () => void;
  onOpenQuote: () => void;
  onOpenDemo: (slug?: string) => void;
}

export function Hero({ onViewProducts, onOpenQuote, onOpenDemo }: HeroProps) {
  return (
    <section id="hero-section" className="relative pt-6 pb-16 sm:pt-10 sm:pb-20 md:pt-16 md:pb-24 overflow-hidden">
      {/* Soft Ambient Subtle Gradients */}
      <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-gradient-to-br from-blue-100/50 to-indigo-100/20 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-100/40 to-sky-100/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Trust Signals & Direct CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-center lg:text-left">
            
            {/* National Tech Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold shadow-xs backdrop-blur-xs transition-all hover:border-blue-300 dark:hover:border-blue-500/50">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950 animate-pulse" />
              <span className="font-bold text-slate-900 dark:text-white">Solución NFC Dominicana</span>
              <span className="text-slate-300 dark:text-slate-700 font-normal">|</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">Sin aplicaciones ni suscripción forzosa 🇩🇴</span>
            </div>

            {/* Main Hero Headline - Tech Startup Typography */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.12]">
                Tu negocio, <br className="hidden sm:inline" />
                <span className="relative inline-block text-blue-600 dark:text-blue-400">
                  a un toque
                  <svg className="absolute -bottom-1.5 left-0 w-full h-3 text-blue-300/40 dark:text-blue-500/30 -z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0,10 Q50,0 100,10" stroke="currentColor" strokeWidth="6" fill="none" />
                  </svg>
                </span>{' '}
                de distancia.
              </h1>
            </div>

            {/* Subtitle with High-Legibility Line Height */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0">
              Tarjetas inteligentes, placas acrílicas para mostrador y stickers con tecnología NFC y QR. 
              Tus clientes tocan y acceden a tu WhatsApp, catálogo, redes sociales, menú y ubicación de inmediato.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
              <button
                id="btn-hero-cotizacion"
                type="button"
                onClick={onOpenQuote}
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 text-base font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-2xl shadow-xl shadow-blue-600/20 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 group cursor-pointer"
              >
                <span>Solicitar cotización</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="btn-hero-productos"
                type="button"
                onClick={onViewProducts}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 text-base font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.98] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-all cursor-pointer"
              >
                <span>Ver catálogo y precios</span>
                <ChevronRight className="w-4 h-4 ml-1 text-slate-400 dark:text-slate-500" />
              </button>
            </div>

            {/* Startup Trust Metrics Strip */}
            <div className="pt-6 sm:pt-7 border-t border-slate-200/70 dark:border-slate-800 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-0.5">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">0.5 seg</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Apertura nativa en el móvil</p>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">100%</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Compatible NFC + QR</p>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-0.5">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">Nacional</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Envíos en toda RD</p>
              </div>
            </div>

          </div>

          {/* Right Column: High-Tech Interactive NFC Demonstration */}
          <div className="lg:col-span-5 flex justify-center">
            <NfcTouchDemo onOpenDemoProfile={() => onOpenDemo('barberia-wilson')} />
          </div>

        </div>
      </div>
    </section>
  );
}

