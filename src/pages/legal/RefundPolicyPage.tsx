import React from 'react';
import { LegalLayout } from '../../components/legal/LegalLayout';
import { COMPANY_CONFIG } from '../../config/company';

interface RefundPolicyPageProps {
  onNavigate: (path: string) => void;
}

export function RefundPolicyPage({ onNavigate }: RefundPolicyPageProps) {
  return (
    <LegalLayout
      title="Política de Reembolsos y Garantías"
      subtitle="Condiciones aplicables a devoluciones de productos físicos NFC y reintegros por servicios digitales de TapRD."
      version={COMPANY_CONFIG.termsVersion}
      lastUpdated={COMPANY_CONFIG.lastUpdatedDate}
      currentPath="/politica-reembolso"
      onNavigate={onNavigate}
    >
      <div className="space-y-8">
        
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Garantía Técnica de Productos Físicos NFC</h2>
          <p>
            Todos los productos físicos comercializados por <strong>{COMPANY_CONFIG.commercialName}</strong> (tarjetas PVC, madera, metal, adhesivos y placas acrílicas) cuentan con garantía de funcionamiento sobre el circuito integrado y chip NFC (estándar NTAG213 / NTAG215 / NTAG216).
          </p>
          <p>
            Si al recibir el producto este presenta fallas de lectura en dispositivos compatibles, daños físicos de fábrica o error en la personalización gráfica atribuible a TapRD, el cliente tendrá derecho al reemplazo sin costo o al reembolso íntegro.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Plazo para Reportar Incidencias</h2>
          <p>
            El cliente dispone de un plazo de hasta <strong>7 días hábiles</strong> posteriores a la entrega del producto físico para notificar cualquier defecto de fábrica o lectura de chip a través de <code>{COMPANY_CONFIG.supportEmail}</code> o vía WhatsApp de soporte, adjuntando video o fotografía de la falla.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Exclusiones de Garantía</h2>
          <p>La garantía y el reembolso de productos físicos no aplican en los siguientes supuestos:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Daños ocasionados por uso indebido, golpes, dobleces extremos, exposición a calor excesivo o inmersión indebida.</li>
            <li>Incompatibilidad derivada de teléfonos inteligentes del receptor que no cuenten con receptor NFC de fábrica o que lo tengan desactivado por software.</li>
            <li>Errores en la información, ortografía o logotipos aprobados previamente por el cliente antes de la impresión.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Reembolsos en Servicios Digitales y Suscripciones</h2>
          <p>
            Dado que la activación del perfil en la nube y la asignación del subdominio se ejecutan de manera inmediata con recursos computacionales en vivo:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>No se otorgan reembolsos retroactivos por períodos mensuales o anuales ya consumidos.</li>
            <li>Si ocurriese un cobro duplicado o erróneo atribuible a la pasarela de pagos o al sistema técnico, se procederá al reintegro del 100% del monto cobrado por error de forma inmediata tras su verificación.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Modalidad y Tiempos de Reembolso</h2>
          <p>
            Los reembolsos aprobados se procesarán mediante transferencia bancaria a la cuenta indicada por el cliente en bancos de República Dominicana (Banreservas, Banco Popular, BHD u otros) o mediante reversión directa en la tarjeta utilizada, en un plazo estimado de 3 a 5 días hábiles bancarios.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
}
