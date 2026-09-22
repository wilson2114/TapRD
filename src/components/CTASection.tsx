import React from 'react';
import { ArrowRight, Smartphone, Sparkles, ShieldCheck } from 'lucide-react';

interface CTASectionProps {
  onOpenContact: () => void;
}

export function CTASection({ onOpenContact }: CTASectionProps) {
  return (
    <section id="cta-section" className="py-16 sm:py-24 bg-gradient-to-b from-white to-[#f8fafc] dark:from-slate-900 dark:to-slate-950 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-8 sm:p-14 text-white text-center shadow-2xl shadow-blue-600/30 overflow-hidden">
          
          {/* Subtle Ambient Orbs */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-900/40 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>TapRD República Dominicana</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              ¿Listo para llevar tu negocio al siguiente nivel?
            </h2>

            <p className="text-base sm:text-lg text-blue-100 font-normal leading-relaxed">
              Conecta a tus clientes con tu negocio usando un solo toque.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                id="btn-cta-solicitar"
                type="button"
                onClick={onOpenContact}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-extrabold text-blue-700 bg-white hover:bg-blue-50 active:scale-[0.98] rounded-xl shadow-lg transition-all"
              >
                <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
                <span>Solicitar mi solución NFC</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>

            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-blue-200">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
                <span>Garantía de chip 12 meses</span>
              </span>
              <span>•</span>
              <span>Envíos express en RD</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
