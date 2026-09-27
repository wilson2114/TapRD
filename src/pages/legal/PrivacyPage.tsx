import React from 'react';
import { LegalLayout } from '../../components/legal/LegalLayout';
import { COMPANY_CONFIG } from '../../config/company';

interface PrivacyPageProps {
  onNavigate: (path: string) => void;
}

export function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  return (
    <LegalLayout
      title="Política de Privacidad y Protección de Datos"
      subtitle="Explicación detallada del tratamiento, almacenamiento, minimización y ejercicio de derechos sobre los datos personales en TapRD."
      version={COMPANY_CONFIG.privacyVersion}
      lastUpdated={COMPANY_CONFIG.lastUpdatedDate}
      currentPath="/privacidad"
      onNavigate={onNavigate}
    >
      <div className="space-y-8">
        
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Principio de Minimización y Compromiso</h2>
          <p>
            En <strong>{COMPANY_CONFIG.commercialName}</strong> la protección de los datos personales de nuestros clientes y visitantes es un principio rector. Aplicamos estrictamente el criterio de <em>minimización de datos</em>: no recopilamos ni almacenamos información que no sea estrictamente indispensable para la prestación y operación técnica de los servicios contratados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Qué Datos Recopilamos</h2>
          <p>TapRD únicamente procesa las siguientes categorías de información:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Datos de Identificación y Contacto de la Cuenta:</strong> Nombre del titular o contacto, dirección de correo electrónico y teléfono/WhatsApp.
            </li>
            <li>
              <strong>Datos Comerciales del Negocio:</strong> Nombre comercial, categoría o sector, descripción de servicios, horarios de apertura, enlaces a redes sociales y datos de ubicación física comercial.
            </li>
            <li>
              <strong>Datos Técnicos y de Autenticación:</strong> Identificador único de usuario (UID de Firebase Authentication), registros de fecha/hora de último inicio de sesión y versión de consentimiento aceptada.
            </li>
            <li>
              <strong>Métricas de Navegación del Perfil:</strong> Contador agregado y anónimo de toques NFC y visitas a la tarjeta digital pública (sin recopilación de perfiles biométricos ni rastreo invasivo entre sitios).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Finalidad del Tratamiento</h2>
          <p>La información recopilada se destina exclusivamente a:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Habilitar el funcionamiento de las tarjetas y dispositivos NFC adquiridos.</li>
            <li>Publicar y servir la página web del perfil comercial digital en /p/:slug.</li>
            <li>Permitir al usuario autenticado editar y gestionar la información de su negocio.</li>
            <li>Atender solicitudes de soporte, garantías o pedidos adicionales.</li>
            <li>Cumplir con las obligaciones legales, tributarias y de facturación que resulten aplicables en República Dominicana.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Almacenamiento y Seguridad de la Información</h2>
          <p>
            Los datos son almacenados en infraestructura de computación en la nube provista por Google Cloud Platform (Firebase Firestore y Firebase Authentication), protegidos con protocolos de cifrado en tránsito (TLS/HTTPS) y en reposo (AES-256).
          </p>
          <p>
            El acceso a las bases de datos está restringido mediante reglas de seguridad de nivel granular (Firestore Security Rules), impidiendo que usuarios no autorizados consulten información de clientes distintos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Destinatarios y Acceso a la Información</h2>
          <p>
            <strong>Información Pública:</strong> Aquellos datos que el cliente decide voluntariamente publicar en su perfil digital (teléfono, servicios, redes, horarios) son de acceso público para cualquier persona que escanee la tarjeta NFC o abra el enlace.
          </p>
          <p>
            <strong>Información Privada:</strong> Las contraseñas, correos de administración interna y contratos no son accesibles al público ni se comercializan o transfieren a terceros para fines de publicidad o corretaje de datos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">6. Plazos de Conservación de Datos</h2>
          <p>
            Los datos se conservarán mientras la relación comercial y la cuenta del cliente permanezcan activas.
          </p>
          <p>
            En caso de solicitud de eliminación de cuenta, la información del perfil público y credenciales de acceso se deshabilitarán de inmediato. Aquella documentación vinculada a transacciones comerciales, facturación o contratos se mantendrá bloqueada durante el plazo de prescripción legal exigido por el Código de Comercio y leyes tributarias dominicanas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">7. Derechos del Titular (Derechos ARCO)</h2>
          <p>
            Como titular de los datos personales, usted tiene derecho a:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Acceso:</strong> Conocer qué datos personales suyos posee TapRD y solicitar una copia de los mismos.</li>
            <li><strong>Rectificación:</strong> Solicitar la corrección o actualización de información inexacta o desactualizada.</li>
            <li><strong>Cancelación / Eliminación:</strong> Solicitar la supresión de sus datos cuando considere que no son necesarios o haya finalizado el servicio.</li>
            <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos para determinados fines específicos.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">8. Canal de Atención y Ejercicio de Derechos</h2>
          <p>
            Los clientes con cuenta activa pueden gestionar sus solicitudes de privacidad directamente desde el portal en la sección 
            <button 
              type="button" 
              onClick={() => onNavigate('/cliente/privacidad')} 
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline mx-1 cursor-pointer"
            >
              /cliente/privacidad
            </button>.
          </p>
          <p>
            Alternativamente, cualquier titular puede dirigir una comunicación formal por correo electrónico a:
            <strong className="block text-slate-900 dark:text-white mt-1">{COMPANY_CONFIG.legalEmail}</strong>
          </p>
        </section>

      </div>
    </LegalLayout>
  );
}
