import { supabase } from '../lib/supabase';

export const getUserId = async (): Promise<string> => {
  try {
    // 1. Try to get the session from the current client instance memory first
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) return session.user.id;

    // 2. Fallback to localStorage directly if the client hasn't hydrated
    const raw = localStorage.getItem('swiftcare_supabase_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      const id = parsed.user?.id || parsed.id || parsed.session?.user?.id;
      if (id) return id;
    }

    // 3. Last ditch effort
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;

    throw new Error('AUTH_REQUIRED');
  } catch (e) {
    console.error("Critical Auth Error in getUserId:", e);
    throw e;
  }
};