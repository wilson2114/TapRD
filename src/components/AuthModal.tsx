import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  Info, 
  Lock, 
  Mail, 
  Key, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { loginUser, isAuthorizedAdminEmail } from '../services/authService';
import { ADMIN_DEMO_EMAIL, ADMIN_DEMO_PASSWORD } from '../config/constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
  onNavigate?: (path: string) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
  onNavigate
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'info'>('login');

  // Estados de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estados de UI
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode('login');
    setError(null);
    setSuccessMsg(null);
  }, [initialMode, isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await loginUser(email, password);
      setLoading(false);
      if (res.success) {
        const isOwnerAdmin = isAuthorizedAdminEmail(res.user?.email);
        const destination = isOwnerAdmin ? '/admin' : '/cliente';
        setSuccessMsg(`¡Bienvenido! Redirigiendo a tu espacio seguro...`);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
          if (onNavigate) onNavigate(destination);
        }, 500);
      } else {
        setError(res.error || 'Credenciales incorrectas o acceso no autorizado.');
      }
    } catch {
      setLoading(false);
      setError('Error al conectar con el servicio de autenticación.');
    }
  };

  const handleFillDemo = () => {
    setEmail(ADMIN_DEMO_EMAIL);
    setPassword(ADMIN_DEMO_PASSWORD);
    setError(null);
  };

  const handleOpenFullScreen = () => {
    onClose();
    if (onNavigate) {
      onNavigate('/login');
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl shadow-slate-900/15 overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Cabecera del modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-xs">
              <span>T</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 ml-0.5 animate-pulse" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-sm font-black text-slate-950 dark:text-white tracking-tight">
                Tap<span className="text-blue-600 dark:text-blue-400">RD</span> Acceso
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                Portal Administrativo y Comercial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleOpenFullScreen}
              title="Abrir en pantalla completa"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              id="btn-auth-modal-close"
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pestañas de modo: Iniciar sesión / Clientes nuevos */}
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 p-1 bg-slate-100/90 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 gap-1">
            <button
              id="auth-modal-tab-login"
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`min-h-[40px] py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-300 shadow-xs border border-slate-200/80 dark:border-slate-600 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar sesión</span>
            </button>

            <button
              id="auth-modal-tab-info"
              type="button"
              onClick={() => {
                setMode('info');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`min-h-[40px] py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'info'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-300 shadow-xs border border-slate-200/80 dark:border-slate-600 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Nuevos Clientes</span>
            </button>
          </div>
        </div>

        {/* Cuerpo del formulario (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Alertas */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Formulario de Inicio de Sesión */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="auth-modal-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@taprd.com o tu email registrado"
                    autoComplete="email"
                    className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="auth-modal-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 shadow-2xs transition-all"
                  />
                </div>
              </div>

              <button
                id="btn-auth-modal-submit-login"
                type="submit"
                disabled={loading}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Verificando...' : 'Entrar a mi cuenta'}</span>
              </button>

              {/* Botón de Autocompletar Demo */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  id="btn-auth-modal-fill-demo"
                  type="button"
                  onClick={handleFillDemo}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>Probar con cuenta Demo de Administración</span>
                </button>
              </div>
            </form>
          )}

          {/* Información para Nuevos Clientes (Sin registro público) */}
          {mode === 'info' && (
            <div className="space-y-4 text-left">
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold text-sm mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Alta Exclusiva por Administración</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Para garantizar la máxima seguridad y vinculación de tus tarjetas NFC, las cuentas de negocio son creadas y autorizadas directamente por el equipo de TapRD.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    <strong className="text-slate-900 dark:text-white">Solicitud o pedido:</strong> TapRD configura tu perfil y tus tarjetas inteligentes.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </div>
                  <p>
                    <strong className="text-slate-900 dark:text-white">Enlace de activación:</strong> Recibes un correo electrónico seguro para establecer tu contraseña.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    3
                  </div>
                  <p>
                    <strong className="text-slate-900 dark:text-white">Acceso al portal:</strong> Inicias sesión con tu correo y contraseña para gestionar tu negocio.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate('/activar');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Tengo un enlace o código de activación</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                  }}
                  className="w-full py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Volver a Iniciar Sesión</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer de seguridad */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Google Firebase Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
