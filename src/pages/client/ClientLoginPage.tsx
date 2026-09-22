import React, { useState } from 'react';
import { loginClient, resetClientPassword } from '../../services/authService';
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
  Store
} from 'lucide-react';

interface ClientLoginPageProps {
  onNavigate: (path: string) => void;
  initialMode?: 'login' | 'recovery';
}

export function ClientLoginPage({ onNavigate, initialMode = 'login' }: ClientLoginPageProps) {
  const [mode, setMode] = useState<'login' | 'recovery'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMessage('Por favor ingresa tu correo electrónico y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginClient(cleanEmail, cleanPass);
      if (result.success) {
        setSuccessMessage('¡Acceso concedido! Redirigiendo al panel de tu negocio...');
        setTimeout(() => {
          onNavigate('/cliente/dashboard');
        }, 600);
      } else {
        setErrorMessage(result.error || 'Credenciales incorrectas o acceso no autorizado.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con los servicios de autenticación.');
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
      setErrorMessage('Por favor ingresa el correo de tu negocio.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetClientPassword(cleanEmail);
      setSuccessMessage(result.message);
    } catch (err: any) {
      setErrorMessage('No se pudo enviar el correo de recuperación. Inténtalo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Acceso de demostración rápido
  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setEmail('demo@barberia.com');
    setPassword('TapRD2026!');
    try {
      const result = await loginClient('demo@barberia.com', 'TapRD2026!');
      if (result.success) {
        setSuccessMessage('Accediendo como Barbería Wilson (Modo Demostración)...');
        setTimeout(() => {
          onNavigate('/cliente/dashboard');
        }, 600);
      }
    } catch {
      setErrorMessage('Error al ingresar con la cuenta de demostración.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between antialiased selection:bg-cyan-500 selection:text-slate-950 relative overflow-hidden">
      
      {/* Luces de fondo decorativas */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-cyan-500/10 blur-[110px] pointer-events-none rounded-full" />

      {/* Header Superior */}
      <header className="p-6 relative z-10 flex items-center justify-between max-w-7xl mx-auto w-full">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a TapRD</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-black text-xs text-white">
            T
          </div>
          <span className="font-black text-sm tracking-tight text-white">TapRD</span>
        </div>
      </header>

      {/* Centro: Card de Autenticación */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 my-4">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Logo y Encabezado */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
              <Store className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {mode === 'login' ? 'Portal de Clientes' : 'Restablecer Contraseña'}
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {mode === 'login' 
                ? 'Accede para gestionar la información, servicios y redes de tu negocio.'
                : 'Ingresa tu correo para recibir las instrucciones de recuperación.'}
            </p>
          </div>

          {/* Mensajes de Alerta / Éxito */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* MODO LOGIN */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Campo Email */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-300">
                  Correo electrónico del negocio
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="negocio@tuempresa.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('recovery');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] font-bold text-cyan-400 hover:underline cursor-pointer"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botón de Enviar */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Iniciando sesión...</span>
                ) : (
                  <>
                    <span>Entrar a mi cuenta</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          ) : (
            /* MODO RECUPERACIÓN */
            <form onSubmit={handleRecovery} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-300">
                  Correo electrónico registrado
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="negocio@tuempresa.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 transition-all font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Enviando enlace...</span>
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
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Volver al inicio de sesión
              </button>
            </form>
          )}

          {/* Separador y Demo Login */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Probar demo rápido (Barbería Wilson)</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Autenticación segura respaldada por Firebase</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-600 relative z-10">
        <p>© {new Date().getFullYear()} TapRD — Tarjetas Inteligentes NFC para Negocios Dominicanos</p>
      </footer>

    </div>
  );
}
