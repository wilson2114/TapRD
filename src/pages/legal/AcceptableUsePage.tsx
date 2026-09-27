import React from 'react';
import { LegalLayout } from '../../components/legal/LegalLayout';
import { COMPANY_CONFIG } from '../../config/company';

interface AcceptableUsePageProps {
  onNavigate: (path: string) => void;
}

export function AcceptableUsePage({ onNavigate }: AcceptableUsePageProps) {
  return (
    <LegalLayout
      title="Política de Uso Aceptable"
      subtitle="Estándares de conducta, prohibiciones estrictas y medidas de protección contra abusos en los perfiles y enlaces de TapRD."
      version={COMPANY_CONFIG.termsVersion}
      lastUpdated={COMPANY_CONFIG.lastUpdatedDate}
      currentPath="/uso-aceptable"
      onNavigate={onNavigate}
    >
      <div className="space-y-8">
        
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Propósito y Alcance</h2>
          <p>
            La plataforma <strong>{COMPANY_CONFIG.commercialName}</strong> fue creada para potenciar la visibilidad digital legítima de negocios, profesionales y emprendedores en República Dominicana. Para preservar la integridad del ecosistema, todos los usuarios y perfiles públicos deben ceñirse rigurosamente a esta Política de Uso Aceptable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Actividades y Contenidos Estrictamente Prohibidos</h2>
          <p>Está categóricamente prohibido utilizar TapRD, sus enlaces NFC o códigos QR para:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-4">
            
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
              <h4 className="text-xs font-black uppercase text-rose-500">Phishing y Estafas</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Páginas falsas que imiten bancos, instituciones gubernamentales, pasarelas de pago o servicios para robar claves o datos confidenciales.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
              <h4 className="text-xs font-black uppercase text-rose-500">Suplantación de Identidad</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Hacerse pasar por personas, marcas, funcionarios o empresas sin autorización explícita y legítima.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
              <h4 className="text-xs font-black uppercase text-rose-500">Malware y Ciberataques</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Difundir virus, troyanos, scripts maliciosos, ransomware o intentar saturar servidores mediante ataques de denegación de servicio (DoS).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
              <h4 className="text-xs font-black uppercase text-rose-500">Infracción de Marca y Copyright</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Uso ilegítimo de signos distintivos, logotipos, imágenes comerciales protegidas o venta de productos falsificados.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
              <h4 className="text-xs font-black uppercase text-rose-500">Contenido Ilícito</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Venta de sustancias prohibidas por ley, armas sin regulación, pornografía infantil, odio, violencia o discriminación.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
              <h4 className="text-xs font-black uppercase text-rose-500">Spam y Enlaces No Deseados</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Distribución masiva automatizada de enlaces no solicitados o redirecciones engañosas a dominios sospechosos.
              </p>
            </div>

          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Monitoreo y Moderación de Perfiles</h2>
          <p>
            TapRD no realiza censura previa de contenidos comerciales comunes, pero cuenta con un sistema de moderación activa y recepción de denuncias ciudadanas. En perfiles públicos se incorpora la opción <strong>"Reportar este perfil"</strong> para que cualquier persona afectada pueda alertar de infracciones.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Medidas Sancionatorias y Suspensión</h2>
          <p>
            Ante la verificación fehaciente de violaciones a esta política, TapRD se reserva el derecho de:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Suspender inmediatamente la visualización pública del perfil (/p/:slug).</li>
            <li>Inhabilitar el redireccionamiento del chip NFC o código QR asociado.</li>
            <li>Bloquear el acceso a la cuenta administrativa del cliente infractor.</li>
            <li>Denunciar y colaborar activamente con el Departamento de Investigación de Crímenes y Delitos de Alta Tecnología (DICAT) y autoridades judiciales dominicanas.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Canal de Denuncias</h2>
          <p>
            Si detecta un perfil alojado en TapRD que incurra en phishing, suplantación o cualquier conducta ilícita, puede reportarlo directamente utilizando el botón de denuncia al pie del perfil o enviando una notificación urgente a <code>{COMPANY_CONFIG.legalEmail}</code>.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
}
