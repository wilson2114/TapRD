import React, { useState, useRef } from 'react';
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
  ArrowUp, 
  ArrowDown, 
  ImageIcon, 
  Upload, 
  X, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { canCreate, getLimit, getRemaining } from '../../services/limitService';
import { uploadServiceImage, deleteServiceImage } from '../../services/storageService';
import { validateServiceImageFile } from '../../services/imageSecurityService';

interface ClientServicesPageProps {
  onNavigate: (path: string) => void;
}

export function ClientServicesPage({ onNavigate }: ClientServicesPageProps) {
  const { client, updateClient } = useClientAuth();

  const [services, setServices] = useState<ClientService[]>(() => {
    const list = client?.services || [];
    return list.map((s, index) => ({
      ...s,
      currency: s.currency || 'DOP',
      active: s.active !== false,
      order: s.order ?? index + 1
    }));
  });

  // =========================================================================
  // ESTADOS PARA AGREGAR NUEVO SERVICIO
  // =========================================================================
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('RD$');
  const [newServiceCurrency, setNewServiceCurrency] = useState('DOP');
  const [newServiceAlt, setNewServiceAlt] = useState('');
  
  // Imagen nuevo servicio
  const [newServiceImageUrl, setNewServiceImageUrl] = useState<string | null>(null);
  const [newServiceThumbUrl, setNewServiceThumbUrl] = useState<string | null>(null);
  const [newServiceImagePath, setNewServiceImagePath] = useState<string | null>(null);
  const [newServiceImageInfo, setNewServiceImageInfo] = useState<{
    name: string;
    size: string;
    dimensions?: string;
  } | null>(null);
  const [newServiceImageUploading, setNewServiceImageUploading] = useState(false);
  const [newServiceImageProgress, setNewServiceImageProgress] = useState(0);
  const [newServiceImageStatusText, setNewServiceImageStatusText] = useState<string | null>(null);
  const [newServiceImageError, setNewServiceImageError] = useState<string | null>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  // =========================================================================
  // ESTADOS PARA EDICIÓN DE UN SERVICIO EXISTENTE
  // =========================================================================
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCurrency, setEditCurrency] = useState('DOP');
  const [editAlt, setEditAlt] = useState('');
  const [editActive, setEditActive] = useState(true);

  // Imagen del servicio en edición
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editThumbUrl, setEditThumbUrl] = useState<string | null>(null);
  const [editImagePath, setEditImagePath] = useState<string | null>(null);
  const [editImageInfo, setEditImageInfo] = useState<{
    name: string;
    size: string;
    dimensions?: string;
  } | null>(null);
  const [editImageUploading, setEditImageUploading] = useState(false);
  const [editImageProgress, setEditImageProgress] = useState(0);
  const [editImageStatusText, setEditImageStatusText] = useState<string | null>(null);
  const [editImageError, setEditImageError] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // =========================================================================
  // ESTADOS DE OPERACIÓN GLOBAL
  // =========================================================================
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!client) return null;

  const maxServices = getLimit(client, 'maxServices');
  const canAddMore = canCreate(client, 'maxServices', services.length);

  // =========================================================================
  // SUBIDA DE FOTOGRAFÍA - NUEVO SERVICIO
  // =========================================================================
  const handleSelectNewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewServiceImageError(null);
    setNewServiceImageStatusText('Validando firma digital (Magic Bytes)...');
    setNewServiceImageUploading(true);
    setNewServiceImageProgress(10);

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    try {
      // 1. Validación anticipada
      const val = await validateServiceImageFile(file, client.id);
      if (!val.valid) {
        setNewServiceImageError(val.error || 'Archivo rechazado por seguridad.');
        setNewServiceImageUploading(false);
        if (newFileInputRef.current) newFileInputRef.current.value = '';
        return;
      }

      setNewServiceImageInfo({
        name: file.name,
        size: sizeFormatted,
        dimensions: val.dimensions ? `${val.dimensions.width}x${val.dimensions.height} px` : undefined
      });

      setNewServiceImageStatusText('Reprocesando y eliminando metadatos EXIF...');
      const tempId = `srv-${Date.now()}`;

      // 2. Reprocesamiento y carga
      const result = await uploadServiceImage(
        file,
        client.id,
        tempId,
        (percent) => {
          setNewServiceImageProgress(percent);
          if (percent > 30 && percent < 60) {
            setNewServiceImageStatusText('Optimizando a formato WebP limpio...');
          } else if (percent >= 60 && percent < 95) {
            setNewServiceImageStatusText('Generando miniatura de 400px...');
          }
        }
      );

      setNewServiceImageUrl(result.imageUrl);
      setNewServiceThumbUrl(result.thumbnailUrl);
      setNewServiceImagePath(result.imagePath);
      setNewServiceImageStatusText('¡Imagen aprobada y optimizada para tu catálogo!');
    } catch (err: any) {
      setNewServiceImageError(err.message || 'Error procesando la fotografía.');
      setNewServiceImageUrl(null);
      setNewServiceThumbUrl(null);
      setNewServiceImagePath(null);
    } finally {
      setNewServiceImageUploading(false);
    }
  };

  const handleRemoveNewImage = () => {
    if (newServiceImagePath) {
      deleteServiceImage(newServiceImagePath, newServiceThumbUrl || undefined);
    }
    setNewServiceImageUrl(null);
    setNewServiceThumbUrl(null);
    setNewServiceImagePath(null);
    setNewServiceImageInfo(null);
    setNewServiceImageError(null);
    setNewServiceImageStatusText(null);
    if (newFileInputRef.current) newFileInputRef.current.value = '';
  };

  // =========================================================================
  // SUBIDA DE FOTOGRAFÍA - SERVICIO EN EDICIÓN
  // =========================================================================
  const handleSelectEditImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingServiceId) return;

    setEditImageError(null);
    setEditImageStatusText('Validando firma digital (Magic Bytes)...');
    setEditImageUploading(true);
    setEditImageProgress(10);

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    try {
      const val = await validateServiceImageFile(file, client.id);
      if (!val.valid) {
        setEditImageError(val.error || 'Archivo rechazado por seguridad.');
        setEditImageUploading(false);
        if (editFileInputRef.current) editFileInputRef.current.value = '';
        return;
      }

      setEditImageInfo({
        name: file.name,
        size: sizeFormatted,
        dimensions: val.dimensions ? `${val.dimensions.width}x${val.dimensions.height} px` : undefined
      });

      setEditImageStatusText('Reprocesando y eliminando metadatos EXIF...');

      // Subir nueva foto
      const result = await uploadServiceImage(
        file,
        client.id,
        editingServiceId,
        (percent) => {
          setEditImageProgress(percent);
          if (percent > 30 && percent < 60) {
            setEditImageStatusText('Optimizando a formato WebP limpio...');
          } else if (percent >= 60 && percent < 95) {
            setEditImageStatusText('Generando miniatura de 400px...');
          }
        }
      );

      // Si existía una imagen anterior diferente, limpiarla de Storage
      if (editImagePath && editImagePath !== result.imagePath) {
        deleteServiceImage(editImagePath, editThumbUrl || undefined);
      }

      setEditImageUrl(result.imageUrl);
      setEditThumbUrl(result.thumbnailUrl);
      setEditImagePath(result.imagePath);
      setEditImageStatusText('¡Fotografía aprobada y optimizada!');
    } catch (err: any) {
      setEditImageError(err.message || 'Error procesando la fotografía.');
    } finally {
      setEditImageUploading(false);
    }
  };

  const handleRemoveEditImage = () => {
    if (editImagePath) {
      deleteServiceImage(editImagePath, editThumbUrl || undefined);
    }
    setEditImageUrl(null);
    setEditThumbUrl(null);
    setEditImagePath(null);
    setEditImageInfo(null);
    setEditImageError(null);
    setEditImageStatusText(null);
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  // =========================================================================
  // CREACIÓN DE UN SERVICIO
  // =========================================================================
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    if (!canAddMore) {
      setErrorMessage(`Has alcanzado el límite de ${maxServices} servicios de tu plan.`);
      return;
    }

    if (newServiceImageUploading) {
      setErrorMessage('Por favor espera a que la fotografía termine de procesarse.');
      return;
    }

    const nextOrder = services.length + 1;

    const newService: ClientService = {
      id: `srv-${Date.now()}`,
      name: newServiceName.trim(),
      description: newServiceDesc.trim() || 'Servicio profesional de calidad garantizada.',
      price: newServicePrice.trim() || 'A consultar',
      currency: newServiceCurrency || 'DOP',
      imageUrl: newServiceImageUrl || undefined,
      thumbnailUrl: newServiceThumbUrl || undefined,
      imagePath: newServiceImagePath || undefined,
      imageAlt: newServiceAlt.trim() || `${newServiceName.trim()} - ${client.businessName}`,
      imageStatus: newServiceImageUrl ? 'approved' : undefined,
      active: true,
      order: nextOrder
    };

    setServices([...services, newService]);

    // Limpiar formulario
    setNewServiceName('');
    setNewServiceDesc('');
    setNewServicePrice('RD$');
    setNewServiceCurrency('DOP');
    setNewServiceAlt('');
    setNewServiceImageUrl(null);
    setNewServiceThumbUrl(null);
    setNewServiceImagePath(null);
    setNewServiceImageInfo(null);
    setNewServiceImageError(null);
    setNewServiceImageStatusText(null);
    if (newFileInputRef.current) newFileInputRef.current.value = '';
  };

  // =========================================================================
  // ELIMINACIÓN DE UN SERVICIO
  // =========================================================================
  const handleDeleteService = async (service: ClientService) => {
    if (service.imagePath || service.thumbnailUrl) {
      deleteServiceImage(service.imagePath, service.thumbnailUrl);
    }

    const updated = services
      .filter(s => s.id !== service.id)
      .map((s, idx) => ({ ...s, order: idx + 1 }));

    setServices(updated);

    if (editingServiceId === service.id) {
      setEditingServiceId(null);
    }
  };

  // =========================================================================
  // EDICIÓN DE UN SERVICIO
  // =========================================================================
  const handleStartEdit = (service: ClientService) => {
    setEditingServiceId(service.id);
    setEditName(service.name);
    setEditDesc(service.description);
    setEditPrice(service.price);
    setEditCurrency(service.currency || 'DOP');
    setEditAlt(service.imageAlt || '');
    setEditActive(service.active !== false);
    setEditImageUrl(service.imageUrl || null);
    setEditThumbUrl(service.thumbnailUrl || null);
    setEditImagePath(service.imagePath || null);
    setEditImageInfo(null);
    setEditImageError(null);
    setEditImageStatusText(service.imageUrl ? 'Fotografía aprobada actualmente activa' : null);
  };

  const handleSaveEdit = () => {
    if (!editingServiceId) return;

    if (editImageUploading) {
      setErrorMessage('Por favor espera a que la imagen termine de procesarse.');
      return;
    }

    setServices(services.map(s => {
      if (s.id === editingServiceId) {
        return {
          ...s,
          name: editName.trim() || s.name,
          description: editDesc.trim(),
          price: editPrice.trim() || s.price,
          currency: editCurrency || 'DOP',
          imageUrl: editImageUrl || undefined,
          thumbnailUrl: editThumbUrl || undefined,
          imagePath: editImagePath || undefined,
          imageAlt: editAlt.trim() || `${editName.trim()} - ${client.businessName}`,
          imageStatus: editImageUrl ? 'approved' : undefined,
          active: editActive
        };
      }
      return s;
    }));

    setEditingServiceId(null);
  };

  // =========================================================================
  // REORDENAMIENTO DE SERVICIOS
  // =========================================================================
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newArr = [...services];
    const temp = newArr[index - 1];
    newArr[index - 1] = newArr[index];
    newArr[index] = temp;
    // Recalcular orden secuencial
    setServices(newArr.map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  const handleMoveDown = (index: number) => {
    if (index === services.length - 1) return;
    const newArr = [...services];
    const temp = newArr[index + 1];
    newArr[index + 1] = newArr[index];
    newArr[index] = temp;
    setServices(newArr.map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  // =========================================================================
  // ACTIVAR / DESACTIVAR SERVICIO (TOGGLE RÁPIDO)
  // =========================================================================
  const handleToggleActive = (serviceId: string) => {
    setServices(services.map(s => {
      if (s.id === serviceId) {
        return { ...s, active: !s.active };
      }
      return s;
    }));
  };

  // =========================================================================
  // GUARDAR EN BASE DE DATOS
  // =========================================================================
  const handleSaveAll = async () => {
    setErrorMessage(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      const sanitizedServices = services.map((s, idx) => ({
        ...s,
        order: idx + 1,
        active: s.active !== false
      }));

      const updated = await updateClient({
        services: sanitizedServices
      });

      if (updated) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMessage('No se pudieron guardar los servicios en la base de datos.');
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
      subtitle="Gestiona tus servicios, asigna fotografías verificadas y organízalos para tu tarjeta NFC."
      actions={
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveAll}
          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
          <span>{isSaving ? 'Guardando...' : 'Guardar catálogo'}</span>
        </button>
      }
    >
      <div className="space-y-6">

        {/* Mensaje de Éxito */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>¡Catálogo de servicios y fotografías guardados con éxito! Ya se reflejan en tu tarjeta NFC y perfil público.</span>
          </div>
        )}

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECCIÓN 1: FORMULARIO PARA AGREGAR NUEVO SERVICIO               */}
        {/* ================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">Agregar un Nuevo Servicio</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Ingresa los datos del servicio y sube una fotografía opcional.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                !canAddMore 
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800' 
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {services.length} / {maxServices === null ? '∞' : maxServices} servicios
              </span>
            </div>
          </div>

          {!canAddMore ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200">
                    Has alcanzado el límite de servicios de tu plan.
                  </p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                    Tu plan actual permite hasta {maxServices} servicios. Mejora tu plan para agregar más.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('/planes')}
                className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-xs transition-all cursor-pointer"
              >
                <span>Ver planes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddService} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                
                {/* Nombre */}
                <div className="sm:col-span-6 space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nombre del servicio <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="Ej. Corte Clásico + Barba"
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium"
                  />
                </div>

                {/* Moneda */}
                <div className="sm:col-span-2 space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Moneda</label>
                  <select
                    value={newServiceCurrency}
                    onChange={(e) => setNewServiceCurrency(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-bold"
                  >
                    <option value="DOP">DOP (RD$)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>

                {/* Precio */}
                <div className="sm:col-span-4 space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Precio estimado</label>
                  <input
                    type="text"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    placeholder="RD$ 600"
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium font-mono"
                  />
                </div>

                {/* Descripción */}
                <div className="sm:col-span-12 space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Descripción detallada (opcional)</label>
                  <input
                    type="text"
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                    placeholder="Ej. Incluye lavado capilar, perfilado con navaja caliente y toalla mentolada."
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium"
                  />
                </div>

                {/* Texto Alternativo (imageAlt para accesibilidad) */}
                <div className="sm:col-span-12 space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Texto alternativo de la foto (imageAlt para accesibilidad)
                  </label>
                  <input
                    type="text"
                    value={newServiceAlt}
                    onChange={(e) => setNewServiceAlt(e.target.value)}
                    placeholder="Ej. Corte de cabello degradado moderno con toalla"
                    className="w-full py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Subida de Fotografía Segura */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Fotografía del Servicio (Opcional)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                    JPG, PNG o WEBP (Máx. 5 MB)
                  </span>
                </div>

                {/* Input nativo oculto por seguridad */}
                <input
                  ref={newFileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleSelectNewImage}
                  className="hidden"
                  id="new-service-file-input"
                />

                {newServiceImageUrl ? (
                  /* Vista Previa de la Fotografía Aprobada */
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700 shrink-0">
                        <img
                          src={newServiceThumbUrl || newServiceImageUrl}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Fotografía aprobada y optimizada</span>
                        </div>
                        {newServiceImageInfo && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {newServiceImageInfo.name} • {newServiceImageInfo.size} {newServiceImageInfo.dimensions ? `• ${newServiceImageInfo.dimensions}` : ''}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 font-mono">Formato WebP limpio sin metadatos EXIF</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => newFileInputRef.current?.click()}
                        className="py-1.5 px-3 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                      >
                        Reemplazar
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveNewImage}
                        className="py-1.5 px-2.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Selector de Archivo */
                  <div
                    onClick={() => newFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-white/50 dark:bg-slate-800/40 hover:bg-blue-50/30"
                  >
                    <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1.5" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Haz clic para seleccionar una fotografía desde tu dispositivo
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Seguridad activa: se analizan Magic Bytes y se eliminan metadatos antes de publicar.
                    </p>
                  </div>
                )}

                {/* Barra de progreso / Estado de procesamiento */}
                {newServiceImageUploading && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{newServiceImageStatusText || 'Procesando imagen...'}</span>
                      </span>
                      <span>{newServiceImageProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-200"
                        style={{ width: `${newServiceImageProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error de imagen seguro */}
                {newServiceImageError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{newServiceImageError}</span>
                  </div>
                )}
              </div>

              {/* Botón Añadir a la lista */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={newServiceImageUploading}
                  className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-white text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>Añadir a la lista de servicios</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ================================================================= */}
        {/* SECCIÓN 2: LISTA DE SERVICIOS ACTUALES (CON FOTOS, ORDEN Y ESTADO) */}
        {/* ================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Servicios del Catálogo ({services.length})
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Puedes cambiar el orden con las flechas, activar o pausar servicios, y editar sus fotos.
              </p>
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
              {services.map((srv, index) => {
                const isEditing = editingServiceId === srv.id;

                if (isEditing) {
                  return (
                    /* PANEL DE EDICIÓN EN LÍNEA */
                    <div key={srv.id} className="py-4 space-y-4 bg-blue-50/40 dark:bg-blue-950/30 p-4 sm:p-5 rounded-2xl my-2 border border-blue-200/70 dark:border-blue-900/50">
                      <div className="flex items-center justify-between border-b border-blue-100 dark:border-blue-900/60 pb-2">
                        <span className="text-xs font-black text-blue-900 dark:text-blue-300">
                          Editando Servicio #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingServiceId(null)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6 space-y-1 text-left">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Nombre</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Nombre del servicio"
                            className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1 text-left">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Moneda</label>
                          <select
                            value={editCurrency}
                            onChange={(e) => setEditCurrency(e.target.value)}
                            className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                          >
                            <option value="DOP">DOP</option>
                            <option value="USD">USD</option>
                          </select>
                        </div>

                        <div className="sm:col-span-4 space-y-1 text-left">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Precio</label>
                          <input
                            type="text"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            placeholder="Precio (ej. RD$ 500)"
                            className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                          />
                        </div>

                        <div className="sm:col-span-12 space-y-1 text-left">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Descripción</label>
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Descripción"
                            className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="sm:col-span-12 space-y-1 text-left">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Texto alternativo foto (imageAlt)</label>
                          <input
                            type="text"
                            value={editAlt}
                            onChange={(e) => setEditAlt(e.target.value)}
                            placeholder="Texto descriptivo para accesibilidad"
                            className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        {/* Switch de Activo / Pausado */}
                        <div className="sm:col-span-12 flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditActive(!editActive)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              editActive
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {editActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{editActive ? 'Servicio Activo (Visible en perfil)' : 'Servicio Pausado (Oculto)'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Fotografía en Modo Edición */}
                      <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                            Fotografía del servicio
                          </span>
                          <span className="text-[10px] text-slate-500">JPG, PNG o WEBP</span>
                        </div>

                        <input
                          ref={editFileInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                          onChange={handleSelectEditImage}
                          className="hidden"
                          id={`edit-file-input-${srv.id}`}
                        />

                        {editImageUrl ? (
                          <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2.5">
                              <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700 shrink-0">
                                <img
                                  src={editThumbUrl || editImageUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-left space-y-0.5">
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Foto aprobada</span>
                                </span>
                                {editImageInfo && (
                                  <p className="text-[10px] text-slate-500">
                                    {editImageInfo.name} ({editImageInfo.size})
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => editFileInputRef.current?.click()}
                                className="py-1 px-2.5 rounded-lg text-[11px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
                              >
                                Cambiar
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveEditImage}
                                className="py-1 px-2 rounded-lg text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                Quitar foto
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => editFileInputRef.current?.click()}
                            className="w-full py-2.5 px-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-blue-500 flex items-center justify-center gap-2 hover:bg-blue-50/30 transition-colors cursor-pointer"
                          >
                            <Upload className="w-4 h-4 text-slate-400" />
                            <span>Subir fotografía verificada para este servicio</span>
                          </button>
                        )}

                        {editImageUploading && (
                          <div className="text-[11px] font-bold text-blue-600 flex items-center gap-1.5 pt-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{editImageStatusText || 'Procesando...'} ({editImageProgress}%)</span>
                          </div>
                        )}

                        {editImageError && (
                          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                            <span>{editImageError}</span>
                          </div>
                        )}
                      </div>

                      {/* Botones de acción de edición */}
                      <div className="flex items-center justify-end gap-2 pt-1">
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
                          className="py-1.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                        >
                          Listo
                        </button>
                      </div>
                    </div>
                  );
                }

                // VISTA NORMAL DEL SERVICIO
                return (
                  <div key={srv.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                    <div className="flex items-start gap-3 min-w-0">
                      
                      {/* Fotografía de servicio o placeholder */}
                      {srv.imageUrl ? (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0 relative">
                          <img
                            src={srv.thumbnailUrl || srv.imageUrl}
                            alt={srv.imageAlt || srv.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/80 flex items-center justify-center text-slate-400 shrink-0">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {srv.name}
                          </span>
                          
                          {/* Badge de Precio */}
                          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md font-mono">
                            {srv.currency && srv.currency !== 'DOP' && !srv.price.includes(srv.currency) ? `${srv.currency} ` : ''}
                            {srv.price}
                          </span>

                          {/* Badge de Estado Activo / Pausado */}
                          {srv.active === false && (
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                              Pausado
                            </span>
                          )}

                          {/* Badge de Foto aprobada */}
                          {srv.imageUrl && (
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Foto WebP</span>
                            </span>
                          )}
                        </div>

                        {srv.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
                            {srv.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Acciones: Orden, Activar/Desactivar, Editar y Eliminar */}
                    <div className="flex items-center gap-1 sm:gap-1.5 self-end sm:self-center shrink-0">
                      
                      {/* Reordenar: Subir */}
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer"
                        title="Subir de posición"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Reordenar: Bajar */}
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === services.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer"
                        title="Bajar de posición"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Activo / Pausado */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(srv.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          srv.active !== false
                            ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={srv.active !== false ? 'Pausar servicio' : 'Activar servicio'}
                      >
                        {srv.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      {/* Editar */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(srv)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        title="Editar servicio y foto"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Eliminar */}
                      <button
                        type="button"
                        onClick={() => handleDeleteService(srv)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors cursor-pointer"
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
            className="w-full sm:w-auto py-3 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Guardando catálogo...' : 'Guardar todos los cambios'}</span>
          </button>
        </div>

      </div>
    </ClientLayout>
  );
}
