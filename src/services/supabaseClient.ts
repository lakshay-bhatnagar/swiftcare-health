// services/supabaseClient.ts
import { supabase } from '../lib/supabase';

// This keeps your existing code working but uses the reliable official SDK under the hood
export const supabaseClient = {
  auth: {
    signInWithPassword: (e: string, p: string) => supabase.auth.signInWithPassword({ email: e, password: p }),
    signUp: (e: string, p: string, options?: any) => supabase.auth.signUp({ email: e, password: p, options }),
    signOut: () => supabase.auth.signOut(),
    getUser: () => supabase.auth.getUser(),
    getSession: () => supabase.auth.getSession(),
  },
  from(table: string) {
    return {
      select: (query = '*') => supabase.from(table).select(query),
      insert: (payload: any) => supabase.from(table).insert(payload).select(),
      update: (filters: string, payload: any) => {
        // Basic parser for your old "id=eq.123" filter style
        const [col, val] = filters.split('=eq.');
        return supabase.from(table).update(payload).eq(col, val).select();
      },
      delete: (filters: string) => {
        const [col, val] = filters.split('=eq.');
        return supabase.from(table).delete().eq(col, val);
      },
      // If any service still uses .query(), point it to standard select
      query: (raw: string) => {
         const params = new URLSearchParams(raw);
         const select = params.get('select') || '*';
         return supabase.from(table).select(select);
      }
    };
  }
};