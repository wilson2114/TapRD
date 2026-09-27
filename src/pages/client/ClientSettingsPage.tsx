import React, { useState } from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { ClientLayout } from '../../components/client/ClientLayout';
import { ClientSettings } from '../../types/client';
import { DEFAULT_PLANS } from '../../config/plans';
import { 
  CreditCard, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Save, 
  Sliders, 
  HelpCircle,
  Clock,
  Layers,
  Info
} from 'lucide-react';
import { isSubscriptionActive, isGracePeriodActive } from '../../services/subscriptionService';
import { canUseFeature } from '../../services/featureAccessService';

interface ClientSettingsPageProps {
  onNavigate: (path: string) => void;
}

export function ClientSettingsPage({ onNavigate }: ClientSettingsPageProps) {
  const { client, updateClient } = useClientAuth();

  const [settings, setSettings] = useState<ClientSettings>(() => ({
    showPhone: client?.settings?.showPhone ?? true,
    showWhatsapp: client?.settings?.showWhatsapp ?? true,
    showInstagram: client?.settings?.showInstagram ?? true,
    showFacebook: client?.settings?.showFacebook ?? true,
    showTikTok: client?.settings?.showTikTok ?? true,
    showAddress: client?.settings?.showAddress ?? true,
    showHours: client?.settings?.showHours ?? true,
    showServices: client?.settings?.showServices ?? true,
    showReviews: client?.settings?.showReviews ?? true,
    showBankAccounts: client?.settings?.showBankAccounts ?? true
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!client) return null;

  const currentPlanId = (client.plan || 'starter').toLowerCase();
  const currentPlanConfig = DEFAULT_PLANS.find(p => p.id === currentPlanId) || DEFAULT_PLANS[0];
  const activeSub = isSubscriptionActive(client);
  const inGrace = isGracePeriodActive(client);

  const handleToggle = (key: keyof ClientSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const updated = await updateClient({
        settings
      });
      if (updated) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMessage('No se pudieron guardar las preferencias.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar configuración.');
    } finally {
      setIsSaving(false);
    }
  };

  // Formatear fechas
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin fecha programada';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <ClientLayout
      currentPath="/cliente/configuracion"
      onNavigate={onNavigate}
      title="Configuración & Plan"
      subtitle="Supervisa tu suscripción activa, estado de facturación y visibilidad de tu perfil"
    >
      <div className="space-y-8 max-w-5xl">

        {/* Notificaciones */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Configuración de visibilidad guardada correctamente.</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECCIÓN 1: PLAN Y FACTURACIÓN (Requirement 19) */}
        {/* ================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
          {/* Header de la tarjeta */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Nivel de Suscripción Activo</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black capitalize tracking-tight">
                Plan {currentPlanConfig.name}
              </h2>
              <p className="text-xs text-blue-200/80 max-w-lg">
                {currentPlanConfig.description}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('/planes')}
                className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <span>Cambiar plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/planes/comparar')}
                className="text-[11px] text-blue-200 hover:text-white underline font-semibold text-center sm:text-right cursor-pointer"
              >
                Comparar características
              </button>
            </div>
          </div>

          {/* Grid de Datos de Facturación */}
          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 border-b border-slate-100 dark:border-slate-800">
            
            {/* Estado de Suscripción */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Estado de Suscripción
              </span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  activeSub ? 'bg-emerald-500' : inGrace ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <span className="text-sm font-black text-slate-900 dark:text-white capitalize">
                  {client.subscriptionStatus === 'active' 
                    ? 'Activa' 
                    : client.subscriptionStatus === 'trialing' 
                    ? 'Prueba Gratuita' 
                    : client.subscriptionStatus === 'suspended'
                    ? 'Suspendida'
                    : client.subscriptionStatus === 'expired'
                    ? 'Vencida'
                    : client.subscriptionStatus || 'Activa'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {activeSub ? 'Acceso completo a tus funciones' : 'Tu plan requiere atención o renovación'}
              </p>
            </div>

            {/* Fecha de Renovación / Vencimiento */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Fecha de Renovación
              </span>
              <div className="flex items-center gap-1.5 text-sm font-black text-slate-900 dark:text-white">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>
                  {client.subscriptionExpiresAt 
                    ? formatDate(client.subscriptionExpiresAt) 
                    : 'Renovación automática'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ciclo: {client.billingCycle === 'yearly' ? 'Anual' : 'Mensual'}
              </p>
            </div>

            {/* Próximo Pago */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Próximo Pago
              </span>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {currentPlanConfig.price === 0 
                  ? 'Gratuito (RD$ 0)' 
                  : `${currentPlanConfig.currency}$ ${currentPlanConfig.price.toLocaleString()}`}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {client.nextPaymentAt ? `Programado: ${formatDate(client.nextPaymentAt)}` : 'Sin cargos automáticos'}
              </p>
            </div>

            {/* Método de Pago Actual */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Método de Pago
              </span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{client.paymentProvider || 'Gestión TapRD'}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Coordinado por asesor comercial
              </p>
            </div>

          </div>

          {/* Resumen de características del plan actual */}
          <div className="p-6 sm:p-8 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Funcionalidades Incluidas en tu Plan</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {currentPlanConfig.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/planes')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>¿Deseas más capacidades? Explora todos nuestros planes disponibles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECCIÓN 2: PREFERENCIAS DE VISIBILIDAD DE PERFIL */}
        {/* ================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Visibilidad de Elementos en tu Perfil Público</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Activa o desactiva qué secciones e información pueden ver los visitantes al escanear tu tarjeta NFC
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[
              { key: 'showPhone', label: 'Botón de Llamada Telefónica' },
              { key: 'showWhatsapp', label: 'Botón de WhatsApp' },
              { key: 'showInstagram', label: 'Enlace a Instagram' },
              { key: 'showFacebook', label: 'Enlace a Facebook' },
              { key: 'showTikTok', label: 'Enlace a TikTok' },
              { key: 'showAddress', label: 'Dirección y Mapa' },
              { key: 'showHours', label: 'Horario Comercial' },
              { key: 'showServices', label: 'Catálogo de Servicios' },
              { key: 'showBankAccounts', label: 'Cuentas Bancarias de Transferencia' },
              { key: 'showReviews', label: 'Botón de Reseñas Google' }
            ].map((item) => {
              const active = Boolean(settings[item.key as keyof ClientSettings]);
              return (
                <div
                  key={item.key}
                  onClick={() => handleToggle(item.key as keyof ClientSettings)}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between cursor-pointer select-none transition-all"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {item.label}
                  </span>
                  <div
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        active ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveSettings}
              className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Preferencias'}</span>
            </button>
          </div>
        </div>

      </div>
    </ClientLayout>
  );
}
