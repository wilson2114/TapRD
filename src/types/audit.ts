export type AuditAction = 
  | 'CLIENT_ACCESS_CREATED'
  | 'CLIENT_ACCESS_SUSPENDED'
  | 'CLIENT_ACCESS_REACTIVATED'
  | 'CLIENT_INVITATION_RESENT'
  | 'CLIENT_PROFILE_UPDATED';

export interface AuditLog {
  id: string;
  actorUid: string;
  actorRole: string;
  action: AuditAction;
  targetClientId: string;
  timestamp: string;
  details?: Record<string, any>;
}
