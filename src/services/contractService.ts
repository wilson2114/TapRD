import { db, auth, isFirebaseConfigured } from '../lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { Client, ClientContractStatus } from '../types/client';
import { ClientContract } from '../types/legal';
import { updateClient, getClientById } from './clientService';
import { COMPANY_CONFIG } from '../config/company';

export async function updateClientContract(
  clientId: string,
  contractData: {
    contractStatus: ClientContractStatus;
    contractVersion?: string;
    contractAcceptedAt?: string;
    contractSignedAt?: string;
    contractExpiresAt?: string;
    contractDocumentUrl?: string;
    contractNotes?: string;
  }
): Promise<{ success: boolean; client?: Client; error?: string }> {
  try {
    const now = new Date().toISOString();
    const payload = {
      contractStatus: contractData.contractStatus,
      contractVersion: contractData.contractVersion || COMPANY_CONFIG.termsVersion,
      contractAcceptedAt: contractData.contractAcceptedAt || (contractData.contractStatus === 'accepted' ? now : undefined),
      contractSignedAt: contractData.contractSignedAt || (contractData.contractStatus === 'signed' ? now : undefined),
      contractExpiresAt: contractData.contractExpiresAt,
      contractDocumentUrl: contractData.contractDocumentUrl,
      contractNotes: contractData.contractNotes,
      updatedAt: now
    };

    // Actualizar en el cliente
    const updated = await updateClient(clientId, payload);

    // Registrar en auditoría
    try {
      const auditId = `aud_contract_${Date.now()}`;
      const logEntry = {
        id: auditId,
        actorUid: auth?.currentUser?.uid || 'admin',
        actorRole: 'admin',
        action: 'CONTRACT_STATUS_UPDATED',
        targetClientId: clientId,
        timestamp: now,
        details: {
          newStatus: contractData.contractStatus,
          version: payload.contractVersion,
          documentUrl: payload.contractDocumentUrl || null
        }
      };
      if (isFirebaseConfigured && db) {
        await setDoc(doc(db, 'auditLogs', auditId), logEntry);
      }
    } catch (auditErr) {
      console.warn('[ContractService] Aviso registrando log de auditoría:', auditErr);
    }

    return { success: true, client: updated || undefined };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al actualizar el contrato del cliente.' };
  }
}
