import React, { useState } from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Globe, 
  Package, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ExternalLink, 
  Radio, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';
import { logoutAdmin, getCurrentAdminUser } from '../../services/adminAuthService';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function isNavItemActive(itemPath: string, currentPath: string): boolean {
  // Normalizar removiendo slash final si existe para comparaciones precisas
  const normCurrent = currentPath.replace(/\/+$/, '') || '/';
  const normItem = itemPath.replace(/\/+$/, '') || '/';

  // 1. Si hay coincidencia exacta
  if (normCurrent === normItem) {
    return true;
  }

  // 2. Opción específica "Crear cliente" (/admin/clientes/nuevo)
  if (normItem === '/admin/clientes/nuevo') {
    return normCurrent === '/admin/clientes/nuevo';
  }

  // 3. Opción "Clientes" (/admin/clientes)
  // Regla crítica: NUNCA marcar "Clientes" si estamos en la subpágina "Crear cliente"
  if (normItem === '/admin/clientes') {
    if (normCurrent === '/admin/clientes/nuevo') {
      return false;
    }
    // Se activa para la lista /admin/clientes o al editar /admin/clientes/:id/editar
    return normCurrent.startsWith('/admin/clientes/');
  }

  // 4. Opción Dashboard (/admin)
  if (normItem === '/admin') {
    return normCurrent === '/admin';
  }

  // 5. Demás secciones administrativas (/admin/perfiles, /admin/productos, etc.)
  return normCurrent.startsWith(`${normItem}/`);
}

export function AdminLayout({
  currentPath,
  onNavigate,
  title,
  subtitle,
  actions,
  children
}: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUser = getCurrentAdminUser();

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } finally {
      onNavigate('/admin/login');
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
      badge: undefined
    },
    {
      label: 'Clientes',
      path: '/admin/clientes',
      icon: Users,
      badge: undefined
    },
    {
      label: 'Crear cliente',
      path: '/admin/clientes/nuevo',
      icon: UserPlus,
      badge: 'Nuevo'
    },
    {
      label: 'Perfiles',
      path: '/admin/perfiles',
      icon: Globe,
      badge: undefined
    },
    {
      label: 'Productos',
      path: '/admin/productos',
      icon: Package,
      badge: undefined
    },
    {
      label: 'Configuración',
      path: '/admin/configuracion',
      icon: Settings,
      badge: undefined
    }
  ];

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  const getBreadcrumbs = () => {
    const norm = currentPath.replace(/\/+$/, '') || '/';
    if (norm === '/admin') {
      return [{ label: 'Dashboard', path: '/admin' }];
    }
    if (norm === '/admin/clientes/nuevo') {
      return [
        { label: 'Clientes', path: '/admin/clientes' },
        { label: 'Crear cliente', path: '/admin/clientes/nuevo' }
      ];
    }
    if (norm.startsWith('/admin/clientes/') && norm.endsWith('/editar')) {
      return [
        { label: 'Clientes', path: '/admin/clientes' },
        { label: 'Editar cliente', path: norm }
      ];
    }
    if (norm === '/admin/clientes') {
      return [{ label: 'Clientes', path: '/admin/clientes' }];
    }
    if (norm === '/admin/perfiles') {
      return [{ label: 'Perfiles', path: '/admin/perfiles' }];
    }
    if (norm === '/admin/productos') {
      return [{ label: 'Productos', path: '/admin/productos' }];
    }
    if (norm === '/admin/configuracion') {
      return [{ label: 'Configuración', path: '/admin/configuracion' }];
    }
    return [{ label: 'General', path: '/admin' }];
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      
      {/* =================================================================== */}
      {/* DESKTOP SIDEBAR */}
      {/* =================================================================== */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col justify-between shrink-0 border-r border-slate-800 sticky top-0 h-screen z-30">
        
        {/* Brand Header */}
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => handleNavClick('/admin')}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                <span className="text-xl tracking-tighter">T</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 ml-0.5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white">
                    Tap<span className="text-blue-400">RD</span>
                  </span>
                  <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 bg-blue-900/70 text-blue-300 rounded border border-blue-700/50">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Panel de control
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Menú Principal
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavItemActive(item.path, currentPath);
              return (
                <button
                  key={item.path}
                  id={`admin-nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-black'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold uppercase bg-blue-500/30 text-cyan-300 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          
          {/* Direct link to public site */}
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver sitio web público</span>
            </span>
          </button>

          {/* Admin User Profile */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/30">
                {getInitials(currentUser?.displayName || currentUser?.email)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.displayName || 'Admin TapRD'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentUser?.email || 'admin@taprd.com'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* =================================================================== */}
      {/* MOBILE HEADER & DRAWER */}
      {/* =================================================================== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavClick('/admin')}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            <span className="text-base tracking-tighter">T</span>
          </div>
          <span className="text-base font-black text-white">
            Tap<span className="text-blue-400">RD</span> Admin
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle id="btn-admin-mobile-theme" />
          <button
            id="btn-admin-mobile-logout"
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/35 text-rose-400 text-xs font-bold transition-all border border-rose-500/30 cursor-pointer min-h-[38px]"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold">Salir</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
          />

          <div className="relative w-4/5 max-w-xs bg-slate-900 text-white h-full flex flex-col justify-between p-4 shadow-2xl z-10 animate-in slide-in-from-left duration-200 overflow-y-auto overscroll-contain">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                    T
                  </div>
                  <span className="font-black text-white">TapRD Admin</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isNavItemActive(item.path, currentPath);
                  return (
                    <button
                      key={item.path}
                      id={`admin-mobile-nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      type="button"
                      onClick={() => handleNavClick(item.path)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white font-black shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] bg-blue-500/30 text-cyan-300 px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Logout Mobile */}
            <div className="pt-4 border-t border-slate-800 space-y-2.5">
              {/* Mobile User Profile */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/40 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                    {getInitials(currentUser?.displayName || currentUser?.email)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {currentUser?.displayName || 'Admin TapRD'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {currentUser?.email || 'admin@taprd.com'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ver sitio público</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MAIN CONTENT AREA */}
      {/* =================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        
        {/* Top Content Bar */}
        <header className="bg-white dark:bg-slate-900/90 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => onNavigate('/admin')}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer shrink-0"
              >
                Panel
              </button>
              {getBreadcrumbs().map((crumb, idx, arr) => {
                const isLast = idx === arr.length - 1;
                return (
                  <React.Fragment key={crumb.path + idx}>
                    <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                    {isLast ? (
                      <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">{crumb.label}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onNavigate(crumb.path)}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer shrink-0"
                      >
                        {crumb.label}
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggle id="btn-admin-theme-toggle" />
            {actions}
          </div>
        </header>

        {/* Page Children */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
