import React, { useState } from 'react';
import { Product } from '../types';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { ProductMockup } from '../components/ProductMockup';
import { ProductRequestModal } from '../components/ProductRequestModal';
import { createProductWhatsAppUrl } from '../config/constants';
import { 
  CheckCircle2, 
  ArrowLeft, 
  MessageCircle, 
  Send, 
  Smartphone, 
  Radio, 
  Shield, 
  Truck, 
  Sparkles, 
  Users, 
  Check, 
  ExternalLink,
  ChevronRight,
  Phone,
  UserPlus
} from 'lucide-react';

interface ProductDetailPageProps {
  product: Product;
  onNavigate: (path: string) => void;
  onOpenDemo?: (slug?: string) => void;
}

export function ProductDetailPage({ product, onNavigate, onOpenDemo }: ProductDetailPageProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleWhatsApp = () => {
    const url = createProductWhatsAppUrl(product.name, {
      quantity: '1',
      city: 'Santo Domingo'
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors">
      {/* SEO Metadata */}
      <SEOHead
        title={product.seoTitle || `${product.name} | Soluciones NFC TapRD`}
        description={product.seoDescription || product.shortDescription}
      />

      {/* Navbar */}
      <Navbar
        currentPath={product.route}
        onNavigate={onNavigate}
        onOpenContact={() => setModalOpen(true)}
      />

      <main className="flex-1 py-6 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb: Inicio > Productos > [Nombre] */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6 sm:mb-8" aria-label="Breadcrumb">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Inicio
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
            <button
              type="button"
              onClick={() => onNavigate('/productos')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Productos
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
            <span className="text-slate-900 dark:text-white font-bold">{product.name}</span>
          </nav>

          {/* Hero Section: Title, Subtitle, Large Mockup & CTAs */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-10 mb-10 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Product Info Column */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/60">
                    {product.category}
                  </span>
                  {product.badge && (
                    <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                      {product.badge}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
                  {product.name}
                </h1>

                <p className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 leading-snug">
                  {product.tagline}
                </p>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {product.description}
                </p>

                {/* Price Display */}
                <div className="pt-2 pb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Precio de inversión
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
                    {product.price}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pago único. Incluye chip NFC configurado + perfil digital sin mensualidades forzosas.
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="flex-1 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Solicitar ahora</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer shrink-0"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Solicitar por WhatsApp</span>
                  </button>
                </div>

                {/* Micro Guarantees */}
                <div className="pt-3 flex flex-wrap gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Envíos a todo el país</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Garantía de chip 12 meses</span>
                  </div>
                </div>

              </div>

              {/* Large Visual Mockup Column */}
              <div className="lg:col-span-5 flex items-center justify-center bg-gradient-to-b from-slate-50/80 to-blue-50/40 dark:from-slate-800/80 dark:to-slate-900/60 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800">
                <ProductMockup type={product.iconType} size="lg" />
              </div>

            </div>
          </div>

          {/* Section: "¿Qué incluye?" */}
          <section className="mb-12">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/60">
                Detalles del Producto
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                ¿Qué incluye?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Todo lo necesario para que tu negocio o profesión empiece a conectar al instante.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {product.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-start gap-3 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{feature}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Listo para usar desde el primer día con soporte de TapRD.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: "¿Cómo funciona?" */}
          <section className="mb-12 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/60">
                Experiencia Simple
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                ¿Cómo funciona?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Tres pasos inmediatos sin fricción para tus clientes o prospectos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Paso 1 */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/70 dark:border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg mx-auto flex items-center justify-center shadow-md shadow-blue-500/20">
                  1
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Paso 1: Acerca el teléfono
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  El cliente solo aproxima la parte superior de su teléfono al chip NFC o escanea el QR integrado.
                </p>
              </div>

              {/* Paso 2 */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/70 dark:border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg mx-auto flex items-center justify-center shadow-md shadow-blue-500/20">
                  2
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Paso 2: Se abre tu perfil digital
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Una notificación del sistema operativo abre tu página web instantánea en menos de 1 segundo sin descargar apps.
                </p>
              </div>

              {/* Paso 3 */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/70 dark:border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg mx-auto flex items-center justify-center shadow-md shadow-blue-500/20">
                  3
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Paso 3: El cliente puede contactar contigo
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Guarda tu contacto con un clic en su agenda, te escribe por WhatsApp, ve tus redes o califica tu servicio.
                </p>
              </div>

            </div>
          </section>

          {/* Section: "¿Para quién es?" */}
          <section className="mb-12">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/60">
                Público Objetivo
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                ¿Para quién es?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Diseñado para profesionales y comercios que buscan diferenciarse con tecnología moderna.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mx-auto">
              {(product.targetAudience || product.idealFor).map((item, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section: "¿Qué verá tu cliente?" (Visual digital profile representation) */}
          <section className="mb-12 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/60">
                Experiencia Final
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                ¿Qué verá tu cliente?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Una representación visual limpia y responsive de tu perfil digital cargado en el teléfono.
              </p>
            </div>

            {/* Simulated Phone Frame with Digital Profile Preview */}
            <div className="max-w-sm mx-auto bg-slate-950 p-3.5 rounded-[2.5rem] shadow-2xl border-4 border-slate-800">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden text-slate-900 dark:text-slate-100 text-xs">
                
                {/* Simulated Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-blue-950 p-4 text-white relative">
                  <div className="flex items-center justify-between text-[10px] text-white/80">
                    <span className="font-bold">TapRD Profile</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-base flex items-center justify-center border-2 border-white shadow-md">
                      TR
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white">Tu Marca / Nombre</h4>
                      <p className="text-[10px] text-blue-300 font-medium">{product.category}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Mock */}
                <div className="p-4 space-y-2.5 bg-[#f8fafc] dark:bg-slate-900/90">
                  <div className="p-3 bg-emerald-600 text-white font-extrabold rounded-xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Chatear por WhatsApp</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                  </div>

                  <div className="p-3 bg-slate-900 dark:bg-slate-800 text-white font-extrabold rounded-xl flex items-center justify-between shadow-xs border border-transparent dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-cyan-400" />
                      <span>Llamar ahora</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-center text-slate-700 dark:text-slate-200">
                      Instagram
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-center text-slate-700 dark:text-slate-200">
                      Cómo llegar
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="w-full py-2.5 bg-blue-600 text-white font-black text-center rounded-xl flex items-center justify-center gap-1.5 shadow-xs">
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Guardar contacto</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Live Demo Trigger */}
            {onOpenDemo && (
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => onOpenDemo('barberia-wilson')}
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Ver un perfil demo en vivo interactivo (Barbería Wilson)</span>
                </button>
              </div>
            )}
          </section>

          {/* Bottom Conversion Box: Price & Large CTA Buttons */}
          <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
            <div className="max-w-xl mx-auto space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                Inversión Garantizada
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Precio {product.price}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Empieza hoy mismo a transformar la forma en que conectas con tus clientes en República Dominicana.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="py-4 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-black text-sm shadow-xl shadow-blue-600/30 transition-all cursor-pointer"
              >
                Solicitar ahora
              </button>

              <button
                type="button"
                onClick={handleWhatsApp}
                className="py-4 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Solicitar por WhatsApp</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Atención personalizada • Entregas en Santo Domingo y envíos nacionales
            </p>
          </section>

        </div>
      </main>

      <Footer
        onNavigate={onNavigate}
        onOpenContact={() => setModalOpen(true)}
      />

      {/* Request Modal */}
      <ProductRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialProductName={product.name}
      />
    </div>
  );
}
