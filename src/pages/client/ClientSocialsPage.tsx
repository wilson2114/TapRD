import React, { useState } from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { ClientLayout } from '../../components/client/ClientLayout';
import { ClientSocialLinks, ClientSettings } from '../../types/client';
import { 
  Save, 
  Check, 
  AlertCircle, 
  Instagram, 
  Facebook, 
  Globe, 
  Youtube, 
  Share2, 
  Eye, 
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface ClientSocialsPageProps {
  onNavigate: (path: string) => void;
}

export function ClientSocialsPage({ onNavigate }: ClientSocialsPageProps) {
  const { client, updateClient } = useClientAuth();

  const [socialLinks, setSocialLinks] = useState<ClientSocialLinks>(() => ({
    instagram: client?.socialLinks?.instagram || '',
    facebook: client?.socialLinks?.facebook || '',
    tiktok: client?.socialLinks?.tiktok || '',
    youtube: client?.socialLinks?.youtube || '',
    website: client?.socialLinks?.website || ''
  }));

  const [settings, setSettings] = useState<ClientSettings>(() => ({
    showPhone: client?.settings?.showPhone ?? true,
    showWhatsapp: client?.settings?.showWhatsapp ?? true,
    showInstagram: client?.settings?.showInstagram ?? true,
    showFacebook: client?.settings?.showFacebook ?? true,
    showTikTok: client?.settings?.showTikTok ?? true,
    showAddress: client?.settings?.showAddress ?? true,
    showHours: client?.settings?.showHours ?? true,
    showServices: client?.settings?.showServices ?? true,
    showReviews: client?.settings?.showReviews ?? true
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!client) return null;

  const handleSocialChange = (field: keyof ClientSocialLinks, value: string) => {
    // Si escribe @handle o url, mantenerlo limpio
    const clean = value.replace(/^@/, '').trim();
    setSocialLinks({
      ...socialLinks,
      [field]: clean
    });
  };

  const handleToggleSetting = (field: keyof ClientSettings) => {
    setSettings({
      ...settings,
      [field]: !settings[field]
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      const updated = await updateClient({
        socialLinks,
        settings
      });
      if (updated) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMessage('No se pudieron guardar las redes sociales.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error guardando en Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ClientLayout
      currentPath="/cliente/redes"
      onNavigate={onNavigate}
      title="Redes Sociales & Enlaces"
      subtitle="Configura los perfiles sociales y la visibilidad de los botones en tu tarjeta digital."
      actions={
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
          <span>{isSaving ? 'Guardando...' : 'Guardar enlaces'}</span>
        </button>
      }
    >
      <form onSubmit={handleSave} className="space-y-6">

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>¡Redes sociales y botones de acceso rápido actualizados en tu perfil!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Sección: Redes Sociales */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white">Perfiles Sociales</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ingresa el usuario o enlace a tus páginas para que los clientes te sigan al tocar la tarjeta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Instagram */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Instagram</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 font-mono text-xs">@</span>
                <input
                  type="text"
                  value={socialLinks.instagram || ''}
                  onChange={(e) => handleSocialChange('instagram', e.target.value)}
                  placeholder="tubarberia.rd"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Facebook */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Facebook className="w-4 h-4 text-blue-600" />
                <span>Facebook</span>
              </label>
              <input
                type="text"
                value={socialLinks.facebook || ''}
                onChange={(e) => handleSocialChange('facebook', e.target.value)}
                placeholder="Nombre de tu página o enlace"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 font-medium"
              />
            </div>

            {/* TikTok */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                <span>TikTok</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 font-mono text-xs">@</span>
                <input
                  type="text"
                  value={socialLinks.tiktok || ''}
                  onChange={(e) => handleSocialChange('tiktok', e.target.value)}
                  placeholder="tunegocio"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Sitio Web */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Sitio Web Oficial</span>
              </label>
              <input
                type="url"
                value={socialLinks.website || ''}
                onChange={(e) => handleSocialChange('website', e.target.value)}
                placeholder="https://tubarberia.com"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 font-medium"
              />
            </div>

          </div>
        </div>

        {/* Sección: Visibilidad de Botones */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white">Botones & Acciones Visibles</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Activa o desactiva qué secciones o botones flotantes verán los visitantes al tocar tu tarjeta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[
              { key: 'showWhatsapp', label: 'Botón de WhatsApp' },
              { key: 'showPhone', label: 'Botón de Llamada' },
              { key: 'showInstagram', label: 'Botón de Instagram' },
              { key: 'showFacebook', label: 'Botón de Facebook' },
              { key: 'showTikTok', label: 'Botón de TikTok' },
              { key: 'showAddress', label: 'Dirección & Ubicación' },
              { key: 'showHours', label: 'Horarios de Atención' },
              { key: 'showServices', label: 'Catálogo de Servicios' },
              { key: 'showReviews', label: 'Botón Reseñas de Google' },
            ].map((item) => {
              const active = settings[item.key as keyof ClientSettings];
              return (
                <div
                  key={item.key}
                  onClick={() => handleToggleSetting(item.key as keyof ClientSettings)}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between cursor-pointer transition-all select-none"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {item.label}
                  </span>
                  <div
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botón de Guardar en el pie */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto py-3 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Guardando cambios...' : 'Guardar enlaces y visibilidad'}</span>
          </button>
        </div>

      </form>
    </ClientLayout>
  );
}
