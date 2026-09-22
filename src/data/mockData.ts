import { DigitalProfile, BusinessCategory } from '../types';
import { PRODUCTS } from './products';

export { PRODUCTS };

export const DEMO_PROFILES: Record<string, DigitalProfile> = {
  'barberia-wilson': {
    slug: 'barberia-wilson',
    isDemo: true,
    name: 'BARBERÍA WILSON',
    category: 'Barbería & Estilo',
    tagline: 'Cortes clásicos y modernos para el caballero exigente',
    description: 'Espacio exclusivo para el cuidado masculino en Santo Domingo. Maestros barberos certificados, ambiente climatizado, bebidas de cortesía y atención de primera clase.',
    avatarInitials: 'BW',
    avatarBgColor: 'bg-slate-900',
    coverGradient: 'from-slate-900 via-zinc-900 to-blue-950',
    verified: true,
    phone: '+18095550188',
    whatsapp: '18095550188',
    whatsappMessage: '¡Hola Barbería Wilson! Vi su perfil en TapRD y me gustaría reservar una cita.',
    email: 'contacto.wilson@demo.taprd.do',
    website: 'https://barberiawilson.demo.taprd.do',
    instagram: 'barberiawilson.rd',
    facebook: 'barberiawilsonrd',
    tiktok: 'barberiawilson',
    address: 'Av. Winston Churchill #145, Piantini',
    city: 'Santo Domingo, D.N.',
    mapsUrl: 'https://maps.google.com/?q=Piantini+Santo+Domingo',
    wazeUrl: 'https://waze.com/ul?q=Piantini+Santo+Domingo',
    googleReviewsUrl: 'https://search.google.com/local/writereview?placeid=demo',
    reviewScore: 4.9,
    reviewCount: 184,
    services: [
      {
        id: 's1',
        name: 'Corte Clásico o Degradado',
        description: 'Lavado con champú premium, asesoría de imagen, corte a tijera/máquina y peinado profesional.',
        price: 'RD$500',
        duration: '40 min',
        popular: true
      },
      {
        id: 's2',
        name: 'Perfilado y Cuidado de Barba',
        description: 'Toalla caliente aromatizada, aceites esenciales de hidratación, afeitado a navaja y perfilado fino.',
        price: 'RD$300',
        duration: '25 min'
      },
      {
        id: 's3',
        name: 'Combo Corte + Barba VIP',
        description: 'Experiencia completa: corte estilizado, tratamiento de toalla caliente, perfilado de barba y exfoliación facial express.',
        price: 'RD$700',
        duration: '60 min',
        popular: true
      },
      {
        id: 's4',
        name: 'Tratamiento Capilar Anticaída',
        description: 'Masaje capilar tonificante con tónico revitalizante y sellado térmico.',
        price: 'RD$450',
        duration: '20 min'
      },
      {
        id: 's5',
        name: 'Corte Infantil (Niños hasta 11 años)',
        description: 'Paciencia y cuidado para los más pequeños con un estilo impecable.',
        price: 'RD$400',
        duration: '30 min'
      }
    ],
    hours: [
      { day: 'Lunes a Viernes', hours: '9:00 AM – 8:00 PM', isOpen: true },
      { day: 'Sábados', hours: '8:30 AM – 8:30 PM', isOpen: true },
      { day: 'Domingos', hours: '10:00 AM – 3:00 PM', isOpen: true }
    ],
    wifi: {
      ssid: 'Barberia_Wilson_Guest',
      note: 'Pide la clave a tu barbero'
    },
    bankInfo: {
      bank: 'Banco Popular Dominicano',
      accountType: 'Corriente',
      accountNumber: '792-XXXXXX-1',
      holder: 'Wilson Barber Shop SRL',
      rncOrCedula: '131-XXXXX-X'
    },
    analytics: {
      totalTaps: 1420,
      whatsappClicks: 635,
      instagramClicks: 310,
      vcardDownloads: 184,
      reviewClicks: 95,
      directionsClicks: 196,
      weeklyTaps: [
        { day: 'Lun', taps: 140 },
        { day: 'Mar', taps: 165 },
        { day: 'Mié', taps: 190 },
        { day: 'Jue', taps: 240 },
        { day: 'Vie', taps: 310 },
        { day: 'Sáb', taps: 380 },
        { day: 'Dom', taps: 110 }
      ]
    }
  },

  'restaurante': {
    slug: 'restaurante',
    isDemo: true,
    name: 'MARE NOSTRUM BISTRÓ',
    category: 'Restaurante Mediterráneo & Tapas',
    tagline: 'Sabores del mar y cocina mediterránea en el corazón de Bella Vista',
    description: 'Cocina de autor con pescados frescos del día, pastas artesanales hechas a mano, selecta cava de vinos y terraza al aire libre perfecta para cenas especiales y reuniones ejecutivas.',
    avatarInitials: 'MN',
    avatarBgColor: 'bg-blue-900',
    coverGradient: 'from-blue-950 via-slate-900 to-sky-950',
    verified: true,
    phone: '+18095550299',
    whatsapp: '18095550299',
    whatsappMessage: '¡Hola Mare Nostrum! Me gustaría consultar disponibilidad de mesa o reservar.',
    email: 'reservas.marenostrum@demo.taprd.do',
    website: 'https://marenostrum.demo.taprd.do',
    instagram: 'marenostrumbistro.rd',
    facebook: 'marenostrumbistro',
    tiktok: 'marenostrumrd',
    address: 'Calle Sarasota #78, Bella Vista',
    city: 'Santo Domingo, D.N.',
    mapsUrl: 'https://maps.google.com/?q=Bella+Vista+Santo+Domingo',
    wazeUrl: 'https://waze.com/ul?q=Bella+Vista+Santo+Domingo',
    googleReviewsUrl: 'https://search.google.com/local/writereview?placeid=demo2',
    reviewScore: 4.8,
    reviewCount: 312,
    services: [
      {
        id: 'r1',
        name: 'Paella de Mariscos de la Costa (Para 2 personas)',
        description: 'Arroz bomba español, camarones de Sánchez, calamares, mejillones y azafrán puro.',
        price: 'RD$1,950',
        popular: true
      },
      {
        id: 'r2',
        name: 'Pulpo a la Brasa con Puré de Yautía',
        description: 'Cocido a baja temperatura, terminado en leña de roble con pimentón de la Vera.',
        price: 'RD$1,150',
        popular: true
      },
      {
        id: 'r3',
        name: 'Raviolis de Ricotta & Espinaca en Salsa Trufada',
        description: 'Pasta fresca hecha a mano cada mañana, reducción de crema y aceite de trufa blanca.',
        price: 'RD$890'
      },
      {
        id: 'r4',
        name: 'Carpaccio de Chillo Fresco & Cítricos Caribeños',
        description: 'Láminas finas de pescado salvaje, emulsión de chinola y perlas de aceite de oliva.',
        price: 'RD$720'
      },
      {
        id: 'r5',
        name: 'Menú Ejecutivo Almuerzo (Lunes a Viernes)',
        description: 'Entrada del día + Plato fuerte de pesca o carne + Bebida refrescante incluida.',
        price: 'RD$650'
      }
    ],
    hours: [
      { day: 'Lunes a Jueves', hours: '12:00 PM – 11:00 PM', isOpen: true },
      { day: 'Viernes y Sábados', hours: '12:00 PM – 12:30 AM', isOpen: true },
      { day: 'Domingos', hours: '12:00 PM – 9:30 PM', isOpen: true }
    ],
    wifi: {
      ssid: 'MareNostrum_WiFi_Clientes',
      note: 'Sin contraseña requerida'
    },
    bankInfo: {
      bank: 'Banco BHD',
      accountType: 'Corriente',
      accountNumber: '102-XXXXXX-8',
      holder: 'Mare Nostrum Gastronomía SRL',
      rncOrCedula: '132-XXXXX-X'
    },
    analytics: {
      totalTaps: 3890,
      whatsappClicks: 1420,
      instagramClicks: 1150,
      vcardDownloads: 340,
      reviewClicks: 410,
      directionsClicks: 570,
      weeklyTaps: [
        { day: 'Lun', taps: 280 },
        { day: 'Mar', taps: 310 },
        { day: 'Mié', taps: 420 },
        { day: 'Jue', taps: 610 },
        { day: 'Vie', taps: 890 },
        { day: 'Sáb', taps: 980 },
        { day: 'Dom', taps: 400 }
      ]
    }
  },

  'inmobiliaria': {
    slug: 'inmobiliaria',
    isDemo: true,
    name: 'AURA LUXURY REAL ESTATE',
    category: 'Bienes Raíces & Inversiones',
    tagline: 'Propiedades exclusivas en Santo Domingo, Punta Cana y Las Terrenas',
    description: 'Firma inmobiliaria especializada en asesoría para compradores locales, extranjeros e inversionistas de la diáspora dominicana con beneficios de Ley Confotur.',
    avatarInitials: 'AL',
    avatarBgColor: 'bg-emerald-950',
    coverGradient: 'from-slate-900 via-emerald-950 to-stone-900',
    verified: true,
    phone: '+18095550344',
    whatsapp: '18095550344',
    whatsappMessage: '¡Hola Aura Real Estate! Me gustaría recibir información de proyectos de inversión disponibles.',
    email: 'info@aurarealestate.demo.taprd.do',
    website: 'https://aurarealestate.demo.taprd.do',
    instagram: 'aurarealestate.rd',
    facebook: 'aurarealestaterd',
    tiktok: 'aurarealestaterd',
    address: 'Torre Piantini Corporate, Piso 8, Av. Gustavo Mejía Ricart',
    city: 'Santo Domingo, D.N.',
    mapsUrl: 'https://maps.google.com/?q=Piantini+Santo+Domingo',
    wazeUrl: 'https://waze.com/ul?q=Piantini+Santo+Domingo',
    googleReviewsUrl: 'https://search.google.com/local/writereview?placeid=demo3',
    reviewScore: 5.0,
    reviewCount: 96,
    services: [
      {
        id: 'i1',
        name: 'Asesoría de Inversión Turística (Punta Cana & Cap Cana)',
        description: 'Análisis de retorno (ROI 9-13%), exención de impuestos por Confotur y gestión de renta vacacional.',
        price: 'Consulta Gratuita',
        popular: true
      },
      {
        id: 'i2',
        name: 'Apartamentos en Plano en el Polígono Central',
        description: 'Opciones en Piantini, Naco, Evaristo Morales y Bella Vista con planes de pago flexibles hasta 36 meses.',
        price: 'Desde US$145,000',
        popular: true
      },
      {
        id: 'i3',
        name: 'Valuación Profesional de Inmuebles',
        description: 'Estudio de mercado comparativo para fijar el precio óptimo de venta o alquiler en República Dominicana.',
        price: 'RD$6,500'
      },
      {
        id: 'i4',
        name: 'Tours Inmobiliarios Privados (Presenciales & Virtuales)',
        description: 'Acompañamiento personalizado y videollamadas en vivo para inversionistas en Estados Unidos y Europa.',
        price: 'Sin Costo Adicional'
      }
    ],
    hours: [
      { day: 'Lunes a Viernes', hours: '8:30 AM – 6:30 PM', isOpen: true },
      { day: 'Sábados', hours: '9:00 AM – 2:00 PM (Con Cita)', isOpen: true },
      { day: 'Domingos', hours: 'Cerrado', isOpen: false }
    ],
    bankInfo: {
      bank: 'Banco Santa Cruz',
      accountType: 'Dólares & Pesos',
      accountNumber: '301-XXXXXX-4',
      holder: 'Aura Real Estate Group SRL',
      rncOrCedula: '133-XXXXX-X'
    },
    analytics: {
      totalTaps: 2150,
      whatsappClicks: 940,
      instagramClicks: 480,
      vcardDownloads: 620,
      reviewClicks: 88,
      directionsClicks: 140,
      weeklyTaps: [
        { day: 'Lun', taps: 290 },
        { day: 'Mar', taps: 340 },
        { day: 'Mié', taps: 310 },
        { day: 'Jue', taps: 420 },
        { day: 'Vie', taps: 390 },
        { day: 'Sáb', taps: 260 },
        { day: 'Dom', taps: 140 }
      ]
    }
  }
};

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    id: 'barberias',
    title: 'Barberías & Peluquerías',
    description: 'Permite que tus clientes guarden tu número, agenden por WhatsApp y vean tu catálogo de cortes y precios al instante.',
    iconName: 'Scissors',
    demoSlug: 'barberia-wilson',
    benefits: ['Precios claros sin tener que preguntar', 'Reserva rápida por WhatsApp', 'Perfilado de redes sociales']
  },
  {
    id: 'restaurantes',
    title: 'Restaurantes & Bares',
    description: 'Sustituye la carta física por una placa NFC en cada mesa. Tu menú actualizado siempre disponible y sin costo de reimpresión.',
    iconName: 'Utensils',
    demoSlug: 'restaurante',
    benefits: ['Menú digital instantáneo', 'Conexión a red WiFi sin pedir clave', 'Multiplica tus reseñas en Google Maps']
  },
  {
    id: 'salones',
    title: 'Salones de Belleza & Spas',
    description: 'Muestra fotos de trabajos recientes en Instagram, lista de servicios y tarifas, y botón directo para agendar citas.',
    iconName: 'Sparkles',
    demoSlug: 'barberia-wilson',
    benefits: ['Galería de trabajos', 'Citas directas por WhatsApp', 'Venta cruzada de productos capilares']
  },
  {
    id: 'inmobiliaria',
    title: 'Agentes Inmobiliarios',
    description: 'En ferias o visitas a propiedades, comparte tu vCard con un toque para que el cliente guarde tu contacto sin errores.',
    iconName: 'Building2',
    demoSlug: 'inmobiliaria',
    benefits: ['Guardar contacto en la agenda del móvil con 1 clic', 'Catálogo de proyectos', 'Imagen ejecutiva de alto nivel']
  },
  {
    id: 'fotografos',
    title: 'Fotógrafos & Creadores',
    description: 'Tu portafolio fotográfico, reels y tarifas en el teléfono de organizadores de bodas y clientes de eventos.',
    iconName: 'Camera',
    demoSlug: 'barberia-wilson',
    benefits: ['Portafolio instantáneo', 'Cotizaciones directas', 'Mayor conversión en eventos en vivo']
  },
  {
    id: 'tiendas',
    title: 'Tiendas & Boutiques',
    description: 'Coloca un sticker o placa en tu mostrador de cobro para que te sigan en Instagram y se unan a tu canal VIP de WhatsApp.',
    iconName: 'ShoppingBag',
    demoSlug: 'restaurante',
    benefits: ['Más seguidores reales de compradores', 'Datos de cuenta bancaria para transferencias', 'Reseñas de compra inmediata']
  },
  {
    id: 'hoteles',
    title: 'Hoteles & Alojamientos',
    description: 'Ofrece a tus huéspedes acceso directo a recomendaciones de la zona, menú de room service y calificaciones de 5 estrellas.',
    iconName: 'Hotel',
    demoSlug: 'restaurante',
    benefits: ['Check-in digital y bienvenida', 'Guía turística local de RD', 'Incremento drástico en TripAdvisor/Google']
  },
  {
    id: 'profesionales',
    title: 'Profesionales Independientes',
    description: 'Abogados, médicos, contadores y consultores que requieren transmitir seriedad, modernidad y disponibilidad inmediata.',
    iconName: 'Briefcase',
    demoSlug: 'inmobiliaria',
    benefits: ['Intercambio de contacto sin papel', 'Datos de facturación RNC/Cédula', 'Canal formal de comunicación']
  }
];

export const FAQS = [
  {
    question: '¿Todos los teléfonos inteligentes son compatibles con NFC?',
    answer: 'Sí, más del 95% de los teléfonos modernos son compatibles. Prácticamente todos los iPhone desde el iPhone 7 (2016 en adelante) y los dispositivos Android de gama media y alta cuentan con chip NFC activo de fábrica. Para los escasos dispositivos sin NFC, cada solución TapRD incluye un código QR dinámico de alta definición como respaldo infalible.'
  },
  {
    question: '¿El cliente necesita descargar alguna aplicación para leer la tarjeta?',
    answer: 'No. Esta es la mayor ventaja de TapRD. El cliente no necesita instalar absolutamente nada. Tan pronto acerca su teléfono, el sistema operativo despliega una notificación nativa que abre el perfil digital directamente en su navegador web.'
  },
  {
    question: '¿Qué pasa si cambio de número, precios o dirección en el futuro?',
    answer: 'No tienes que comprar otra tarjeta ni cambiar tus placas. Tu perfil digital es 100% dinámico y editable. Puedes actualizar tus números de teléfono, menú, enlaces de redes sociales, ubicación o precios en cualquier momento sin alterar tu hardware NFC.'
  },
  {
    question: '¿Cómo se guardan los datos de contacto en el teléfono del cliente?',
    answer: 'Al pulsar el botón "Guardar contacto", el teléfono descarga un archivo de contacto estándar (.vcf) que añade automáticamente tu nombre, empresa, teléfonos, WhatsApp, correo y redes a la libreta de contactos del cliente con un solo toque.'
  },
  {
    question: '¿Hacen envíos a todo el territorio de República Dominicana?',
    answer: 'Sí. Realizamos envíos rápidos a todo el país, incluyendo el Gran Santo Domingo, Santiago, La Vega, Puerto Plata, San Francisco de Macorís, Punta Cana, La Romana y demás provincias mediante mensajería expresa y servicios locales certificados.'
  },
  {
    question: '¿Cuánto tiempo tarda la entrega tras solicitar una solución?',
    answer: 'Para productos estándar con personalización básica, el tiempo de entrega suele ser de 24 a 48 horas hábiles en Santo Domingo y de 48 a 72 horas para el interior de República Dominicana.'
  }
];
