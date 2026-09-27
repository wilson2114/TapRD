import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db, isFirebaseConfigured, auth } from '../lib/firebase';
import { Client, ClientSubscriptionStatus } from '../types/client';
import { ClientSubscriptionInfo, SubscriptionAuditLog, SubscriptionStatus } from '../types/plan';
import { getClientById, updateClient } from './clientService';
import { getPlanById } from './planService';

const AUDIT_COLLECTION_NAME = 'subscriptionAuditLogs';

/**
 * Verifica si la suscripción de un cliente está actualmente activa.
 * Considera el status y la fecha de expiración sin alterar la base de datos desde el navegador.
 */
export function isSubscriptionActive(client?: Client | null): boolean {
  if (!client) return false;

  const status = client.subscriptionStatus || 'active';

  // Si está explícitamente suspendida, cancelada o expirada
  if (status === 'suspended' || status === 'cancelled' || status === 'expired') {
    return false;
  }

  // Si está activa o trialing, comprobar fecha de vencimiento si existe
  if (status === 'active' || status === 'trialing') {
    if (client.subscriptionExpiresAt) {
      const expirationDate = new Date(client.subscriptionExpiresAt);
      const now = new Date();
      if (!isNaN(expirationDate.getTime()) && expirationDate < now) {
        // La fecha ya pasó
        return false;
      }
    }
    return true;
  }

  // Pending o past_due se consideran no activas plenamente
  return false;
}

/**
 * Comprueba si el cliente está dentro del período de gracia posterior al vencimiento
 */
export function isGracePeriodActive(client?: Client | null): boolean {
  if (!client || !client.gracePeriodUntil) return false;
  const graceDate = new Date(client.gracePeriodUntil);
  const now = new Date();
  return !isNaN(graceDate.getTime()) && graceDate > now;
}

/**
 * Obtener la información de suscripción del cliente
 */
export async function getClientSubscription(clientId: string): Promise<ClientSubscriptionInfo | null> {
  const client = await getClientById(clientId);
  if (!client) return null;

  return {
    plan: client.plan || 'starter',
    subscriptionStatus: (client.subscriptionStatus as SubscriptionStatus) || 'active',
    subscriptionStartedAt: client.subscriptionStartedAt || client.createdAt,
    subscriptionExpiresAt: client.subscriptionExpiresAt,
    gracePeriodUntil: client.gracePeriodUntil,
    billingCycle: (client.billingCycle as any) || 'monthly',
    paymentProvider: client.paymentProvider || '',
    paymentCustomerId: client.paymentCustomerId || '',
    paymentSubscriptionId: client.paymentSubscriptionId || '',
    paymentStatus: client.paymentStatus || '',
    amount: client.amount,
    currency: client.currency || 'DOP',
    lastPaymentAt: client.lastPaymentAt,
    nextPaymentAt: client.nextPaymentAt
  };
}

/**
 * Registra una entrada inmutable de auditoría para cambios de suscripción
 */
export async function logSubscriptionChange(audit: Omit<SubscriptionAuditLog, 'id' | 'timestamp'>): Promise<void> {
  const auditId = `aud-sub-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const timestamp = new Date().toISOString();

  const auditEntry: SubscriptionAuditLog = {
    ...audit,
    id: auditId,
    timestamp
  };

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, AUDIT_COLLECTION_NAME, auditId), auditEntry);
    } catch (err) {
      console.warn('Aviso registrando auditoría de suscripción en Firestore:', err);
    }
  }
}

/**
 * Actualizar manualmente el plan de un cliente (Operación reservada para ADMIN / SUPERADMIN)
 */
export async function updateClientPlan(
  clientId: string,
  newPlanId: string,
  actorUid?: string,
  reason?: string
): Promise<Client> {
  const client = await getClientById(clientId);
  if (!client) {
    throw new Error(`Cliente ${clientId} no encontrado.`);
  }

  const previousPlan = client.plan || 'starter';
  const previousStatus = client.subscriptionStatus || 'active';
  const currentActor = actorUid || auth.currentUser?.uid || 'admin';

  // Validar existencia de plan
  const planObj = await getPlanById(newPlanId);
  const validPlanId = planObj ? planObj.id : newPlanId;

  const updatedClient = await updateClient(clientId, {
    plan: validPlanId
  });

  if (!updatedClient) {
    throw new Error(`Error al actualizar el plan para el cliente ${clientId}.`);
  }

  // Registrar auditoría
  await logSubscriptionChange({
    clientId,
    clientBusinessName: client.businessName,
    previousPlan,
    newPlan: validPlanId,
    previousStatus,
    newStatus: previousStatus,
    changedBy: currentActor,
    reason: reason || 'Cambio manual de plan administrativo'
  });

  return updatedClient;
}

/**
 * Actualizar el estado de suscripción del cliente
 */
export async function updateSubscriptionStatus(
  clientId: string,
  newStatus: ClientSubscriptionStatus,
  actorUid?: string,
  reason?: string
): Promise<Client> {
  const client = await getClientById(clientId);
  if (!client) {
    throw new Error(`Cliente ${clientId} no encontrado.`);
  }

  const previousStatus = client.subscriptionStatus || 'active';
  const currentPlan = client.plan || 'starter';
  const currentActor = actorUid || auth.currentUser?.uid || 'admin';

  const updatedClient = await updateClient(clientId, {
    subscriptionStatus: newStatus
  });

  if (!updatedClient) {
    throw new Error(`Error al actualizar el estado de suscripción para el cliente ${clientId}.`);
  }

  await logSubscriptionChange({
    clientId,
    clientBusinessName: client.businessName,
    previousPlan: currentPlan,
    newPlan: currentPlan,
    previousStatus,
    newStatus,
    changedBy: currentActor,
    reason: reason || `Cambio de estado de suscripción a ${newStatus}`
  });

  return updatedClient;
}

/**
 * Activar suscripción
 */
export async function activateSubscription(clientId: string, actorUid?: string, reason?: string): Promise<Client> {
  return await updateSubscriptionStatus(clientId, 'active', actorUid, reason || 'Activación manual de suscripción');
}

/**
 * Suspender suscripción
 */
export async function suspendSubscription(clientId: string, actorUid?: string, reason?: string): Promise<Client> {
  return await updateSubscriptionStatus(clientId, 'suspended', actorUid, reason || 'Suspensión manual de suscripción');
}

/**
 * Cancelar suscripción
 */
export async function cancelSubscription(clientId: string, actorUid?: string, reason?: string): Promise<Client> {
  return await updateSubscriptionStatus(clientId, 'cancelled', actorUid, reason || 'Cancelación manual de suscripción');
}

/**
 * Marcar como expirada
 */
export async function expireSubscription(clientId: string, actorUid?: string, reason?: string): Promise<Client> {
  return await updateSubscriptionStatus(clientId, 'expired', actorUid, reason || 'Expiración manual de suscripción');
}
