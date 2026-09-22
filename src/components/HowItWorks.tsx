import React from 'react';
import { CreditCard, Palette, Radio, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onSelectProduct?: () => void;
}

export function HowItWorks({ onSelectProduct }: HowItWorksProps) {
  const steps = [
    {
      number: '01',
      title: 'Elige',
      description: 'Selecciona tu tarjeta, placa o sticker NFC adaptado a tu estilo de trabajo o mostrador comercial.',
      icon: CreditCard,
      highlight: 'Hardware NFC de alta calidad',
      badgeColor: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/60'
    },
    {
      number: '02',
      title: 'Personalizamos',
      description: 'Creamos tu perfil digital con tu logo, enlaces de WhatsApp, redes sociales, servicios, horarios y ubicación.',
      icon: Palette,
      highlight: 'Perfil digital 100% editable',
      badgeColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/60'
    },
    {
      number: '03',
      title: 'Conecta',
      description: 'Tu cliente acerca su teléfono y accede instantáneamente a tu información sin descargar ninguna app.',
      icon: Radio,
      highlight: 'Conexión a un solo toque',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/60'
    }
  ];

  return (
    <section id="como-funciona" className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/60">
            Paso a Paso
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ¿Cómo funciona TapRD?
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Digitalizar la forma en que conectas con tus clientes en República Dominicana nunca fue tan simple.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                id={`step-card-${step.number}`}
                className="relative bg-[#f8fafc] dark:bg-slate-800/80 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-blue-300/80 dark:hover:border-blue-500/80 transition-all duration-200 group flex flex-col justify-between"
              >
                {/* Step Top Bar */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-slate-300 dark:text-slate-600 font-mono">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Step Footer Badge */}
                <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md border ${step.badgeColor}`}>
                    {step.highlight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section Bottom Info Callout */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ¿Tienes dudas sobre cuál es la solución ideal para tu negocio?{' '}
            <button
              type="button"
              onClick={onSelectProduct}
              className="font-bold text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
            >
              Explora nuestro catálogo completo
            </button>
          </p>
        </div>

      </div>
    </section>
  );
}
