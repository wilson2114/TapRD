import { Client } from '../types/client';
import { PlanLimits } from '../types/plan';
import { DEFAULT_PLANS } from '../config/plans';

export type LimitKey = 'maxServices' | 'maxSocialLinks' | 'maxTeamMembers' | 'maxAnalyticsDays' | 'maxProfiles';

/**
 * Obtener los límites configurados para el plan del cliente
 */
export function getPlanLimits(planId: string = 'starter'): PlanLimits {
  const normalized = (planId || 'starter').toLowerCase();
  const plan = DEFAULT_PLANS.find(p => p.id === normalized);
  if (plan && plan.limits) {
    return plan.limits;
  }
  return DEFAULT_PLANS[0].limits;
}

/**
 * Obtener el valor límite específico para un cliente. Retorna null si es ilimitado.
 */
export function getLimit(client: Client | null | undefined, limitKey: LimitKey): number | null {
  if (!client) return 0;
  const limits = getPlanLimits(client.plan || 'starter');
  const value = limits[limitKey];
  return value !== undefined ? value : null;
}

/**
 * Valida si el cliente puede crear un nuevo ítem (ej. servicio, enlace de red social)
 */
export function canCreate(client: Client | null | undefined, limitKey: LimitKey, currentCount: number): boolean {
  if (!client) return false;
  const limit = getLimit(client, limitKey);
  // Si el límite es null, significa ilimitado
  if (limit === null) return true;
  return currentCount < limit;
}

/**
 * Retorna cuántos elementos le quedan disponibles para crear antes de alcanzar el tope.
 * Retorna null si es ilimitado.
 */
export function getRemaining(client: Client | null | undefined, limitKey: LimitKey, currentCount: number): number | null {
  if (!client) return 0;
  const limit = getLimit(client, limitKey);
  if (limit === null) return null; // Ilimitado
  return Math.max(0, limit - currentCount);
}

/**
 * Mensaje de error amigable cuando se alcanza el límite
 */
export function getLimitReachedMessage(limitKey: LimitKey, limit: number): string {
  switch (limitKey) {
    case 'maxServices':
      return `Has alcanzado el límite de ${limit} servicios de tu plan actual.`;
    case 'maxSocialLinks':
      return `Has alcanzado el límite de ${limit} redes sociales de tu plan actual.`;
    case 'maxTeamMembers':
      return `Has alcanzado el límite de ${limit} miembros de equipo de tu plan actual.`;
    case 'maxProfiles':
      return `Has alcanzado el límite de ${limit} perfiles de tu plan actual.`;
    default:
      return `Has alcanzado el límite permitido (${limit}) en tu plan actual.`;
  }
}
