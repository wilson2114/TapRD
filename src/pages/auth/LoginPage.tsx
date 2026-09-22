import React, { useState, useEffect } from 'react';
import { loginUser, sendPasswordReset, getCurrentUser, isAuthorizedAdminEmail } from '../../services/authService';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Sparkles,
  KeyRound,
  Loader2,
  Info
} from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

interface LoginPageProps {
  onNavigate: (path: string) => void;
  initialMode?: 'login' | 'recovery';
}

export function LoginPage({ onNavigate, initialMode = 'login' }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'recovery'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Si ya tiene sesión activa, redirigir a su área correspondiente de forma segura
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const isOwnerAdmin = isAuthorizedAdminEmail(currentUser.email);
      if (isOwnerAdmin) {
        onNavigate('/admin');
      } else {
        onNavigate('/cliente');
      }
    }
  }, [onNavigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMessage('Por favor introduce tu correo electrónico y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(cleanEmail, cleanPass);
      if (result.success) {
        const isOwnerAdmin = isAuthorizedAdminEmail(cleanEmail);
        if (isOwnerAdmin && result.role === 'ADMIN') {
          setSuccessMessage('¡Bienvenido, Administrador! Accediendo al panel de control...');
          setTimeout(() => {
            onNavigate('/admin');
          }, 500);
        } else {
          setSuccessMessage('¡Acceso concedido! Redirigiendo a tu portal comercial...');
          setTimeout(() => {
            onNavigate('/cliente');
          }, 500);
        }
      } else {
        setErrorMessage(result.error || 'Credenciales incorrectas o acceso no autorizado.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión con el servicio de autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Por favor introduce tu correo electrónico registrado.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendPasswordReset(cleanEmail);
      if (result.success) {
        setSuccessMessage(result.message);
      } else {
        setErrorMessage(result.message || 'No se pudo enviar el correo de recuperación.');
      }
    } catch {
      setErrorMessage('Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      <SEOHead 
        title={mode === 'login' ? 'Iniciar Sesión | TapRD' : 'Recuperar Contraseña | TapRD'}
        description="Acceso exclusivo al sistema TapRD mediante Firebase Authentication para administración y clientes registrados."
      />

      {/* Luces y ambientación de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-900/25 via-blue-950/10 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Logo y Encabezado */}
        <div className="text-center mb-8">
          <button 
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 mb-4 group cursor-pointer focus:outline-hidden"
            title="Volver a la página principal"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform ring-4 ring-white/5">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">TapRD</span>
          </button>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {mode === 'login' ? 'Iniciar sesión' : 'Recuperar contraseña'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 font-medium">
            {mode === 'login' 
              ? 'Accede con las credenciales registradas de tu cuenta.'
              : 'Te enviaremos un enlace oficial a tu correo registrado.'}
          </p>
        </div>

        {/* Tarjeta de Formulario Principal */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          {/* Mensajes de Alerta / Éxito */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
              <div className="font-medium leading-relaxed">{successMessage}</div>
            </div>
          )}

          {mode === 'login' ? (
            /* FORMULARIO DE INICIO DE SESIÓN */
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              
              {/* Campo Correo Electrónico */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@negocio.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[44px]"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      setMode('recovery');
                    }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botón Iniciar Sesión */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer min-h-[44px] active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar sesión</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Nota sobre alta y activación de clientes */}
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-center">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  ¿Eres cliente de TapRD? Tu cuenta es creada exclusivamente por administración. Recibirás un enlace a tu correo para activar tu contraseña.
                </p>
              </div>
            </form>
          ) : (
            /* FORMULARIO DE RECUPERACIÓN DE CONTRASEÑA */
            <form onSubmit={handleRecovery} className="space-y-5" noValidate>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Correo electrónico registrado
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@negocio.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[44px]"
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-500 leading-normal">
                  Ingresa el correo con el que se dio de alta tu negocio o administración. Te llegará un enlace de restablecimiento seguro.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando correo...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Enviar instrucciones</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setMode('login');
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al inicio de sesión</span>
              </button>
            </form>
          )}

          {/* Seguridad y Privacidad */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Autenticación cifrada con Google Firebase Auth</span>
          </div>
        </div>

        {/* Enlace al sitio público */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="text-xs text-slate-500 hover:text-slate-400 font-medium transition-colors cursor-pointer"
          >
            ← Volver al sitio principal de TapRD
          </button>
        </div>

      </div>
    </div>
  );
}
