import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { Plan } from '../types/plan';
import { DEFAULT_PLANS } from '../config/plans';

const COLLECTION_NAME = 'plans';
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

/**
 * Inicializa y sincroniza los planes desde Firestore.
 * Si la colección no contiene planes en Firestore, la inicializa con los planes por defecto.
 */
export async function initializePlans(): Promise<Plan[]> {
  if (hasInitialized && inMemoryPlans.length > 0) {
    return inMemoryPlans;
  }

  inMemoryPlans = loadLocalCache();

  if (isFirebaseConfigured) {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      if (!snapshot.empty) {
        const firestorePlans: Plan[] = [];
        snapshot.forEach((docSnap) => {
          firestorePlans.push({
            id: docSnap.id,
            ...docSnap.data()
          } as Plan);
        });

        // Ordenar con starter, business, pro en primer lugar si aplica
        const order = ['starter', 'business', 'pro'];
        firestorePlans.sort((a, b) => {
          const idxA = order.indexOf(a.id);
          const idxB = order.indexOf(b.id);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });

        inMemoryPlans = firestorePlans;
        saveLocalCache(inMemoryPlans);
        hasInitialized = true;
        return inMemoryPlans;
      } else {
        // Sembrar planes predeterminados en Firestore
        for (const defaultPlan of DEFAULT_PLANS) {
          try {
            await setDoc(doc(db, COLLECTION_NAME, defaultPlan.id), defaultPlan);
          } catch (seedErr) {
            console.warn(`No se pudo sembrar plan ${defaultPlan.id} en Firestore:`, seedErr);
          }
        }
      }
    } catch (err) {
      console.warn('Aviso cargando planes desde Firestore, usando planes predeterminados:', err);
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

  // Fallback a planes por defecto
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

  // Guardar en Firestore si está configurado
  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, COLLECTION_NAME, planId), newPlan);
    } catch (err) {
      console.error('Error creando plan en Firestore:', err);
      throw err;
    }
  }

  // Actualizar en memoria y caché local
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

  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        ...updates,
        updatedAt: now
      });
    } catch (err) {
      console.error(`Error actualizando plan "${id}" en Firestore:`, err);
      throw err;
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
