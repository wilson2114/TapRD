import React from 'react';
import { Product } from '../types';
import { ProductMockup } from './ProductMockup';
import { ArrowRight, Check, Sparkles, Eye, Send } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  detailed?: boolean;
}

export function ProductCard({ product, onSelect, onViewDetails, detailed = true }: ProductCardProps) {
  return (
    <div
      id={`product-card-${product.slug || product.id}`}
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-400/80 dark:hover:border-blue-500/80 transition-all duration-300 flex flex-col overflow-hidden group"
    >
      {/* Product Image / Mockup Frame */}
      <div className="p-4 sm:p-5 pb-2 relative bg-gradient-to-b from-slate-50/80 to-transparent dark:from-slate-800/40">
        {product.badge && (
          <div className="absolute top-6 right-6 z-20">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-md">
              <Sparkles className="w-3 h-3" />
              {product.badge}
            </span>
          </div>
        )}
        <div className="flex items-center justify-center">
          <ProductMockup type={product.iconType} size="sm" interactive={false} />
        </div>
      </div>

      {/* Product Information */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between pt-2">
        <div>
          {/* Category & Name */}
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {product.category}
          </span>

          <div className="flex items-baseline justify-between gap-2 mt-1 mb-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {product.name}
            </h3>
            <span className="text-base font-black text-slate-900 dark:text-white font-mono shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
              {product.price || product.priceFrom}
            </span>
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            {product.shortDescription || product.description}
          </p>

          {/* Features List */}
          <div className="space-y-1.5 mb-6 pt-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Características incluidas:
            </p>
            <ul className="space-y-1.5">
              {(product.features || []).slice(0, detailed ? 7 : 4).map((feat, i) => (
                <li key={i} className="flex items-start text-xs text-slate-700 dark:text-slate-300 gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 stroke-[3]" />
                  <span className="leading-tight font-medium">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Controls: Ver detalles & Solicitar */}
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          {onViewDetails ? (
            <button
              type="button"
              id={`btn-detalles-${product.slug || product.id}`}
              onClick={() => onViewDetails(product)}
              className="py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver detalles</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            id={`btn-solicitar-${product.slug || product.id}`}
            onClick={() => onSelect(product)}
            className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Solicitar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
