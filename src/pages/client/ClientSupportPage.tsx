import React, { useState } from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { ClientLayout } from '../../components/client/ClientLayout';
import { getWhatsAppUrl } from '../../config/constants';
import { 
  MessageCircle, 
  HelpCircle, 
  Phone, 
  Send, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface ClientSupportPageProps {
  onNavigate: (path: string) => void;
}

const FAQS = [
  {
    q: '¿Los cambios que hago en este portal se reflejan de inmediato en mi tarjeta física?',
    a: 'Sí. Al actualizar tus servicios, teléfonos, logo u horarios en este portal, se guardan al instante en la nube. Cuando cualquier cliente toque tu tarjeta o escanee tu código QR, verá la versión más reciente sin necesidad de reprogramar tu tarjeta.'
  },
  {
    q: '¿Qué teléfonos son compatibles con la tarjeta inteligente TapRD?',
    a: 'Todos los iPhones del iPhone Xs en adelante (año 2018+) y prácticamente el 98% de los teléfonos Android modernos cuentan con lector NFC nativo activado. Para teléfonos más antiguos, el código QR impreso en el reverso de la tarjeta garantiza compatibilidad del 100%.'
  },
  {
    q: '¿Cómo puedo solicitar tarjetas NFC adicionales para mis empleados o sucursales?',
    a: 'Puedes escribirnos directamente a través del botón de WhatsApp abajo indicando tu negocio. Ofrecemos paquetes con descuento para equipos comerciales y réplicas con perfiles personalizados para cada barbero, agente o profesional.'
  },
  {
    q: '¿Cómo consigo más reseñas de 5 estrellas en Google?',
    a: 'Ve a la sección "Información" e ingresa tu enlace directo de Google Reviews. Cuando un cliente quede satisfecho con tu servicio, pídele que acerque su teléfono a tu tarjeta TapRD; se le abrirá directamente la pantalla para calificar tu negocio con 5 estrellas en menos de 5 segundos.'
  }
];

export function ClientSupportPage({ onNavigate }: ClientSupportPageProps) {
  const { client } = useClientAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [messageText, setMessageText] = useState('');

  if (!client) return null;

  const supportWhatsAppUrl = getWhatsAppUrl(
    '18095550100',
    `Hola equipo TapRD, soy ${client.ownerName || 'el encargado'} del negocio ${client.businessName} (taprd.com/p/${client.slug}). Necesito asistencia con lo siguiente: ${messageText || 'Tengo una consulta.'}`
  );

  return (
    <ClientLayout
      currentPath="/cliente/soporte"
      onNavigate={onNavigate}
      title="Centro de Ayuda & Soporte"
      subtitle="Estamos a tu disposición para ayudarte a impulsar las ventas y presencia digital de tu negocio."
      actions={
        <a
          href={supportWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-white" />
          <span>WhatsApp Soporte</span>
        </a>
      }
    >
      <div className="space-y-6">

        {/* Banner de Contacto Directo */}
        <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-emerald-900/50 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <MessageCircle className="w-4 h-4 fill-emerald-400" />
            <span>Atención Prioritaria para Negocios TapRD</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white max-w-xl">
            ¿Tienes alguna consulta o necesitas una nueva tarjeta?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Nuestro equipo en Santo Domingo te asiste con programación NFC, optimización de perfil y reposición de tarjetas.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={supportWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>Chatear por WhatsApp con un Especialista</span>
            </a>

            <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5 py-2 sm:py-0">
              <Phone className="w-3.5 h-3.5" />
              <span>Lunes a Sábado: 8:00 AM – 7:00 PM</span>
            </div>
          </div>
        </div>

        {/* Mensaje Rápido a Soporte */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Enviar Consulta</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Escribe tu duda y te redirigiremos a WhatsApp con tu mensaje listo para enviar.</p>
          </div>

          <div className="space-y-3">
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Escribe aquí tu pregunta o solicitud para ${client.businessName}...`}
              className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-blue-500 transition-all font-medium resize-none"
            />

            <div className="flex justify-end">
              <a
                href={supportWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400 dark:text-white" />
                <span>Enviar mensaje por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Preguntas Frecuentes */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Preguntas Frecuentes</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Respuestas rápidas a las dudas comunes sobre el uso de tu tarjeta TapRD.</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={faq.q} className="py-3">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2.5 pr-6 animate-in fade-in">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </ClientLayout>
  );
}
