import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { ProductCard } from '../components/ProductCard';
import { ProductRequestModal } from '../components/ProductRequestModal';
import { PRODUCTS, PRODUCT_PACKS, COMPARISON_FEATURES } from '../data/products';
import { Product, ProductPack } from '../types';
import { createProductWhatsAppUrl } from '../config/constants';
import { 
  Shield, 
  Truck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Check, 
  Minus, 
  MessageCircle, 
  Layers, 
  HelpCircle,
  PackageCheck,
  Send,
  Radio
} from 'lucide-react';

interface ProductsPageProps {
  onNavigate: (path: string) => void;
  onOpenContact?: (productInterest?: string) => void;
  onOpenDemo?: (slug?: string) => void;
}

export function ProductsPage({ onNavigate, onOpenContact, onOpenDemo }: ProductsPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState<string>('Tap Card');

  const handleSelectProduct = (product: Product) => {
    setSelectedProductName(product.name);
    setModalOpen(true);
  };

  const handleViewDetails = (product: Product) => {
    onNavigate(product.route);
  };

  const handleSelectPack = (pack: ProductPack) => {
    setSelectedProductName(`${pack.name} (${pack.price})`);
    setModalOpen(true);
  };

  const handleWhatsAppGeneral = () => {
    const url = createProductWhatsAppUrl('Soluciones NFC TapRD', {
      city: 'Santo Domingo'
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors">
      {/* SEO Metadata */}
      <SEOHead
        title="Productos NFC para negocios | TapRD"
        description="Descubre tarjetas NFC, placas NFC, stickers y soluciones digitales para negocios y profesionales."
      />

      <Navbar
        currentPath="/productos"
        onNavigate={onNavigate}
        onOpenContact={() => {
          setSelectedProductName('Tap Card');
          setModalOpen(true);
        }}
      />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header principal del catálogo */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/60 shadow-2xs">
              Catálogo Oficial TapRD
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
              Soluciones NFC para tu negocio
            </h1>
            <p className="mt-4 text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Elige la solución que mejor se adapte a tu negocio y empieza a conectar con tus clientes con un solo toque.
            </p>

            {/* Quality Guarantees */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-600 dark:text-slate-300 font-bold">
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Envíos en Santo Domingo y provincias</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Garantía de chip NFC 12 meses</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Sin mensualidades obligatorias</span>
              </div>
            </div>
          </div>

          {/* Product Grid (4 Core Products) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-20">
            {PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={handleSelectProduct}
                onViewDetails={handleViewDetails}
                detailed={true}
              />
            ))}
          </div>

          {/* ================================================================= */}
          {/* SECTION 9: COMPARACIÓN DE PRODUCTOS ("¿Cuál solución necesito?") */}
          {/* ================================================================= */}
          <section className="mb-20">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/60">
                Guía de Elección
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white mt-3 tracking-tight">
                ¿Cuál solución necesito?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
                Compara las características clave de cada producto y selecciona la que se ajuste a tu operación.
              </p>
            </div>

            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                      <th className="py-5 px-6 font-black uppercase tracking-wider text-slate-900 dark:text-white w-1/3">
                        Característica
                      </th>
                      {PRODUCTS.map((p) => (
                        <th key={p.id} className="py-5 px-4 text-center font-black text-slate-900 dark:text-white">
                          <div className="text-sm font-black">{p.name}</div>
                          <div className="text-[11px] font-mono text-blue-600 dark:text-cyan-400 font-bold">{p.price}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {COMPARISON_FEATURES.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">
                          <span>{item.feature}</span>
                          {item.tooltip && (
                            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                              {item.tooltip}
                            </span>
                          )}
                        </td>
                        
                        {/* Tap Card */}
                        <td className="py-4 px-4 text-center">
                          {item.tapCard ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700 font-black text-base">—</span>
                          )}
                        </td>

                        {/* Tap Business */}
                        <td className="py-4 px-4 text-center">
                          {item.tapBusiness ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700 font-black text-base">—</span>
                          )}
                        </td>

                        {/* Tap Review */}
                        <td className="py-4 px-4 text-center">
                          {item.tapReview ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700 font-black text-base">—</span>
                          )}
                        </td>

                        {/* Tap Sticker */}
                        <td className="py-4 px-4 text-center">
                          {item.tapSticker ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700 font-black text-base">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
                      <td className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400">Acción</td>
                      {PRODUCTS.map((p) => (
                        <td key={p.id} className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleSelectProduct(p)}
                            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
                          >
                            Solicitar
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Mobile Carousel / Horizontal Scrollable Cards (Optimized for phones) */}
            <div className="md:hidden">
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory -mx-4 px-4 no-scrollbar">
                {PRODUCTS.map((prod) => (
                  <div
                    key={prod.id}
                    className="min-w-[270px] max-w-[280px] snap-center shrink-0 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          {prod.category}
                        </span>
                        <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                          {prod.price}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-950 dark:text-white mt-2 mb-3">
                        {prod.name}
                      </h3>

                      <div className="space-y-2 pt-1 mb-4 text-xs">
                        {COMPARISON_FEATURES.map((item, idx) => {
                          const hasFeature = 
                            prod.id === 'tap-card' ? item.tapCard :
                            prod.id === 'tap-business' ? item.tapBusiness :
                            prod.id === 'tap-review' ? item.tapReview : item.tapSticker;

                          return (
                            <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                              <span className="text-slate-600 dark:text-slate-300 font-medium">{item.feature}</span>
                              {hasFeature ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-700 font-bold text-sm">—</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(prod)}
                        className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Ver detalles
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectProduct(prod)}
                        className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 cursor-pointer"
                      >
                        Solicitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
                Desliza horizontalmente para comparar todos los productos →
              </p>
            </div>
          </section>

          {/* ================================================================= */}
          {/* SECTION 10: PACKS ("Soluciones para negocios") */}
          {/* ================================================================= */}
          <section className="mb-20">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/60">
                Paquetes Comerciales
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white mt-3 tracking-tight">
                Soluciones para negocios
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
                Paquetes pensados para profesionales y empresas que desean equipar sus puntos de atención o equipo comercial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {PRODUCT_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                    pack.popular
                      ? 'bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white shadow-xl ring-2 ring-blue-500/50'
                      : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md'
                  }`}
                >
                  {pack.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-600 text-white shadow-md">
                        <Sparkles className="w-3 h-3" />
                        {pack.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${pack.popular ? 'text-cyan-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {pack.name}
                    </span>

                    <h3 className={`text-lg sm:text-xl font-black mt-1 mb-2 ${pack.popular ? 'text-white' : 'text-slate-950 dark:text-white'}`}>
                      {pack.targetAudience}
                    </h3>

                    <p className={`text-xs leading-relaxed mb-6 ${pack.popular ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                      {pack.description}
                    </p>

                    {/* Price Display */}
                    <div className="mb-6 pb-6 border-b border-slate-200/30 dark:border-slate-800">
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${pack.popular ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        Inversión estimada
                      </span>
                      <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${pack.popular ? 'text-white' : 'text-slate-950 dark:text-white'}`}>
                        {pack.price}
                      </div>
                      <p className={`text-[10px] mt-0.5 ${pack.popular ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        Precios de referencia. Permite personalización según requerimiento.
                      </p>
                    </div>

                    {/* Includes List */}
                    <div className="space-y-2.5 mb-8">
                      <p className={`text-[10px] font-black uppercase tracking-wider ${pack.popular ? 'text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                        Incluye:
                      </p>
                      <ul className="space-y-2">
                        {pack.includes.map((inc, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs">
                            <Check className={`w-4 h-4 shrink-0 mt-0.5 stroke-[3] ${pack.popular ? 'text-cyan-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                            <span className={`font-medium ${pack.popular ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'}`}>
                              {inc}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => handleSelectPack(pack)}
                      className={`w-full py-3.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98 ${
                        pack.popular
                          ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/25'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{pack.ctaText}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Fast Assistance Callout */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                Atención Directa en República Dominicana
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                ¿No estás seguro de cuál elegir?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Escríbenos por WhatsApp y te asesoramos según el tipo de local, equipo comercial o necesidad de tu negocio.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                type="button"
                onClick={handleWhatsAppGeneral}
                className="py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Hablar por WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedProductName('Asesoría personalizada');
                  setModalOpen(true);
                }}
                className="py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all cursor-pointer"
              >
                <span>Solicitar llamada</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer
        onNavigate={onNavigate}
        onOpenContact={() => {
          setSelectedProductName('Tap Card');
          setModalOpen(true);
        }}
      />

      {/* Request Modal */}
      <ProductRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialProductName={selectedProductName}
      />
    </div>
  );
}
