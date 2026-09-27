import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plan } from '../../types/plan';
import { getPlans, activatePlan, deactivatePlan } from '../../services/planService';
import { 
  Shield, 
  Plus, 
  Edit2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Check, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AdminPlansPageProps {
  onNavigate: (path: string) => void;
}

export function AdminPlansPage({ onNavigate }: AdminPlansPageProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await getPlans();
      setPlans(data);
    } catch (err) {
      console.error('Error cargando planes en admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleToggleActive = async (plan: Plan) => {
    setActionInProgress(plan.id);
    try {
      if (plan.active) {
        await deactivatePlan(plan.id);
        setSuccessMsg(`Plan "${plan.name}" desactivado con éxito.`);
      } else {
        await activatePlan(plan.id);
        setSuccessMsg(`Plan "${plan.name}" reactivado con éxito.`);
      }
      await loadPlans();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(`Error al actualizar estado del plan: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <AdminLayout
      currentPath="/admin/planes"
      onNavigate={onNavigate}
      title="Gestión de Planes y Precios"
      subtitle="Administra los niveles de suscripción, límites de funciones y precios configurables de TapRD"
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadPlans}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Recargar planes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/admin/planes/nuevo')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear nuevo plan</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* Banner de Mensaje de Éxito */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
              &times;
            </button>
          </div>
        )}

        {/* Info banner */}
        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
          <div>
            <p className="font-bold">Infraestructura de Planes Preparada para Pagos</p>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
              Los cambios de precio o características se sincronizan en vivo sin requerir redeploys. No alteran contratos de clientes existentes sin acción explícita.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/planes')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-300 font-bold shrink-0 cursor-pointer"
          >
            <span>Ver vista pública /planes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tabla / Lista de planes */}
        {loading ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Cargando catálogo de planes...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No hay planes registrados</h3>
            <button
              type="button"
              onClick={() => onNavigate('/admin/planes/nuevo')}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              Crear primer plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isDefaultCore = ['starter', 'business', 'pro'].includes(plan.id);

              return (
                <div
                  key={plan.id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl border p-6 flex flex-col justify-between shadow-2xs transition-all ${
                    plan.active
                      ? 'border-slate-200/90 dark:border-slate-800'
                      : 'border-rose-200/60 dark:border-rose-950/60 bg-rose-50/20 dark:bg-rose-950/10 opacity-75'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white capitalize">
                            {plan.name}
                          </h3>
                          {plan.active ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              Activo
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              Inactivo
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">ID: {plan.id}</span>
                      </div>

                      {plan.badge && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-300">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {plan.description}
                    </p>

                    {/* Precio configurado */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Precio configurado:</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {plan.price === 0 ? 'Gratis' : `${plan.currency}$ ${plan.price.toLocaleString()}`}
                        <span className="text-[10px] font-normal text-slate-400 ml-1">
                          /{plan.interval === 'yearly' ? 'año' : 'mes'}
                        </span>
                      </span>
                    </div>

                    {/* Límites */}
                    <div className="space-y-1.5 text-xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Límites:</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                          <span className="text-slate-400 block">Servicios:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {plan.limits?.maxServices === null ? 'Ilimitados' : `${plan.limits?.maxServices || 10} máx`}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                          <span className="text-slate-400 block">Redes:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {plan.limits?.maxSocialLinks === null ? 'Ilimitadas' : `${plan.limits?.maxSocialLinks || 5} máx`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Funcionalidades count */}
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {plan.features?.length || 0}
                      </span> características promocionadas.
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(plan)}
                      disabled={actionInProgress === plan.id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        plan.active
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}
                    >
                      {actionInProgress === plan.id ? 'Guardando...' : plan.active ? 'Desactivar' : 'Activar'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate(`/admin/planes/${plan.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
