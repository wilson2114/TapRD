import React from 'react';
import { LegalLayout } from '../../components/legal/LegalLayout';
import { COMPANY_CONFIG } from '../../config/company';

interface CancellationPolicyPageProps {
  onNavigate: (path: string) => void;
}

export function CancellationPolicyPage({ onNavigate }: CancellationPolicyPageProps) {
  return (
    <LegalLayout
      title="Política de Cancelación de Servicios"
      subtitle="Términos y procedimientos para la baja o cancelación de suscripciones digitales y planes de TapRD."
      version={COMPANY_CONFIG.termsVersion}
      lastUpdated={COMPANY_CONFIG.lastUpdatedDate}
      currentPath="/politica-cancelacion"
      onNavigate={onNavigate}
    >
      <div className="space-y-8">
        
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Libertad de Cancelación</h2>
          <p>
            En <strong>{COMPANY_CONFIG.commercialName}</strong> respetamos la autonomía de nuestros clientes. El titular de un servicio o plan de suscripción digital puede solicitar la cancelación o no renovación de su plan en cualquier momento, sin penalizaciones por permanencia forzosa, salvo estipulación particular acordada expresamente en un contrato corporativo.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Procedimiento para Solicitar la Cancelación</h2>
          <p>La cancelación de una suscripción puede realizarse a través de:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Portal de Clientes:</strong> Ingresando a la pestaña <em>Configuración &gt; Plan y Facturación</em> y seleccionando la opción de cancelar suscripción o no renovación.
            </li>
            <li>
              <strong>Comunicación Directa:</strong> Enviando un correo a <code>{COMPANY_CONFIG.supportEmail}</code> desde la dirección vinculada a la cuenta, indicando el nombre del negocio o slug del perfil.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Efectos de la Cancelación y Ciclo de Facturación</h2>
          <p>
            Cuando se solicita la cancelación de un plan mensual o anual con vigencia activa:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>
              El servicio continuará activo hasta la fecha de expiración del período ya abonado (fecha de corte).
            </li>
            <li>
              No se generarán cobros recurrentes en los períodos subsiguientes.
            </li>
            <li>
              Una vez alcanzada la fecha de vencimiento, el perfil comercial digital pasará al estado de <em>expirado</em> o <em>inactivo</em>, impidiendo la visualización pública hasta su reactivación.
            </li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Conservación de Datos tras la Cancelación</h2>
          <p>
            Para facilitarle la reactivación futura sin perder su configuración, los enlaces, catálogos y datos del perfil se mantendrán almacenados en modo inactivo durante un período de cortesía técnica. Si el cliente desea la eliminación completa inmediata de la información, puede solicitarla a través del canal de privacidad.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Cancelación de Pedidos de Productos Físicos NFC</h2>
          <p>
            En el caso de tarjetas, placas o expositores físicos personalizados (impresos con logo o nombre de la empresa), la cancelación de la orden solo será admitida antes de que el producto entre a la fase de producción gráfica o grabación de chip.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
}
