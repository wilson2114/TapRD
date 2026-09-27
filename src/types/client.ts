export type ClientStatus = 'active' | 'pending' | 'inactive';
export type ClientAccountStatus = 'active' | 'inactive' | 'suspended' | 'pending_deletion';
export type ClientProfileStatus = 'active' | 'inactive' | 'suspended';
export type ClientContractStatus = 'draft' | 'pending' | 'accepted' | 'signed' | 'expired' | 'cancelled';
export type ClientPlan = 'starter' | 'business' | 'pro' | string;
export type ClientSubscriptionStatus = 
  | 'pending' 
  | 'active' 
  | 'past_due' 
  | 'expired' 
  | 'cancelled' 
  | 'suspended' 
  | 'trialing';
export type ClientAccessStatus = 'none' | 'pending' | 'active' | 'suspended';

export interface ClientPermissions {
  canEditProfile: boolean;
  canEditServices: boolean;
  canEditHours: boolean;
  canEditSocials: boolean;
  canViewAnalytics: boolean;
  canDownloadQR: boolean;
}

export const DEFAULT_CLIENT_PERMISSIONS: ClientPermissions = {
  canEditProfile: true,
  canEditServices: true,
  canEditHours: true,
  canEditSocials: true,
  canViewAnalytics: true,
  canDownloadQR: true,
};

export type ServiceImageStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'failed';

export interface ClientService {
  id: string;
  name: string;
  description: string;
  price: string;
  currency?: string;
  imageUrl?: string;
  imagePath?: string;
  imageAlt?: string;
  active?: boolean;
  order?: number;
  imageStatus?: ServiceImageStatus;
  thumbnailUrl?: string;
}

export interface ClientSocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
}

export interface DaySchedule {
  enabled: boolean;
  open: string;
  close: string;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface ClientDayHours {
  day: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  display?: string;
}

export interface ClientSettings {
  showPhone: boolean;
  showWhatsapp: boolean;
  showInstagram: boolean;
  showFacebook: boolean;
  showTikTok: boolean;
  showAddress: boolean;
  showHours: boolean;
  showServices: boolean;
  showReviews: boolean;
  showBankAccounts?: boolean;
}

export interface ClientBankAccount {
  id: string;
  bank: string;
  accountType: 'Ahorros' | 'Corriente' | string;
  accountNumber: string;
  currency: 'DOP' | 'USD' | string;
  holder: string;
  rncOrCedula?: string;
  notes?: string;
}

export interface Client {
  id: string;
  name?: string; // alias para compatibilidad Firestore
  ownerName: string;
  businessName: string;
  slug: string;
  profileSlug?: string; // alias para compatibilidad Firestore
  active?: boolean;
  category: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  address: string;
  logo?: string;
  logoUrl?: string;
  avatarInitials?: string;
  avatarBgColor?: string;
  coverGradient?: string;
  socialLinks: ClientSocialLinks;
  services: ClientService[];
  hours: ClientDayHours[];
  weeklySchedule?: WeeklySchedule;
  bankAccounts?: ClientBankAccount[];
  bankInfo?: {
    bank: string;
    accountType: string;
    accountNumber: string;
    holder: string;
    rncOrCedula?: string;
  };
  settings: ClientSettings;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  userId?: string;
  clientEmail?: string;
  accessStatus?: ClientAccessStatus;
  activationToken?: string;
  plan?: ClientPlan;
  subscriptionStatus?: ClientSubscriptionStatus;
  subscriptionStartedAt?: string;
  subscriptionExpiresAt?: string;
  gracePeriodUntil?: string;
  billingCycle?: 'monthly' | 'yearly';
  paymentProvider?: string;
  paymentCustomerId?: string;
  paymentSubscriptionId?: string;
  paymentStatus?: string;
  amount?: number;
  currency?: string;
  lastPaymentAt?: string;
  nextPaymentAt?: string;
  permissions?: ClientPermissions;
  productAssigned?: string;
  googleReviewsUrl?: string;
  mapsUrl?: string;
  viewsCount?: number;
  profileTheme?: 'light' | 'dark' | 'auto';
  // Cumplimiento Legal y Separación de Estados (PARTE 10)
  accountStatus?: ClientAccountStatus;
  profileStatus?: ClientProfileStatus;
  contractStatus?: ClientContractStatus;
  contractVersion?: string;
  contractAcceptedAt?: string;
  contractSignedAt?: string;
  contractExpiresAt?: string;
  contractDocumentUrl?: string;
  contractNotes?: string;
  termsVersion?: string;
  privacyVersion?: string;
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
  termsAcceptedAt?: string;
  privacyAcceptedAt?: string;
}
