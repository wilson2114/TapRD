export type AuditAction = 
  | 'CLIENT_ACCESS_CREATED'
  | 'CLIENT_ACCESS_SUSPENDED'
  | 'CLIENT_ACCESS_REACTIVATED'
  | 'CLIENT_INVITATION_RESENT'
  | 'CLIENT_PROFILE_UPDATED'
  | 'CONTRACT_STATUS_UPDATED'
  | 'PROFILE_SUSPENDED_BY_MODERATION'
  | 'PROFILE_REACTIVATED_BY_MODERATION'
  | 'REPORT_STATUS_UPDATED'
  | 'PRIVACY_REQUEST_CREATED'
  | 'PRIVACY_REQUEST_UPDATED'
  | 'ACCOUNT_DELETION_REQUESTED';

export interface AuditLog {
  id: string;
  actorUid: string;
  actorRole: string;
  action: AuditAction;
  targetClientId: string;
  timestamp: string;
  details?: Record<string, any>;
}
