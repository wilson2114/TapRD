import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { Plan } from '../types/plan';
import { getActivePlans } from '../services/planService';
import { DEFAULT_PLANS } from '../config/plans';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle, 
  Table, 
  MessageCircle, 
  Zap,
  Info,
  Clock,
  Layers
} from 'lucide-react';
import { ProductRequestModal } from '../components/ProductRequestModal';

interface PlansPageProps {
  onNavigate: (path: string) => void;
  onOpenContact?: (interest?: string) => void;
  onOpenDemo?: (slug?: string) => void;
}

export function PlansPage({ onNavigate, onOpenContact, onOpenDemo }: PlansPageProps) {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(true);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedPlanInterest, setSelectedPlanInterest] = useState<string>('');
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const loadedPlans = await getActivePlans();
        if (isMounted && loadedPlans && loadedPlans.length > 0) {
          setPlans(loadedPlans);
        }
      } catch (err) {
        console.warn('Error cargando planes desde servicio, usando valores predeterminados:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlanInterest(`Plan ${plan.name}`);
    if (onOpenContact) {
      onOpenContact(`Interés en Plan ${plan.name}`);
    } else {
      setContactModalOpen(true);
    }
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    if (price === 0) {
      return (
        <div className="flex items-baseline gap-1">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Gratis</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ para empezar</span>
        </div>
      );
    }
    return (
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{currency}$</span>
        <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{price.toLocaleString()}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/{interval === 'yearly' ? 'año' : 'mes'}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors">
      <SEOHead
        title="Planes TapRD | Perfil digital para negocios"
        description="Conoce los planes de TapRD para crear y administrar tu perfil digital."
      />

      <Navbar
        currentPath="/planes"
        onNavigate={onNavigate}
        onOpenContact={(interest) => {
          setSelectedPlanInterest(interest || 'Planes TapRD');
          setContactModalOpen(true);
        }}
      />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="relative pt-12 pb-14 sm:pt-20 sm:pb-20 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-transparent dark:from-slate-900 dark:via-slate-950 dark:to-transparent border-b border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Planes Flexibles & Escalables</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
              Impulsa tu presencia digital con la tecnología <span className="text-blue-600 dark:text-blue-400">NFC de TapRD</span>
            </h1>

            <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Elige el plan ideal para tu negocio. Desde perfiles esenciales para emprendedores hasta herramientas avanzadas con métricas en tiempo real.
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/planes/comparar')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl border border-blue-200/80 dark:border-blue-800 transition-all cursor-pointer"
              >
                <Table className="w-4 h-4" />
                <span>Ver tabla comparativa detallada</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400">Cargando planes disponibles...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {plans.map((plan) => {
                const isPopular = plan.popular || plan.id === 'business';
                const isPro = plan.id === 'pro';

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                      isPopular
                        ? 'bg-white dark:bg-slate-900 border-2 border-blue-500 dark:border-blue-500 shadow-xl shadow-blue-500/10 scale-100 lg:-translate-y-2'
                        : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Badge destacado */}
                    {plan.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/30">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div className="space-y-6">
                      {/* Cabecera */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white capitalize">
                            {plan.name}
                          </h2>
                          {isPro && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              Premium
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[36px]">
                          {plan.description}
                        </p>
                      </div>

                      {/* Precio */}
                      <div className="py-3 border-y border-slate-100 dark:border-slate-800/80">
                        {formatPrice(plan.price, plan.currency, plan.interval)}
                      </div>

                      {/* Botón CTA Elegir Plan */}
                      <button
                        type="button"
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full min-h-[44px] py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 ${
                          isPopular
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                        }`}
                      >
                        <span>Elegir plan {plan.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      {/* Lista de características */}
                      <div className="space-y-3 pt-2">
                        <span className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                          ¿Qué incluye este plan?
                        </span>
                        <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                          {plan.features.map((feat, idx) => {
                            const isUpcoming = feat.toLowerCase().includes('próximamente');
                            return (
                              <li key={idx} className="flex items-start gap-2.5">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                  isUpcoming
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                    : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                                }`}>
                                  {isUpcoming ? <Clock className="w-2.5 h-2.5" /> : <Check className="w-2.5 h-2.5" />}
                                </div>
                                <span className={isUpcoming ? 'text-slate-400 dark:text-slate-500 italic' : ''}>
                                  {feat}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>

                    {/* Pie de tarjeta */}
                    <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Sin contratos forzosos</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Banner de Consulta y Asistencia */}
        <section className="py-12 bg-slate-100/70 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              ¿Tienes un negocio con múltiples sucursales o necesidades a medida?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Nuestro equipo en República Dominicana diseña soluciones personalizadas para franquicias, eventos y empresas con requerimientos específicos.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlanInterest('Solución Empresarial a Medida');
                  setContactModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>Hablar con un asesor</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/planes/comparar')}
                className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
              >
                <span>Comparar características</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer
        onNavigate={onNavigate}
        onOpenContact={() => {
          setSelectedPlanInterest('Contacto desde Planes');
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
