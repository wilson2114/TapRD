import { Client } from '../types';

/**
 * CLIENTES DEMO DE TAPRD
 * 
 * IMPORTANTE:
 * Estos datos son estrictamente para DEMOSTRACIÓN del panel administrativo.
 * No corresponden a personas ni negocios reales.
 * Se utilizan para verificar el flujo de administración, generación de slugs,
 * perfiles digitales y códigos QR.
 */
export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    ownerName: 'Juan Pérez',
    businessName: 'Barbería Wilson',
    slug: 'barberia-wilson',
    category: 'Barbería',
    description: 'Especialistas en cortes masculinos clásicos y modernos, perfilado de barba al vapor y diseño personalizado en Santo Domingo.',
    phone: '+1 809-555-0142',
    whatsapp: '18095550142',
    email: 'contacto@barberiawilson.demo',
    city: 'Santo Domingo',
    address: 'Av. Winston Churchill #102, Plaza Central, Piantini',
    avatarInitials: 'BW',
    avatarBgColor: 'bg-blue-600',
    coverGradient: 'from-slate-900 via-blue-950 to-slate-900',
    productAssigned: 'Tap Card',
    status: 'active',
    googleReviewsUrl: 'https://maps.google.com/?q=Santo+Domingo',
    mapsUrl: 'https://maps.google.com/?q=Av.+Winston+Churchill+102+Santo+Domingo',
    socialLinks: {
      instagram: 'barberiawilson.rd',
      tiktok: 'barberiawilson',
      facebook: 'barberiawilsonrd',
      website: 'https://barberiawilson.com'
    },
    services: [
      {
        id: 'srv-101',
        name: 'Corte de Cabello Clásico & Fade',
        description: 'Corte con máquina y tijera, lavado refrescante y peinado con cera mate.',
        price: 'RD$500'
      },
      {
        id: 'srv-102',
        name: 'Perfilado de Barba',
        description: 'Afeitado tradicional con toalla caliente, vapor ozono y bálsamo hidratante.',
        price: 'RD$300'
      },
      {
        id: 'srv-103',
        name: 'Corte + Barba Completo',
        description: 'Combo ejecutivo: corte moderno, perfilado de barba al vapor y mascarilla negra.',
        price: 'RD$700'
      },
      {
        id: 'srv-104',
        name: 'Lavado y Exfoliación Capilar',
        description: 'Tratamiento purificante anticaspa con masaje capilar relajante de 10 min.',
        price: 'RD$400'
      }
    ],
    hours: [
      { day: 'Lunes', isOpen: true, openTime: '09:00', closeTime: '20:00', display: '9:00 AM – 8:00 PM' },
      { day: 'Martes', isOpen: true, openTime: '09:00', closeTime: '20:00', display: '9:00 AM – 8:00 PM' },
      { day: 'Miércoles', isOpen: true, openTime: '09:00', closeTime: '20:00', display: '9:00 AM – 8:00 PM' },
      { day: 'Jueves', isOpen: true, openTime: '09:00', closeTime: '20:00', display: '9:00 AM – 8:00 PM' },
      { day: 'Viernes', isOpen: true, openTime: '09:00', closeTime: '21:00', display: '9:00 AM – 9:00 PM' },
      { day: 'Sábado', isOpen: true, openTime: '08:30', closeTime: '21:00', display: '8:30 AM – 9:00 PM' },
      { day: 'Domingo', isOpen: true, openTime: '10:00', closeTime: '16:00', display: '10:00 AM – 4:00 PM' }
    ],
    settings: {
      showPhone: true,
      showWhatsapp: true,
      showInstagram: true,
      showFacebook: true,
      showTikTok: true,
      showAddress: true,
      showHours: true,
      showServices: true,
      showReviews: true,
      showBankAccounts: true
    },
    bankAccounts: [
      {
        id: 'bnk-101',
        bank: 'Banco Popular Dominicano',
        accountType: 'Cuenta Corriente',
        accountNumber: '792834912',
        currency: 'DOP',
        holder: 'Barbería Wilson SRL',
        rncOrCedula: '1-31-98765-4',
        notes: 'Enviar comprobante por WhatsApp tras transferir.'
      },
      {
        id: 'bnk-102',
        bank: 'Banreservas (Banco de Reservas)',
        accountType: 'Cuenta de Ahorros',
        accountNumber: '9601248593',
        currency: 'DOP',
        holder: 'Juan Pérez',
        rncOrCedula: '402-1928374-1'
      }
    ],
    createdAt: '2026-02-10T14:30:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'cli-002',
    ownerName: 'María López',
    businessName: 'Restaurante Sabor RD',
    slug: 'restaurante-sabor-rd',
    category: 'Restaurante',
    description: 'Cocina dominicana contemporánea, mariscos frescos y cortes a la brasa en el corazón de la Zona Colonial.',
    phone: '+1 809-555-0188',
    whatsapp: '18095550188',
    email: 'reservas@saborrd.demo',
    city: 'Santo Domingo',
    address: 'Calle El Conde #350, Zona Colonial',
    avatarInitials: 'SR',
    avatarBgColor: 'bg-amber-700',
    coverGradient: 'from-amber-950 via-stone-900 to-slate-950',
    productAssigned: 'Tap Business',
    status: 'active',
    googleReviewsUrl: 'https://maps.google.com/?q=Zona+Colonial+Santo+Domingo',
    mapsUrl: 'https://maps.google.com/?q=Calle+El+Conde+350+Santo+Domingo',
    socialLinks: {
      instagram: 'saborrd.rest',
      facebook: 'restaurantesaborrd',
      tiktok: 'saborrd',
      website: 'https://saborrd.do'
    },
    services: [
      {
        id: 'srv-201',
        name: 'Menú Ejecutivo Criollo',
        description: 'Plato del día, moro de guandules con coco, pechuga a la plancha, ensalada y jugo natural.',
        price: 'RD$450'
      },
      {
        id: 'srv-202',
        name: 'Mofongo Especial de Camarones',
        description: 'Plátano verde majado en pilón tradicional con ajo criollo y salsa de camarones al ajillo.',
        price: 'RD$850'
      },
      {
        id: 'srv-203',
        name: 'Chivo Liniero Guisado',
        description: 'Tierno chivo con toque de orégano de la sierra y tostones crocantes.',
        price: 'RD$790'
      },
      {
        id: 'srv-204',
        name: 'Pescado al Coco de Samaná',
        description: 'Chillo fresco bañado en reducción de leche de coco y pimientos morrones.',
        price: 'RD$920'
      }
    ],
    hours: [
      { day: 'Lunes', isOpen: true, openTime: '12:00', closeTime: '23:00', display: '12:00 PM – 11:00 PM' },
      { day: 'Martes', isOpen: true, openTime: '12:00', closeTime: '23:00', display: '12:00 PM – 11:00 PM' },
      { day: 'Miércoles', isOpen: true, openTime: '12:00', closeTime: '23:00', display: '12:00 PM – 11:00 PM' },
      { day: 'Jueves', isOpen: true, openTime: '12:00', closeTime: '23:30', display: '12:00 PM – 11:30 PM' },
      { day: 'Viernes', isOpen: true, openTime: '12:00', closeTime: '00:00', display: '12:00 PM – 12:00 AM' },
      { day: 'Sábado', isOpen: true, openTime: '12:00', closeTime: '00:00', display: '12:00 PM – 12:00 AM' },
      { day: 'Domingo', isOpen: true, openTime: '12:00', closeTime: '22:00', display: '12:00 PM – 10:00 PM' }
    ],
    settings: {
      showPhone: true,
      showWhatsapp: true,
      showInstagram: true,
      showFacebook: true,
      showTikTok: false,
      showAddress: true,
      showHours: true,
      showServices: true,
      showReviews: true,
      showBankAccounts: true
    },
    bankAccounts: [
      {
        id: 'bnk-201',
        bank: 'Banco BHD',
        accountType: 'Cuenta Corriente',
        accountNumber: '258930129',
        currency: 'DOP',
        holder: 'Restaurante Sabor RD SRL',
        rncOrCedula: '1-32-45678-9'
      },
      {
        id: 'bnk-202',
        bank: 'Banco Popular Dominicano',
        accountType: 'Cuenta Corriente',
        accountNumber: '802194723',
        currency: 'USD',
        holder: 'Restaurante Sabor RD SRL',
        rncOrCedula: '1-32-45678-9',
        notes: 'Aceptamos transferencias en dólares (USD) para reservas de eventos.'
      }
    ],
    createdAt: '2026-02-14T18:00:00.000Z',
    updatedAt: '2026-02-28T16:00:00.000Z'
  },
  {
    id: 'cli-003',
    ownerName: 'Carlos Gómez',
    businessName: 'Caribe Realty',
    slug: 'caribe-realty',
    category: 'Inmobiliaria',
    description: 'Venta y alquiler de villas turísticas en Punta Cana, Las Terrenas y apartamentos premium en Santo Domingo.',
    phone: '+1 809-555-0199',
    whatsapp: '18095550199',
    email: 'info@cariberealty.demo',
    city: 'Santiago de los Caballeros',
    address: 'Av. Juan Pablo Duarte #45, Torre Empresarial, 5to Nivel',
    avatarInitials: 'CR',
    avatarBgColor: 'bg-emerald-700',
    coverGradient: 'from-slate-900 via-teal-950 to-slate-950',
    productAssigned: 'Tap Card',
    status: 'pending',
    googleReviewsUrl: 'https://maps.google.com/?q=Santiago+República+Dominicana',
    mapsUrl: 'https://maps.google.com/?q=Av.+Juan+Pablo+Duarte+Santiago',
    socialLinks: {
      instagram: 'cariberealty.do',
      facebook: 'cariberealtyrd',
      youtube: 'cariberealtytv',
      website: 'https://cariberealty.com'
    },
    services: [
      {
        id: 'srv-301',
        name: 'Asesoría de Inversión Inmobiliaria',
        description: 'Consulta estratégica de rentabilidad y retorno de inversión en proyectos turísticos.',
        price: 'Gratis'
      },
      {
        id: 'srv-302',
        name: 'Gestión de Venta y Alquiler',
        description: 'Comercialización completa con fotografía profesional, tour 3D y difusión premium.',
        price: 'Comisión estándar'
      },
      {
        id: 'srv-303',
        name: 'Tasación Inmobiliaria Certificada',
        description: 'Valoración formal del inmueble realizada por perito certificado para bancos y trámites.',
        price: 'RD$3,500'
      }
    ],
    hours: [
      { day: 'Lunes', isOpen: true, openTime: '08:30', closeTime: '18:00', display: '8:30 AM – 6:00 PM' },
      { day: 'Martes', isOpen: true, openTime: '08:30', closeTime: '18:00', display: '8:30 AM – 6:00 PM' },
      { day: 'Miércoles', isOpen: true, openTime: '08:30', closeTime: '18:00', display: '8:30 AM – 6:00 PM' },
      { day: 'Jueves', isOpen: true, openTime: '08:30', closeTime: '18:00', display: '8:30 AM – 6:00 PM' },
      { day: 'Viernes', isOpen: true, openTime: '08:30', closeTime: '18:00', display: '8:30 AM – 6:00 PM' },
      { day: 'Sábado', isOpen: true, openTime: '09:00', closeTime: '13:00', display: '9:00 AM – 1:00 PM' },
      { day: 'Domingo', isOpen: false, display: 'Cerrado' }
    ],
    settings: {
      showPhone: true,
      showWhatsapp: true,
      showInstagram: true,
      showFacebook: true,
      showTikTok: false,
      showAddress: true,
      showHours: true,
      showServices: true,
      showReviews: true,
      showBankAccounts: true
    },
    bankAccounts: [
      {
        id: 'bnk-301',
        bank: 'Banco Popular Dominicano',
        accountType: 'Cuenta Corriente',
        accountNumber: '754129841',
        currency: 'USD',
        holder: 'Caribe Realty SRL',
        rncOrCedula: '1-33-87654-2',
        notes: 'Depósitos y reservas de propiedades turísticas.'
      }
    ],
    createdAt: '2026-03-02T11:20:00.000Z',
    updatedAt: '2026-03-02T11:20:00.000Z'
  },
  {
    id: 'cli-004',
    ownerName: 'Pamela Rosario',
    businessName: 'Beauty Studio',
    slug: 'beauty-studio',
    category: 'Salón de belleza',
    description: 'Estudio de belleza especializado en técnicas de coloración europea, alisados orgánicos, uñas acrílicas y maquillaje profesional.',
    phone: '+1 809-555-0210',
    whatsapp: '18095550210',
    email: 'citas@beautystudio.demo',
    city: 'Santo Domingo Este',
    address: 'Av. San Vicente de Paúl #80, Plaza Las Américas',
    avatarInitials: 'BS',
    avatarBgColor: 'bg-rose-600',
    coverGradient: 'from-slate-900 via-rose-950 to-slate-950',
    productAssigned: 'Tap Review',
    status: 'active',
    googleReviewsUrl: 'https://maps.google.com/?q=Santo+Domingo+Este',
    mapsUrl: 'https://maps.google.com/?q=Av.+San+Vicente+de+Paul+Santo+Domingo+Este',
    socialLinks: {
      instagram: 'beautystudio.rd',
      tiktok: 'beautystudiord',
      facebook: 'beautystudiord'
    },
    services: [
      {
        id: 'srv-401',
        name: 'Balayage & Iluminación Personalizada',
        description: 'Técnica a mano alzada con tonalización fría o cálida y tratamiento Plex sellador.',
        price: 'RD$3,200'
      },
      {
        id: 'srv-402',
        name: 'Hidratación Profunda con Keratina',
        description: 'Anti-frizz, brillo efecto espejo y reconstrucción capilar termoactiva.',
        price: 'RD$1,800'
      },
      {
        id: 'srv-403',
        name: 'Manicure Ruso con Esmaltado Semipermanente',
        description: 'Limpieza de cutícula con torno, nivelación con base rubber y color de larga duración.',
        price: 'RD$900'
      },
      {
        id: 'srv-404',
        name: 'Pedicure Spa Relax',
        description: 'Exfoliación con sales marinas, mascarilla de parafina y masaje relajante.',
        price: 'RD$1,100'
      }
    ],
    hours: [
      { day: 'Lunes', isOpen: false, display: 'Cerrado' },
      { day: 'Martes', isOpen: true, openTime: '09:00', closeTime: '19:00', display: '9:00 AM – 7:00 PM' },
      { day: 'Miércoles', isOpen: true, openTime: '09:00', closeTime: '19:00', display: '9:00 AM – 7:00 PM' },
      { day: 'Jueves', isOpen: true, openTime: '09:00', closeTime: '19:00', display: '9:00 AM – 7:00 PM' },
      { day: 'Viernes', isOpen: true, openTime: '09:00', closeTime: '20:00', display: '9:00 AM – 8:00 PM' },
      { day: 'Sábado', isOpen: true, openTime: '08:30', closeTime: '20:00', display: '8:30 AM – 8:00 PM' },
      { day: 'Domingo', isOpen: true, openTime: '10:00', closeTime: '15:00', display: '10:00 AM – 3:00 PM' }
    ],
    settings: {
      showPhone: true,
      showWhatsapp: true,
      showInstagram: true,
      showFacebook: true,
      showTikTok: true,
      showAddress: true,
      showHours: true,
      showServices: true,
      showReviews: true,
      showBankAccounts: true
    },
    bankAccounts: [
      {
        id: 'bnk-401',
        bank: 'Banreservas (Banco de Reservas)',
        accountType: 'Cuenta de Ahorros',
        accountNumber: '9602481029',
        currency: 'DOP',
        holder: 'Pamela Rosario',
        rncOrCedula: '402-2849102-5'
      }
    ],
    createdAt: '2026-03-05T09:15:00.000Z',
    updatedAt: '2026-03-10T14:40:00.000Z'
  }
];
