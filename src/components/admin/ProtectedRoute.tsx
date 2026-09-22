import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert, Loader2, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigate: (path: string) => void;
}

/**
 * COMPONENTE DE PROTECCIÓN DE RUTAS ADMINISTRATIVAS
 * - Si está comprobando autenticación: muestra pantalla de carga
 * - Si no está autenticado: redirige automáticamente a /admin/login
 * - Si está autenticado pero sin rol administrativo: muestra advertencia de permisos
 * - Si está autorizado: renderiza la interfaz protegida
 */
export function ProtectedRoute({ children, onNavigate }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();

  // 1. Estado de verificación inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Verificando sesión segura...</h2>
        <p className="text-slate-400 text-sm max-w-sm">
          Conectando con Firebase Authentication para validar credenciales de administrador.
        </p>
      </div>
    );
  }

  // 2. Si no está autenticado, redirigir a /login
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        onNavigate('/login');
      }, 50);
    }

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
        </div>
        <p className="text-slate-300 text-sm">Redirigiendo a inicio de sesión...</p>
      </div>
    );
  }

  // 3. Si está autenticado pero no tiene rol de ADMIN
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5 text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Acceso restringido</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            El panel administrativo está reservado exclusivamente para la administración de TapRD. Los clientes deben utilizar su portal comercial privado.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onNavigate('/cliente')}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ir a mi portal comercial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                logout();
                onNavigate('/login');
              }}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-all cursor-pointer"
            >
              Cerrar sesión e ingresar con otra cuenta
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="w-full py-2.5 px-4 text-slate-500 hover:text-slate-400 text-xs font-medium transition-colors cursor-pointer"
            >
              Volver a la página principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Usuario autenticado y autorizado
  return <>{children}</>;
}
