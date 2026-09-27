import { Client } from '../types/client';
import { PlanFeatures } from '../types/plan';
import { DEFAULT_PLANS } from '../config/plans';
import { isSubscriptionActive } from './subscriptionService';

export type FeatureKey =
  | 'profile'
  | 'services'
  | 'hours'
  | 'socials'
  | 'qr'
  | 'nfc'
  | 'analytics'
  | 'advancedAnalytics'
  | 'customProfile'
  | 'support'
  | 'prioritySupport'
  | 'customDomain';

/**
 * Resuelve los featureFlags asociados al plan del cliente
 */
export function getPlanFeatureFlags(planId: string = 'starter'): PlanFeatures {
  const normalized = (planId || 'starter').toLowerCase();
  const plan = DEFAULT_PLANS.find(p => p.id === normalized);
  if (plan && plan.featureFlags) {
    return plan.featureFlags;
  }

  // Fallback con Starter si no existe
  return DEFAULT_PLANS[0].featureFlags;
}

/**
 * Determina si el plan asignado al cliente contempla la funcionalidad dada
 */
export function hasFeature(client: Client | null | undefined, feature: FeatureKey): boolean {
  if (!client) return false;
  const flags = getPlanFeatureFlags(client.plan || 'starter');
  return !!flags[feature];
}

/**
 * Determina si el cliente tiene permiso activo para utilizar una funcionalidad.
 * Centraliza la verificación para evitar "if client.plan === 'business'" en múltiples componentes.
 * 
 * @param client Cliente actual
 * @param feature Funcionalidad a consultar
 * @param options Opciones adicionales (ej. ignorar expiración para ciertas vistas de solo lectura)
 */
export function canUseFeature(
  client: Client | null | undefined,
  feature: FeatureKey,
  options: { checkSubscriptionActive?: boolean } = {}
): boolean {
  if (!client) return false;

  // 1. Verificar si el plan contiene la característica
  const planHasFeature = hasFeature(client, feature);
  if (!planHasFeature) {
    return false;
  }

  // 2. Si la opción checkSubscriptionActive está activada, validar que la suscripción no haya vencido
  if (options.checkSubscriptionActive) {
    if (!isSubscriptionActive(client)) {
      return false;
    }
  }

  return true;
}

/**
 * Mensaje descriptivo para guiar al usuario si una funcionalidad está bloqueada
 */
export function getFeatureLockReason(feature: FeatureKey): { title: string; description: string; requiredPlan: string } {
  switch (feature) {
    case 'advancedAnalytics':
      return {
        title: 'Métricas Avanzadas Bloqueadas',
        description: 'Desbloquea el análisis de clics por botón, dispositivos frecuentes y horarios de mayor afluencia actualizando a Business o Pro.',
        requiredPlan: 'Business'
      };
    case 'customProfile':
      return {
        title: 'Personalización Visual Avanzada',
        description: 'Personaliza los colores de portada, estilos de botones e insignias verificadas con el plan Business o Pro.',
        requiredPlan: 'Business'
      };
    case 'prioritySupport':
      return {
        title: 'Soporte Prioritario 24/7',
        description: 'Obtén asistencia personalizada prioritaria por WhatsApp y videollamada con el plan Pro.',
        requiredPlan: 'Pro'
      };
    case 'customDomain':
      return {
        title: 'Dominio Propio (Próximamente)',
        description: 'Conecta tu propio dominio (ej. tunegocio.com) en lugar de taprd.com/p/slug. Exclusivo para el plan Pro.',
        requiredPlan: 'Pro'
      };
    default:
      return {
        title: 'Función disponible en un plan superior',
        description: 'Esta característica requiere un plan superior para ser utilizada.',
        requiredPlan: 'Business'
      };
  }
}
