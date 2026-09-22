export interface ProductSpecs {
  chip: string;
  range: string;
  compatibility: string;
  waterResistant: boolean;
  warranty: string;
}

export interface ProductDiscountTier {
  minQuantity: number;
  discountPercent: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  price: string;
  priceFrom: string;
  priceNumeric: number;
  features: string[];
  route: string;
  image?: string;
  tagline: string;
  badge?: string;
  idealFor: string[];
  targetAudience?: string[];
  material: string;
  specs: ProductSpecs;
  iconType: 'card' | 'plate' | 'star' | 'sticker';
  buttonLabel?: string;
  seoTitle?: string;
  seoDescription?: string;

  // Arquitectura preparada para futuras capacidades (inventario, cupones, suscripción)
  inventory?: number;
  customPricing?: boolean;
  discounts?: ProductDiscountTier[];
  couponsEnabled?: boolean;
  orderAvailable?: boolean;
  subscriptionAvailable?: boolean;
}

export interface ProductPack {
  id: string;
  name: string;
  targetAudience: string;
  description: string;
  price: string;
  includes: string[];
  badge?: string;
  popular?: boolean;
  ctaText: string;
}

export interface ProductComparisonFeature {
  feature: string;
  tapCard: boolean;
  tapBusiness: boolean;
  tapReview: boolean;
  tapSticker: boolean;
  tooltip?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  duration?: string;
  popular?: boolean;
  category?: string;
}

export interface BusinessHoursDay {
  day: string;
  hours: string;
  isOpen: boolean;
}

export interface BankDetails {
  bank: string;
  accountType: string;
  accountNumber: string;
  holder: string;
  rncOrCedula?: string;
}

export interface ProfileAnalytics {
  totalTaps: number;
  whatsappClicks: number;
  instagramClicks: number;
  vcardDownloads: number;
  reviewClicks: number;
  directionsClicks: number;
  weeklyTaps: { day: string; taps: number }[];
}

export interface DigitalProfile {
  slug: string;
  isDemo: boolean;
  name: string;
  category: string;
  tagline: string;
  description: string;
  avatarInitials: string;
  avatarBgColor: string;
  coverGradient: string;
  verified: boolean;
  phone: string;
  whatsapp: string;
  whatsappMessage?: string;
  email: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  address: string;
  city: string;
  mapsUrl: string;
  wazeUrl?: string;
  googleReviewsUrl?: string;
  reviewScore?: number;
  reviewCount?: number;
  services: ServiceItem[];
  hours: BusinessHoursDay[];
  wifi?: {
    ssid: string;
    note?: string;
  };
  bankInfo?: BankDetails;
  analytics?: ProfileAnalytics;
  profileTheme?: 'light' | 'dark' | 'auto';
}

export interface BusinessCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
  demoSlug?: string;
  benefits: string[];
}

export interface ContactInquiry {
  name: string;
  businessName: string;
  phone: string;
  email: string;
  businessType: string;
  productInterest: string;
  message: string;
  submittedAt?: string;
}

export * from './client';
export * from './user';
export * from './audit';
