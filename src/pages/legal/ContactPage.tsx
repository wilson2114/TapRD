import React, { useState } from 'react';
import { LegalLayout } from '../../components/legal/LegalLayout';
import { COMPANY_CONFIG } from '../../config/company';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, MessageCircle, Clock } from 'lucide-react';
import { getWhatsAppUrl } from '../../config/constants';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('comercial');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    // Abrir enlace directo a correo o WhatsApp
    const body = `Nombre: ${name}\nCorreo: ${email}\nMotivo: ${subject}\n\nMensaje:\n${message}`;
    const mailto = `mailto:${COMPANY_CONFIG.email}?subject=${encodeURIComponent(`[Contacto TapRD] ${subject}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    setSubmitted(true);
  };

  const whatsappHref = getWhatsAppUrl(
    COMPANY_CONFIG.phone,
    '¡Hola TapRD! Me comunico desde la página oficial de contacto.'
  );

  return (
    <LegalLayout
      title="Contacto Oficial y Canales de Atención"
      subtitle="Comunícate con nuestro equipo para asesoría comercial de productos NFC, soporte técnico o consultas legales."
      version={COMPANY_CONFIG.termsVersion}
      lastUpdated={COMPANY_CONFIG.lastUpdatedDate}
      currentPath="/contacto"
      onNavigate={onNavigate}
    >
      <div className="space-y-8">
        
        {/* Canales Directos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose">
          
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Atención General</h4>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold break-all">{COMPANY_CONFIG.email}</p>
            <p className="text-[11px] text-slate-500">Cotizaciones y dudas comerciales</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Legal y Privacidad</h4>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-bold break-all">{COMPANY_CONFIG.legalEmail}</p>
            <p className="text-[11px] text-slate-500">Derechos ARCO y contratos</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">WhatsApp Rápido</h4>
            <a 
              href={whatsappHref} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline block"
            >
              {COMPANY_CONFIG.phone}
            </a>
            <p className="text-[11px] text-slate-500">Respuesta inmediata</p>
          </div>

        </div>

        {/* Horarios y Ubicación */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ubicación y Horario de Atención</h2>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{COMPANY_CONFIG.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Lunes a Viernes de 9:00 AM a 6:00 PM (Hora de República Dominicana, GMT-4)</span>
            </div>
          </div>
        </section>

        {/* Formulario de Contacto */}
        <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Envíanos un Mensaje Directo</h2>
          
          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 mx-auto" />
              <h3 className="text-sm font-bold">¡Mensaje preparado con éxito!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Se ha generado tu comunicación con el equipo de TapRD. Te responderemos a la mayor brevedad posible.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold underline hover:no-underline cursor-pointer"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 not-prose">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tu Nombre o Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan Pérez / Barbería Wilson"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tu Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@tudominio.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Motivo de la Consulta *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="comercial">Cotización o Adquisición de Productos NFC</option>
                  <option value="soporte">Soporte Técnico o Configuración de Perfil</option>
                  <option value="legal">Asunto Legal, Contrato o Privacidad (ARCO)</option>
                  <option value="alianza">Alianzas Comerciales o Distribuidores</option>
                  <option value="otro">Otro Motivo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Detalles del Mensaje *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe aquí tu consulta o requerimiento..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Comunicación</span>
              </button>
            </form>
          )}
        </section>

      </div>
    </LegalLayout>
  );
}
