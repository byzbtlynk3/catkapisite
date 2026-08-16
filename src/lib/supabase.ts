import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any)?.env ?? {};
const url = (env.VITE_SUPABASE_URL as string | undefined) || '';
const anon = (env.VITE_SUPABASE_ANON_KEY as string | undefined) || '';

if (!url || !anon) {
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set - Supabase public client is disabled until .env is configured.');
}

export const supabase = url && anon ? createClient(url, anon, { auth: { persistSession: true } }) : null;

export default supabase;
