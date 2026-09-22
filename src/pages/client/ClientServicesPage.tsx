import React, { useState } from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { ClientLayout } from '../../components/client/ClientLayout';
import { ClientService } from '../../types/client';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Check, 
  AlertCircle, 
  Briefcase, 
  DollarSign, 
  Layers,
  X
} from 'lucide-react';

interface ClientServicesPageProps {
  onNavigate: (path: string) => void;
}

export function ClientServicesPage({ onNavigate }: ClientServicesPageProps) {
  const { client, updateClient } = useClientAuth();

  const [services, setServices] = useState<ClientService[]>(() => client?.services || []);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('RD$');
  
  // Edición de un servicio existente
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Status
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!client) return null;

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const newService: ClientService = {
      id: `srv-${Date.now()}`,
      name: newServiceName.trim(),
      description: newServiceDesc.trim() || 'Servicio profesional de calidad garantizada.',
      price: newServicePrice.trim() || 'A consultar'
    };

    setServices([...services, newService]);
    setNewServiceName('');
    setNewServiceDesc('');
    setNewServicePrice('RD$');
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleStartEdit = (service: ClientService) => {
    setEditingServiceId(service.id);
    setEditName(service.name);
    setEditDesc(service.description);
    setEditPrice(service.price);
  };

  const handleSaveEdit = () => {
    if (!editingServiceId) return;
    setServices(services.map(s => {
      if (s.id === editingServiceId) {
        return {
          ...s,
          name: editName.trim() || s.name,
          description: editDesc.trim(),
          price: editPrice.trim() || s.price
        };
      }
      return s;
    }));
    setEditingServiceId(null);
  };

  const handleSaveAll = async () => {
    setErrorMessage(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      const updated = await updateClient({
        services
      });
      if (updated) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMessage('No se pudieron guardar los servicios.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error guardando en la base de datos.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ClientLayout
      currentPath="/cliente/servicios"
      onNavigate={onNavigate}
      title="Catálogo de Servicios & Precios"
      subtitle="Define los tratamientos, productos o servicios que verán tus clientes en tu perfil NFC."
      actions={
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveAll}
          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
          <span>{isSaving ? 'Guardando...' : 'Guardar catálogo'}</span>
        </button>
      }
    >
      <div className="space-y-6">

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¡Servicios actualizados correctamente y visibles en tu tarjeta NFC!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario para Agregar Nuevo Servicio */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">Agregar un Nuevo Servicio</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Ingresa el título, descripción breve y precio aproximado.</p>
            </div>
          </div>

          <form onSubmit={handleAddService} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            <div className="sm:col-span-5 space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nombre del servicio *</label>
              <input
                type="text"
                required
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="Ej. Corte Clásico + Barba"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="sm:col-span-4 space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Precio</label>
              <input
                type="text"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                placeholder="RD$ 600"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium font-mono"
              />
            </div>

            <div className="sm:col-span-3 flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-transparent dark:border-slate-700"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Añadir a la lista</span>
              </button>
            </div>

            <div className="sm:col-span-12 space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Descripción detallada (opcional)</label>
              <input
                type="text"
                value={newServiceDesc}
                onChange={(e) => setNewServiceDesc(e.target.value)}
                placeholder="Lavado incluido, perfilado de navaja y toalla caliente..."
                className="w-full py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </form>
        </div>

        {/* Lista de Servicios Actuales */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">Servicios Activos ({services.length})</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tus clientes podrán ver estos servicios con sus precios en tu tarjeta.</p>
            </div>
          </div>

          {services.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <Briefcase className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-bold">No tienes servicios agregados aún.</p>
              <p className="text-[11px]">Agrega tu primer servicio arriba para comenzar.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {services.map((srv) => {
                const isEditing = editingServiceId === srv.id;

                if (isEditing) {
                  return (
                    <div key={srv.id} className="py-4 space-y-3 bg-blue-50/40 dark:bg-blue-950/30 p-4 rounded-2xl my-2 border border-blue-200/60 dark:border-blue-900/40">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nombre del servicio"
                          className="py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                        />
                        <input
                          type="text"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          placeholder="Precio (ej. RD$ 500)"
                          className="py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Descripción"
                            className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingServiceId(null)}
                          className="py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="py-1.5 px-3.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer"
                        >
                          Listo
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={srv.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{srv.name}</span>
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md font-mono">
                          {srv.price}
                        </span>
                      </div>
                      {srv.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md">{srv.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(srv)}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        title="Editar servicio"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(srv.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title="Eliminar servicio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botón de Guardar en el pie */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAll}
            className="w-full sm:w-auto py-3 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Guardando catálogo...' : 'Guardar todos los cambios'}</span>
          </button>
        </div>

      </div>
    </ClientLayout>
  );
}
