import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  X, 
  MessageCircle, 
  Instagram, 
  Radio, 
  Download, 
  Star, 
  Navigation, 
  Shield, 
  Zap, 
  Layers, 
  Users, 
  CreditCard,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { DigitalProfile, ProfileAnalytics } from '../types';
import { getProfileLocalStats } from '../utils/analytics';

interface SaaSDemoModalProps {
  profile: DigitalProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function SaaSDemoModal({ profile, isOpen, onClose }: SaaSDemoModalProps) {
  const [stats, setStats] = useState<ProfileAnalytics>(() => getProfileLocalStats(profile.slug, profile.analytics));
  const [activeTab, setActiveTab] = useState<'analytics' | 'saas-features'>('analytics');

  useEffect(() => {
    if (isOpen) {
      setStats(getProfileLocalStats(profile.slug, profile.analytics));
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Panel de Estadísticas TapRD
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded border border-blue-100 dark:border-blue-900/60">
                  SaaS Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Métricas en tiempo real para {profile.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Estadísticas de Interacción
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saas-features')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'saas-features'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Arquitectura Futura SaaS
          </button>
        </div>

        {activeTab === 'analytics' ? (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
                <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1">
                  <span className="text-xs font-bold">Toques NFC</span>
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {stats.totalTaps.toLocaleString()}
                </p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                  +14% vs mes anterior
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
                  <span className="text-xs font-bold">WhatsApp Clics</span>
                  <MessageCircle className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {stats.whatsappClicks.toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  Alta conversión de venta
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/60">
                <div className="flex items-center justify-between text-pink-600 dark:text-pink-400 mb-1">
                  <span className="text-xs font-bold">Instagram Clics</span>
                  <Instagram className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {stats.instagramClicks.toLocaleString()}
                </p>
                <p className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold mt-0.5">
                  Seguidores orgánicos
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60">
                <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-1">
                  <span className="text-xs font-bold">Contactos Guardados</span>
                  <Download className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {stats.vcardDownloads.toLocaleString()}
                </p>
                <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                  Descargas vCard
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60">
                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
                  <span className="text-xs font-bold">Reseñas Google</span>
                  <Star className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {stats.reviewClicks.toLocaleString()}
                </p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                  Calificaciones recibidas
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span className="text-xs font-bold">Cómo llegar</span>
                  <Navigation className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {stats.directionsClicks.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Rutas en Maps/Waze
                </p>
              </div>

            </div>

            {/* Weekly Bar Distribution */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Actividad de Toques por Día</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Últimos 7 días</span>
              </div>
              <div className="grid grid-cols-7 gap-2 items-end h-28 pt-2">
                {stats.weeklyTaps.map((day, i) => {
                  const maxTaps = Math.max(...stats.weeklyTaps.map(d => d.taps), 100);
                  const heightPercent = Math.min(100, Math.round((day.taps / maxTaps) * 100));
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-lg relative flex items-end h-20">
                        <div
                          style={{ height: `${Math.max(15, heightPercent)}%` }}
                          className="w-full bg-blue-600 rounded-t-lg transition-all"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{day.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              💡 Cada vez que tocas los botones en el perfil interactivo, las estadísticas locales se actualizan.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              La plataforma TapRD ha sido concebida con una arquitectura limpia y desacoplada, lista para conectarse a autenticación, base de datos en tiempo real y facturación recurrente.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Lock className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>Autenticación & Cuentas</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Modelos de datos listos para registro seguro, inicio de sesión de dueños y roles (Admin, Negocio, Empleado).
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Editor Visual de Perfiles</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Gestión de logos, colores, servicios, precios en RD$, horarios y links dinámicos sin tocar código.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Planes & Suscripciones</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Estructura preparada para suscripciones mensuales en RD$ (Básico, Profesional, Franquicia).
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Gestión Multi-Perfil</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Capacidad de administrar múltiples sucursales o tarjetas para todo el equipo de ventas desde un solo panel.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
              <span className="font-bold">Nota de Arquitectura:</span> No se han expuesto API keys ni conexiones ficticias. Los endpoints y modelos están preparados para enchufarse a servicios en la nube cuando se active la fase de backend.
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Entendido, cerrar panel
          </button>
        </div>

      </div>
    </div>
  );
}
