import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Plan } from '../types/plan';
import { DEFAULT_PLANS } from '../config/plans';

const SUPABASE_TABLE = 'plans';
const LOCAL_STORAGE_KEY = 'taprd_plans_data_v1';

let inMemoryPlans: Plan[] = [...DEFAULT_PLANS];
let hasInitialized = false;

// Cargar caché local
function loadLocalCache(): Plan[] {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return [...DEFAULT_PLANS];
}

function saveLocalCache(plans: Plan[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));
  } catch {}
}

function planToSupabaseRow(p: Plan) {
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price) || 0,
    currency: p.currency || 'DOP',
    billing_cycle: (p as any).billingCycle || p.interval || 'monthly',
    active: p.active !== false,
    data: p,
    updated_at: p.updatedAt || new Date().toISOString()
  };
}

/**
 * Inicializa y sincroniza los planes desde Supabase.
 * Si la tabla no contiene planes en Supabase, la inicializa con los planes por defecto.
 */
export async function initializePlans(): Promise<Plan[]> {
  if (hasInitialized && inMemoryPlans.length > 0) {
    return inMemoryPlans;
  }

  inMemoryPlans = loadLocalCache();

  if (isSupabaseConfigured) {
    try {
      const { data: rows, error } = await supabase.from(SUPABASE_TABLE).select('id, data');
      if (!error && Array.isArray(rows) && rows.length > 0) {
        const supaPlans: Plan[] = rows.map((r: any) => ({
          ...(r.data as Plan),
          id: r.id
        }));

        const order = ['starter', 'business', 'pro'];
        supaPlans.sort((a, b) => {
          const idxA = order.indexOf(a.id);
          const idxB = order.indexOf(b.id);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });

        inMemoryPlans = supaPlans;
        saveLocalCache(inMemoryPlans);
        hasInitialized = true;
        return inMemoryPlans;
      } else if (!error) {
        await supabase.from(SUPABASE_TABLE).upsert(DEFAULT_PLANS.map(planToSupabaseRow), { onConflict: 'id' });
      }
    } catch (err) {
      console.warn('Aviso cargando planes desde Supabase, usando planes predeterminados:', err);
    }
  }

  hasInitialized = true;
  saveLocalCache(inMemoryPlans);
  return inMemoryPlans;
}

/**
 * Obtener todos los planes disponibles (activos e inactivos)
 */
export async function getPlans(): Promise<Plan[]> {
  return await initializePlans();
}

/**
 * Obtener planes activos
 */
export async function getActivePlans(): Promise<Plan[]> {
  const plans = await getPlans();
  return plans.filter(p => p.active !== false);
}

/**
 * Obtener un plan específico por su ID ('starter', 'business', 'pro' o personalizado)
 */
export async function getPlanById(id: string): Promise<Plan | null> {
  const plans = await getPlans();
  const found = plans.find(p => p.id === id);
  if (found) return found;

  const defaultFound = DEFAULT_PLANS.find(p => p.id === id);
  return defaultFound || null;
}

/**
 * Crear un nuevo plan configurable
 */
export async function createPlan(data: Omit<Plan, 'createdAt' | 'updatedAt'>): Promise<Plan> {
  const now = new Date().toISOString();
  const planId = (data.id || data.name.toLowerCase().replace(/\s+/g, '-')).trim();

  const newPlan: Plan = {
    ...data,
    id: planId,
    createdAt: now,
    updatedAt: now
  };

  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from(SUPABASE_TABLE)
      .upsert(planToSupabaseRow(newPlan), { onConflict: 'id' });
    if (error) {
      console.error('Error creando plan en Supabase:', error);
      throw new Error(error.message);
    }
  }

  inMemoryPlans = inMemoryPlans.filter(p => p.id !== planId);
  inMemoryPlans.push(newPlan);
  saveLocalCache(inMemoryPlans);

  return newPlan;
}

/**
 * Actualizar un plan existente
 */
export async function updatePlan(id: string, updates: Partial<Omit<Plan, 'id' | 'createdAt'>>): Promise<Plan> {
  const existing = await getPlanById(id);
  if (!existing) {
    throw new Error(`Plan con ID "${id}" no encontrado.`);
  }

  const now = new Date().toISOString();
  const updatedPlan: Plan = {
    ...existing,
    ...updates,
    id,
    updatedAt: now
  };

  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from(SUPABASE_TABLE)
      .upsert(planToSupabaseRow(updatedPlan), { onConflict: 'id' });
    if (error) {
      console.error(`Error actualizando plan "${id}" en Supabase:`, error);
      throw new Error(error.message);
    }
  }

  inMemoryPlans = inMemoryPlans.map(p => p.id === id ? updatedPlan : p);
  saveLocalCache(inMemoryPlans);

  return updatedPlan;
}

/**
 * Desactivar un plan (no elimina clientes existentes)
 */
export async function deactivatePlan(id: string): Promise<Plan> {
  return await updatePlan(id, { active: false });
}

/**
 * Reactivar un plan
 */
export async function activatePlan(id: string): Promise<Plan> {
  return await updatePlan(id, { active: true });
}
