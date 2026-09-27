import React from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { SEOHead } from '../SEOHead';
import { COMPANY_CONFIG } from '../../config/company';
import { 
  ShieldCheck, 
  FileText, 
  Cookie, 
  RotateCcw, 
  DollarSign, 
  AlertTriangle, 
  Info, 
  Mail, 
  Building2, 
  ExternalLink,
  ChevronRight,
  Printer
} from 'lucide-react';

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  version: string;
  lastUpdated: string;
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export function LegalLayout({
  title,
  subtitle,
  version,
  lastUpdated,
  currentPath,
  onNavigate,
  children
}: LegalLayoutProps) {
  const legalNavItems = [
    { label: 'Términos y Condiciones', path: '/terminos', icon: FileText },
    { label: 'Política de Privacidad', path: '/privacidad', icon: ShieldCheck },
    { label: 'Política de Cookies', path: '/cookies', icon: Cookie },
    { label: 'Política de Cancelación', path: '/politica-cancelacion', icon: RotateCcw },
    { label: 'Política de Reembolso', path: '/politica-reembolso', icon: DollarSign },
    { label: 'Uso Aceptable', path: '/uso-aceptable', icon: AlertTriangle },
    { label: 'Aviso Legal', path: '/aviso-legal', icon: Building2 },
    { label: 'Contacto Legal', path: '/contacto', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white transition-colors duration-200">
      <SEOHead 
        title={`${title} | TapRD`}
        description={`${subtitle}. Documentación y marco legal de operación técnica de TapRD en República Dominicana.`}
      />

      <Navbar 
        currentPath={currentPath}
        onNavigate={onNavigate}
        onOpenContact={() => onNavigate('/contacto')}
      />

      {/* Hero Header */}
      <section className="pt-28 pb-12 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <button 
              type="button" 
              onClick={() => onNavigate('/')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Inicio
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Legal</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-blue-600 dark:text-blue-400 font-bold">{title}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xs font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Versión {version}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Actualizado: {lastUpdated}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {title}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
                {subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                title="Imprimir documento"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          {/* Banner de Aviso Técnico Legal */}
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
            <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold">Aviso sobre marco operativo:</strong> Este documento establece las condiciones técnicas y comerciales bajo las cuales opera <strong>{COMPANY_CONFIG.commercialName}</strong>. La aplicación se prepara técnicamente para el cumplimiento normativo; las estipulaciones contractuales definitivas se adecuarán a la legislación aplicable en {COMPANY_CONFIG.jurisdiction}.
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Nav */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-3 py-2">
                Centro Legal
              </h3>
              {legalNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 px-3 space-y-1.5">
                <p className="font-bold text-slate-700 dark:text-slate-300">Contacto Legal:</p>
                <p className="break-all">{COMPANY_CONFIG.legalEmail}</p>
                <p>{COMPANY_CONFIG.jurisdiction}</p>
              </div>
            </div>
          </aside>

          {/* Legal Document Content */}
          <main className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-2xs prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            {children}
          </main>

        </div>
      </div>

      <Footer 
        onNavigate={onNavigate}
        onOpenContact={() => onNavigate('/contacto')}
      />
    </div>
  );
}
