import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { COMPARISON_FEATURES } from '../config/plans';
import { Check, Minus, ArrowLeft, ArrowRight, Table, Sparkles, MessageCircle } from 'lucide-react';
import { ProductRequestModal } from '../components/ProductRequestModal';

interface ComparePlansPageProps {
  onNavigate: (path: string) => void;
  onOpenContact?: (interest?: string) => void;
}

export function ComparePlansPage({ onNavigate, onOpenContact }: ComparePlansPageProps) {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedPlanInterest, setSelectedPlanInterest] = useState<string>('');

  const handleSelectPlan = (planName: string) => {
    setSelectedPlanInterest(`Plan ${planName}`);
    if (onOpenContact) {
      onOpenContact(`Interés en Plan ${planName} desde Comparativa`);
    } else {
      setContactModalOpen(true);
    }
  };

  const renderValue = (val: string | boolean) => {
    if (val === true) {
      return (
        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <Check className="w-3.5 h-3.5" />
        </div>
      );
    }
    if (val === false) {
      return (
        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 flex items-center justify-center mx-auto">
          <Minus className="w-3.5 h-3.5" />
        </div>
      );
    }
    if (typeof val === 'string' && val.toLowerCase().includes('próximamente')) {
      return (
        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/60">
          Próximamente
        </span>
      );
    }
    return (
      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
        {val}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors">
      <SEOHead
        title="Comparar Planes TapRD | Tabla detallada de características"
        description="Compara las funciones, límites y capacidades de los planes Starter, Business y Pro de TapRD."
      />

      <Navbar
        currentPath="/planes/comparar"
        onNavigate={onNavigate}
        onOpenContact={(interest) => {
          setSelectedPlanInterest(interest || 'Planes Comparativa');
          setContactModalOpen(true);
        }}
      />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumb & Header */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => onNavigate('/planes')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la vista de planes</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/90 dark:border-slate-800 pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider mb-1">
                  <Table className="w-3.5 h-3.5" />
                  <span>Matriz de Capacidades</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Comparativa detallada de planes
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Revisa cada característica para elegir la solución precisa que necesita tu empresa
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/planes')}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Ver tarjetas de planes
                </button>
              </div>
            </div>
          </div>

          {/* Tabla Comparativa Responsiva con scroll horizontal asegurado */}
          <div className="space-y-2">
            <div className="md:hidden flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-2">
              <span className="font-semibold">💡 Desliza hacia los lados para ver todos los planes</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">← Deslizar →</span>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
                <table className="w-full text-left border-collapse min-w-[640px]">
                  {/* Cabecera de la tabla fija */}
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80">
                      <th className="py-5 px-6 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 w-2/5">
                        Característica
                      </th>
                      <th className="py-5 px-4 text-center w-1/5">
                        <span className="block text-sm font-black text-slate-900 dark:text-white uppercase">
                          Starter
                        </span>
                        <span className="block text-[11px] font-bold text-slate-400">Esencial</span>
                      </th>
                      <th className="py-5 px-4 text-center w-1/5 bg-blue-50/50 dark:bg-blue-950/30 border-x border-blue-100 dark:border-blue-900/40">
                        <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white mb-1 shadow-2xs">
                          Más popular
                        </span>
                        <span className="block text-sm font-black text-blue-700 dark:text-blue-300 uppercase">
                          Business
                        </span>
                        <span className="block text-[11px] font-bold text-blue-500/80">Crecimiento</span>
                      </th>
                      <th className="py-5 px-4 text-center w-1/5">
                        <span className="block text-sm font-black text-slate-900 dark:text-white uppercase">
                          Pro
                        </span>
                        <span className="block text-[11px] font-bold text-slate-400">Todo incluido</span>
                      </th>
                    </tr>
                  </thead>

                {/* Cuerpo de la tabla agrupado por categorías */}
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {COMPARISON_FEATURES.map((section, sIdx) => (
                    <React.Fragment key={sIdx}>
                      {/* Fila separadora de categoría */}
                      <tr className="bg-slate-100/70 dark:bg-slate-800/60">
                        <td
                          colSpan={4}
                          className="py-3 px-6 font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[11px]"
                        >
                          {section.category}
                        </td>
                      </tr>

                      {/* Items de la categoría */}
                      {section.items.map((item, iIdx) => (
                        <tr
                          key={iIdx}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">
                            {item.name}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {renderValue(item.starter)}
                          </td>
                          <td className="py-4 px-4 text-center bg-blue-50/30 dark:bg-blue-950/20 border-x border-blue-100/60 dark:border-blue-900/30">
                            {renderValue(item.business)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {renderValue(item.pro)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}

                  {/* Fila inferior de botones de acción */}
                  <tr className="bg-slate-50/80 dark:bg-slate-900/90 border-t-2 border-slate-200 dark:border-slate-800">
                    <td className="py-5 px-6 font-bold text-slate-500">
                      Selecciona tu plan
                    </td>
                    <td className="py-5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleSelectPlan('Starter')}
                        className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Elegir Starter
                      </button>
                    </td>
                    <td className="py-5 px-4 text-center bg-blue-50/50 dark:bg-blue-950/30 border-x border-blue-100 dark:border-blue-900/40">
                      <button
                        type="button"
                        onClick={() => handleSelectPlan('Business')}
                        className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-98"
                      >
                        Elegir Business
                      </button>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleSelectPlan('Pro')}
                        className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Elegir Pro
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

          {/* Nota al pie */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
            <span>
              💡 Todas las tarjetas NFC y placas inteligentes de TapRD funcionan de por vida y son reconfigurables sin costos de reimpresión.
            </span>
            <button
              type="button"
              onClick={() => handleSelectPlan('General')}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline shrink-0 cursor-pointer"
            >
              ¿Tienes dudas? Consulta con nosotros
            </button>
          </div>

        </div>
      </main>

      <Footer
        onNavigate={onNavigate}
        onOpenContact={() => {
          setSelectedPlanInterest('Comparativa de Planes');
          setContactModalOpen(true);
        }}
      />

      <ProductRequestModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        initialProductName={selectedPlanInterest || 'Tap Card'}
      />
    </div>
  );
}
