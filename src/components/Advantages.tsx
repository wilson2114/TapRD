import React from 'react';
import { 
  DownloadCloud, 
  Smartphone, 
  QrCode, 
  RefreshCw, 
  Layers, 
  Palette,
  CheckCircle2
} from 'lucide-react';

export function Advantages() {
  const advantagesList = [
    {
      title: 'Cero aplicaciones que descargar',
      description: 'Tu cliente no necesita instalar nada en su móvil. La información se despliega de forma nativa e instantánea en su navegador.',
      icon: DownloadCloud,
      color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Funciona directamente desde el teléfono',
      description: 'Diseñado específicamente con estándares móviles modernos, garantizando carga rápida en Android y iPhone.',
      icon: Smartphone,
      color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
    },
    {
      title: 'Doble respaldo: NFC + Código QR',
      description: 'Si el cliente tiene un teléfono más antiguo sin NFC activado, el código QR de alta resolución asegura que nadie se quede sin tu contacto.',
      icon: QrCode,
      color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Actualizaciones al instante sin cambiar tarjeta',
      description: '¿Cambiaste de WhatsApp, precios o dirección? Modifica tu perfil digital en la nube sin volver a gastar en nuevas tarjetas o placas.',
      icon: RefreshCw,
      color: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400'
    },
    {
      title: 'Todos tus enlaces en un solo lugar',
      description: 'Reúne WhatsApp, Instagram, Google Reviews, catálogo, cuenta bancaria para transferencias y ubicación en una sola experiencia fluida.',
      icon: Layers,
      color: 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400'
    },
    {
      title: 'Diseño personalizado con tu marca',
      description: 'Proyecta una imagen de máxima vanguardia y profesionalismo frente a tus clientes, socios e inversionistas.',
      icon: Palette,
      color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
    }
  ];

  return (
    <section id="ventajas-section" className="py-16 sm:py-24 bg-[#f8fafc] dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/60">
            ¿Por qué elegir TapRD?
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ventajas que marcan la diferencia
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            La transición de tarjetas tradicionales de cartón a perfiles NFC inteligentes aumenta la retención de clientes y acelera tus ventas.
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantagesList.map((adv, idx) => {
            const Icon = adv.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${adv.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {adv.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {adv.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Solución TapRD Garantizada</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
