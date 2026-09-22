import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useClients } from '../../hooks/useClients';
import { PUBLIC_BASE_URL } from '../../config/constants';
import { Client } from '../../types';
import { ProfileQRCode } from '../../components/admin/ProfileQRCode';
import { Globe, ExternalLink, QrCode, Copy, Check, Radio, Edit3, Sparkles, Loader2 } from 'lucide-react';

interface AdminProfilesPageProps {
  onNavigate: (path: string) => void;
}

export function AdminProfilesPage({ onNavigate }: AdminProfilesPageProps) {
  const { clients, loading } = useClients();
  const [selectedClientForQr, setSelectedClientForQr] = useState<Client | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopy = async (slug: string) => {
    const url = `${PUBLIC_BASE_URL}/p/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {}
  };

  return (
    <AdminLayout
      currentPath="/admin/perfiles"
      onNavigate={onNavigate}
      title="Perfiles Digitales & NFC"
      subtitle="Visualiza el estado de los perfiles públicos, enlaces permanentes y códigos QR para hardware."
    >
      <div className="space-y-6">
        
        {/* Top Info Banner */}
        <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
          <Radio className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <strong className="block font-black mb-0.5">Arquitectura de Enlaces NFC Permanentes:</strong>
            Cada cliente cuenta con un slug estático que nunca cambia. Puedes modificar en cualquier momento
            sus redes, servicios y teléfonos desde el panel sin necesidad de reprogramar físicamente las tarjetas o placas NFC ya entregadas.
          </div>
        </div>

        {/* Loading state */}
        {loading && clients.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-bold text-slate-500">Cargando perfiles desde Firestore...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && clients.length === 0 && (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
            <Globe className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">No hay perfiles registrados</h3>
              <p className="text-xs text-slate-500">Crea tu primer cliente para generar su perfil digital NFC.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/admin/clientes/nuevo')}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              Crear cliente
            </button>
          </div>
        )}

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => {
            const url = `${PUBLIC_BASE_URL}/p/${client.slug}`;
            return (
              <div
                key={client.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${client.avatarBgColor || 'bg-blue-600'} text-white font-black text-xs flex items-center justify-center shrink-0`}>
                        {client.avatarInitials || client.businessName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm">{client.businessName}</h3>
                        <p className="text-[11px] text-slate-500 font-medium">{client.category} • {client.city}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      client.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : client.status === 'pending'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {client.status}
                    </span>
                  </div>

                  {/* Slug & NFC URL badge */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Ruta del perfil NFC:
                    </span>
                    <p className="font-mono text-xs font-bold text-blue-600 truncate">
                      /p/{client.slug}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(client.slug)}
                    className="py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 hover:bg-slate-50 cursor-pointer"
                  >
                    {copiedSlug === client.slug ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedClientForQr(client)}
                    className="py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-slate-800 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate(`/p/${client.slug}`)}
                    className="py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-100 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* QR Modal */}
      {selectedClientForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative">
            <button
              type="button"
              onClick={() => setSelectedClientForQr(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              ✕
            </button>
            <ProfileQRCode
              url={`${PUBLIC_BASE_URL}/p/${selectedClientForQr.slug}`}
              businessName={selectedClientForQr.businessName}
              onOpenProfile={() => onNavigate(`/p/${selectedClientForQr.slug}`)}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
