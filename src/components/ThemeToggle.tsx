import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  id?: string;
  className?: string;
  variant?: 'icon' | 'segmented' | 'dropdown';
  showLabel?: boolean;
}

export function ThemeToggle({
  id = 'theme-toggle-btn',
  className = '',
  variant = 'icon',
  showLabel = false
}: ThemeToggleProps) {
  const { theme, resolvedTheme, isDark, setTheme, toggleTheme } = useTheme();

  // Variante segmentada (Claro / Oscuro / Sistema) para páginas de configuración o perfil
  if (variant === 'segmented') {
    const options: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
      { value: 'light', label: 'Claro', icon: <Sun className="w-4 h-4 text-amber-500" /> },
      { value: 'dark', label: 'Oscuro', icon: <Moon className="w-4 h-4 text-blue-400" /> },
      { value: 'system', label: 'Sistema', icon: <Monitor className="w-4 h-4 text-slate-400" /> }
    ];

    return (
      <div 
        id={id}
        className={`inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs ${className}`}
        role="group"
        aria-label="Seleccionar tema visual"
      >
        {options.map((opt) => {
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Variante compacta tipo botón icon (conmutador rápido día/noche)
  return (
    <button
      id={id}
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all cursor-pointer border ${
        isDark
          ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-slate-700/80 hover:border-slate-600 shadow-xs'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200/80 shadow-xs'
      } ${className}`}
    >
      <div className="relative w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform rotate-0 hover:rotate-45 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform -rotate-12 hover:rotate-0 text-slate-700" />
        )}
      </div>

      {showLabel && (
        <span className="ml-2 text-xs font-bold">
          {isDark ? 'Modo Oscuro' : 'Modo Claro'}
        </span>
      )}
    </button>
  );
}
