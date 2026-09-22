import React, { useState } from 'react';
import { ContactInquiry } from '../types';
import { Send, CheckCircle2, X, Sparkles, MessageSquare, Phone, Building, User, Mail, Tag } from 'lucide-react';

interface ContactFormProps {
  initialProductInterest?: string;
  isModal?: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
}

export function ContactForm({
  initialProductInterest = 'Tap Card',
  isModal = false,
  onClose,
  title = 'Solicitar Cotización',
  subtitle = 'Completa tus datos y un especialista de TapRD se comunicará contigo en menos de 2 horas hábiles.'
}: ContactFormProps) {
  const [formData, setFormData] = useState<ContactInquiry>({
    name: '',
    businessName: '',
    phone: '',
    email: '',
    businessType: 'Barbería / Salón',
    productInterest: initialProductInterest,
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const businessTypes = [
    'Barbería / Salón de Belleza',
    'Restaurante / Bar / Cafetería',
    'Agente Inmobiliario / Bienes Raíces',
    'Tienda / Comercio Minorista',
    'Fotógrafo / Creador de Contenido',
    'Consultor / Profesional Independiente',
    'Hotel / Hospedaje',
    'Salud / Clínica / Odontología',
    'Otro tipo de negocio'
  ];

  const productOptions = [
    'Tap Card (Desde RD$1,800)',
    'Tap Business (Desde RD$2,500)',
    'Tap Review (Desde RD$1,500)',
    'Tap Sticker (Desde RD$500)',
    'Combo Multi-solución (Varios productos)',
    'Solución a medida para franquicias o corporativos'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Visual simulation delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Save to demo leads in local storage for SaaS preview
      try {
        const stored = localStorage.getItem('taprd_demo_leads');
        const leads = stored ? JSON.parse(stored) : [];
        leads.push({ ...formData, submittedAt: new Date().toISOString() });
        localStorage.setItem('taprd_demo_leads', JSON.stringify(leads));
      } catch {}
    }, 650);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      businessName: '',
      phone: '',
      email: '',
      businessType: 'Barbería / Salón',
      productInterest: initialProductInterest,
      message: ''
    });
    setIsSuccess(false);
  };

  const content = (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 ${isModal ? '' : 'border border-slate-200/80 dark:border-slate-800 shadow-lg'}`}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/60">
            Cotización Inmediata
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isSuccess ? (
        /* Confirmation State */
        <div id="contact-success-state" className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ¡Cotización solicitada con éxito!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            Gracias, <span className="font-bold text-slate-900 dark:text-white">{formData.name}</span>. Hemos recibido los datos de <span className="font-bold text-slate-900 dark:text-white">{formData.businessName || 'tu negocio'}</span> para la solución <span className="font-bold text-blue-600 dark:text-blue-400">{formData.productInterest}</span>.
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-left max-w-md mx-auto text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
            <p className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px]">Resumen de solicitud</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Teléfono / WhatsApp:</span> {formData.phone}</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Correo:</span> {formData.email}</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Sector:</span> {formData.businessType}</p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Solicitar otra cotización
            </button>
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Cerrar ventana
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Form Inputs */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Tu Nombre *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Carlos Valdéz"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Nombre del Negocio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Nombre del Negocio *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Ej. Barbería Valdéz SRL"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Teléfono / WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Teléfono / WhatsApp *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ej. (809) 555-0123"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Correo Electrónico *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="carlos@minegocio.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Tipo de Negocio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Tipo de Negocio
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-900 dark:text-white"
              >
                {businessTypes.map((type, i) => (
                  <option key={i} value={type} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Producto de Interés */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Producto de Interés
              </label>
              <select
                value={formData.productInterest}
                onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-900 dark:text-white"
              >
                {productOptions.map((opt, i) => (
                  <option key={i} value={opt} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Mensaje adicional */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Mensaje o Requerimientos Específicos
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                <MessageSquare className="w-4 h-4" />
              </div>
              <textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="¿Cuántas unidades necesitas? ¿Tienes alguna duda de personalización con tu logo?"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Privacy note */}
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Tus datos están protegidos. No compartimos tu información con terceros ni enviamos spam.
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            id="btn-submit-cotizacion"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-75 rounded-xl shadow-lg shadow-blue-500/20 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Procesando solicitud...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Solicitar cotización</span>
              </>
            )}
          </button>
        </form>
      )}

    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return (
    <section id="contacto-section" className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {content}
      </div>
    </section>
  );
}
