import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Smartphone, 
  ChevronDown, 
  Sparkles, 
  Shield, 
  LogIn,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import { AuthModal } from './AuthModal';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenContact: (productInterest?: string) => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export function Navbar({ currentPath, onNavigate, onOpenContact, onOpenAuth }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demosDropdownOpen, setDemosDropdownOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, isAdmin, isClient, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (path: string) => {
    setMobileMenuOpen(false);
    setDemosDropdownOpen(false);
    onNavigate(path);
  };

  const handleAuthClick = (mode: 'login' | 'register') => {
    setMobileMenuOpen(false);
    if (onOpenAuth) {
      onOpenAuth(mode);
    } else {
      setAuthModalMode(mode);
    }
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    onNavigate('/');
  };

  return (
    <header
      id="main-navbar"
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-slate-100 dark:border-slate-800'
          : 'bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div 
            id="nav-logo-brand"
            className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" 
            onClick={() => handleLinkClick('/')}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 shrink-0">
              <span className="text-lg sm:text-xl tracking-tighter">T</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 ml-0.5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Tap<span className="text-blue-600 dark:text-blue-400">RD</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1 sm:px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md border border-blue-100 dark:border-blue-900/60">
                  NFC
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block font-medium">
                Soluciones digitales en RD
              </p>
            </div>
          </div>

          {/* Desktop Navigation (Laptops & Desktops) */}
          <nav className="hidden lg:flex items-center gap-7">
            <button
              id="nav-inicio"
              onClick={() => handleLinkClick('/')}
              className={`text-sm font-semibold transition-colors cursor-pointer ${
                currentPath === '/' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inicio
            </button>
            <button
              id="nav-productos"
              onClick={() => handleLinkClick('/productos')}
              className={`text-sm font-semibold transition-colors cursor-pointer ${
                currentPath.startsWith('/productos') ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Productos
            </button>
            <a
              id="nav-como-funciona"
              href="/#como-funciona"
              onClick={(e) => {
                if (currentPath === '/') {
                  e.preventDefault();
                  document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  e.preventDefault();
                  handleLinkClick('/#como-funciona');
                }
              }}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cómo funciona
            </a>
            <a
              id="nav-para-negocios"
              href="/#para-negocios"
              onClick={(e) => {
                if (currentPath === '/') {
                  e.preventDefault();
                  document.getElementById('para-negocios')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  e.preventDefault();
                  handleLinkClick('/#para-negocios');
                }
              }}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Para negocios
            </a>
            <a
              id="nav-faq"
              href="/#preguntas-frecuentes"
              onClick={(e) => {
                if (currentPath === '/') {
                  e.preventDefault();
                  document.getElementById('preguntas-frecuentes')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  e.preventDefault();
                  handleLinkClick('/#preguntas-frecuentes');
                }
              }}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Preguntas frecuentes
            </a>

            {/* Demos Dropdown */}
            <div className="relative">
              <button
                id="nav-demos-dropdown"
                onClick={() => setDemosDropdownOpen(!demosDropdownOpen)}
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1 px-2.5 rounded-lg bg-blue-50/70 border border-blue-100 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ver Demos</span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
              </button>

              {demosDropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setDemosDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Perfiles Demo en Vivo
                  </div>
                  <button
                    id="demo-nav-barberia"
                    onClick={() => handleLinkClick('/demo/barberia')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between cursor-pointer"
                  >
                    <span>Barbería Wilson</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Barbería</span>
                  </button>
                  <button
                    id="demo-nav-restaurante"
                    onClick={() => handleLinkClick('/demo/restaurante')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between cursor-pointer"
                  >
                    <span>Mare Nostrum Bistró</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Restaurante</span>
                  </button>
                  <button
                    id="demo-nav-inmobiliaria"
                    onClick={() => handleLinkClick('/demo/inmobiliaria')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between cursor-pointer"
                  >
                    <span>Aura Real Estate</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Inmobiliaria</span>
                  </button>
                </div>
              )}
            </div>

            <button
              id="nav-contacto"
              onClick={() => onOpenContact()}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Contacto
            </button>
          </nav>

          {/* Desktop Actions CTA (Visible on sm and up) */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-2.5">
            {/* Theme Toggle Button */}
            <ThemeToggle id="navbar-desktop-theme-toggle" />

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <button
                    id="btn-nav-admin-panel"
                    type="button"
                    onClick={() => handleLinkClick('/admin')}
                    className="inline-flex items-center justify-center px-3 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 active:scale-[0.98] rounded-xl transition-all border border-blue-200/80 dark:border-blue-800/80 cursor-pointer"
                    title="Ir al panel de administración"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                    <span>Panel Admin</span>
                  </button>
                ) : (
                  <button
                    id="btn-nav-client-portal"
                    type="button"
                    onClick={() => handleLinkClick('/cliente')}
                    className="inline-flex items-center justify-center px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:scale-[0.98] rounded-xl transition-all border border-emerald-200/80 dark:border-emerald-800/80 cursor-pointer"
                    title="Ir a mi portal comercial"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Mi Portal</span>
                  </button>
                )}

                <button
                  id="btn-nav-logout"
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 active:scale-[0.98] rounded-xl transition-all border border-rose-200/80 dark:border-rose-800/80 cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1 text-rose-600 dark:text-rose-400" />
                  <span>Salir</span>
                </button>
              </>
            ) : (
              <button
                id="btn-nav-admin-login"
                type="button"
                onClick={() => handleAuthClick('login')}
                className="inline-flex items-center justify-center px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white active:scale-[0.98] rounded-xl transition-all border border-slate-200/80 dark:border-slate-700 cursor-pointer"
                title="Iniciar sesión en TapRD"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                <span>Iniciar sesión</span>
              </button>
            )}

            <button
              id="btn-nav-quiero-nfc"
              type="button"
              onClick={() => onOpenContact()}
              className="inline-flex items-center justify-center px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer shrink-0"
            >
              <Smartphone className="w-4 h-4 mr-1.5" />
              <span className="hidden xl:inline">Quiero mi solución NFC</span>
              <span className="xl:hidden">Solución NFC</span>
            </button>
          </div>

          {/* Mobile Actions: Iniciar sesión / Cerrar sesión + Menu toggle (Phones) */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
            {/* Theme Toggle Button Mobile */}
            <ThemeToggle id="navbar-mobile-theme-toggle" />

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <button
                    id="btn-mobile-header-admin"
                    type="button"
                    onClick={() => handleLinkClick('/admin')}
                    className="inline-flex items-center justify-center min-h-[38px] px-2.5 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 active:bg-blue-200 rounded-xl transition-all border border-blue-200 dark:border-blue-800/80 cursor-pointer shadow-2xs"
                    aria-label="Panel Admin"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 sm:mr-1 shrink-0" />
                    <span className="hidden min-[360px]:inline ml-1">Panel</span>
                  </button>
                ) : (
                  <button
                    id="btn-mobile-header-portal"
                    type="button"
                    onClick={() => handleLinkClick('/cliente')}
                    className="inline-flex items-center justify-center min-h-[38px] px-2.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:bg-emerald-200 rounded-xl transition-all border border-emerald-200 dark:border-emerald-800/80 cursor-pointer shadow-2xs"
                    aria-label="Mi Portal"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 sm:mr-1 shrink-0" />
                    <span className="hidden min-[360px]:inline ml-1">Portal</span>
                  </button>
                )}

                <button
                  id="btn-mobile-header-logout"
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center min-h-[38px] px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 active:bg-rose-200 rounded-xl transition-all border border-rose-200 dark:border-rose-800/80 cursor-pointer shadow-2xs"
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 sm:mr-1 shrink-0" />
                  <span className="hidden min-[360px]:inline ml-1">Salir</span>
                </button>
              </>
            ) : (
              /* Direct Mobile "Iniciar sesión" button right on the top navbar */
              <button
                id="btn-mobile-header-login"
                type="button"
                onClick={() => handleAuthClick('login')}
                className="inline-flex items-center justify-center min-h-[38px] px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
                aria-label="Iniciar sesión"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 sm:mr-1 shrink-0" />
                <span className="hidden min-[360px]:inline ml-1">Iniciar sesión</span>
                <span className="min-[360px]:hidden ml-1">Entrar</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              id="btn-mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 focus:outline-none min-w-[42px] min-h-[42px] flex items-center justify-center cursor-pointer"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-800 dark:text-slate-200" /> : <Menu className="w-6 h-6 text-slate-800 dark:text-slate-200" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu Component */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentPath={currentPath}
        onNavigate={handleLinkClick}
        onOpenContact={onOpenContact}
        onOpenAuth={handleAuthClick}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      {/* Auth Modal (Opens when Iniciar sesión or Registrarse is clicked) */}
      <AuthModal
        isOpen={authModalMode !== null}
        onClose={() => setAuthModalMode(null)}
        initialMode={authModalMode || 'login'}
        onNavigate={onNavigate}
      />
    </header>
  );
}
