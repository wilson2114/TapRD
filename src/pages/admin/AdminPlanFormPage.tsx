import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plan, PlanInterval, PlanLimits, PlanFeatures } from '../../types/plan';
import { getPlanById, createPlan, updatePlan } from '../../services/planService';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Layers,
  Sparkles
} from 'lucide-react';

interface AdminPlanFormPageProps {
  planId?: string; // Si está presente, es modo edición
  onNavigate: (path: string) => void;
}

export function AdminPlanFormPage({ planId, onNavigate }: AdminPlanFormPageProps) {
  const isEditing = Boolean(planId && planId !== 'nuevo');

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState<'DOP' | 'USD'>('DOP');
  const [interval, setInterval] = useState<PlanInterval>('monthly');
  const [badge, setBadge] = useState('');
  const [popular, setPopular] = useState(false);
  const [active, setActive] = useState(true);

  // Features list
  const [features, setFeatures] = useState<string[]>([
    'Perfil digital interactivo',
    'Tarjeta NFC inteligente TapRD'
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');

  // Limits
  const [isServicesUnlimited, setIsServicesUnlimited] = useState(false);
  const [maxServices, setMaxServices] = useState<number>(10);
  const [isSocialsUnlimited, setIsSocialsUnlimited] = useState(false);
  const [maxSocialLinks, setMaxSocialLinks] = useState<number>(5);
  const [maxAnalyticsDays, setMaxAnalyticsDays] = useState<number>(30);
  const [isAnalyticsDaysUnlimited, setIsAnalyticsDaysUnlimited] = useState(false);

  // Feature Flags
  const [featureFlags, setFeatureFlags] = useState<PlanFeatures>({
    profile: true,
    services: true,
    hours: true,
    socials: true,
    qr: true,
    nfc: true,
    analytics: true,
    advancedAnalytics: false,
    customProfile: false,
    support: true,
    prioritySupport: false
  });

  useEffect(() => {
    if (!isEditing || !planId) return;

    async function load() {
      setLoading(true);
      try {
        const plan = await getPlanById(planId!);
        if (plan) {
          setName(plan.name);
          setId(plan.id);
          setDescription(plan.description);
          setPrice(plan.price || 0);
          setCurrency(plan.currency || 'DOP');
          setInterval(plan.interval || 'monthly');
          setBadge(plan.badge || '');
          setPopular(Boolean(plan.popular));
          setActive(plan.active !== false);
          setFeatures(plan.features || []);

          if (plan.limits) {
            if (plan.limits.maxServices === null) {
              setIsServicesUnlimited(true);
            } else {
              setIsServicesUnlimited(false);
              setMaxServices(plan.limits.maxServices ?? 10);
            }

            if (plan.limits.maxSocialLinks === null) {
              setIsSocialsUnlimited(true);
            } else {
              setIsSocialsUnlimited(false);
              setMaxSocialLinks(plan.limits.maxSocialLinks ?? 5);
            }

            if (plan.limits.maxAnalyticsDays === null) {
              setIsAnalyticsDaysUnlimited(true);
            } else {
              setIsAnalyticsDaysUnlimited(false);
              setMaxAnalyticsDays(plan.limits.maxAnalyticsDays ?? 30);
            }
          }

          if (plan.featureFlags) {
            setFeatureFlags({
              ...featureFlags,
              ...plan.featureFlags
            });
          }
        } else {
          setErrorMsg(`Plan con ID "${planId}" no encontrado.`);
        }
      } catch (err: any) {
        setErrorMsg(`Error cargando plan: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [planId, isEditing]);

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre del plan es obligatorio.');
      return;
    }

    setErrorMsg(null);
    setSaving(true);

    const limitsPayload: PlanLimits = {
      maxServices: isServicesUnlimited ? null : Number(maxServices),
      maxSocialLinks: isSocialsUnlimited ? null : Number(maxSocialLinks),
      maxTeamMembers: 1,
      maxAnalyticsDays: isAnalyticsDaysUnlimited ? null : Number(maxAnalyticsDays),
      maxProfiles: 1
    };

    try {
      if (isEditing && planId) {
        await updatePlan(planId, {
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          currency,
          interval,
          badge: badge.trim() || undefined,
          popular,
          active,
          features,
          featureFlags,
          limits: limitsPayload
        });
        setSuccessMsg('Plan actualizado correctamente en la base de datos.');
      } else {
        const generatedId = (id || name).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim();
        await createPlan({
          id: generatedId,
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          currency,
          interval,
          badge: badge.trim() || undefined,
          popular,
          active,
          features,
          featureFlags,
          limits: limitsPayload
        });
        setSuccessMsg('Nuevo plan creado con éxito.');
        setTimeout(() => {
          onNavigate('/admin/planes');
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(`Error al guardar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      currentPath={isEditing ? `/admin/planes/${planId}` : '/admin/planes/nuevo'}
      onNavigate={onNavigate}
      title={isEditing ? `Editar Plan: ${name || planId}` : 'Crear Nuevo Plan'}
      subtitle="Configura precios, intervalos, descripciones y límites de funcionalidades"
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('/admin/planes')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Planes</span>
          </button>
        </div>
      }
    >
      <div className="max-w-4xl space-y-6">
        
        {/* Notificaciones */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Cargando detalles del plan...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Información Básica */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>1. Información General del Plan</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre del Plan *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!isEditing && !id) {
                        setId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                      }
                    }}
                    placeholder="Ej. Starter, Business, Pro"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ID / Slug de Identificación {isEditing && '(Inmutable)'}
                  </label>
                  <input
                    type="text"
                    disabled={isEditing}
                    value={id}
                    onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="ej. starter, business, pro"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs font-mono disabled:opacity-60 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción Comercial
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Resumen del valor que aporta este plan a los negocios..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Etiqueta / Badge (Opcional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Ej. Más Popular, Nuevo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={popular}
                      onChange={(e) => setPopular(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>Destacar como "Más Popular"</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span>Plan Activo y Visible</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 2. Precios e Intervalos */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>2. Precios Configurables (Base de Datos)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Precio (0 para Gratis)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Moneda
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                  >
                    <option value="DOP">DOP (Pesos Dominicanos)</option>
                    <option value="USD">USD (Dólares)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Intervalo de Cobro
                  </label>
                  <select
                    value={interval}
                    onChange={(e) => setInterval(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                  >
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Límites Numéricos */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                3. Límites de Contenido (limitService)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Servicios */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Servicios / Productos
                  </span>
                  <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={isServicesUnlimited}
                      onChange={(e) => setIsServicesUnlimited(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Ilimitado</span>
                  </label>
                  {!isServicesUnlimited && (
                    <input
                      type="number"
                      min="1"
                      value={maxServices}
                      onChange={(e) => setMaxServices(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                    />
                  )}
                </div>

                {/* Redes Sociales */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Enlaces de Redes
                  </span>
                  <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={isSocialsUnlimited}
                      onChange={(e) => setIsSocialsUnlimited(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Ilimitado</span>
                  </label>
                  {!isSocialsUnlimited && (
                    <input
                      type="number"
                      min="1"
                      value={maxSocialLinks}
                      onChange={(e) => setMaxSocialLinks(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                    />
                  )}
                </div>

                {/* Días de Analytics */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Historial Analytics
                  </span>
                  <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={isAnalyticsDaysUnlimited}
                      onChange={(e) => setIsAnalyticsDaysUnlimited(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Ilimitado (Histórico total)</span>
                  </label>
                  {!isAnalyticsDaysUnlimited && (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="7"
                        value={maxAnalyticsDays}
                        onChange={(e) => setMaxAnalyticsDays(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      />
                      <span className="text-xs text-slate-400">días</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Feature Flags */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                4. Control de Funciones (featureAccessService)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {Object.keys(featureFlags).map((key) => {
                  const isChecked = Boolean((featureFlags as any)[key]);
                  return (
                    <label
                      key={key}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          setFeatureFlags({
                            ...featureFlags,
                            [key]: e.target.checked
                          });
                        }}
                        className="rounded text-blue-600 h-4 w-4"
                      />
                      <span className="font-bold capitalize">{key}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 5. Lista de Características (Bullets para /planes) */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                5. Características Promocionadas para Tarjetas de Planes
              </h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  placeholder="Escribe una nueva característica (ej. Soporte 24/7)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pt-2">
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón de Guardado */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => onNavigate('/admin/planes')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Guardando en Base de Datos...' : isEditing ? 'Guardar Cambios' : 'Crear Plan'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </AdminLayout>
  );
}
