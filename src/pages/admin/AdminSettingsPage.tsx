import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PUBLIC_BASE_URL, WHATSAPP_NUMBER } from '../../config/constants';
import { getRegisteredAdmins, createAdminUser } from '../../services/adminAuthService';
import { Settings, Save, Check, Database, Key, Globe, Shield, Radio, Server, Code, UserPlus, Users, ShieldCheck } from 'lucide-react';

interface AdminSettingsPageProps {
  onNavigate: (path: string) => void;
}

export function AdminSettingsPage({ onNavigate }: AdminSettingsPageProps) {
  const [baseUrl, setBaseUrl] = useState(PUBLIC_BASE_URL);
  const [supportWhatsapp, setSupportWhatsapp] = useState(WHATSAPP_NUMBER);
  const [currency, setCurrency] = useState('RD$');
  const [saved, setSaved] = useState(false);
  const [admins, setAdmins] = useState(() => getRegisteredAdmins());

  // Formulario rápido para nuevo admin
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'superadmin'>('admin');
  const [adminMsg, setAdminMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMsg(null);

    const result = createAdminUser(newAdminName, newAdminEmail, newAdminPassword, newAdminRole);
    if (result.success) {
      setAdminMsg({ type: 'success', text: `¡Administrador ${newAdminName} registrado con éxito!` });
      setAdmins(getRegisteredAdmins());
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setTimeout(() => setAdminMsg(null), 3500);
    } else {
      setAdminMsg({ type: 'error', text: result.error || 'Error al registrar administrador.' });
    }
  };

  return (
    <AdminLayout
      currentPath="/admin/configuracion"
      onNavigate={onNavigate}
      title="Configuración de la Plataforma"
      subtitle="Parámetros globales del sistema, URLs base de perfiles NFC y arquitectura futura."
    >
      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        
        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Configuración general actualizada temporalmente en la sesión.</span>
          </div>
        )}

        {/* 1. Parámetros Globales */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900">
              1. Enlaces & Dominio de Producción
            </h2>
            <p className="text-xs text-slate-500">
              Configura la URL base que se graba en los chips NFC
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                PUBLIC_BASE_URL (URL Base para Perfiles NFC)
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-mono focus:outline-hidden focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Por defecto: <code className="text-blue-600 font-bold">https://taprd.com</code> (conceptual durante la fase DEMO).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  WhatsApp Oficial de Atención
                </label>
                <input
                  type="text"
                  value={supportWhatsapp}
                  onChange={(e) => setSupportWhatsapp(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-mono focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Moneda Predeterminada
                </label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Guardar parámetros
              </button>
            </div>
          </div>
        </div>

        {/* 2. Cuentas de Administrador Registradas */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  2. Administradores del Sistema
                </h2>
                <p className="text-xs text-slate-500">
                  Cuentas con credenciales autorizadas para gestionar TapRD
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddAdmin(!showAddAdmin)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-400" />
              <span>{showAddAdmin ? 'Cerrar formulario' : 'Registrar nuevo administrador'}</span>
            </button>
          </div>

          {/* Mensaje de estado */}
          {adminMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                adminMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>{adminMsg.text}</span>
            </div>
          )}

          {/* Formulario desplegable para agregar nuevo admin */}
          {showAddAdmin && (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in duration-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Registrar nuevo Administrador
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    required
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="Ej: Wilson Brito"
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correo administrativo</label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@correo.com"
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rol de Acceso</label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as 'admin' | 'superadmin')}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="admin">Administrador</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCreateAdmin}
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Guardar Administrador</span>
                </button>
              </div>
            </div>
          )}

          {/* Tabla / Lista de Administradores */}
          <div className="divide-y divide-slate-100">
            {admins.map((admin, idx) => (
              <div key={admin.email || idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {admin.name ? admin.name.slice(0, 2).toUpperCase() : 'AD'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{admin.name}</span>
                      <span className="text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                        {admin.role}
                      </span>
                    </p>
                    <p className="text-slate-400 font-mono text-[11px]">{admin.email}</p>
                  </div>
                </div>

                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Activo
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Preparación de Infraestructura Cloud & Backend (TODOs de Fase SaaS) */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Server className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-base font-black text-white">
                  3. Conexión de Base de Datos & Backend (Próxima Fase)
                </h2>
                <p className="text-xs text-slate-400">
                  Arquitectura preparada para pasar de DEMO a SaaS comercial
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase bg-blue-900/60 text-blue-300 px-2.5 py-1 rounded-full border border-blue-700/50">
              Roadmap SaaS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Database Card */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <Database className="w-4 h-4" />
                <span>Base de Datos Persistente</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {/*
                  TODO: Conectar cliente a Firebase Firestore / Supabase PostgreSQL.
                  Reemplazar clientService.ts con llamadas asíncronas hacia API REST o SDK directo.
                */}
                Estructura de tipos <code className="text-cyan-300">Client</code>, <code className="text-cyan-300">ClientService</code> y <code className="text-cyan-300">ClientSettings</code> lista para sincronización en la nube.
              </p>
            </div>

            {/* Auth Card */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Key className="w-4 h-4" />
                <span>Autenticación Real (RBAC)</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {/*
                  TODO: Conectar Firebase Auth / Supabase Auth con soporte para
                  multi-tenancy y acceso de clientes a su propio perfil para auto-gestión.
                */}
                Control de sesión preparado en <code className="text-cyan-300">adminAuthService.ts</code> listo para intercambiar por tokens JWT seguros.
              </p>
            </div>

            {/* Image Storage Card */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Globe className="w-4 h-4" />
                <span>Storage de Imágenes y Logos</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {/*
                  TODO: Conectar almacenamiento en bucket con CDN para fotos de productos,
                  banners y logotipos de comercios dominicanos.
                */}
                Componente de formulario listo para enviar multipart/form-data o firmas de subida directa.
              </p>
            </div>

            {/* Analytics Card */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Radio className="w-4 h-4" />
                <span>Telemetría de Taps NFC</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {/*
                  TODO: Contador de toques NFC en tiempo real, clics en WhatsApp, descargas de vCard
                  y geolocalización de lecturas.
                */}
                Módulo <code className="text-cyan-300">analytics.ts</code> preparado para registrar eventos de interacción sin violar privacidad.
              </p>
            </div>
          </div>
        </div>

      </form>
    </AdminLayout>
  );
}
