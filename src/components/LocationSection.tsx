import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface LocationSectionProps {
  address: string;
  city: string;
  mapsUrl: string;
  wazeUrl?: string;
  onOpenMap?: () => void;
}

export function LocationSection({ address, city, mapsUrl, wazeUrl, onOpenMap }: LocationSectionProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <MapPin className="w-4 h-4" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
          Ubicación
        </h3>
      </div>

      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
        {address}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
        {city}, República Dominicana
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onOpenMap}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 text-xs font-bold transition-colors border border-slate-200/70 dark:border-slate-700"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Google Maps</span>
        </a>

        {wazeUrl ? (
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onOpenMap}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-slate-700 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-400 text-xs font-bold transition-colors border border-slate-200/70 dark:border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Waze</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => window.open(`https://waze.com/ul?q=${encodeURIComponent(address + ' ' + city)}`, '_blank')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-slate-700 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-400 text-xs font-bold transition-colors border border-slate-200/70 dark:border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Waze</span>
          </button>
        )}
      </div>
    </div>
  );
}
