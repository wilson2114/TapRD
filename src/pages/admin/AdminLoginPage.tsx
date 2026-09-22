import React, { useState, useEffect } from 'react';
import { loginAdmin, getCurrentUser, isAuthorizedAdminEmail } from '../../services/authService';
import { ADMIN_DEMO_EMAIL, ADMIN_DEMO_PASSWORD } from '../../config/constants';
import { SEOHead } from '../../components/SEOHead';
import { 
  ArrowLeft, 
  Lock, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Key, 
  CheckCircle2,
  Info
} from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (path: string) => void;
  initialMode?: 'login' | 'register';
}

export function AdminLoginPage({ onNavigate }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Comprobación segura de sesión: solo administradores autorizados van a /admin
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (isAuthorizedAdminEmail(user.email)) {
        onNavigate('/admin');
      } else {
        onNavigate('/cliente');
      }
    }
  }, [onNavigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const result = await loginAdmin(email, password);
      setLoading(false);

      if (result.success) {
        setSuccessMsg('¡Inicio de sesión exitoso! Accediendo al panel de administración...');
        setTimeout(() => {
          onNavigate('/admin');
        }, 500);
      } else {
        setError(result.error || 'Credenciales inválidas o acceso administrativo no autorizado.');
      }
    } catch {
      setLoading(false);
      setError('Error inesperado durante el inicio de sesión. Por favor intenta de nuevo.');
    }
  };

  const handleFillDemo = () => {
    setEmail(ADMIN_DEMO_EMAIL);
    setPassword(ADMIN_DEMO_PASSWORD);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <SEOHead 
        title="Acceso de Administración | TapRD"
        description="Portal exclusivo para la administración y dirección de TapRD con autenticación segura en Google Firebase."
      />

      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <button
          id="btn-volver-web"
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mb-6 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver al sitio web</span>
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-2xl shadow-xl shadow-blue-600/30 mb-4 ring-4 ring-blue-500/20">
            <span>T</span>
            <span className="w-2 h-2 rounded-full bg-cyan-300 ml-0.5 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
            Tap<span className="text-blue-500">RD</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">
            Panel de Control Administrativo Central
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Mensajes de Éxito o Error */}
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Notificación de credenciales DEMO */}
          <div className="bg-blue-950/40 border border-blue-500/20 rounded-2xl p-3.5 sm:p-4 text-xs space-y-2">
            <div className="flex items-center justify-between text-blue-300 font-bold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Acceso Rápido / Demo de Propietario</span>
              </span>
              <button
                id="btn-autocompletar-demo"
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] font-black text-blue-400 hover:text-blue-300 underline cursor-pointer"
              >
                Autocompletar
              </button>
            </div>
            <div className="text-[11px] text-slate-400 font-mono space-y-1">
              <p>Email: <span className="text-white font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{ADMIN_DEMO_EMAIL}</span></p>
              <p>Contraseña: <span className="text-white font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{ADMIN_DEMO_PASSWORD}</span></p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Correo electrónico autorizado
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@taprd.com o tu email de propietario"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[44px]"
                />
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
            >
              {loading ? (
                <span>Validando credenciales...</span>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Entrar al Panel Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Aviso informativo de alta de cuentas */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-slate-400 text-xs">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              El registro público está desactivado. Las cuentas comerciales se generan desde este panel y se activan mediante enlace por correo electrónico.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-slate-500 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Autenticación Cifrada con Firebase Authentication</span>
          </div>

        </div>
      </div>
    </div>
  );
}
