import { ClientPlan, ClientSubscriptionStatus } from './client';

export type PlanInterval = 'monthly' | 'yearly';

export interface PlanLimits {
  maxServices: number | null; // null = unlimited
  maxSocialLinks: number | null;
  maxTeamMembers: number | null;
  maxAnalyticsDays: number | null;
  maxProfiles: number | null;
  [key: string]: number | null | undefined;
}

export interface PlanFeatures {
  profile: boolean;
  services: boolean;
  hours: boolean;
  socials: boolean;
  qr: boolean;
  nfc: boolean;
  analytics: boolean;
  advancedAnalytics: boolean;
  customProfile: boolean;
  support: boolean;
  prioritySupport: boolean;
  customDomain?: boolean;
  [key: string]: boolean | undefined;
}

export interface Plan {
  id: string; // 'starter' | 'business' | 'pro' | custom
  name: string;
  description: string;
  price: number;
  currency: 'DOP' | 'USD';
  interval: PlanInterval;
  features: string[]; // List of bullet points for display
  featureFlags: PlanFeatures; // Structured map for code checks
  limits: PlanLimits;
  permissions?: Record<string, boolean>;
  popular?: boolean;
  active: boolean;
  badge?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 
  | 'pending'
  | 'active'
  | 'past_due'
  | 'expired'
  | 'cancelled'
  | 'suspended'
  | 'trialing';

export interface SubscriptionAuditLog {
  id: string;
  clientId: string;
  clientBusinessName?: string;
  previousPlan: string;
  newPlan: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  timestamp: string;
  reason?: string;
}

export interface ClientSubscriptionInfo {
  plan: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartedAt?: string;
  subscriptionExpiresAt?: string;
  gracePeriodUntil?: string;
  billingCycle: PlanInterval;
  paymentProvider?: string;
  paymentCustomerId?: string;
  paymentSubscriptionId?: string;
  paymentStatus?: string;
  amount?: number;
  currency?: string;
  lastPaymentAt?: string;
  nextPaymentAt?: string;
}
