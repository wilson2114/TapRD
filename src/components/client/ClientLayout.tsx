import React, { useState } from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { ThemeToggle } from '../ThemeToggle';
import { 
  LayoutDashboard, 
  Store, 
  Briefcase, 
  Clock, 
  Share2, 
  QrCode, 
  HelpCircle, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X, 
  Radio, 
  Sparkles,
  CheckCircle2,
  ChevronRight,
  User
} from 'lucide-react';
import { PUBLIC_BASE_URL } from '../../config/constants';

interface ClientLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function ClientLayout({
  children,
  currentPath,
  onNavigate,
  title,
  subtitle,
  actions
}: ClientLayoutProps) {
  const { client, logout } = useClientAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: 'Panel Principal',
      path: '/cliente/dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      label: 'Datos de Negocio',
      path: '/cliente/perfil',
      icon: Store,
      badge: null
    },
    {
      label: 'Mis Servicios',
      path: '/cliente/servicios',
      icon: Briefcase,
      badge: client?.services?.length ? `${client.services.length}` : null
    },
    {
      label: 'Horario Comercial',
      path: '/cliente/horarios',
      icon: Clock,
      badge: null
    },
    {
      label: 'Redes & Reseñas',
      path: '/cliente/redes',
      icon: Share2,
      badge: null
    },
    {
      label: 'Código QR & NFC',
      path: '/cliente/qr',
      icon: QrCode,
      badge: 'NFC'
    },
    {
      label: 'Soporte TapRD',
      path: '/cliente/soporte',
      icon: HelpCircle,
      badge: null
    }
  ];

  const handleLogout = async () => {
    await logout();
    onNavigate('/cliente/login');
  };

  const profileUrl = client?.slug ? `${PUBLIC_BASE_URL}/p/${client.slug}` : '#';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
      {/* =================================================================== */}
      {/* TOP HEADER */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              onClick={() => onNavigate('/cliente/dashboard')}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-cyan-500/20">
                T
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900 dark:text-white text-sm tracking-tight">TapRD</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                    Portal Clientes
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
                  Gestión de Perfil NFC
                </span>
              </div>
            </div>
          </div>

          {/* Business Pill & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {client && (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200/70 dark:border-slate-700"
                title="Abrir tu perfil público NFC"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Ver perfil público</span>
              </a>
            )}

            {/* Conmutador de Tema Persistente para Entorno de Trabajo */}
            <ThemeToggle id="btn-client-portal-theme" />

            {client && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                {client.logo ? (
                  <img
                    src={client.logo}
                    alt={client.businessName}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-lg ${client.avatarBgColor || 'bg-blue-600'} text-white font-bold text-xs flex items-center justify-center`}>
                    {client.avatarInitials || client.businessName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate max-w-[140px]">
                    {client.businessName}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    En línea
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 sm:py-1.5 sm:px-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>

        </div>
      </header>

      {/* =================================================================== */}
      {/* BODY WITH SIDEBAR & CONTENT */}
      {/* =================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-4">
          
          {/* Card Resumen de Negocio */}
          {client && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                {client.logo ? (
                  <img
                    src={client.logo}
                    alt={client.businessName}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                  />
                ) : (
                  <div className={`w-11 h-11 rounded-xl ${client.avatarBgColor || 'bg-blue-600'} text-white font-black text-sm flex items-center justify-center shadow-2xs`}>
                    {client.avatarInitials || client.businessName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {client.businessName}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {client.category || 'Negocio TapRD'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 dark:text-slate-500">Plan actual:</span>
                <span className="font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md uppercase tracking-wider text-[10px] border border-blue-200/60 dark:border-blue-800">
                  {client.plan || 'Business'}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path === '/cliente/dashboard' && currentPath === '/cliente');
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Banner NFC */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm space-y-2.5 border border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold">
              <Radio className="w-3.5 h-3.5" />
              <span>Tecnología NFC TapRD</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Cualquier cambio que guardes se sincroniza de inmediato con tu tarjeta inteligente.
            </p>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-cyan-400 font-bold hover:underline"
            >
              <span>Abrir mi perfil</span>
              <ChevronRight className="w-3 h-3" />
            </a>
          </div>

        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex">
            <div className="w-72 max-w-[80vw] bg-white dark:bg-slate-900 h-full p-4 flex flex-col shadow-2xl space-y-4 border-r border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    T
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Menú Cliente</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selector de Tema en Móvil */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Tema del Portal:</span>
                <ThemeToggle id="btn-client-drawer-theme" />
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate(item.path);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Top Page Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/70 dark:border-slate-800">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>

            {actions && (
              <div className="shrink-0 flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>

          {/* Page Content */}
          <div>
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
