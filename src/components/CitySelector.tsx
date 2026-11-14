import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  MapPin,
  Search,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Star,
  Building2
} from 'lucide-react';
import {
  DOMINICAN_PROVINCES,
  POPULAR_DOMINICAN_CITIES,
  getProvinceByCity,
  normalizeLocationText
} from '../data/dominicanCities';

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  allowCustom?: boolean;
  id?: string;
}

export function CitySelector({
  value,
  onChange,
  placeholder = 'Selecciona una ciudad o pueblo...',
  className = '',
  buttonClassName = '',
  allowCustom = true,
  id
}: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>('all');
  const [collapsedProvinces, setCollapsedProvinces] = useState<Record<string, boolean>>({});
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentProvince = useMemo(() => getProvinceByCity(value), [value]);

  // Calcular posición del portal relativo al botón trigger
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const preferredHeight = 380;
    const spaceBelow = viewportHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;

    const openUpwards = spaceBelow < 260 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(
      preferredHeight,
      Math.max(200, openUpwards ? spaceAbove : spaceBelow)
    );

    const minWidth = Math.max(rect.width, Math.min(340, viewportWidth - 24));
    let left = rect.left;
    if (left + minWidth > viewportWidth - 12) {
      left = Math.max(12, viewportWidth - minWidth - 12);
    }

    setDropdownStyle({
      position: 'fixed',
      top: openUpwards ? undefined : `${rect.bottom + 6}px`,
      bottom: openUpwards ? `${viewportHeight - rect.top + 6}px` : undefined,
      left: `${left}px`,
      width: `${minWidth}px`,
      maxHeight: `${maxHeight}px`,
      zIndex: 9999
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    const focusTimer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 20);

    const handleResizeOrScroll = (e: Event) => {
      if (dropdownRef.current && e.target instanceof Node && dropdownRef.current.contains(e.target)) {
        return;
      }
      updatePosition();
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const normalizedQuery = useMemo(() => normalizeLocationText(searchQuery), [searchQuery]);

  // Filtrar ciudades populares cuando no hay filtro de provincia (o cuando coincide la búsqueda)
  const filteredPopular = useMemo(() => {
    if (selectedProvinceFilter !== 'all') return [];
    if (!normalizedQuery) return POPULAR_DOMINICAN_CITIES;
    return POPULAR_DOMINICAN_CITIES.filter((c) => {
      const prov = getProvinceByCity(c);
      return (
        normalizeLocationText(c).includes(normalizedQuery) ||
        (prov && normalizeLocationText(prov).includes(normalizedQuery))
      );
    });
  }, [normalizedQuery, selectedProvinceFilter]);

  // Filtrar provincias y sus pueblos
  const filteredProvinces = useMemo(() => {
    return DOMINICAN_PROVINCES.filter(
      (p) => selectedProvinceFilter === 'all' || p.province === selectedProvinceFilter
    )
      .map((prov) => {
        if (!normalizedQuery) {
          return prov;
        }
        const provinceMatches = normalizeLocationText(prov.province).includes(normalizedQuery);
        if (provinceMatches) {
          return prov;
        }
        const matchingCities = prov.cities.filter((c) =>
          normalizeLocationText(c).includes(normalizedQuery)
        );
        return {
          ...prov,
          cities: matchingCities
        };
      })
      .filter((prov) => prov.cities.length > 0);
  }, [normalizedQuery, selectedProvinceFilter]);

  const totalMatchingCities = useMemo(
    () => filteredProvinces.reduce((acc, p) => acc + p.cities.length, 0),
    [filteredProvinces]
  );

  const handleSelectCity = (selected: string) => {
    onChange(selected);
    setIsOpen(false);
    setSearchQuery('');
  };

  const toggleProvinceCollapse = (provinceName: string) => {
    setCollapsedProvinces((prev) => ({
      ...prev,
      [provinceName]: !prev[provinceName]
    }));
  };

  const hasExactMatch = useMemo(() => {
    if (!normalizedQuery) return true;
    const inPopular = POPULAR_DOMINICAN_CITIES.some(
      (c) => normalizeLocationText(c) === normalizedQuery
    );
    const inProvinces = DOMINICAN_PROVINCES.some((p) =>
      p.cities.some((c) => normalizeLocationText(c) === normalizedQuery)
    );
    return inPopular || inProvinces;
  }, [normalizedQuery]);

  const dropdownContent = isOpen ? (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Cabecera fija con buscador y filtro de provincia */}
      <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/95 space-y-2 shrink-0">
        {/* Buscador de ciudad o pueblo */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ciudad, pueblo o provincia..."
            className="w-full pl-8 pr-8 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Selector rápido de provincia */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedProvinceFilter}
              onChange={(e) => setSelectedProvinceFilter(e.target.value)}
              className="w-full pl-8 pr-6 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Todas las provincias ({DOMINICAN_PROVINCES.length})</option>
              {DOMINICAN_PROVINCES.map((p) => (
                <option key={p.province} value={p.province}>
                  {p.province} ({p.cities.length})
                </option>
              ))}
            </select>
          </div>
          {selectedProvinceFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedProvinceFilter('all')}
              className="px-2 py-1.5 rounded-lg text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer shrink-0"
            >
              Ver todas
            </button>
          )}
        </div>
      </div>

      {/* Lista desplazable de resultados */}
      <div className="overflow-y-auto flex-1 p-1.5 space-y-2 overscroll-contain">
        {/* Opción personalizada si el texto buscado no existe literalmente */}
        {allowCustom && searchQuery.trim().length >= 2 && !hasExactMatch && (
          <button
            type="button"
            onClick={() => handleSelectCity(searchQuery.trim())}
            className="w-full text-left px-3 py-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-800/60 text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center justify-between gap-2 cursor-pointer transition-colors"
          >
            <span className="truncate">Usar ubicación: &ldquo;{searchQuery.trim()}&rdquo;</span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-600 text-white shrink-0">
              Personalizada
            </span>
          </button>
        )}

        {/* Sección: Ciudades Principales / Más Frecuentes */}
        {filteredPopular.length > 0 && (
          <div className="space-y-0.5">
            <div className="px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>Ciudades Principales / Más Frecuentes</span>
            </div>
            <div className="grid grid-cols-1 gap-0.5">
              {filteredPopular.map((c) => {
                const isSelected = value === c;
                const prov = getProvinceByCity(c);
                return (
                  <button
                    key={`pop-${c}`}
                    type="button"
                    onClick={() => handleSelectCity(c)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{c}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {prov && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {prov}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sección: Pueblos organizados por Provincia */}
        {filteredProvinces.length > 0 ? (
          <div className="space-y-1.5 pt-1">
            {filteredProvinces.map((prov) => {
              const isSearching = Boolean(normalizedQuery) || selectedProvinceFilter !== 'all';
              const isCollapsed = !isSearching && Boolean(collapsedProvinces[prov.province]);

              return (
                <div
                  key={prov.province}
                  className="rounded-xl border border-slate-100 dark:border-slate-800/80 overflow-hidden bg-slate-50/40 dark:bg-slate-800/20"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (!isSearching) toggleProvinceCollapse(prov.province);
                    }}
                    className={`w-full px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/90 flex items-center justify-between text-left ${
                      !isSearching ? 'cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-800' : 'cursor-default'
                    }`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      {prov.province}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200/70 dark:border-slate-600">
                        {prov.cities.length}
                      </span>
                      {!isSearching && (
                        isCollapsed ? (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )
                      )}
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div className="p-1 space-y-0.5 bg-white dark:bg-slate-900">
                      {prov.cities.map((c) => {
                        const isSelected = value === c;
                        return (
                          <button
                            key={`${prov.province}-${c}`}
                            type="button"
                            onClick={() => handleSelectCity(c)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                            }`}
                          >
                            <span className="truncate">{c}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 px-4 text-center space-y-2">
            <MapPin className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              No encontramos pueblos con &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Prueba buscando por otro municipio, distrito municipal o provincia.
            </p>
          </div>
        )}
      </div>

      {/* Footer informativo */}
      <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/95 flex items-center justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
        <span>
          {filteredProvinces.length} provincia{filteredProvinces.length === 1 ? '' : 's'} · {totalMatchingCities} localidades
        </span>
        <span>República Dominicana</span>
      </div>
    </div>
  ) : null;

  return (
    <div className={`relative ${className}`}>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={
          buttonClassName ||
          'w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-all flex items-center justify-between gap-2 text-left cursor-pointer'
        }
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <span className={`truncate ${!value ? 'text-slate-400' : ''}`}>
            {value || placeholder}
          </span>
          {currentProvince && (
            <span className="hidden sm:inline-block shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {currentProvince}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-blue-500' : ''
          }`}
        />
      </button>

      {typeof document !== 'undefined' && dropdownContent
        ? createPortal(dropdownContent, document.body)
        : null}
    </div>
  );
}
