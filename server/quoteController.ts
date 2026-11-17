import { Request, Response } from 'express';
import { getFirebaseAdmin } from './firebaseAdmin';

const COLLECTION_NAME = 'quoteRequests';

async function verifyAdminRequest(req: Request): Promise<boolean> {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7).trim();
  if (!token) return false;

  const { auth, db, isConfigured } = getFirebaseAdmin();
  if (!isConfigured || !auth) return false;

  try {
    const decoded = await auth.verifyIdToken(token);
    const email = (decoded.email || '').toLowerCase();
    let role = ((decoded.role as string) || '').toLowerCase();

    if (
      email === 'wilsonabelinobrito@gmail.com' ||
      (decoded.email_verified === true && /@taprd\.com$/.test(email))
    ) {
      return true;
    }

    if (!role && db) {
      const userDoc = await db.collection('users').doc(decoded.uid).get();
      if (userDoc.exists) {
        role = String(userDoc.data()?.role || '').toLowerCase();
      }
    }

    return role === 'admin' || role === 'superadmin';
  } catch {
    return false;
  }
}

export async function createPublicQuoteHandler(req: Request, res: Response) {
  try {
    const {
      source,
      name,
      businessName,
      phone,
      email,
      businessType,
      productInterest,
      quantity,
      city,
      needOption,
      message
    } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }

    const { db, isConfigured, hasServiceAccount } = getFirebaseAdmin();
    if (!isConfigured || !db || !hasServiceAccount) {
      return res.status(503).json({
        error: 'Firebase Admin no configurado con Service Account en el servidor.'
      });
    }

    const now = new Date().toISOString();
    const payload = {
      source: ['contact_form', 'product_modal', 'contact_page'].includes(source)
        ? source
        : 'contact_form',
      name: name.trim().slice(0, 150),
      businessName: typeof businessName === 'string' ? businessName.trim().slice(0, 150) : '',
      phone: typeof phone === 'string' ? phone.trim().slice(0, 60) : '',
      email: typeof email === 'string' ? email.trim().slice(0, 150) : '',
      businessType: typeof businessType === 'string' ? businessType.trim().slice(0, 120) : '',
      productInterest:
        typeof productInterest === 'string' && productInterest.trim()
          ? productInterest.trim().slice(0, 120)
          : 'Tap Card',
      quantity: Number(quantity) > 0 ? Math.min(Number(quantity), 10000) : 1,
      city: typeof city === 'string' ? city.trim().slice(0, 100) : '',
      needOption: typeof needOption === 'string' ? needOption.trim().slice(0, 120) : '',
      message: typeof message === 'string' ? message.trim().slice(0, 2000) : '',
      status: 'new',
      adminNotes: '',
      createdAt: now,
      updatedAt: now
    };

    const ref = await db.collection(COLLECTION_NAME).add(payload);
    return res.status(201).json({ id: ref.id, ...payload });
  } catch (err) {
    console.error('[quoteController] Error en createPublicQuoteHandler:', err);
    return res.status(500).json({ error: 'No se pudo registrar la solicitud.' });
  }
}

export async function listAdminQuotesHandler(req: Request, res: Response) {
  const authorized = await verifyAdminRequest(req);
  if (!authorized) {
    return res.status(401).json({ error: 'No autorizado.' });
  }

  try {
    const { db, isConfigured, hasServiceAccount } = getFirebaseAdmin();
    if (!isConfigured || !db || !hasServiceAccount) {
      return res.status(503).json({ error: 'Firebase Admin no disponible.' });
    }

    const snap = await db.collection(COLLECTION_NAME).get();
    const items = snap.docs
      .map((d: any) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }))
      .sort((a: any, b: any) => {
        const tA = new Date(a.createdAt || 0).getTime();
        const tB = new Date(b.createdAt || 0).getTime();
        return tB - tA;
      });

    return res.json({ items });
  } catch (err) {
    console.error('[quoteController] Error en listAdminQuotesHandler:', err);
    return res.status(500).json({ error: 'Error consultando solicitudes.' });
  }
}

export async function updateAdminQuoteHandler(req: Request, res: Response) {
  const authorized = await verifyAdminRequest(req);
  if (!authorized) {
    return res.status(401).json({ error: 'No autorizado.' });
  }

  const id = String(req.params.id || '').trim();
  if (!id) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const { db, isConfigured, hasServiceAccount } = getFirebaseAdmin();
    if (!isConfigured || !db || !hasServiceAccount) {
      return res.status(503).json({ error: 'Firebase Admin no disponible.' });
    }

    const { status, adminNotes } = req.body || {};
    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString()
    };
    if (typeof status === 'string') updates.status = status;
    if (typeof adminNotes === 'string') updates.adminNotes = adminNotes;

    await db.collection(COLLECTION_NAME).doc(id).update(updates);
    return res.json({ ok: true, id, ...updates });
  } catch (err) {
    console.error('[quoteController] Error en updateAdminQuoteHandler:', err);
    return res.status(500).json({ error: 'Error actualizando solicitud.' });
  }
}

export async function deleteAdminQuoteHandler(req: Request, res: Response) {
  const authorized = await verifyAdminRequest(req);
  if (!authorized) {
    return res.status(401).json({ error: 'No autorizado.' });
  }

  const id = String(req.params.id || '').trim();
  if (!id) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const { db, isConfigured, hasServiceAccount } = getFirebaseAdmin();
    if (!isConfigured || !db || !hasServiceAccount) {
      return res.status(503).json({ error: 'Firebase Admin no disponible.' });
    }

    await db.collection(COLLECTION_NAME).doc(id).delete();
    return res.json({ ok: true, id });
  } catch (err) {
    console.error('[quoteController] Error en deleteAdminQuoteHandler:', err);
    return res.status(500).json({ error: 'Error eliminando solicitud.' });
  }
}
