import type { Database } from '@/types/database';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const SESSION_KEY = 'swiftcare_supabase_session';
let isRefreshing = false;
let refreshPromise: Promise<Session> | null = null;

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

// Add this function inside your supabaseClient.ts
async function refreshToken() {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const session = readSession();
      if (!session?.refresh_token) throw new Error("No refresh token available");

      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });

      if (!res.ok) {
        writeSession(null);
        throw new Error("Refresh failed");
      }

      const newSession = await res.json();
      writeSession(newSession);
      return newSession;
    } finally {
      // Reset flags when done
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // 1. Define a function that always gets the LATEST headers
  const getHeaders = () => ({ ...authHeaders(), ...(init.headers || {}) });

  // 2. Initial attempt
  let res = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: getHeaders(),
  });

  let bodyJson;
  try {
    const clonedRes = res.clone();
    bodyJson = await clonedRes.json();
  } catch (e) {
    bodyJson = {};
  }

  const isExpired = res.status === 401 || bodyJson.code === "PGRST303" || bodyJson.message === "JWT expired";

  if (isExpired) {
    try {
      console.log("🔄 Token expired. Refreshing...");
      // All concurrent requests will wait for this same promise
      await refreshToken();

      // 3. RETRY with the NEW headers (fresh token)
      res = await fetch(`${SUPABASE_URL}${path}`, {
        ...init,
        headers: getHeaders(), // This now gets the new token from localStorage
      });
    } catch (e) {
      window.dispatchEvent(new CustomEvent('supabase-auth-failed'));
      throw e;
    }
  }

  if (!res.ok) {
    const text = await res.text();
    console.error("SUPABASE ERROR:", text);
    throw new Error(text || `Supabase request failed (${res.status})`);
  }

  return res.status === 204 ? (undefined as T) : res.json();
}

export const supabaseClient = {
  auth: {
    async signUp(email: string, password: string, options?: { data?: any }) {
      const session = await request<Session>(`/auth/v1/signup`, {
        method: 'POST',
        // We merge the email/password with any extra metadata provided in options.data
        body: JSON.stringify({
          email,
          password,
          data: options?.data
        }),
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
        const user = await request<{ id: string; email?: string }>(`/auth/v1/user`);
        return { data: user };
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
          headers: {
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
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
