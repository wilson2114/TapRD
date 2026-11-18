import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://kibzbiyjxvazpzlehusi.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_LaTk-n-JiKLNUbfP_v-jQA_n2M4YIwP';

export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;

export const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

/**
 * Helper para verificar si las tablas de Supabase ya fueron creadas en el proyecto.
 */
export async function checkSupabaseTableReady(tableName: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from(tableName).select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
