import { collection, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { supabase, isSupabaseConfigured, checkSupabaseTableReady } from '../lib/supabase';
import { Client } from '../types/client';

export interface SupabaseStatusReport {
  configured: boolean;
  clientsReady: boolean;
  quotesReady: boolean;
  plansReady: boolean;
  reportsReady: boolean;
}

export interface MigrationResult {
  clientsMigrated: number;
  quotesMigrated: number;
  plansMigrated: number;
  reportsMigrated: number;
  errors: string[];
}

export async function getSupabaseStatusReport(): Promise<SupabaseStatusReport> {
  if (!isSupabaseConfigured) {
    return {
      configured: false,
      clientsReady: false,
      quotesReady: false,
      plansReady: false,
      reportsReady: false
    };
  }

  const [clientsReady, quotesReady, plansReady, reportsReady] = await Promise.all([
    checkSupabaseTableReady('clients'),
    checkSupabaseTableReady('quote_requests'),
    checkSupabaseTableReady('plans'),
    checkSupabaseTableReady('reports')
  ]);

  return {
    configured: true,
    clientsReady,
    quotesReady,
    plansReady,
    reportsReady
  };
}

export function clientToSupabaseRow(c: Client) {
  return {
    id: c.id,
    slug: (c.slug || c.id).toLowerCase(),
    business_name: c.businessName || '',
    owner_name: c.ownerName || '',
    category: c.category || '',
    description: c.description || '',
    phone: c.phone || '',
    whatsapp: c.whatsapp || '',
    email: c.email || '',
    client_email: c.clientEmail || c.email || '',
    city: c.city || '',
    address: c.address || '',
    product_assigned: c.productAssigned || 'Tap Card',
    status: c.status || 'active',
    profile_status: c.profileStatus || 'active',
    active: c.active !== false,
    views: Number(c.viewsCount) || 0,
    plan: c.plan || 'starter',
    subscription_status: c.subscriptionStatus || 'active',
    access_status: c.accessStatus || 'none',
    user_id: c.userId || null,
    logo_url: c.logoUrl || c.logo || null,
    cover_gradient: c.coverGradient || null,
    avatar_bg_color: c.avatarBgColor || null,
    avatar_initials: c.avatarInitials || null,
    data: c,
    created_at: c.createdAt || new Date().toISOString(),
    updated_at: c.updatedAt || new Date().toISOString()
  };
}

/**
 * Migra clientes, planes, solicitudes de cotización y reportes desde Firestore hacia Supabase.
 */
export async function migrateFirestoreToSupabase(): Promise<MigrationResult> {
  const result: MigrationResult = {
    clientsMigrated: 0,
    quotesMigrated: 0,
    plansMigrated: 0,
    reportsMigrated: 0,
    errors: []
  };

  if (!isSupabaseConfigured) {
    result.errors.push('Supabase no está configurado.');
    return result;
  }

  if (!isFirebaseConfigured) {
    result.errors.push('Firebase no está configurado en este entorno.');
    return result;
  }

  // 1. Migrar Clientes
  try {
    const clientsSnap = await getDocs(collection(db, 'clients'));
    const rows = clientsSnap.docs
      .map((d) => ({ ...(d.data() as Client), id: d.id }))
      .filter((c) => Boolean(c.businessName || c.slug))
      .map((c) => clientToSupabaseRow(c));
    if (rows.length > 0) {
      const { error } = await supabase.from('clients').upsert(rows, { onConflict: 'id' });
      if (error) result.errors.push(`Clientes: ${error.message}`);
      else result.clientsMigrated = rows.length;
    }
  } catch (err: any) {
    result.errors.push(`Error leyendo clientes de Firestore: ${err?.message || err}`);
  }

  // 2. Migrar Planes
  try {
    const plansSnap = await getDocs(collection(db, 'plans'));
    const planRows = plansSnap.docs.map((d) => {
      const data = d.data() as Record<string, any>;
      return {
        id: d.id,
        name: data.name || d.id,
        price: Number(data.price) || 0,
        currency: data.currency || 'DOP',
        billing_cycle: data.billingCycle || 'monthly',
        active: data.active !== false,
        data: { ...data, id: d.id },
        updated_at: new Date().toISOString()
      };
    });
    if (planRows.length > 0) {
      const { error } = await supabase.from('plans').upsert(planRows, { onConflict: 'id' });
      if (error) result.errors.push(`Planes: ${error.message}`);
      else result.plansMigrated = planRows.length;
    }
  } catch (err: any) {
    result.errors.push(`Error leyendo planes: ${err?.message || err}`);
  }

  // 3. Migrar Solicitudes de Cotización (quoteRequests + reports con type=quote_request)
  try {
    const quoteRows: any[] = [];
    const seen = new Set<string>();

    try {
      const qSnap = await getDocs(collection(db, 'quoteRequests'));
      qSnap.docs.forEach((d) => {
        const q = d.data() as Record<string, any>;
        seen.add(d.id);
        quoteRows.push({
          source: q.source || 'contact_form',
          name: q.name || 'Cliente',
          business_name: q.businessName || '',
          phone: q.phone || '',
          email: q.email || '',
          business_type: q.businessType || '',
          product_interest: q.productInterest || 'Tap Card',
          quantity: Number(q.quantity) || 1,
          city: q.city || '',
          need_option: q.needOption || '',
          message: q.message || '',
          status: q.status || 'new',
          admin_notes: q.adminNotes || '',
          created_at: q.createdAt || new Date().toISOString(),
          updated_at: q.updatedAt || new Date().toISOString()
        });
      });
    } catch {
      // Ignorar si quoteRequests no tiene permisos de lectura
    }

    const rSnap = await getDocs(collection(db, 'reports'));
    const reportRows: any[] = [];

    rSnap.docs.forEach((d) => {
      const r = d.data() as Record<string, any>;
      if (r.type === 'quote_request') {
        if (!seen.has(d.id)) {
          quoteRows.push({
            source: r.source || 'contact_form',
            name: r.name || 'Cliente',
            business_name: r.businessName || '',
            phone: r.phone || '',
            email: r.email || '',
            business_type: r.businessType || '',
            product_interest: r.productInterest || 'Tap Card',
            quantity: Number(r.quantity) || 1,
            city: r.city || '',
            need_option: r.needOption || '',
            message: r.message || '',
            status: r.status || 'new',
            admin_notes: r.adminNotes || '',
            created_at: r.createdAt || new Date().toISOString(),
            updated_at: r.updatedAt || new Date().toISOString()
          });
        }
      } else {
        reportRows.push({
          id: d.id,
          profile_slug: r.profileSlug || '',
          client_id: r.clientId || '',
          business_name: r.businessName || '',
          reason: r.reason || 'other',
          details: r.details || '',
          reporter_email: r.reporterEmail || '',
          status: r.status || 'pending',
          action_taken: r.actionTaken || 'none',
          admin_notes: r.adminNotes || '',
          created_at: r.createdAt || new Date().toISOString()
        });
      }
    });

    if (quoteRows.length > 0) {
      const { data: existingQuotes } = await supabase
        .from('quote_requests')
        .select('name, created_at, source');
      const existingKeys = new Set(
        (existingQuotes || []).map((eq: any) => `${eq.source}|${eq.name}|${new Date(eq.created_at).toISOString()}`)
      );
      const freshQuotes = quoteRows.filter(
        (q) => !existingKeys.has(`${q.source}|${q.name}|${new Date(q.created_at).toISOString()}`)
      );
      if (freshQuotes.length > 0) {
        const { error } = await supabase.from('quote_requests').insert(freshQuotes);
        if (error) result.errors.push(`Solicitudes: ${error.message}`);
        else result.quotesMigrated = freshQuotes.length;
      }
    }

    if (reportRows.length > 0) {
      const { error } = await supabase.from('reports').upsert(reportRows, { onConflict: 'id' });
      if (error) result.errors.push(`Reportes: ${error.message}`);
      else result.reportsMigrated = reportRows.length;
    }
  } catch (err: any) {
    result.errors.push(`Error migrando solicitudes/reportes: ${err?.message || err}`);
  }

  return result;
}
