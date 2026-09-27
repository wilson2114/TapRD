import React from 'react';
import { LegalLayout } from '../../components/legal/LegalLayout';
import { COMPANY_CONFIG } from '../../config/company';

interface CookiesPageProps {
  onNavigate: (path: string) => void;
}

export function CookiesPage({ onNavigate }: CookiesPageProps) {
  return (
    <LegalLayout
      title="Política de Cookies y Almacenamiento Local"
      subtitle="Información sobre las tecnologías de almacenamiento en navegador y cookies empleadas por TapRD."
      version={COMPANY_CONFIG.cookiesVersion}
      lastUpdated={COMPANY_CONFIG.lastUpdatedDate}
      currentPath="/cookies"
      onNavigate={onNavigate}
    >
      <div className="space-y-8">
        
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. ¿Qué son las Cookies y Almacenamiento Web?</h2>
          <p>
            Las cookies y el almacenamiento local (LocalStorage / SessionStorage) son pequeños archivos de datos o fragmentos de texto que los sitios web depositan en el navegador de su dispositivo para recordar configuraciones, sesiones de inicio y mejorar la experiencia de usuario.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Tecnologías Empleadas en TapRD</h2>
          <p>En TapRD utilizamos principalmente almacenamiento estrictamente técnico y funcional:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Autenticación y Seguridad (Firebase Auth):</strong> Mantiene de forma segura la sesión del cliente o administrador para que no deba ingresar su contraseña en cada clic.
            </li>
            <li>
              <strong>Preferencia de Tema Visual:</strong> Almacena en <code>localStorage</code> si el usuario prefiere visualizar la interfaz en modo claro o modo oscuro.
            </li>
            <li>
              <strong>Métricas Técnicas de Toque NFC:</strong> Registros temporales no biométricos para evitar el conteo múltiple accidental de toques en una misma sesión.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Cookies de Terceros y Publicidad</h2>
          <p>
            <strong>TapRD NO utiliza cookies de redes publicitarias externas, ni vende historiales de navegación a anunciantes terceros ni implementa píxeles de rastreo invasivos entre dominios.</strong>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Cómo Deshabilitar o Eliminar Cookies</h2>
          <p>
            Usted puede configurar su navegador en cualquier momento para bloquear o borrar las cookies y datos de sitios web almacenados:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Google Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios.</li>
            <li><strong>Safari:</strong> Preferencias &gt; Privacidad &gt; Administrar datos del sitio web.</li>
            <li><strong>Mozilla Firefox:</strong> Opciones &gt; Privacidad &amp; Seguridad &gt; Cookies y datos del sitio.</li>
          </ul>
          <p className="text-xs text-slate-500 mt-2">
            Nota: La desactivación de elementos estrictamente técnicos de sesión podría impedir el inicio de sesión correcto en el panel administrativo o portal del cliente.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
}
