import React from 'react';
import { ServiceItem } from '../types';
import { Sparkles, Tag, Clock } from 'lucide-react';

interface ServiceListProps {
  services: ServiceItem[];
  onSelectService?: (service: ServiceItem) => void;
  currency?: string;
}

export function ServiceList({ services, onSelectService, currency = 'RD$' }: ServiceListProps) {
  if (!services || services.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Tag className="w-4 h-4" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Nuestros servicios
          </h3>
        </div>
        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
          {services.length} disponibles
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {services.map((service) => (
          <div
            key={service.id}
            className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {service.name}
                </h4>
                {service.popular && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    <Sparkles className="w-2.5 h-2.5" />
                    Popular
                  </span>
                )}
              </div>

              {service.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {service.description}
                </p>
              )}

              {service.duration && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                  <Clock className="w-3 h-3" />
                  <span>Duración: {service.duration}</span>
                </div>
              )}
            </div>

            {/* Price badge */}
            {service.price && (
              <div className="shrink-0 text-right">
                <span className="inline-block text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100/80 dark:border-blue-900/40 px-2.5 py-1 rounded-xl font-mono">
                  {service.price}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
