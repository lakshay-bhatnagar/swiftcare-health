import type { Database } from '@/types/database';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const SESSION_KEY = 'swiftcare_supabase_session';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

type Session = {
  access_token: string;
  refresh_token?: string;
  user?: { id: string; email?: string };
};

const readSession = (): Session | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
};

const writeSession = (session: Session | null) => {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const authHeaders = () => {
  const token = readSession()?.access_token;
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: token ? `Bearer ${token}` : `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Supabase request failed (${res.status})`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const supabaseClient = {
  auth: {
    async signUp(email: string, password: string) {
      const session = await request<Session>(`/auth/v1/signup`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      writeSession(session);
      return session;
    },
    async signInWithPassword(email: string, password: string) {
      const session = await request<Session>(`/auth/v1/token?grant_type=password`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      writeSession(session);
      return session;
    },
    async signOut() {
      await request(`/auth/v1/logout`, { method: 'POST' });
      writeSession(null);
    },
    async getUser() {
      try {
        return await request<{ id: string; email: string }>(`/auth/v1/user`);
      } catch {
        return null;
      }
    },
    getSession: readSession,
  },
  from<T extends keyof Database['public']['Tables']>(table: T) {
    return {
      select: <R = Database['public']['Tables'][T]['Row'][]>(query = '*') =>
        request<R>(`/rest/v1/${String(table)}?select=${encodeURIComponent(query)}`),
      insert: <R = Database['public']['Tables'][T]['Row'][]>(payload: unknown) =>
        request<R>(`/rest/v1/${String(table)}`, {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload),
        }),
      update: <R = Database['public']['Tables'][T]['Row'][]>(filters: string, payload: unknown) =>
        request<R>(`/rest/v1/${String(table)}?${filters}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(payload),
        }),
      delete: <R = void>(filters: string) =>
        request<R>(`/rest/v1/${String(table)}?${filters}`, { method: 'DELETE' }),
      query: <R>(rawQuery: string) => request<R>(`/rest/v1/${String(table)}?${rawQuery}`),
    };
  },
};
