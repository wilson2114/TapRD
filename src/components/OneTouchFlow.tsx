import React from 'react';
import { 
  Radio, 
  Smartphone, 
  MessageCircle, 
  Instagram, 
  Utensils, 
  BookOpen, 
  MapPin, 
  Star, 
  ArrowDown, 
  ArrowRight 
} from 'lucide-react';

export function OneTouchFlow() {
  const destinations = [
    { label: 'WhatsApp Directo', icon: MessageCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'Instagram & Redes', icon: Instagram, color: 'text-pink-600 bg-pink-50 border-pink-200' },
    { label: 'Menú Digital', icon: Utensils, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'Catálogo de Servicios', icon: BookOpen, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Ubicación GPS (Maps / Waze)', icon: MapPin, color: 'text-red-600 bg-red-50 border-red-200' },
    { label: 'Reseñas 5 Estrellas Google', icon: Star, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
  ];

  return (
    <section id="un-solo-toque" className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/60">
            Arquitectura de Conexión
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Un solo toque, infinitas posibilidades
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Mira cómo la tecnología NFC transforma un simple toque en acciones directas de compra, contacto y recomendación.
          </p>
        </div>

        {/* Visual Flow Representation */}
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Level 1: NFC Interaction */}
          <div className="w-full max-w-md bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-lg shadow-blue-500/20 text-center flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Paso Inicial</p>
              <h3 className="text-xl font-extrabold">Toque NFC sin contacto</h3>
              <p className="text-xs text-blue-100">Tarjeta, placa de mesa o sticker inteligente</p>
            </div>
          </div>

          {/* Flow Arrow 1 */}
          <div className="my-4 flex flex-col items-center">
            <div className="w-0.5 h-8 bg-blue-400" />
            <ArrowDown className="w-5 h-5 text-blue-600 -mt-1" />
          </div>

          {/* Level 2: Perfil Digital */}
          <div className="w-full max-w-lg bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 text-center flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-500/30 text-cyan-300 rounded border border-blue-400/30">
                Apertura Nativa en 0.5s
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1">Perfil Digital TapRD</h3>
              <p className="text-xs text-slate-400">Micro-sitio optimizado para teléfonos con tu marca</p>
            </div>
          </div>

          {/* Flow Arrow 2 */}
          <div className="my-4 flex flex-col items-center">
            <div className="w-0.5 h-8 bg-slate-400 dark:bg-slate-600" />
            <ArrowDown className="w-5 h-5 text-slate-700 dark:text-slate-400 -mt-1" />
          </div>

          {/* Level 3: Destinations & Conversions */}
          <div className="w-full">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6">
              El cliente elige qué acción realizar inmediatamente
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {destinations.map((dest, i) => {
                const Icon = dest.icon;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-xl border bg-white dark:bg-slate-800 shadow-xs hover:shadow-md transition-shadow flex items-center gap-3 border-slate-200 dark:border-slate-700/80"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${dest.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {dest.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
