import React from 'react';
import { LegalLayout } from '../../components/legal/LegalLayout';
import { COMPANY_CONFIG } from '../../config/company';

interface LegalNoticePageProps {
  onNavigate: (path: string) => void;
}

export function LegalNoticePage({ onNavigate }: LegalNoticePageProps) {
  return (
    <LegalLayout
      title="Aviso Legal e Identificación de la Plataforma"
      subtitle="Datos identificativos, régimen de responsabilidad y estatus legal de la plataforma TapRD."
      version={COMPANY_CONFIG.termsVersion}
      lastUpdated={COMPANY_CONFIG.lastUpdatedDate}
      currentPath="/aviso-legal"
      onNavigate={onNavigate}
    >
      <div className="space-y-8">
        
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Datos Identificativos de la Empresa</h2>
          <p>
            En cumplimiento del principio de transparencia y del marco comercial de la República Dominicana, se exponen a continuación los datos informativos de la plataforma:
          </p>

          <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 not-prose space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block">Nombre Comercial:</span>
                <span className="font-bold text-slate-900 dark:text-white">{COMPANY_CONFIG.commercialName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Estado Societario:</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">{COMPANY_CONFIG.legalStatus}</span>
              </div>
              <div>
                <span className="text-slate-500 block">RNC / Identificación Fiscal:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {COMPANY_CONFIG.rnc || 'En trámite de formalización ante la DGII'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Registro Mercantil:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {COMPANY_CONFIG.mercantileRegistration || 'En proceso ante Cámara de Comercio'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Jurisdicción y Domicilio:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{COMPANY_CONFIG.address}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Correo Electrónico Oficial:</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{COMPANY_CONFIG.email}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Naturaleza del Proveedor de Hosting</h2>
          <p>
            TapRD opera como un proveedor de servicios de la sociedad de la información que aloja perfiles comerciales digitales y suministra dispositivos de proximidad NFC. La información comercial, precios, ofertas y horarios exhibidos en cada perfil público son definidos y administrados directamente por los clientes respectivos.
          </p>
          <p>
            TapRD no se hace responsable por transacciones económicas, pagos de bienes o servicios acordados entre los visitantes del perfil y los propietarios del negocio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Continuidad del Servicio y Terceros</h2>
          <p>
            Aunque aplicamos los mayores estándares de disponibilidad y resiliencia en la nube mediante Google Cloud y Firebase, TapRD no garantiza la ausencia total de interrupciones ocasionadas por fuerza mayor, tareas indispensables de mantenimiento programado o fallas en las redes de telecomunicaciones de los proveedores de internet.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Ley Aplicable y Jurisdicción</h2>
          <p>
            Cualquier controversia relacionada con el acceso, uso o interpretación de este aviso legal se regirá por las leyes de la <strong>República Dominicana</strong>, con renuncia a cualquier otro fuero que pudiera corresponder.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
}
