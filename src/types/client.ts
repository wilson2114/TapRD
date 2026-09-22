export type ClientStatus = 'active' | 'pending' | 'inactive';
export type ClientPlan = 'starter' | 'business' | 'pro';
export type ClientSubscriptionStatus = 'active' | 'pending' | 'expired' | 'cancelled';
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

export interface ClientService {
  id: string;
  name: string;
  description: string;
  price: string;
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
  plan?: ClientPlan;
  subscriptionStatus?: ClientSubscriptionStatus;
  permissions?: ClientPermissions;
  productAssigned?: string;
  googleReviewsUrl?: string;
  mapsUrl?: string;
  viewsCount?: number;
  profileTheme?: 'light' | 'dark' | 'auto';
}
