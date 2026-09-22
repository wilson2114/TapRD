import React, { useState } from 'react';
import { X, CheckCircle2, MessageCircle, Send, Sparkles, Building, User, Phone, Mail, MapPin, Layers, HelpCircle } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { createProductWhatsAppUrl } from '../config/constants';

interface ProductRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductName?: string;
}

export const NEED_OPTIONS = [
  'Quiero una tarjeta NFC',
  'Quiero una placa NFC',
  'Quiero una solución para reseñas',
  'Quiero stickers NFC',
  'Necesito varias unidades',
  'Necesito una solución personalizada'
];

export function ProductRequestModal({
  isOpen,
  onClose,
  initialProductName = 'Tap Card'
}: ProductRequestModalProps) {
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Santo Domingo');
  const [businessType, setBusinessType] = useState('Comercio / Tienda');
  const [selectedProduct, setSelectedProduct] = useState(initialProductName);
  const [quantity, setQuantity] = useState('1');
  const [needOption, setNeedOption] = useState<string>(() => {
    if (initialProductName.toLowerCase().includes('card')) return 'Quiero una tarjeta NFC';
    if (initialProductName.toLowerCase().includes('business')) return 'Quiero una placa NFC';
    if (initialProductName.toLowerCase().includes('review')) return 'Quiero una solución para reseñas';
    if (initialProductName.toLowerCase().includes('sticker')) return 'Quiero stickers NFC';
    return 'Quiero una tarjeta NFC';
  });
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission saving
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Save inquiry to local lead registry for SaaS demonstration
      try {
        const stored = localStorage.getItem('taprd_product_inquiries');
        const list = stored ? JSON.parse(stored) : [];
        list.push({
          name,
          businessName,
          whatsapp,
          email,
          city,
          businessType,
          selectedProduct,
          quantity,
          needOption,
          message,
          submittedAt: new Date().toISOString()
        });
        localStorage.setItem('taprd_product_inquiries', JSON.stringify(list));
      } catch {}
    }, 600);
  };

  const handleWhatsAppDirect = () => {
    const url = createProductWhatsAppUrl(selectedProduct, {
      name,
      businessName,
      quantity,
      city
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleReset = () => {
    setName('');
    setBusinessName('');
    setWhatsapp('');
    setEmail('');
    setMessage('');
    setIsSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-gradient-to-r from-slate-50 to-blue-50/40 dark:from-slate-800/80 dark:to-slate-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full">
                Solicitud de Cotización
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">TapRD Comercial</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              {isSubmitted ? '¡Solicitud recibida!' : `Cotizar ${selectedProduct}`}
            </h3>
            {!isSubmitted && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Completa tus datos o escríbenos directamente por WhatsApp. Te responderemos en breve.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
          {isSubmitted ? (
            /* Confirmation View */
            <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-black text-slate-950 dark:text-white">
                  ¡Solicitud recibida!
                </h4>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-md mx-auto">
                  Gracias por contactar con TapRD. Revisaremos tu solicitud y nos pondremos en contacto contigo.
                </p>
              </div>

              {/* Data Summary Card */}
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4.5 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5 max-w-md mx-auto text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase">
                  <span>Detalles de la cotización</span>
                  <span>{selectedProduct}</span>
                </div>
                <p><span className="font-bold text-slate-900 dark:text-white">Contacto:</span> {name || 'Cliente'} {businessName ? `(${businessName})` : ''}</p>
                <p><span className="font-bold text-slate-900 dark:text-white">WhatsApp:</span> {whatsapp || 'No especificado'}</p>
                <p><span className="font-bold text-slate-900 dark:text-white">Ciudad:</span> {city}</p>
                <p><span className="font-bold text-slate-900 dark:text-white">Cantidad solicitada:</span> {quantity} unidad(es)</p>
                <p><span className="font-bold text-slate-900 dark:text-white">Tipo de necesidad:</span> {needOption}</p>
              </div>

              {/* Action Buttons Post-Submit */}
              <div className="pt-3 flex flex-col sm:flex-row gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Confirmar por WhatsApp ahora</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Cerrar ventana
                </button>
              </div>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* WhatsApp Quick CTA Banner */}
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-emerald-950 dark:text-emerald-200 font-medium">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 fill-white" />
                  </div>
                  <span>¿Prefieres atención inmediata? Escríbenos directamente.</span>
                </div>
                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  WhatsApp directo
                </button>
              </div>

              {/* Grid: Nombre & Negocio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Tu Nombre *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Wilson Brito"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Nombre del negocio *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Barbería Wilson / Inmobiliaria"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Grid: WhatsApp & Correo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    WhatsApp / Teléfono *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 809-555-0199"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="contacto@tunegocio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Grid: Ciudad & Tipo de negocio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Ciudad (República Dominicana) *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all cursor-pointer"
                    >
                      <option value="Santo Domingo">Santo Domingo (D.N. / Este / Oeste / Norte)</option>
                      <option value="Santiago de los Caballeros">Santiago de los Caballeros</option>
                      <option value="Punta Cana / Bávaro">Punta Cana / Bávaro / La Altagracia</option>
                      <option value="La Romana">La Romana</option>
                      <option value="Puerto Plata">Puerto Plata</option>
                      <option value="San Francisco de Macorís">San Francisco de Macorís</option>
                      <option value="La Vega">La Vega</option>
                      <option value="San Cristóbal">San Cristóbal</option>
                      <option value="Otra provincia">Otra provincia de RD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Tipo de negocio *
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all cursor-pointer"
                  >
                    <option value="Barbería / Salón de Belleza">Barbería / Salón de Belleza</option>
                    <option value="Restaurante / Bar / Cafetería">Restaurante / Bar / Cafetería</option>
                    <option value="Agente Inmobiliario / Bienes Raíces">Agente Inmobiliario / Bienes Raíces</option>
                    <option value="Comercio / Tienda / Retail">Comercio / Tienda / Retail</option>
                    <option value="Fotógrafo / Creador Audiovisual">Fotógrafo / Creador Audiovisual</option>
                    <option value="Consultor / Profesional Independiente">Consultor / Profesional Independiente</option>
                    <option value="Clínica / Salud / Odontología">Clínica / Salud / Odontología</option>
                    <option value="Hotel / Hospedaje / Airbnb">Hotel / Hospedaje / Airbnb</option>
                    <option value="Taller / Servicios Técnicos">Taller / Servicios Técnicos</option>
                    <option value="Otro sector">Otro sector</option>
                  </select>
                </div>
              </div>

              {/* Grid: Producto seleccionado & Cantidad */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Producto seleccionado *
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-blue-700 dark:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all cursor-pointer"
                  >
                    {PRODUCTS.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} — {p.price} ({p.category})
                      </option>
                    ))}
                    <option value="Pack Starter (Desde RD$1,800)">Pack Starter (Desde RD$1,800)</option>
                    <option value="Pack Business (Desde RD$2,500)">Pack Business (Desde RD$2,500)</option>
                    <option value="Pack Pro (Cotización personalizada)">Pack Pro (Cotización personalizada)</option>
                    <option value="Múltiples soluciones personalizadas">Múltiples soluciones personalizadas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
              </div>

              {/* Campo Requerido: "¿Qué necesitas?" */}
              <div className="pt-2">
                <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  ¿Qué necesitas? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {NEED_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        needOption === opt
                          ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-300 font-bold'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="needOption"
                        value={opt}
                        checked={needOption === opt}
                        onChange={() => setNeedOption(opt)}
                        className="text-blue-600 focus:ring-blue-600 h-4 w-4"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mensaje */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Mensaje o notas adicionales (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre personalización de logo, dudas o fecha estimada..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              {/* Action Buttons: Solicitar cotización + Solicitar por WhatsApp */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Enviando solicitud...' : 'Solicitar cotización'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Solicitar por WhatsApp</span>
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
