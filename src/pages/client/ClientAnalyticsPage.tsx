import React, { useState } from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { ClientLayout } from '../../components/client/ClientLayout';
import { canUseFeature, getFeatureLockReason } from '../../services/featureAccessService';
import { getLimit } from '../../services/limitService';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Smartphone, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  BarChart3,
  Clock,
  Share2,
  PhoneCall,
  MessageSquare
} from 'lucide-react';

interface ClientAnalyticsPageProps {
  onNavigate: (path: string) => void;
}

export function ClientAnalyticsPage({ onNavigate }: ClientAnalyticsPageProps) {
  const { client } = useClientAuth();

  if (!client) return null;

  const hasAdvanced = canUseFeature(client, 'advancedAnalytics');
  const maxDays = getLimit(client, 'maxAnalyticsDays') ?? 30;

  return (
    <ClientLayout
      currentPath="/cliente/analytics"
      onNavigate={onNavigate}
      title="Estadísticas de Interacción"
      subtitle="Analiza las visitas, toques NFC y clics en los enlaces de tu negocio"
    >
      <div className="space-y-6 max-w-5xl">
        
        {/* Banner de Rango de Historial */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-bold">
              Historial disponible en tu plan ({client.plan?.toUpperCase() || 'STARTER'}): {maxDays} días
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/planes')}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Ver planes con mayor retención</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Métricas Principales (Starter y superiores) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Total de Visitas & Toques NFC</span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">1,248</p>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18% en los últimos 30 días</span>
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Clics a WhatsApp</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">482</p>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>38.6% tasa de conversión</span>
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Guardado de Contacto (vCard)</span>
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                <Smartphone className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">194</p>
            <p className="text-[11px] text-slate-400 font-medium">Clientes agregaron tu número</p>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECCIÓN ANALYTICS AVANZADO (Gateado para Business o Pro) */}
        {/* Requirement 15 */}
        {/* ================================================================= */}
        <div className="relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
          
          <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Métricas Avanzadas & Desglose de Conversión
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Plan Business / Pro
            </span>
          </div>

          {/* Si el plan NO tiene advancedAnalytics, se aplica el bloqueo visual requerido */}
          {!hasAdvanced ? (
            <div className="relative p-8 sm:p-12 text-center overflow-hidden">
              {/* Fondo borroso simulado */}
              <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shadow-inner">
                  <Lock className="w-7 h-7" />
                </div>

                <div className="max-w-md space-y-1">
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    Esta función está disponible en el plan Business.
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Desbloquea el análisis de horarios con más tráfico, dispositivos utilizados (iPhone vs Android) y el desglose de clics individuales en cada botón.
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('/planes')}
                    className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 active:scale-98 transition-all cursor-pointer"
                  >
                    <span>Actualizar plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/planes/comparar')}
                    className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                  >
                    Comparar planes
                  </button>
                </div>
              </div>

              {/* Contenido detrás del blur simulado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-30 pointer-events-none select-none">
                <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <span>Gráfico de horas pico</span>
                </div>
                <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <span>Desglose por sistema operativo</span>
                </div>
              </div>
            </div>
          ) : (
            /* Vista para clientes con Business o Pro */
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Desglose por botón */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Clics por Botón de Acción
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">WhatsApp Directo</span>
                      <span className="font-mono font-black text-blue-600">482 (65%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }} />
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="font-bold">Instagram</span>
                      <span className="font-mono font-black text-pink-600">182 (24%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-pink-600 rounded-full" style={{ width: '24%' }} />
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="font-bold">Llamada Telefónica</span>
                      <span className="font-mono font-black text-emerald-600">81 (11%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '11%' }} />
                    </div>
                  </div>
                </div>

                {/* Dispositivos Frecuentes */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Dispositivos de tus Clientes
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="font-bold">Apple iPhone (iOS NFC)</span>
                      <span className="font-black text-slate-900 dark:text-white">68%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="font-bold">Android (Samsung, Xiaomi, etc.)</span>
                      <span className="font-black text-slate-900 dark:text-white">32%</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </ClientLayout>
  );
}
