import { Product, ProductPack, ProductComparisonFeature } from '../types';

/**
 * ============================================================================
 * DATOS CENTRALIZADOS DE PRODUCTOS TAPRD
 * ============================================================================
 * Modifica precios, textos, características y rutas desde este único lugar.
 * La arquitectura está preparada para inventario, descuentos y e-commerce futuro.
 */

export const PRODUCTS: Product[] = [
  {
    id: 'tap-card',
    slug: 'tap-card',
    name: 'Tap Card',
    category: 'Tarjeta NFC',
    shortDescription: 'Tu tarjeta de presentación inteligente. Comparte tus datos de contacto, redes sociales y enlaces importantes con un solo toque.',
    description: 'Tu tarjeta de presentación inteligente. Comparte tus datos de contacto, redes sociales y enlaces importantes con un solo toque.',
    price: 'Desde RD$1,800',
    priceFrom: 'Desde RD$1,800',
    priceNumeric: 1800,
    route: '/productos/tap-card',
    tagline: 'Tu información profesional, a un solo toque.',
    buttonLabel: 'Solicitar Tap Card',
    badge: 'Más popular',
    features: [
      'Tarjeta NFC personalizada',
      'Perfil digital',
      'Código QR de respaldo',
      'WhatsApp',
      'Redes sociales',
      'Información de contacto',
      'Botón para guardar contacto'
    ],
    idealFor: [
      'Profesionales independientes',
      'Emprendedores',
      'Vendedores y ejecutivos comerciales',
      'Agentes inmobiliarios',
      'Fotógrafos y creativos',
      'Técnicos y especialistas',
      'Dueños de negocios'
    ],
    targetAudience: [
      'Profesionales',
      'Emprendedores',
      'Vendedores',
      'Agentes inmobiliarios',
      'Fotógrafos',
      'Técnicos',
      'Dueños de negocios'
    ],
    material: 'PVC Mate de alta densidad con chip protegido contra torsión',
    specs: {
      chip: 'NTAG216 alta velocidad y lectura bidireccional',
      range: '1 a 3 cm de lectura instantánea',
      compatibility: 'iOS 13+ (iPhone 7 en adelante) y Android con NFC activado',
      waterResistant: true,
      warranty: '12 meses de garantía oficial'
    },
    iconType: 'card',
    seoTitle: 'Tap Card | Tarjeta de Presentación Inteligente NFC en RD',
    seoDescription: 'Tu tarjeta de presentación inteligente NFC. Comparte tus datos de contacto, redes sociales y WhatsApp con un solo toque sin instalar apps.'
  },
  {
    id: 'tap-business',
    slug: 'tap-business',
    name: 'Tap Business',
    category: 'Solución NFC para negocios',
    shortDescription: 'Una placa NFC personalizada para conectar a tus clientes con el menú, catálogo, WhatsApp, redes sociales, ubicación y otros canales digitales.',
    description: 'Una placa NFC personalizada para conectar a tus clientes con el menú, catálogo, WhatsApp, redes sociales, ubicación y otros canales digitales.',
    price: 'Desde RD$2,500',
    priceFrom: 'Desde RD$2,500',
    priceNumeric: 2500,
    route: '/productos/tap-business',
    tagline: 'Conecta tu punto físico de venta con todos tus canales digitales.',
    buttonLabel: 'Solicitar Tap Business',
    badge: 'Para Mostrador',
    features: [
      'Placa NFC personalizada',
      'Perfil digital para negocios',
      'Código QR',
      'WhatsApp',
      'Instagram',
      'Ubicación',
      'Catálogo o menú',
      'Reseñas'
    ],
    idealFor: [
      'Restaurantes, cafeterías y bares',
      'Barberías, peluquerías y salones de belleza',
      'Centros de estética y consultorios médicos',
      'Recepciones de oficinas, talleres y boutiques',
      'Comercios con mostrador de atención al público'
    ],
    targetAudience: [
      'Restaurantes y Bares',
      'Barberías y Salones',
      'Cafeterías',
      'Consultorios y Clínicas',
      'Comercios con Mostrador',
      'Hoteles y Recepciones'
    ],
    material: 'Acrílico reforzado de 3mm con peana resistente o soporte de mesa',
    specs: {
      chip: 'NTAG215 amplificado para lectura de mostrador',
      range: 'Lectura rápida a 2-3 cm',
      compatibility: 'Compatible con todos los smartphones iPhone y Android',
      waterResistant: true,
      warranty: '12 meses'
    },
    iconType: 'plate',
    seoTitle: 'Tap Business | Placa NFC para Mostradores y Negocios en RD',
    seoDescription: 'Placa NFC para mostradores comerciales. Conecta a tus clientes con tu menú digital, catálogo, WhatsApp, Instagram y ubicación al instante.'
  },
  {
    id: 'tap-review',
    slug: 'tap-review',
    name: 'Tap Review',
    category: 'Reseñas',
    shortDescription: 'Facilita que tus clientes encuentren tu página de reseñas y compartan su experiencia.',
    description: 'Facilita que tus clientes encuentren tu página de reseñas y compartan su experiencia.',
    price: 'Desde RD$1,500',
    priceFrom: 'Desde RD$1,500',
    priceNumeric: 1500,
    route: '/productos/tap-review',
    tagline: 'Facilita que tus clientes encuentren tu página de reseñas.',
    buttonLabel: 'Solicitar Tap Review',
    badge: 'Reputación Digital',
    features: [
      'NFC',
      'Código QR',
      'Diseño personalizado',
      'Enlace a reseñas',
      'Fácil instalación'
    ],
    idealFor: [
      'Restaurantes y cafés',
      'Hoteles, hostales y alojamientos turísticos',
      'Barberías y salones de belleza',
      'Talleres mecánicos y centros de servicio',
      'Clínicas dentales y de salud'
    ],
    targetAudience: [
      'Restaurantes y Cafés',
      'Hoteles y Alojamientos',
      'Barberías y Salones',
      'Centros de Salud',
      'Talleres Automotrices',
      'Negocios de Servicio'
    ],
    material: 'Placa compacta para caja o mesa con acabado mate antireflejo',
    specs: {
      chip: 'NTAG213 optimizado para apertura de enlace directo',
      range: 'Lectura inmediata al aproximar',
      compatibility: 'Dispositivos con lector NFC nativo y lectores QR',
      waterResistant: true,
      warranty: '12 meses'
    },
    iconType: 'star',
    seoTitle: 'Tap Review | Solución NFC para Enlace de Reseñas en RD',
    seoDescription: 'Facilita que tus clientes encuentren tu página de reseñas y compartan su experiencia en un toque con tecnología NFC y QR.'
  },
  {
    id: 'tap-sticker',
    slug: 'tap-sticker',
    name: 'Tap Sticker',
    category: 'Sticker NFC',
    shortDescription: 'Una solución NFC compacta para compartir enlaces e información desde mostradores, productos, vehículos y otros espacios.',
    description: 'Una solución NFC compacta para compartir enlaces e información desde mostradores, productos, vehículos y otros espacios.',
    price: 'Desde RD$500',
    priceFrom: 'Desde RD$500',
    priceNumeric: 500,
    route: '/productos/tap-sticker',
    tagline: 'Una solución NFC compacta para cualquier superficie.',
    buttonLabel: 'Solicitar Tap Sticker',
    badge: 'Económico & Versátil',
    features: [
      'Sticker NFC',
      'Enlace personalizado',
      'Código QR opcional',
      'Personalización',
      'Fácil instalación'
    ],
    idealFor: [
      'Mostradores de cobro y cajas registradoras',
      'Vehículos comerciales y de reparto',
      'Empaques de productos y cajas de envío',
      'Mesas, vitrinas y expositores',
      'Equipamiento de trabajo'
    ],
    targetAudience: [
      'Vehículos de Reparto',
      'Cajas y Mostradores',
      'Empaques Comerciales',
      'Expositores y Ferias',
      'Flotas y Equipos'
    ],
    material: 'Vinilo resinado epóxico con adhesivo 3M de alta adherencia y filtro anti-metal',
    specs: {
      chip: 'NTAG213 ultra-delgado con blindaje ferrítico',
      range: '1 a 2 cm',
      compatibility: 'Universal en iPhone y Android con NFC',
      waterResistant: true,
      warranty: '6 meses'
    },
    iconType: 'sticker',
    seoTitle: 'Tap Sticker | Stickers Inteligentes NFC en República Dominicana',
    seoDescription: 'Stickers adhesivos NFC para mostradores, vehículos, empaques y mesas. Comparte tus enlaces e información al instante con un toque.'
  }
];

/**
 * ============================================================================
 * PAQUETES COMERCIALES (PACKS)
 * ============================================================================
 */
export const PRODUCT_PACKS: ProductPack[] = [
  {
    id: 'pack-starter',
    name: 'PACK STARTER',
    targetAudience: 'Para profesionales.',
    description: 'La solución esencial para profesionales independientes y ejecutivos que desean presentarse de manera memorable.',
    price: 'Desde RD$1,800',
    includes: [
      '1 Tap Card personalizada',
      '1 perfil digital',
      'QR de respaldo'
    ],
    ctaText: 'Solicitar Pack Starter'
  },
  {
    id: 'pack-business',
    name: 'PACK BUSINESS',
    targetAudience: 'Para pequeños negocios.',
    description: 'El kit perfecto para mostradores, mesas y puntos de venta que reciben clientes diariamente.',
    price: 'Desde RD$2,500',
    includes: [
      '1 Tap Business',
      '1 perfil digital',
      'WhatsApp',
      'Redes sociales',
      'Ubicación',
      'Reseñas'
    ],
    popular: true,
    badge: 'Más Solicitado',
    ctaText: 'Solicitar Pack Business'
  },
  {
    id: 'pack-pro',
    name: 'PACK PRO',
    targetAudience: 'Para negocios que necesitan varias soluciones.',
    description: 'La cobertura total para negocios con equipo de ventas, punto físico y estrategia activa de atención.',
    price: 'Solicitar cotización',
    includes: [
      'Tap Business',
      'Tap Review',
      'Tap Cards',
      'Perfil digital',
      'Configuración personalizada'
    ],
    ctaText: 'Solicitar Pack Pro'
  }
];

/**
 * ============================================================================
 * TABLA COMPARATIVA DE SOLUCIONES
 * ============================================================================
 */
export const COMPARISON_FEATURES: ProductComparisonFeature[] = [
  {
    feature: 'Tarjeta física',
    tapCard: true,
    tapBusiness: false,
    tapReview: false,
    tapSticker: false,
    tooltip: 'Formato de bolsillo tipo tarjeta de crédito'
  },
  {
    feature: 'Perfil digital',
    tapCard: true,
    tapBusiness: true,
    tapReview: false,
    tapSticker: false,
    tooltip: 'Micro-sitio móvil con catálogo y contacto'
  },
  {
    feature: 'WhatsApp',
    tapCard: true,
    tapBusiness: true,
    tapReview: false,
    tapSticker: true,
    tooltip: 'Enlace directo para abrir chat de WhatsApp'
  },
  {
    feature: 'Redes sociales',
    tapCard: true,
    tapBusiness: true,
    tapReview: false,
    tapSticker: false,
    tooltip: 'Instagram, TikTok, Facebook y enlaces'
  },
  {
    feature: 'Ubicación',
    tapCard: true,
    tapBusiness: true,
    tapReview: false,
    tapSticker: false,
    tooltip: 'Google Maps y Waze en un toque'
  },
  {
    feature: 'Catálogo',
    tapCard: true,
    tapBusiness: true,
    tapReview: false,
    tapSticker: false,
    tooltip: 'Menú digital o catálogo de servicios'
  },
  {
    feature: 'Reseñas',
    tapCard: false,
    tapBusiness: true,
    tapReview: true,
    tapSticker: false,
    tooltip: 'Enlace directo para que el cliente califique'
  },
  {
    feature: 'Personalización',
    tapCard: true,
    tapBusiness: true,
    tapReview: true,
    tapSticker: true,
    tooltip: 'Diseño con logotipo y colores de tu marca'
  }
];

/**
 * Helper para obtener producto por slug o ID
 */
export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(
    (p) => p.slug === slug || p.id === slug || p.route.endsWith(`/${slug}`)
  );
}
