/**
 * Tipos para Cumplimiento Legal, Privacidad, Contratos y Protección de TapRD (PARTE 10)
 */

export type ContractStatus = 
  | 'draft' 
  | 'pending' 
  | 'accepted' 
  | 'signed' 
  | 'expired' 
  | 'cancelled';

export interface ClientContract {
  id?: string;
  clientId: string;
  contractStatus: ContractStatus;
  contractVersion: string;
  contractAcceptedAt?: string;
  contractSignedAt?: string;
  contractExpiresAt?: string;
  contractDocumentUrl?: string; // Ruta Storage o enlace seguro privado
  contractNotes?: string;
  legalRepresentativeName?: string;
  clientSignerName?: string;
  clientSignerIdNumber?: string;
  updatedAt: string;
}

export type PrivacyRequestType = 
  | 'data_correction'     // Corrección de datos inexactos
  | 'data_update'         // Actualización de datos desfasados
  | 'data_access'         // Copia o portabilidad de datos personales
  | 'data_deletion'       // Solicitud de eliminación (derecho al olvido)
  | 'privacy_inquiry';    // Consulta o reclamo general de privacidad

export type PrivacyRequestStatus = 
  | 'pending'     // Recibida y en cola
  | 'in_review'   // En análisis administrativo
  | 'completed'   // Atendida y resuelta
  | 'rejected'    // Desestimada con fundamentación
  | 'cancelled';  // Cancelada por el propio usuario

export interface PrivacyRequest {
  id: string;
  userId: string;
  clientId: string;
  clientBusinessName?: string;
  userEmail: string;
  requestType: PrivacyRequestType;
  status: PrivacyRequestStatus;
  details: string;
  notes?: string; // Notas internas de administración
  resolvedAt?: string;
  resolvedBy?: string; // UID del admin
  createdAt: string;
  updatedAt: string;
}

export type ReportReason = 
  | 'incorrect_content'   // Contenido incorrecto o falso
  | 'impersonation'       // Suplantación de identidad o marca
  | 'illegal_content'     // Contenido ilícito o prohibido
  | 'unauthorized_brand'  // Uso no autorizado de marca o propiedad intelectual
  | 'spam'                // Enlaces fraudulentos o spam
  | 'other';              // Otro motivo detallado

export type ReportStatus = 
  | 'pending'     // Pendiente de revisión
  | 'reviewing'   // En proceso de investigación
  | 'resolved'    // Acción tomada
  | 'dismissed';  // Desestimado (sin mérito)

export type ReportActionTaken = 
  | 'none'
  | 'warning_issued'
  | 'profile_suspended'
  | 'content_edited'
  | 'dismissed';

export interface ContentReport {
  id: string;
  profileSlug: string;
  clientId: string;
  businessName: string;
  reason: ReportReason;
  details: string;
  reporterEmail?: string;
  status: ReportStatus;
  actionTaken?: ReportActionTaken;
  adminNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

/**
 * Estados explícitamente diferenciados para una cuenta de cliente:
 * - accountStatus: estado general de la cuenta
 * - accessStatus: estado de acceso al portal y credenciales
 * - profileStatus: estado de visibilidad del perfil público
 * - subscriptionStatus: estado del plan / facturación
 */
export type AccountStatus = 'active' | 'inactive' | 'suspended' | 'pending_deletion';
export type ProfileStatus = 'active' | 'inactive' | 'suspended';
