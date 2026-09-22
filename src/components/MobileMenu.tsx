import React, { useEffect } from 'react';
import { 
  LogIn, 
  UserPlus, 
  Smartphone, 
  Sparkles, 
  X, 
  ChevronRight, 
  Shield, 
  HelpCircle,
  PhoneCall,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { AppUser } from '../types/user';
import { isAuthorizedAdminEmail } from '../services/authService';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenContact: (productInterest?: string) => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  user?: AppUser | null;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export function MobileMenu({
  isOpen,
  onClose,
  currentPath,
  onNavigate,
  onOpenContact,
  onOpenAuth,
  user,
  isAuthenticated,
  onLogout
}: MobileMenuProps) {
  // Prevent background body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLinkClick = (path: string) => {
    onClose();
    onNavigate(path);
  };

  const handleAuthClick = (mode: 'login' | 'register') => {
    onClose();
    if (onOpenAuth) {
      onOpenAuth(mode);
    } else {
      onNavigate('/login');
    }
  };

  const handleLogoutClick = () => {
    onClose();
    if (onLogout) {
      onLogout();
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div 
      id="mobile-menu-overlay"
      className="fixed inset-0 z-50 lg:hidden flex flex-col justify-start"
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación móvil"
    >
      {/* Backdrop oscuro con blur para cerrar al tocar fuera */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor del Drawer */}
      <div 
        id="mobile-drawer-content"
        className="relative w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xl z-10 max-h-[calc(100dvh-4.5rem)] mt-16 sm:mt-20 overflow-y-auto overscroll-contain flex flex-col"
        style={{
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))'
        }}
      >
        {/* ================================================================= */}
        {/* SECCIÓN 1: SESIÓN / AUTENTICACIÓN                                */}
        {/* ================================================================= */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border-b border-slate-800 text-white">
          {isAuthenticated ? (
            <div>
              {/* Tarjeta de Usuario Autenticado */}
              {(() => {
                const isAdmin = isAuthorizedAdminEmail(user?.email);
                return (
                  <>
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800/80">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg ${isAdmin ? 'bg-blue-600/40 text-blue-300 border-blue-500/40' : 'bg-emerald-600/40 text-emerald-300 border-emerald-500/40'} border flex items-center justify-center font-black text-xs shrink-0`}>
                          {getInitials(user?.displayName || user?.email)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate max-w-[180px]">
                            {user?.displayName || (isAdmin ? 'Administrador' : 'Cliente')}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isAdmin ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'} border capitalize shrink-0`}>
                        {isAdmin ? 'Admin' : 'Cliente'}
                      </span>
                    </div>

                    {/* Botones de acción móvil: Ir al Panel / Mi Portal y Cerrar Sesión */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {isAdmin ? (
                        <button
                          id="btn-mobile-ir-panel"
                          type="button"
                          onClick={() => handleLinkClick('/admin')}
                          className="min-h-[46px] px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4 text-white shrink-0" />
                          <span className="truncate">Panel Admin</span>
                        </button>
                      ) : (
                        <button
                          id="btn-mobile-ir-portal"
                          type="button"
                          onClick={() => handleLinkClick('/cliente')}
                          className="min-h-[46px] px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4 text-white shrink-0" />
                          <span className="truncate">Mi Portal</span>
                        </button>
                      )}

                      <button
                        id="btn-mobile-cerrar-sesion"
                        type="button"
                        onClick={handleLogoutClick}
                        className="min-h-[46px] px-3 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/35 text-rose-300 text-xs sm:text-sm font-bold border border-rose-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="truncate">Cerrar sesión</span>
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-black tracking-wide text-white uppercase">
                    Acceso a Plataforma
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  TapRD
                </span>
              </div>

              <p className="text-[11px] text-slate-300 mb-3 leading-snug">
                Inicia sesión con tus credenciales seguras para acceder a tu cuenta.
              </p>

              {/* Botón único de Iniciar Sesión (Sin registro público) */}
              <button
                id="btn-mobile-iniciar-sesion"
                type="button"
                onClick={() => handleAuthClick('login')}
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-white shrink-0" />
                <span>Iniciar sesión</span>
              </button>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* SECCIÓN 2: ENLACES PRINCIPALES DE NAVEGACIÓN                     */}
        {/* ================================================================= */}
        <div className="p-3 sm:p-4 space-y-1">
          <button
            id="mobile-nav-inicio"
            type="button"
            onClick={() => handleLinkClick('/')}
            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left text-sm font-bold flex items-center justify-between transition-colors ${
              currentPath === '/'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>Inicio</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            id="mobile-nav-productos"
            type="button"
            onClick={() => handleLinkClick('/productos')}
            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left text-sm font-bold flex items-center justify-between transition-colors ${
              currentPath.startsWith('/productos')
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>Productos NFC</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            id="mobile-nav-como-funciona"
            type="button"
            onClick={() => handleLinkClick('/#como-funciona')}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
          >
            <span>Cómo funciona</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            id="mobile-nav-para-negocios"
            type="button"
            onClick={() => handleLinkClick('/#para-negocios')}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
          >
            <span>Para negocios</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            id="mobile-nav-faq"
            type="button"
            onClick={() => handleLinkClick('/#preguntas-frecuentes')}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
          >
            <span>Preguntas frecuentes</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* ================================================================= */}
        {/* SECCIÓN 3: PERFILES DEMO EN VIVO                                 */}
        {/* ================================================================= */}
        <div className="px-3 sm:px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 px-1 mb-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ver Demos en Vivo</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              id="mobile-demo-barberia"
              type="button"
              onClick={() => handleLinkClick('/demo/barberia')}
              className="min-h-[44px] p-2 text-center text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700 shadow-2xs transition-colors flex flex-col items-center justify-center"
            >
              <span className="truncate">Barbería</span>
              <span className="text-[10px] text-slate-400 font-normal">Wilson</span>
            </button>

            <button
              id="mobile-demo-restaurante"
              type="button"
              onClick={() => handleLinkClick('/demo/restaurante')}
              className="min-h-[44px] p-2 text-center text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700 shadow-2xs transition-colors flex flex-col items-center justify-center"
            >
              <span className="truncate">Restaurante</span>
              <span className="text-[10px] text-slate-400 font-normal">Mare</span>
            </button>

            <button
              id="mobile-demo-inmobiliaria"
              type="button"
              onClick={() => handleLinkClick('/demo/inmobiliaria')}
              className="min-h-[44px] p-2 text-center text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700 shadow-2xs transition-colors flex flex-col items-center justify-center"
            >
              <span className="truncate">Inmobiliaria</span>
              <span className="text-[10px] text-slate-400 font-normal">Aura</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECCIÓN 4: CTA DE CONTACTO Y SOPORTE                             */}
        {/* ================================================================= */}
        <div className="p-3.5 sm:p-4 space-y-3">
          <button
            id="btn-mobile-drawer-contact"
            type="button"
            onClick={() => {
              onClose();
              onOpenContact();
            }}
            className="w-full min-h-[48px] py-3 px-4 text-center font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-md shadow-blue-600/20 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>Quiero mi solución NFC</span>
          </button>

          {/* Enlaces de soporte o acceso directo */}
          <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-emerald-600" />
              <span>RD: (809) 555-TAPRD</span>
            </span>
            <span>Santo Domingo, RD 🇩🇴</span>
          </div>
        </div>
      </div>
    </div>
  );
}
