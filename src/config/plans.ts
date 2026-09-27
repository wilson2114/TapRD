import { Plan } from '../types/plan';

/**
 * PLANES PREDETERMINADOS DE TAPRD
 * Estos valores sirven como fuente inicial y fallback en caso de que Firestore
 * no tenga la colección "plans" inicializada. La fuente principal configurable es Firestore.
 */
export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'La solución esencial para comenzar tu presencia física y digital con tarjeta NFC y perfil interactivo.',
    price: 0,
    currency: 'DOP',
    interval: 'monthly',
    badge: 'Esencial',
    popular: false,
    active: true,
    features: [
      'Perfil digital comercial interactivo',
      'Enlace único personalizado (taprd.com/p/tu-negocio)',
      'Código QR descargable en alta resolución',
      'Compatibilidad con tarjeta NFC inteligente',
      'Información básica del negocio y ubicación',
      'Catálogo de hasta 10 servicios o productos',
      'Horarios comerciales semanales',
      'Enlaces a redes sociales y botón WhatsApp directo',
      'Estadísticas básicas de visitas al perfil'
    ],
    featureFlags: {
      profile: true,
      services: true,
      hours: true,
      socials: true,
      qr: true,
      nfc: true,
      analytics: true,
      advancedAnalytics: false,
      customProfile: false,
      support: true,
      prioritySupport: false
    },
    limits: {
      maxServices: 10,
      maxSocialLinks: 5,
      maxTeamMembers: 1,
      maxAnalyticsDays: 30,
      maxProfiles: 1
    },
    permissions: {
      canEditProfile: true,
      canEditServices: true,
      canEditHours: true,
      canEditSocials: true,
      canViewAnalytics: true,
      canDownloadQR: true
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Diseñado para negocios en crecimiento que requieren estadísticas profundas, mayor catálogo y personalización.',
    price: 0,
    currency: 'DOP',
    interval: 'monthly',
    badge: 'Más Popular',
    popular: true,
    active: true,
    features: [
      'Todo lo incluido en el plan Starter',
      'Catálogo ampliado de hasta 30 servicios con fotos',
      'Analytics avanzado (interacciones por botón, horarios pico, dispositivos)',
      'Personalización visual de perfil (temas, colores y portada personalizada)',
      'Gestión de cuentas bancarias y transferencias en RD$ y US$',
      'Integración directa para reseñas de Google Maps',
      'Historial analítico de hasta 90 días',
      'Soporte técnico preferencial vía WhatsApp',
      'Badge de negocio verificado en perfil'
    ],
    featureFlags: {
      profile: true,
      services: true,
      hours: true,
      socials: true,
      qr: true,
      nfc: true,
      analytics: true,
      advancedAnalytics: true,
      customProfile: true,
      support: true,
      prioritySupport: false
    },
    limits: {
      maxServices: 30,
      maxSocialLinks: 10,
      maxTeamMembers: 3,
      maxAnalyticsDays: 90,
      maxProfiles: 1
    },
    permissions: {
      canEditProfile: true,
      canEditServices: true,
      canEditHours: true,
      canEditSocials: true,
      canViewAnalytics: true,
      canDownloadQR: true
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Control absoluto para marcas, franquicias y profesionales exigentes con soporte prioritario y funciones premium.',
    price: 0,
    currency: 'DOP',
    interval: 'monthly',
    badge: 'Todo Incluido',
    popular: false,
    active: true,
    features: [
      'Todo lo incluido en el plan Business',
      'Servicios y productos ilimitados',
      'Analytics completo e ilimitado en tiempo real',
      'Personalización total de perfil y estilos visuales',
      'Prioridad máxima en soporte técnico y asistencia directa',
      'Multi-sucursales / Miembros de equipo (Próximamente)',
      'Dominio propio personalizado (Próximamente)',
      'Exportación avanzada de métricas en PDF/Excel (Próximamente)',
      'Acceso prioritario a nuevas características de TapRD'
    ],
    featureFlags: {
      profile: true,
      services: true,
      hours: true,
      socials: true,
      qr: true,
      nfc: true,
      analytics: true,
      advancedAnalytics: true,
      customProfile: true,
      support: true,
      prioritySupport: true,
      customDomain: false
    },
    limits: {
      maxServices: null, // Ilimitado
      maxSocialLinks: null,
      maxTeamMembers: 10,
      maxAnalyticsDays: null, // Ilimitado
      maxProfiles: 3
    },
    permissions: {
      canEditProfile: true,
      canEditServices: true,
      canEditHours: true,
      canEditSocials: true,
      canViewAnalytics: true,
      canDownloadQR: true
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

export const COMPARISON_FEATURES = [
  {
    category: 'Presencia Digital & Conectividad',
    items: [
      { name: 'Perfil digital para negocios', starter: 'Incluido', business: 'Incluido', pro: 'Incluido' },
      { name: 'Enlace web personalizado', starter: 'taprd.com/p/*', business: 'taprd.com/p/*', pro: 'taprd.com/p/*' },
      { name: 'Código QR de alta definición', starter: true, business: true, pro: true },
      { name: 'Tarjeta NFC Inteligente TapRD', starter: true, business: true, pro: true },
      { name: 'Botón WhatsApp directo', starter: true, business: true, pro: true },
      { name: 'Dominio propio personalizado', starter: false, business: false, pro: 'Próximamente' }
    ]
  },
  {
    category: 'Catálogo & Contenido',
    items: [
      { name: 'Límite de Servicios / Productos', starter: 'Hasta 10', business: 'Hasta 30', pro: 'Ilimitados' },
      { name: 'Horario comercial interactivo', starter: true, business: true, pro: true },
      { name: 'Cuentas bancarias para transferencias', starter: true, business: true, pro: true },
      { name: 'Redes sociales vinculadas', starter: 'Hasta 5', business: 'Hasta 10', pro: 'Ilimitadas' },
      { name: 'Enlace a reseñas Google Maps', starter: true, business: true, pro: true }
    ]
  },
  {
    category: 'Métricas & Estadísticas',
    items: [
      { name: 'Estadísticas básicas (Visitas totales)', starter: true, business: true, pro: true },
      { name: 'Analytics avanzado (Clicks, Fuentes, Dispositivos)', starter: false, business: true, pro: true },
      { name: 'Historial de datos analíticos', starter: '30 días', business: '90 días', pro: 'Ilimitado' },
      { name: 'Exportación de métricas (PDF / Excel)', starter: false, business: false, pro: 'Próximamente' }
    ]
  },
  {
    category: 'Personalización & Soporte',
    items: [
      { name: 'Personalización visual avanzada', starter: false, business: true, pro: true },
      { name: 'Insignia de Negocio Verificado', starter: false, business: true, pro: true },
      { name: 'Soporte técnico', starter: 'Estándar', business: 'Preferencial', pro: 'Prioritario 24/7' },
      { name: 'Multi-sucursales / Equipo', starter: false, business: false, pro: 'Próximamente' }
    ]
  }
];
