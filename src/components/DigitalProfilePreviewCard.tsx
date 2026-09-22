import React, { useState } from 'react';
import { 
  MessageCircle, 
  Instagram, 
  MapPin, 
  Scissors, 
  Star, 
  UserPlus, 
  Check, 
  ExternalLink, 
  Radio,
  Clock,
  Sparkles
} from 'lucide-react';
import { downloadVCard } from '../utils/vcard';
import { DEMO_PROFILES } from '../data/mockData';

interface DigitalProfilePreviewCardProps {
  onOpenFullDemo: (slug: string) => void;
}

export function DigitalProfilePreviewCard({ onOpenFullDemo }: DigitalProfilePreviewCardProps) {
  const profile = DEMO_PROFILES['barberia-wilson'];
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const handleSaveContact = () => {
    downloadVCard(profile);
    showNotification('¡Contacto de Barbería Wilson guardado en formato .vcf!');
  };

  return (
    <section id="perfil-digital-preview" className="py-16 sm:py-24 bg-[#f8fafc] dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/60">
            Vista Previa de la Experiencia
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Así experimentan tus clientes tu perfil digital
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Al acercar su teléfono, tu cliente ve inmediatamente una página ultra rápida y con diseño premium.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-5xl mx-auto">
          
          {/* Left: Explanatory Highlights */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800/60 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>DATOS DE DEMOSTRACIÓN REALISTAS</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">
              Diseñado exclusivamente para convertir visitantes en clientes fieles.
            </h3>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Olvídate de folletos impresos que terminan en la basura. Con TapRD, tu negocio ofrece una tarjeta viva que se guarda en la agenda del teléfono del cliente con un solo clic.
            </p>

            <div className="space-y-3.5 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Botón de WhatsApp directo con mensaje automático</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tus clientes inician la conversación con el servicio deseado ya preescrito.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Descarga de vCard nativa</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Agrega automáticamente nombre, teléfono y dirección a los contactos del móvil.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Servicios y precios transparentes en pesos dominicanos</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Acelera la decisión de compra sin fricción ni rodeos.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                id="btn-open-full-demo-barberia"
                onClick={() => onOpenFullDemo('barberia-wilson')}
                className="inline-flex items-center gap-2 px-5 py-3 font-bold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 rounded-xl text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Abrir demo interactivo en pantalla completa</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Phone Frame with Demo Profile */}
          <div className="lg:col-span-6 flex justify-center">
            
            {/* Smartphone Enclosure */}
            <div className="w-full max-w-[340px] bg-slate-950 rounded-[3rem] p-3 shadow-2xl border-4 border-slate-800 relative">
              {/* Dynamic Island Notch */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto mb-1.5 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-800" />
              </div>

              {/* Inner Phone Screen Content */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.3rem] overflow-hidden text-slate-900 dark:text-slate-100 shadow-inner max-h-[580px] overflow-y-auto relative text-left">
                
                {/* Visible Demo Badge */}
                <div className="bg-amber-500 text-slate-950 text-[10px] font-black tracking-widest text-center py-1 uppercase shadow-xs flex items-center justify-center gap-1 sticky top-0 z-30">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>PERFIL DEMO • TAPRD</span>
                </div>

                {/* Cover & Brand Header */}
                <div className="relative h-24 bg-gradient-to-r from-slate-900 via-zinc-900 to-blue-950 p-3 flex items-end">
                  <div className="absolute -bottom-7 left-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-base flex items-center justify-center border-2 border-white shadow-md">
                      BW
                    </div>
                  </div>
                </div>

                {/* Business Info Header */}
                <div className="pt-9 px-4 pb-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                      BARBERÍA WILSON
                    </h4>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full">
                      ✓ Verificado
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Barbería & Estilo
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                    Cortes clásicos y modernos para el caballero exigente en Piantini, Santo Domingo.
                  </p>
                </div>

                {/* Fast Action Buttons Grid */}
                <div className="px-4 py-2 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => showNotification('Simulación: Abriendo WhatsApp de Barbería Wilson (+1 809-555-0188)...')}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/60 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
                    <span className="text-[10px] font-bold">WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showNotification('Simulación: Abriendo Instagram (@barberiawilson.rd)...')}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-pink-50 dark:bg-pink-950/50 hover:bg-pink-100 dark:hover:bg-pink-900/60 text-pink-700 dark:text-pink-300 border border-pink-100 dark:border-pink-800/60 transition-colors"
                  >
                    <Instagram className="w-4 h-4 text-pink-600 dark:text-pink-400 mb-1" />
                    <span className="text-[10px] font-bold">Instagram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showNotification('Simulación: Abriendo navegación GPS en Santo Domingo...')}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/60 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
                    <span className="text-[10px] font-bold">Cómo llegar</span>
                  </button>
                </div>

                {/* Secondary Actions */}
                <div className="px-4 py-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => showNotification('Simulación: Redirigiendo a pantalla de reseñas en Google...')}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-100 dark:border-amber-800/60"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Reseñas (4.9 ★)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveContact}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Guardar contacto</span>
                  </button>
                </div>

                {/* Demo Services Section */}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Servicios DEMO
                    </p>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                      Precios en RD$
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Corte</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Corte clásico o degradado</p>
                      </div>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">
                        RD$500
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Barba</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Toalla caliente y perfilado</p>
                      </div>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">
                        RD$300
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Corte + Barba</p>
                          <span className="text-[8px] bg-blue-600 text-white px-1 py-0.2 rounded font-bold">COMBO</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Experiencia completa VIP</p>
                      </div>
                      <span className="text-xs font-black text-blue-700 dark:text-blue-300 font-mono">
                        RD$700
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notification toast */}
                {copiedNotification && (
                  <div className="mx-4 mb-3 p-2 bg-slate-900 dark:bg-slate-800 text-white text-[11px] rounded-lg text-center animate-in fade-in duration-200">
                    {copiedNotification}
                  </div>
                )}

                {/* Small footer */}
                <div className="py-2.5 text-center border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/60">
                  Perfil creado con <span className="font-bold text-blue-600 dark:text-blue-400">TapRD</span>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
