import React from 'react';
import { 
  Scissors, 
  Utensils, 
  Sparkles, 
  Building2, 
  Camera, 
  ShoppingBag, 
  Hotel, 
  Briefcase,
  ArrowRight,
  Check
} from 'lucide-react';
import { BusinessCategory } from '../types';

interface BusinessCategoryCardProps {
  categories: BusinessCategory[];
  onOpenDemo: (demoSlug: string) => void;
}

export function BusinessCategoryCard({ categories, onOpenDemo }: BusinessCategoryCardProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Scissors': return Scissors;
      case 'Utensils': return Utensils;
      case 'Sparkles': return Sparkles;
      case 'Building2': return Building2;
      case 'Camera': return Camera;
      case 'ShoppingBag': return ShoppingBag;
      case 'Hotel': return Hotel;
      default: return Briefcase;
    }
  };

  return (
    <section id="para-negocios" className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/60">
            Adaptabilidad Total
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Para todo tipo de negocio y profesional
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Descubre cómo cada sector en República Dominicana aprovecha la tecnología NFC para automatizar contactos y ventas.
          </p>
        </div>

        {/* Categories Grid (8 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = getIcon(cat.iconName);
            return (
              <div
                key={cat.id}
                id={`cat-card-${cat.id}`}
                className="bg-[#f8fafc] dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-400/80 dark:hover:border-blue-500/80 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {cat.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {cat.description}
                  </p>

                  <ul className="space-y-1.5 mb-6">
                    {cat.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {cat.demoSlug && (
                  <button
                    type="button"
                    onClick={() => onOpenDemo(cat.demoSlug!)}
                    className="inline-flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group-hover:underline pt-3 border-t border-slate-200/60 dark:border-slate-800 cursor-pointer"
                  >
                    <span>Ver demo de esta categoría</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
