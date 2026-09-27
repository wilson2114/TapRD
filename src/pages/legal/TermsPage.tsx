import React from 'react';
import { LegalLayout } from '../../components/legal/LegalLayout';
import { COMPANY_CONFIG } from '../../config/company';

interface TermsPageProps {
  onNavigate: (path: string) => void;
}

export function TermsPage({ onNavigate }: TermsPageProps) {
  return (
    <LegalLayout
      title="Términos y Condiciones de Uso"
      subtitle="Condiciones generales que regulan el acceso a la plataforma, servicios digitales y adquisición de productos NFC de TapRD."
      version={COMPANY_CONFIG.termsVersion}
      lastUpdated={COMPANY_CONFIG.lastUpdatedDate}
      currentPath="/terminos"
      onNavigate={onNavigate}
    >
      <div className="space-y-8">
        
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Información General y Objeto</h2>
          <p>
            Bienvenido a <strong>{COMPANY_CONFIG.commercialName}</strong>. Los presentes Términos y Condiciones regulan la relación entre el usuario o cliente y la plataforma TapRD para la adquisición de tarjetas y dispositivos con tecnología NFC, el uso de perfiles comerciales digitales en línea, códigos QR dinámicos, servicios de hosting de perfil y paneles de gestión.
          </p>
          <p>
            El acceso y utilización de la plataforma implica el conocimiento y aceptación de estas condiciones. Si no está de acuerdo con alguno de los términos aquí contenidos, deberá abstenerse de utilizar la plataforma o contratar los servicios.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Servicios y Productos Ofrecidos</h2>
          <p>TapRD provee dos tipos principales de prestaciones:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Productos Físicos NFC:</strong> Tarjetas inteligentes (Tap Card), placas comerciales (Tap Business), expositores para reseñas (Tap Review) y adhesivos NFC (Tap Sticker).
            </li>
            <li>
              <strong>Servicios de Software y Perfiles Digitales:</strong> Alojamiento en la nube de perfiles de negocio accesibles mediante enlace público (/p/:slug), generación de códigos QR, enlace vCard y paneles de autogestión comercial.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Cuentas de Usuario y Acceso</h2>
          <p>
            Para administrar un perfil comercial, el cliente recibirá una invitación o enlace de activación seguro. El usuario es responsable de mantener la confidencialidad de sus credenciales y de toda actividad efectuada bajo su cuenta.
          </p>
          <p>
            El usuario se compromete a suministrar información verídica, vigente y comprobable de su negocio, sin suplantar identidades de terceros ni infringir derechos ajenos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Propiedad Intelectual y Derechos sobre el Contenido</h2>
          <div className="space-y-2">
            <p>
              <strong>Titularidad de TapRD:</strong> El código fuente, software, diseño de interfaz, algoritmos, bases de datos y la denominación comercial {COMPANY_CONFIG.commercialName} son titularidad exclusiva de sus creadores y desarrolladores. Queda prohibida su reproducción, ingeniería inversa o explotación no autorizada.
            </p>
            <p>
              <strong>Titularidad del Cliente:</strong> El cliente conserva en todo momento la titularidad y derechos que le correspondan sobre sus marcas registradas, nombres comerciales, logotipos, fotografías, descripciones de catálogo e información que suba a su perfil.
            </p>
            <p>
              <strong>Licencia de Operación:</strong> Al subir materiales a la plataforma, el cliente concede a TapRD una licencia no exclusiva, limitada y revocable únicamente para alojar, desplegar y transmitir dicho contenido a través del perfil público contratado.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Responsabilidad del Cliente sobre el Contenido Publicado</h2>
          <p>
            El cliente declara y garantiza que cuenta con las autorizaciones, permisos y derechos de propiedad intelectual necesarios sobre cualquier logotipo, imagen, número de cuenta bancaria o información comercial que publique.
          </p>
          <p>
            El cliente mantendrá indemne a TapRD frente a cualquier reclamación, demanda o sanción derivada del uso no autorizado de marcas de terceros o difusión de información ilícita en su perfil.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">6. Separación de Estados y Desactivación de Servicios</h2>
          <p>
            Para garantizar claridad técnica y jurídica, TapRD gestiona de forma diferenciada:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Estado de Cuenta:</strong> Activa, inactiva, suspendida o en proceso de baja.</li>
            <li><strong>Estado de Acceso:</strong> Habilitación de inicio de sesión al portal.</li>
            <li><strong>Estado de Perfil:</strong> Visibilidad pública en internet de la tarjeta digital.</li>
            <li><strong>Estado de Suscripción:</strong> Vigencia de pago y plan contratado.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">7. Modificaciones a los Términos</h2>
          <p>
            TapRD se reserva el derecho de actualizar estos términos para reflejar cambios tecnológicos, mejoras en los servicios o adecuaciones regulatorias. Las modificaciones serán publicadas en esta página con indicación de la versión vigente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">8. Jurisdicción y Legislación Aplicable</h2>
          <p>
            Las presentes condiciones se rigen e interpretan con base en las leyes de la <strong>República Dominicana</strong>. Cualquier controversia que no pueda resolverse por mutuo acuerdo se someterá a los tribunales ordinarios de la jurisdicción correspondiente del Distrito Nacional o Santo Domingo.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
}
