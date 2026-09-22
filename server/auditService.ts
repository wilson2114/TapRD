import { getFirebaseAdmin } from './firebaseAdmin';

export type AuditActionType =
  | 'CLIENT_ACCESS_CREATED'
  | 'CLIENT_ACCESS_SUSPENDED'
  | 'CLIENT_ACCESS_REACTIVATED'
  | 'CLIENT_INVITATION_RESENT'
  | 'CLIENT_PROFILE_UPDATED';

export interface AuditLogPayload {
  actorUid: string;
  actorRole: string;
  action: AuditActionType;
  targetClientId: string;
  details?: Record<string, any>;
}

/**
 * Registra un evento inmutable de auditoría en la colección auditLogs (Regla 18).
 * Nunca almacena contraseñas ni tokens.
 */
export async function logAuditEvent(payload: AuditLogPayload): Promise<string> {
  const timestamp = new Date().toISOString();
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const logEntry = {
    id: logId,
    actorUid: payload.actorUid || 'system',
    actorRole: payload.actorRole || 'admin',
    action: payload.action,
    targetClientId: payload.targetClientId,
    timestamp,
    ...(payload.details ? { details: payload.details } : {})
  };

  const { db, isConfigured } = getFirebaseAdmin();

  if (isConfigured && db) {
    try {
      await db.collection('auditLogs').doc(logId).set(logEntry);
      console.log(`[Audit] Evento registrado en Firestore: ${payload.action} sobre ${payload.targetClientId}`);
      return logId;
    } catch (err) {
      console.warn('[Audit] Aviso al escribir log en Firestore:', err);
    }
  } else {
    console.log('[Audit] Registro local (Admin SDK offline):', JSON.stringify(logEntry));
  }

  return logId;
}
