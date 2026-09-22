import React, { useState, useEffect } from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { ClientLayout } from '../../components/client/ClientLayout';
import { uploadClientLogo, deleteClientLogo, validateLogoFile } from '../../services/storageService';
import { ClientProfile } from '../../components/ClientProfile';
import { 
  Save, 
  Eye, 
  Upload, 
  Trash2, 
  Check, 
  AlertCircle, 
  Loader2, 
  X, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  Globe, 
  Sparkles,
  Star,
  Sun,
  Moon,
  Monitor,
  Palette
} from 'lucide-react';

interface ClientProfilePageProps {
  onNavigate: (path: string) => void;
}

const CATEGORIES = [
  'Barbería',
  'Restaurante',
  'Inmobiliaria',
  'Salón de belleza',
  'Consultorio Médico',
  'Estudio Legal',
  'Cafetería',
  'Taller & Mecánica',
  'Servicios Profesionales',
  'Comercio / Tienda',
  'Otro'
];

const CITIES = [
  'Santo Domingo',
  'Santiago de los Caballeros',
  'La Romana',
  'Punta Cana / Bávaro',
  'Puerto Plata',
  'San Cristóbal',
  'San Pedro de Macorís',
  'Higüey',
  'La Vega',
  'Bonao',
  'Las Terrenas / Samaná'
];

export function ClientProfilePage({ onNavigate }: ClientProfilePageProps) {
  const { client, updateClient } = useClientAuth();

  // Form states
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [address, setAddress] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [googleReviewsUrl, setGoogleReviewsUrl] = useState('');
  const [logo, setLogo] = useState<string | undefined>(undefined);
  const [profileTheme, setProfileTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Logo upload state
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [logoError, setLogoError] = useState<string | null>(null);

  useEffect(() => {
    if (client) {
      setBusinessName(client.businessName || '');
      setOwnerName(client.ownerName || '');
      setCategory(client.category || CATEGORIES[0]);
      setDescription(client.description || '');
      setPhone(client.phone || '');
      setWhatsapp(client.whatsapp || '');
      setEmail(client.email || '');
      setCity(client.city || CITIES[0]);
      setAddress(client.address || '');
      setMapsUrl(client.mapsUrl || '');
      setGoogleReviewsUrl(client.googleReviewsUrl || '');
      setLogo(client.logoUrl || client.logo);
      setProfileTheme(client.profileTheme || 'auto');
    }
  }, [client]);

  if (!client) return null;

  // Subida de logo
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateLogoFile(file);
    if (!validation.valid) {
      setLogoError(validation.error || 'Archivo inválido');
      return;
    }

    setLogoError(null);
    setIsUploadingLogo(true);
    setLogoProgress(10);

    try {
      const downloadUrl = await uploadClientLogo(file, client.id, (progress) => {
        setLogoProgress(progress);
      });
      setLogo(downloadUrl);
    } catch (err: any) {
      console.error('Error al subir logo:', err);
      setLogoError(err.message || 'No se pudo subir la imagen.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (logo && window.confirm('¿Deseas eliminar este logo?')) {
      try {
        await deleteClientLogo(logo);
      } catch {}
      setLogo(undefined);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaveSuccess(false);

    if (!businessName.trim()) {
      setErrorMessage('El nombre del negocio es obligatorio.');
      return;
    }

    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    if (!cleanWhatsapp || cleanWhatsapp.length < 8) {
      setErrorMessage('Ingresa un número de WhatsApp válido para que tus clientes puedan escribirte.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateClient({
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        category,
        description: description.trim(),
        phone: phone.trim(),
        whatsapp: cleanWhatsapp,
        email: email.trim(),
        city,
        address: address.trim(),
        mapsUrl: mapsUrl.trim(),
        googleReviewsUrl: googleReviewsUrl.trim(),
        logo,
        logoUrl: logo,
        profileTheme
      });

      if (updated) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMessage('No se pudieron guardar los cambios. Intenta nuevamente.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error guardando en la base de datos.');
    } finally {
      setIsSaving(false);
    }
  };

  const previewClient = {
    ...client,
    businessName: businessName || client.businessName,
    ownerName: ownerName || client.ownerName,
    category: category || client.category,
    description: description || client.description,
    phone: phone || client.phone,
    whatsapp: whatsapp || client.whatsapp,
    email: email || client.email,
    city: city || client.city,
    address: address || client.address,
    logoUrl: logo,
    logo: logo,
    mapsUrl,
    googleReviewsUrl,
    profileTheme
  };

  return (
    <ClientLayout
      currentPath="/cliente/perfil"
      onNavigate={onNavigate}
      title="Información de tu Negocio"
      subtitle="Actualiza tus datos de contacto, dirección y presentación para tu tarjeta NFC."
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vista previa</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-75"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Guardando...' : 'Guardar cambios'}</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSave} className="space-y-6">

        {/* Notificaciones */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>¡Tu información ha sido actualizada y ya se encuentra visible en tu tarjeta TapRD!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Sección: Logo & Marca */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 transition-colors">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white">Logo del Negocio</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sube una imagen cuadrada (PNG, JPG o WebP) para que tus clientes identifiquen tu marca.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {logo ? (
              <div className="relative group">
                <img
                  src={logo}
                  alt={businessName}
                  className="w-24 h-24 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-md"
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 cursor-pointer transition-transform group-hover:scale-110"
                  title="Eliminar logo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 text-xs font-bold">
                <Store className="w-6 h-6 mb-1 text-slate-400" />
                <span>Sin logo</span>
              </div>
            )}

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <label className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{logo ? 'Cambiar imagen del logo' : 'Subir logo desde este dispositivo'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400">
                Recomendado: 500x500 píxeles, máximo 5MB.
              </p>

              {isUploadingLogo && (
                <div className="space-y-1">
                  <div className="h-1.5 w-48 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${logoProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Subiendo {logoProgress}%</span>
                </div>
              )}

              {logoError && (
                <p className="text-xs text-rose-600 font-bold">{logoError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Datos Generales */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 transition-colors">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white">Datos Principales</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Nombre del establecimiento, categoría y descripción comercial.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nombre del Negocio *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ej. Barbería Wilson"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nombre del Propietario / Gerente</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Ej. Wilson Abelino"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Categoría Comercial</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ciudad</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium"
              >
                {CITIES.map((ci) => (
                  <option key={ci} value={ci}>{ci}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Descripción o Eslogan</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve reseña sobre lo que ofreces, tu experiencia y lo que te distingue..."
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium resize-none"
              />
            </div>

          </div>
        </div>

        {/* Sección: Contacto Directo & Ubicación */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 transition-colors">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white">Contacto Directo & Ubicación</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Canales para que tus clientes te escriban o visiten tu local.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp Principal *</span>
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ej. 18095550100"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium font-mono"
              />
              <p className="text-[10px] text-slate-400">Incluye código de país (ej. 1 para RD/USA).</p>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Teléfono de Llamadas</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. (809) 555-0100"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium font-mono"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Correo Electrónico Comercial</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@tubarberia.com"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>Enlace para Reseñas de Google</span>
              </label>
              <input
                type="url"
                value={googleReviewsUrl}
                onChange={(e) => setGoogleReviewsUrl(e.target.value)}
                placeholder="https://g.page/r/..."
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="sm:col-span-2 space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Dirección Física</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej. Av. Winston Churchill #1092, Piantini, Santo Domingo"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="sm:col-span-2 space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Enlace de Google Maps (Ruta GPS)</span>
              </label>
              <input
                type="url"
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium"
              />
            </div>

          </div>
        </div>

        {/* Sección: Tema del Perfil Digital */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5 transition-colors">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-black text-slate-900 dark:text-white">Tema y Apariencia de tu Perfil NFC</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Elige cómo deseas que tus clientes visualicen tu perfil digital cuando escaneen tu tarjeta NFC o abran tu enlace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Opción 1: Claro */}
            <button
              id="theme-opt-light"
              type="button"
              onClick={() => setProfileTheme('light')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                profileTheme === 'light'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-600/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${profileTheme === 'light' ? 'bg-amber-100 text-amber-700' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'} border border-slate-200/80 dark:border-slate-700 shadow-2xs`}>
                  <Sun className="w-5 h-5" />
                </div>
                {profileTheme === 'light' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs" />
                )}
              </div>
              <div>
                <span className="text-sm font-black text-slate-900 dark:text-white block">
                  Modo Claro
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight block mt-0.5">
                  Luminoso, limpio y formal con fondo claro estándar.
                </span>
              </div>
            </button>

            {/* Opción 2: Oscuro */}
            <button
              id="theme-opt-dark"
              type="button"
              onClick={() => setProfileTheme('dark')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                profileTheme === 'dark'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-600/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${profileTheme === 'dark' ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'} border border-slate-200/80 dark:border-slate-700 shadow-2xs`}>
                  <Moon className="w-5 h-5" />
                </div>
                {profileTheme === 'dark' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs" />
                )}
              </div>
              <div>
                <span className="text-sm font-black text-slate-900 dark:text-white block">
                  Modo Oscuro (Midnight)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight block mt-0.5">
                  Elegante con contrastes nocturnos y fondo oscuro de lujo.
                </span>
              </div>
            </button>

            {/* Opción 3: Automático */}
            <button
              id="theme-opt-auto"
              type="button"
              onClick={() => setProfileTheme('auto')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                profileTheme === 'auto'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-600/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${profileTheme === 'auto' ? 'bg-blue-100 text-blue-700' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'} border border-slate-200/80 dark:border-slate-700 shadow-2xs`}>
                  <Monitor className="w-5 h-5" />
                </div>
                {profileTheme === 'auto' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs" />
                )}
              </div>
              <div>
                <span className="text-sm font-black text-slate-900 dark:text-white block">
                  Automático / Sistema
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight block mt-0.5">
                  Se sincroniza con el modo del teléfono de cada usuario.
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Botón de Guardar en el pie */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto py-3 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Guardando en la nube...' : 'Guardar y actualizar perfil'}</span>
          </button>
        </div>

      </form>

      {/* Modal Vista Previa */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-100 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-700">
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-black">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Vista Previa: {businessName || 'Tu Negocio'}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ClientProfile
                client={previewClient}
                isPreview={true}
                onNavigateHome={() => setPreviewOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

    </ClientLayout>
  );
}
