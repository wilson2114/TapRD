import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useClients } from '../../hooks/useClients';
import { toggleClientStatus } from '../../services/clientService';
import { PUBLIC_BASE_URL } from '../../config/constants';
import { Client, ClientStatus } from '../../types';
import { 
  Users, 
  Globe, 
  Clock, 
  ShieldAlert, 
  Plus, 
  ExternalLink, 
  Edit3, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Radio,
  Loader2
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
  onOpenPreview?: (client: Client) => void;
}

export function AdminDashboardPage({ onNavigate, onOpenPreview }: AdminDashboardPageProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { clients, loading, stats } = useClients();
  const recentClients = clients.slice(0, 5);

  const handleCopyLink = async (slug: string, id: string) => {
    const url = `${PUBLIC_BASE_URL}/p/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Activo
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pendiente
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Inactivo
          </span>
        );
    }
  };

  return (
    <AdminLayout
      currentPath="/admin"
      onNavigate={onNavigate}
      title="Dashboard General"
      subtitle="Resumen de actividad, métricas operativas y clientes registrados en TapRD."
      actions={
        <button
          type="button"
          onClick={() => onNavigate('/admin/clientes/nuevo')}
          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear cliente</span>
        </button>
      }
    >
      <div className="space-y-8">
        
        {/* ================================================================= */}
        {/* STATS CARDS (Section 4) */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* 1. Clientes Totales */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Total Clientes
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
                {stats.totalClients}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Registrados en Firestore</span>
              </p>
            </div>
          </div>

          {/* 2. Perfiles activos */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Perfiles activos
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight text-emerald-700 dark:text-emerald-400">
                {stats.activeCount}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                Activos y respondiendo a NFC
              </p>
            </div>
          </div>

          {/* 3. Perfiles pendientes */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-amber-300 dark:hover:border-amber-600 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Pendientes
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight text-amber-700 dark:text-amber-400">
                {stats.pendingCount}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                Por revisión o entrega de hardware
              </p>
            </div>
          </div>

          {/* 4. Perfiles inactivos */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Inactivos
              </span>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-black text-slate-700 dark:text-slate-300 tracking-tight">
                {stats.inactiveCount}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                Desactivados temporalmente
              </p>
            </div>
          </div>

        </div>

        {/* ================================================================= */}
        {/* RECENT CLIENTS (Section 4) */}
        {/* ================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Clientes recientes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Últimas altas y perfiles gestionados en la plataforma
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/admin/clientes')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              <span>Ver todos los clientes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3.5 px-6">Cliente & Negocio</th>
                  <th className="py-3.5 px-4">Producto</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {recentClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${client.avatarBgColor || 'bg-blue-600'} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                          {client.avatarInitials || client.businessName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white">{client.businessName}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{client.ownerName || 'Propietario'} • {client.category}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        <Radio className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        {client.productAssigned || 'Tap Card'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {getStatusBadge(client.status)}
                    </td>

                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(client.createdAt).toLocaleDateString('es-DO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(client.slug, client.id)}
                          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Copiar enlace del perfil"
                        >
                          {copiedId === client.id ? (
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onNavigate(`/admin/clientes/${client.id}/editar`)}
                          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                          title="Editar cliente"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onNavigate(`/p/${client.slug}`)}
                          className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                          title="Abrir perfil público"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800 p-4 space-y-4">
            {recentClients.map((client) => (
              <div key={client.id} className="pt-4 first:pt-0 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl ${client.avatarBgColor || 'bg-blue-600'} text-white font-black text-xs flex items-center justify-center shrink-0`}>
                      {client.avatarInitials || client.businessName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-sm">{client.businessName}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{client.ownerName} • {client.category}</p>
                    </div>
                  </div>
                  {getStatusBadge(client.status)}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <span>Producto: <strong className="text-slate-900 dark:text-white">{client.productAssigned || 'Tap Card'}</strong></span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {new Date(client.createdAt).toLocaleDateString('es-DO')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(client.slug, client.id)}
                    className="py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {copiedId === client.id ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate(`/admin/clientes/${client.id}/editar`)}
                    className="py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate(`/p/${client.slug}`)}
                    className="py-2 px-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Perfil</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Quick Help & NFC Programming Guidelines */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-white/10 px-2.5 py-0.5 rounded-full">
              Soporte Operativo
            </span>
            <h3 className="text-lg sm:text-xl font-black">
              ¿Listo para configurar un nuevo dispositivo NFC?
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Crea el perfil del cliente, genera su slug permanente y programa la URL directa en el chip NFC sin intermediarios.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/admin/clientes/nuevo')}
            className="py-3 px-5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-black text-xs shadow-md shrink-0 transition-all cursor-pointer"
          >
            Comenzar alta de cliente
          </button>
        </div>

      </div>
    </AdminLayout>
  );
}
