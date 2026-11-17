import React, { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  QuoteRequest,
  QuoteRequestStatus,
  subscribeQuoteRequests,
  updateQuoteRequest,
  deleteQuoteRequest
} from '../../services/quoteService';
import { getWhatsAppUrl } from '../../config/constants';
import {
  Inbox,
  Search,
  MessageCircle,
  Mail,
  Phone,
  Building2,
  MapPin,
  Package,
  Trash2,
  UserPlus,
  Check,
  Clock,
  Sparkles,
  StickyNote
} from 'lucide-react';

interface AdminQuotesPageProps {
  onNavigate: (path: string) => void;
}

const STATUS_META: Record<
  QuoteRequestStatus,
  { label: string; badgeClass: string }
> = {
  new: {
    label: 'Nueva',
    badgeClass:
      'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30'
  },
  contacted: {
    label: 'Contactada',
    badgeClass:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
  },
  quoted: {
    label: 'Cotizada',
    badgeClass:
      'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30'
  },
  closed: {
    label: 'Cerrada / Ganada',
    badgeClass:
      'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
  },
  discarded: {
    label: 'Descartada',
    badgeClass:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
  }
};

const SOURCE_LABELS: Record<QuoteRequest['source'], string> = {
  contact_form: 'Formulario Cotización',
  product_modal: 'Modal Producto',
  contact_page: 'Página Contacto'
};

export function AdminQuotesPage({ onNavigate }: AdminQuotesPageProps) {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | QuoteRequestStatus>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeQuoteRequests(
      (items) => {
        setQuotes(items);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const stats = useMemo(() => {
    return {
      total: quotes.length,
      newCount: quotes.filter((q) => q.status === 'new').length,
      contactedCount: quotes.filter((q) => q.status === 'contacted' || q.status === 'quoted').length,
      closedCount: quotes.filter((q) => q.status === 'closed').length
    };
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return quotes.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!q) return true;
      return [
        item.name,
        item.businessName,
        item.phone,
        item.email,
        item.city,
        item.productInterest,
        item.businessType,
        item.message
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
  }, [quotes, searchTerm, statusFilter]);

  const handleStatusChange = async (
    id: string,
    status: QuoteRequestStatus,
    storageCollection?: 'quoteRequests' | 'reports'
  ) => {
    setSavingId(id);
    try {
      await updateQuoteRequest(id, { status }, storageCollection);
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveNotes = async (
    id: string,
    storageCollection?: 'quoteRequests' | 'reports'
  ) => {
    setSavingId(id);
    try {
      await updateQuoteRequest(id, { adminNotes: notesDraft }, storageCollection);
      setEditingNotesId(null);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (
    id: string,
    storageCollection?: 'quoteRequests' | 'reports'
  ) => {
    setSavingId(id);
    try {
      await deleteQuoteRequest(id, storageCollection);
      setConfirmDeleteId(null);
    } finally {
      setSavingId(null);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return 'Reciente';
    try {
      return new Intl.DateTimeFormat('es-DO', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <AdminLayout
      currentPath="/admin/solicitudes"
      onNavigate={onNavigate}
      title="Solicitudes de Cotización"
      subtitle="Bandeja comercial en tiempo real de clientes potenciales"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-[11px] font-black uppercase tracking-wider mb-2">
              <Inbox className="w-3.5 h-3.5" />
              <span>Bandeja Comercial</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Solicitudes de Cotización
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gestiona en tiempo real todos los clientes potenciales que escriben desde la web.
            </p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total recibidas
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats.total}
            </p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-blue-900/60 p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Nuevas sin atender
            </p>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
              {stats.newCount}
            </p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/60 p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              En seguimiento
            </p>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
              {stats.contactedCount}
            </p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Cerradas / Ganadas
            </p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {stats.closedCount}
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, negocio, teléfono, correo o ciudad..."
              className="w-full min-h-[42px] pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['all', 'new', 'contacted', 'quoted', 'closed', 'discarded'] as const).map((key) => {
              const active = statusFilter === key;
              const label = key === 'all' ? 'Todas' : STATUS_META[key].label;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              No hay solicitudes para mostrar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Cuando un visitante envíe una cotización desde la página principal, el catálogo o contacto, aparecerá aquí al instante.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredQuotes.map((item) => {
              const meta = STATUS_META[item.status] || STATUS_META.new;
              const waMessage = `¡Hola ${item.name}! Te escribimos de TapRD sobre tu solicitud de cotización${
                item.productInterest ? ` (${item.productInterest})` : ''
              }.`;
              const waHref = item.phone ? getWhatsAppUrl(item.phone, waMessage) : '';

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4"
                >
                  {/* Top Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                          {item.name}
                        </h3>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {SOURCE_LABELS[item.source] || 'Web'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        {item.businessName && (
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {item.businessName}
                          </span>
                        )}
                        {item.businessType && (
                          <span className="inline-flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                            {item.businessType}
                          </span>
                        )}
                        {item.city && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {item.city}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Status Selector */}
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={item.status}
                        disabled={savingId === item.id}
                        onChange={(e) =>
                          handleStatusChange(
                            item.id,
                            e.target.value as QuoteRequestStatus,
                            item.storageCollection
                          )
                        }
                        className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer"
                      >
                        <option value="new">Nueva</option>
                        <option value="contacted">Contactada</option>
                        <option value="quoted">Cotizada</option>
                        <option value="closed">Cerrada / Ganada</option>
                        <option value="discarded">Descartada</option>
                      </select>
                    </div>
                  </div>

                  {/* Product & Contact Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <Package className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Producto</p>
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                          {item.productInterest || 'Tap Card'}
                          {item.quantity && item.quantity > 1 ? ` × ${item.quantity}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          Teléfono / WhatsApp
                        </p>
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                          {item.phone || 'No especificado'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Correo</p>
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                          {item.email || 'No especificado'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Need / Message */}
                  {(item.needOption || item.message) && (
                    <div className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950/40 rounded-xl p-3 border border-slate-200/70 dark:border-slate-800 space-y-1">
                      {item.needOption && (
                        <p className="font-bold text-blue-600 dark:text-blue-400">
                          Necesidad: {item.needOption}
                        </p>
                      )}
                      {item.message && <p className="leading-relaxed whitespace-pre-line">{item.message}</p>}
                    </div>
                  )}

                  {/* Admin Notes */}
                  {editingNotesId === item.id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder="Escribe notas internas de seguimiento..."
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(item.id, item.storageCollection)}
                          disabled={savingId === item.id}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Guardar nota
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNotesId(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    item.adminNotes && (
                      <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 rounded-xl px-3 py-2">
                        <span className="font-bold">Nota interna:</span> {item.adminNotes}
                      </p>
                    )
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      {waHref && (
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[36px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Responder WhatsApp</span>
                        </a>
                      )}
                      {item.email && (
                        <a
                          href={`mailto:${item.email}?subject=${encodeURIComponent('Cotización TapRD')}`}
                          className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Correo</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNotesId(item.id);
                          setNotesDraft(item.adminNotes || '');
                        }}
                        className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <StickyNote className="w-3.5 h-3.5" />
                        <span>{item.adminNotes ? 'Editar nota' : 'Agregar nota'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('/admin/clientes/nuevo')}
                        className="min-h-[36px] px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Crear cliente</span>
                      </button>
                    </div>

                    <div>
                      {confirmDeleteId === item.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.storageCollection)}
                            disabled={savingId === item.id}
                            className="min-h-[36px] px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="min-h-[36px] px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="min-h-[36px] px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      )}
                    </div>
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
