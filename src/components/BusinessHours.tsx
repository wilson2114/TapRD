import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { BusinessHoursDay } from '../types';

interface BusinessHoursProps {
  hours: BusinessHoursDay[];
}

export function BusinessHours({ hours }: BusinessHoursProps) {
  if (!hours || hours.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Horario de atención
          </h3>
        </div>

        {/* Live Status indicator */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Abierto hoy</span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {hours.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/60 last:border-0"
          >
            <span className="font-semibold text-slate-700 dark:text-slate-300">{item.day}</span>
            <span className={`font-mono font-medium ${item.isOpen ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 italic'}`}>
              {item.hours}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
