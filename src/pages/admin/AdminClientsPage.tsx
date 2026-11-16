import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { getClients, toggleClientStatus, deleteClient, subscribeToClients, fetchClients } from '../../services/clientService';
import { createActivationToken } from '../../services/activationService';
import { batchVerifyClientAccessStatuses, reactivateClientAccess } from '../../services/clientAccessService';
import { PUBLIC_BASE_URL, getWhatsAppUrl } from '../../config/constants';
import { Client, ClientStatus } from '../../types';
import { getProvinceByCity, normalizeLocationText } from '../../data/dominicanCities';
import { ProtectedImage } from '../../components/ProtectedImage';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Edit3, 
  Copy, 
  Check, 
  Eye, 
  Power, 
  Trash2, 
  MessageCircle, 
  Building, 
  MapPin, 
  Radio, 
  MoreVertical,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Send,
  Mail,
  X,
  Share2,
  Loader2,
  AlertTriangle,
  Download,
  QrCode,
  Users
} from 'lucide-react';
import { ClientAccessStatus } from '../../types/client';
import { auth, isFirebaseConfigured } from '../../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

interface AdminClientsPageProps {
  onNavigate: (path: string) => void;
  onOpenPreview?: (client: Client) => void;
}

export function AdminClientsPage({ onNavigate, onOpenPreview }: AdminClientsPageProps) {
  const [clients, setClients] = useState<Client[]>(() => getClients());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'views' | 'name'>('recent');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [invitationModalData, setInvitationModalData] = useState<{ client: Client; activationUrl: string } | null>(null);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [isTogglingStatusId, setIsTogglingStatusId] = useState<string | null>(null);
  const [isDeletingClientId, setIsDeletingClientId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    cancelText?: string;
    variant: 'danger' | 'warning' | 'primary' | 'success';
    onConfirm: () => void;
  } | null>(null);

  // Suscribirse a actualizaciones en tiempo real desde Firestore
  useEffect(() => {
    const unsubscribe = subscribeToClients((updatedClients) => {
      setClients(updatedClients);
    });
    return () => unsubscribe();
  }, []);

  // Verificar automáticamente en segundo plano el estado real de los clientes con acceso
  useEffect(() => {
    if (clients.length > 0) {
      const pendingClients = clients.filter(
        c => c.accessStatus === 'pending' || (!c.accessStatus && c.userId)
      );
      if (pendingClients.length > 0) {
        batchVerifyClientAccessStatuses(
          pendingClients.map(c => ({
            id: c.id,
            userId: c.userId,
            email: c.email,
            clientEmail: c.clientEmail,
            accessStatus: c.accessStatus
          }))
        ).then(statuses => {
          if (statuses && Object.keys(statuses).length > 0) {
            setClients(prev => prev.map(cl => {
              const newStat = statuses[cl.id];
              if (newStat && newStat !== cl.accessStatus) {
                return { ...cl, accessStatus: newStat };
              }
              return cl;
            }));
          }
        }).catch(console.warn);
      }
    }
  }, [clients.length]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleQuickActivateAccess = async (client: Client) => {
    try {
      const res = await reactivateClientAccess(client.id);
      if (res.success) {
        setClients(prev => prev.map(c => c.id === client.id ? { ...c, accessStatus: 'active' } : c));
        showToast(`Acceso de "${client.businessName}" activado correctamente como Activo`);
      } else {
        showToast(res.message || 'No se pudo activar el acceso', 'error');
      }
    } catch {
      showToast('Error al activar el acceso del cliente', 'error');
    }
  };

  const refreshClients = async () => {
    setIsRefreshing(true);
    try {
      const updated = await fetchClients();
      const pendingClients = updated.filter(
        c => c.accessStatus === 'pending' || (!c.accessStatus && c.userId)
      );
      if (pendingClients.length > 0) {
        const statuses = await batchVerifyClientAccessStatuses(
          pendingClients.map(c => ({
            id: c.id,
            userId: c.userId,
            email: c.email,
            clientEmail: c.clientEmail,
            accessStatus: c.accessStatus
          }))
        );
        const merged = updated.map(cl => {
          if (statuses && statuses[cl.id] && statuses[cl.id] !== cl.accessStatus) {
            return { ...cl, accessStatus: statuses[cl.id] };
          }
          return cl;
        });
        setClients(merged);
      } else {
        setClients(updated);
      }
      showToast('Clientes sincronizados con Firestore', 'info');
    } catch {
      showToast('Error al sincronizar con Firestore', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyLink = async (slug: string, id: string) => {
    const url = `${PUBLIC_BASE_URL}/p/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      showToast('Enlace copiado al portapapeles');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleToggleStatus = (client: Client) => {
    const isCurrentlyActive = client.status === 'active';
    const newStatus: ClientStatus = isCurrentlyActive ? 'inactive' : 'active';

    setConfirmDialog({
      isOpen: true,
      title: isCurrentlyActive ? '¿Pausar perfil público?' : '¿Activar perfil público?',
      description: isCurrentlyActive
        ? `¿Quieres pausar el perfil público de "${client.businessName}"? El perfil público (/p/${client.slug}) no estará visible para visitantes ni escaneos NFC, pero todos sus datos permanecerán guardados en Firestore y podrás reactivarlo en cualquier momento.`
        : `¿Quieres volver a activar el perfil público de "${client.businessName}"? Su catálogo (/p/${client.slug}) y tarjeta NFC volverán a estar activos y accesibles de inmediato.`,
      confirmText: isCurrentlyActive ? 'Pausar perfil' : 'Activar perfil',
      variant: isCurrentlyActive ? 'warning' : 'success',
      onConfirm: async () => {
        setConfirmDialog(null);
        setIsTogglingStatusId(client.id);

        // Actualización optimista inmediata en estado local
        setClients(prev =>
          prev.map(c =>
            c.id === client.id
              ? {
                  ...c,
                  status: newStatus,
                  active: newStatus === 'active',
                  profileStatus: newStatus === 'inactive' ? 'inactive' : 'active'
                }
              : c
          )
        );

        try {
          await toggleClientStatus(client.id, newStatus);
          showToast(
            newStatus === 'inactive'
              ? `Perfil de "${client.businessName}" pausado correctamente.`
              : `Perfil de "${client.businessName}" activado correctamente.`
          );
        } catch (err: any) {
          console.error('Error al actualizar estado del cliente:', err);
          showToast(err.message || 'Error al actualizar el estado del perfil', 'error');
          // Revertir estado previo si falló
          setClients(prev =>
            prev.map(c =>
              c.id === client.id
                ? { ...c, status: client.status, active: client.active, profileStatus: client.profileStatus }
                : c
            )
          );
        } finally {
          setIsTogglingStatusId(null);
        }
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '¿Eliminar cliente?',
      description: `¿Estás seguro de que deseas eliminar permanentemente a "${name}"? Esta acción se sincronizará con Firestore.`,
      confirmText: 'Eliminar cliente',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        setIsDeletingClientId(id);
        try {
          const deleted = await deleteClient(id, true);
          if (deleted) {
            setClients(prev => prev.filter(c => c.id !== id));
            showToast('Cliente eliminado correctamente');
          } else {
            showToast('No se pudo eliminar el cliente', 'error');
          }
        } catch (err: any) {
          showToast(err.message || 'Error al eliminar el cliente', 'error');
        } finally {
          setIsDeletingClientId(null);
        }
      }
    });
  };

  const handleInviteClient = async (client: Client) => {
    const targetEmail = client.email || client.clientEmail;
    if (!targetEmail) {
      showToast('Este cliente no tiene correo registrado. Haz clic en Editar para agregarlo.', 'error');
      return;
    }

    setIsGeneratingInvite(true);
    try {
      const act = await createActivationToken(
        client.id, 
        targetEmail, 
        client.businessName, 
        client.ownerName || client.name
      );
      setInvitationModalData({
        client,
        activationUrl: act.activationUrl
      });
    } catch (err: any) {
      showToast(err.message || 'No se pudo generar la invitación', 'error');
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleCopyInviteLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedInvite(true);
      showToast('Enlace de activación copiado al portapapeles');
      setTimeout(() => setCopiedInvite(false), 2000);
    } catch {}
  };

  const handleSendFirebaseReset = async (emailToSend: string) => {
    if (!emailToSend) {
      showToast('No hay correo registrado para este cliente', 'error');
      return;
    }
    try {
      if (isFirebaseConfigured && auth) {
        await sendPasswordResetEmail(auth, emailToSend.trim());
        showToast(`Correo de Firebase enviado a ${emailToSend.trim()}`, 'success');
      } else {
        showToast('Firebase no está configurado en este entorno', 'error');
      }
    } catch (err: any) {
      console.error('Error enviando reset de Firebase:', err);
      showToast(err.message || 'Error al enviar el correo de Firebase', 'error');
    }
  };

  // Contadores rápidos
  const activeCount = clients.filter((c) => c.status === 'active').length;
  const pendingCount = clients.filter((c) => c.status === 'pending').length;
  const inactiveCount = clients.filter((c) => c.status === 'inactive').length;
  const totalViewsCount = clients.reduce((sum, c) => sum + (c.viewsCount || 0), 0);

  // Filtrar y ordenar clientes
  const normalizedTerm = normalizeLocationText(searchTerm);
  const filteredClients = clients
    .filter((c) => {
      const prov = getProvinceByCity(c.city || '') || '';
      const matchesSearch =
        !normalizedTerm ||
        normalizeLocationText(c.businessName || '').includes(normalizedTerm) ||
        normalizeLocationText(c.ownerName || '').includes(normalizedTerm) ||
        normalizeLocationText(c.city || '').includes(normalizedTerm) ||
        normalizeLocationText(prov).includes(normalizedTerm) ||
        normalizeLocationText(c.category || '').includes(normalizedTerm) ||
        normalizeLocationText(c.slug || '').includes(normalizedTerm) ||
        normalizeLocationText(c.email || c.clientEmail || '').includes(normalizedTerm) ||
        (c.whatsapp || '').toLowerCase().includes(normalizedTerm);

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'views') {
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      }
      if (sortBy === 'name') {
        return (a.businessName || '').localeCompare(b.businessName || '', 'es');
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const handleExportCsv = () => {
    const headers = ['Negocio', 'Propietario', 'Correo', 'WhatsApp', 'Ciudad', 'Categoria', 'Plan', 'Estado', 'Vistas', 'Enlace Publico'];
    const escapeCell = (val: string | number | undefined) =>
      `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = filteredClients.map((c) => [
      escapeCell(c.businessName),
      escapeCell(c.ownerName),
      escapeCell(c.clientEmail || c.email),
      escapeCell(c.whatsapp),
      escapeCell(c.city),
      escapeCell(c.category),
      escapeCell(c.plan || 'starter'),
      escapeCell(c.status),
      escapeCell(c.viewsCount || 0),
      escapeCell(`${PUBLIC_BASE_URL}/p/${c.slug}`)
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes-taprd-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exportados ${filteredClients.length} clientes a CSV`);
  };

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Activo
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pendiente
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Inactivo
          </span>
        );
    }
  };

  // Badges de Estado de Acceso del Cliente (Regla 19)
  const getAccessStatusBadge = (accessStatus?: ClientAccessStatus, userId?: string) => {
    const status = accessStatus || (userId ? 'active' : 'none');
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" title="Cliente con acceso activo al portal">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Activo
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800" title="Pendiente de activación por el cliente">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pendiente
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800" title="Acceso al portal suspendido">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Suspendido
          </span>
        );
      case 'none':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700" title="Sin cuenta de acceso al portal">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Sin acceso
          </span>
        );
    }
  };

  return (
    <AdminLayout
      currentPath="/admin/clientes"
      onNavigate={onNavigate}
      title="Gestión de Clientes"
      subtitle="Administra la base de clientes de TapRD, sus perfiles digitales y estado de publicación."
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredClients.length === 0}
            title="Exportar lista filtrada a CSV"
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={refreshClients}
            disabled={isRefreshing}
            title="Sincronizar con Cloud Firestore"
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/admin/clientes/nuevo')}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear cliente</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 border transition-all animate-in fade-in ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
              : toastMessage.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              : 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
          }`}>
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />}
            {toastMessage.type === 'info' && <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 animate-spin" />}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* KPI Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-500/15 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>Total Clientes</span>
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-black text-slate-950 dark:text-white mt-1">{clients.length}</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/15 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>Perfiles Activos</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(inactiveCount > 0 && pendingCount === 0 ? 'inactive' : 'pending')}
            className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'pending' || statusFilter === 'inactive'
                ? 'bg-white dark:bg-slate-900 border-amber-500 ring-2 ring-amber-500/15 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>Pausados / Pend.</span>
              <Power className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{inactiveCount + pendingCount}</p>
          </button>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>Vistas Totales</span>
              <Eye className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-slate-950 dark:text-white mt-1">{totalViewsCount.toLocaleString('es-DO')}</p>
          </div>
        </div>
        
        {/* Search, Filter & Sort Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar negocio, correo, WhatsApp, slug..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between lg:justify-end gap-2.5">
            {/* Filter Tabs (Todos, Activos, Pendientes, Inactivos) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: `Todos (${clients.length})` },
                { id: 'active', label: `Activos (${activeCount})` },
                { id: 'pending', label: `Pendientes (${pendingCount})` },
                { id: 'inactive', label: `Inactivos (${inactiveCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === tab.id
                      ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'views' | 'name')}
              aria-label="Ordenar clientes"
              className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="recent">Más recientes</option>
              <option value="views">Más vistas</option>
              <option value="name">Nombre (A–Z)</option>
            </select>
          </div>

        </div>

        {/* Clients Table / Cards List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          
          {filteredClients.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Building className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No se encontraron clientes con los filtros aplicados.
              </p>
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="py-3.5 px-6">Negocio / Propietario</th>
                      <th className="py-3.5 px-4">Categoría & Ciudad</th>
                      <th className="py-3.5 px-4">WhatsApp</th>
                      <th className="py-3.5 px-4">Perfil</th>
                      <th className="py-3.5 px-4">Acceso Portal</th>
                      <th className="py-3.5 px-4">Plan & Vistas</th>
                      <th className="py-3.5 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        
                        {/* Logo / Initials & Names */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {client.logo ? (
                              <ProtectedImage
                                wrapperClassName="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                                src={client.logo}
                                alt={client.businessName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-xl ${client.avatarBgColor || 'bg-blue-600'} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                                {client.avatarInitials || client.businessName.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-black text-slate-900 dark:text-white text-sm">{client.businessName}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{client.ownerName || 'Sin propietario registrado'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category & City */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">{client.category}</span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                            {client.city}
                          </span>
                        </td>

                        {/* WhatsApp */}
                        <td className="py-4 px-4">
                          <a
                            href={getWhatsAppUrl(client.whatsapp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
                            <span>{client.whatsapp}</span>
                          </a>
                        </td>

                        {/* Estado Perfil */}
                        <td className="py-4 px-4">
                          {getStatusBadge(client.status)}
                        </td>

                        {/* Estado Acceso Portal (Regla 19) */}
                        <td className="py-4 px-4">
                          {getAccessStatusBadge(client.accessStatus, client.userId)}
                        </td>

                        {/* Plan & Vistas */}
                        <td className="py-4 px-4">
                          <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {client.plan || 'starter'}
                          </span>
                          <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                            {(client.viewsCount || 0).toLocaleString('es-DO')} vistas
                          </span>
                        </td>

                        {/* Acciones: Ver, Editar, Copiar enlace, QR, Reenviar invitación, Desactivar, Eliminar */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(client.slug, client.id)}
                              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Copiar enlace público (/p/slug)"
                            >
                              {copiedId === client.id ? (
                                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => window.open(`${PUBLIC_BASE_URL}/q/${client.slug}`, '_blank')}
                              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 transition-colors cursor-pointer"
                              title="Probar QR Dinámico (/q/slug)"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              disabled={isGeneratingInvite}
                              onClick={() => handleInviteClient(client)}
                              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                              title="Reenviar invitación de activación al cliente"
                            >
                              <Send className="w-4 h-4" />
                            </button>

                            {client.accessStatus === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleQuickActivateAccess(client)}
                                className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                                title="Activar cuenta del cliente y marcar como Activo"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                            )}

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

                            <button
                              type="button"
                              disabled={isTogglingStatusId === client.id || isDeletingClientId === client.id}
                              onClick={() => handleToggleStatus(client)}
                              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                client.status === 'active'
                                  ? 'text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60'
                                  : 'text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                              }`}
                              title={client.status === 'active' ? 'Pausar perfil público' : 'Activar perfil público'}
                            >
                              {isTogglingStatusId === client.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                              ) : (
                                <Power className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={isDeletingClientId === client.id || isTogglingStatusId === client.id}
                              onClick={() => handleDelete(client.id, client.businessName)}
                              className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                              title="Eliminar cliente permanentemente"
                            >
                              {isDeletingClientId === client.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (Responsive) */}
              <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800 p-4 space-y-4">
                {filteredClients.map((client) => (
                  <div key={client.id} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl ${client.avatarBgColor || 'bg-blue-600'} text-white font-black text-xs flex items-center justify-center shrink-0`}>
                          {client.avatarInitials || client.businessName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight">{client.businessName}</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{client.ownerName} • {client.category}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {getStatusBadge(client.status)}
                        {getAccessStatusBadge(client.accessStatus, client.userId)}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/70 dark:border-slate-700 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>Ciudad:</span>
                        <strong className="text-slate-800 dark:text-white">{client.city}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>WhatsApp:</span>
                        <a href={getWhatsAppUrl(client.whatsapp)} target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-600 dark:text-emerald-400 underline">
                          {client.whatsapp}
                        </a>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>Email:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{client.email || client.clientEmail || 'No asignado'}</span>
                      </div>
                    </div>

                    {/* Quick Mobile Action Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(client.slug, client.id)}
                        className="min-h-[44px] py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Copiar enlace"
                      >
                        {copiedId === client.id ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>Copiar link</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInviteClient(client)}
                        className="min-h-[44px] py-2 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Reenviar invitación de activación"
                      >
                        <Send className="w-4 h-4" />
                        <span>Invitar</span>
                      </button>

                      {client.accessStatus === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleQuickActivateAccess(client)}
                          className="min-h-[44px] py-2 px-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Activar acceso al portal del cliente"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Activar</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onNavigate(`/admin/clientes/${client.id}/editar`)}
                        className="min-h-[44px] py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onNavigate(`/p/${client.slug}`)}
                        className="min-h-[44px] py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Ver perfil</span>
                      </button>

                      <button
                        type="button"
                        disabled={isTogglingStatusId === client.id}
                        onClick={() => handleToggleStatus(client)}
                        className={`col-span-2 sm:col-span-1 min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                          client.status === 'active'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                        }`}
                      >
                        {isTogglingStatusId === client.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )}
                        <span>{client.status === 'active' ? 'Pausar perfil' : 'Activar perfil'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

      </div>

      {/* Modal de Invitación y Activación */}
      {invitationModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">Enlace de Activación Generado</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Para {invitationModalData.client.businessName} ({invitationModalData.client.email || invitationModalData.client.clientEmail})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInvitationModalData(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Comparte este enlace seguro con el cliente. Le permitirá configurar su contraseña personal y acceder de inmediato a su portal:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={invitationModalData.activationUrl}
                  className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopyInviteLink(invitationModalData.activationUrl)}
                  className="shrink-0 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedInvite ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedInvite ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a
                href={getWhatsAppUrl(
                  invitationModalData.client.whatsapp,
                  `¡Hola ${invitationModalData.client.ownerName || invitationModalData.client.businessName}! Tu perfil en TapRD ha sido preparado. Por favor activa tu cuenta y crea tu contraseña en el siguiente enlace:\n\n${invitationModalData.activationUrl}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar por WhatsApp</span>
              </a>

              <a
                href={`mailto:${invitationModalData.client.email || invitationModalData.client.clientEmail}?subject=Invitación para activar tu portal en TapRD&body=Hola ${invitationModalData.client.ownerName || invitationModalData.client.businessName},%0D%0A%0D%0ATu cuenta en TapRD está lista. Accede al siguiente enlace para crear tu contraseña:%0D%0A${encodeURIComponent(invitationModalData.activationUrl)}`}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Enviar por Correo</span>
              </a>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleSendFirebaseReset(invitationModalData.client.email || invitationModalData.client.clientEmail || '')}
                className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Enviar correo directo de Firebase Auth</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Confirmación Sin Bloqueo de iFrame */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmDialog.variant === 'danger'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    : confirmDialog.variant === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                {confirmDialog.variant === 'warning' || confirmDialog.variant === 'danger' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {confirmDialog.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {confirmDialog.cancelText || 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
                  confirmDialog.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : confirmDialog.variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <span>{confirmDialog.confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
