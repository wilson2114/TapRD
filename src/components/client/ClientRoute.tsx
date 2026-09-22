import React from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { ShieldAlert, Loader2, MessageCircle, LogOut } from 'lucide-react';
import { getWhatsAppUrl } from '../../config/constants';

interface ClientRouteProps {
  children: React.ReactNode;
  onNavigate: (path: string) => void;
}

export function ClientRoute({ children, onNavigate }: ClientRouteProps) {
  const { client, user, loading, isAuthenticated, isSuspended, logout } = useClientAuth();

  // 1. Estado de carga inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
          <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Accediendo a tu negocio...</h2>
        <p className="text-slate-400 text-sm max-w-sm">
          Validando tu sesión con Firebase Authentication.
        </p>
      </div>
    );
  }

  // 2. Si no hay ningún usuario autenticado, redirigir a /login
  if (!user) {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        onNavigate('/login');
      }, 50);
    }

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
          <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
        </div>
        <p className="text-slate-300 text-sm">Redirigiendo a inicio de sesión...</p>
      </div>
    );
  }

  // 3. Si el usuario está autenticado como cliente pero aún no tiene perfil asignado
  if (!client) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-blue-500/20 rounded-3xl p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white mb-2">Perfil en Configuración</h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Has iniciado sesión con el correo <strong className="text-white">{user.email}</strong>, pero tu perfil comercial aún no ha sido vinculado en el sistema por el administrador de TapRD.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-xs text-slate-400 text-left">
            <p>• Tu rol asignado: <span className="text-blue-400 font-bold">CLIENT</span></p>
            <p>• El administrador de TapRD te asignará tu negocio y tarjetas NFC.</p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <a
              href={getWhatsAppUrl('18095550100', `Hola equipo TapRD, inicié sesión con ${user.email} y necesito que vinculen mi negocio a mi cuenta.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Contactar a Soporte TapRD</span>
            </a>

            <button
              type="button"
              onClick={async () => {
                await logout();
                onNavigate('/login');
              }}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Si el acceso está suspendido por el administrador (Sección 35)
  if (isSuspended) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-amber-500/20 rounded-3xl p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">Acceso al Portal Suspendido</h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              El acceso de edición para <strong className="text-white">{client.businessName}</strong> ha sido suspendido temporalmente por el administrador de TapRD. Tu perfil público digital NFC continúa activo para tus clientes.
            </p>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 text-left text-xs space-y-1">
            <p className="text-slate-400">Negocio: <strong className="text-slate-200">{client.businessName}</strong></p>
            <p className="text-slate-400">Perfil público: <span className="text-cyan-400 font-mono">taprd.com/p/{client.slug}</span></p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <a
              href={getWhatsAppUrl('18095550100', `Hola equipo TapRD, mi acceso al portal para mi negocio ${client.businessName} figura suspendido y quisiera reactivarlo.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Contactar a Soporte TapRD</span>
            </a>

            <button
              type="button"
              onClick={async () => {
                await logout();
                onNavigate('/cliente/login');
              }}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Usuario autenticado y activo
  return <>{children}</>;
}
