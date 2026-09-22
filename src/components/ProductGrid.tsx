import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ArrowRight, Sparkles, Layers } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  title?: string;
  subtitle?: string;
  detailed?: boolean;
}

export function ProductGrid({
  products,
  onSelectProduct,
  onViewDetails,
  title = 'Nuestros Productos NFC',
  subtitle = 'Soluciones físicas elegantes listas para conectar a tus clientes en República Dominicana.',
  detailed = false
}: ProductGridProps) {
  return (
    <section id="productos-section" className="py-16 sm:py-24 bg-[#f8fafc] dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/60 shadow-2xs">
            Catálogo Oficial TapRD
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* 4 Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
          {products.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelect={onSelectProduct}
              onViewDetails={onViewDetails}
              detailed={detailed}
            />
          ))}
        </div>

        {/* Bottom Banner Linking to Full Catalog & Comparison */}
        {onViewDetails && (
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => onViewDetails(products[0])}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 shadow-sm text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 transition-all cursor-pointer hover:border-blue-300 dark:hover:border-blue-500/50"
            >
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Ver catálogo completo con tabla comparativa y paquetes comerciales</span>
              <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
