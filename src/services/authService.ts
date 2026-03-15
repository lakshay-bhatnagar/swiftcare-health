import { supabaseClient } from './supabaseClient';
import type { User } from '@/types';

export const authService = {
  async signUp(email: string, password: string, fullName?: string, phone?: string): Promise<User> {
    const session = await supabaseClient.auth.signUp(email, password);
    const userId = session.user?.id;
    if (!userId) throw new Error('Unable to create account');

    await supabaseClient.from('profiles').insert({
      user_id: userId,
      full_name: fullName ?? '',
      phone: phone ?? '',
    });

    return {
      id: userId,
      email,
      name: fullName ?? '',
      phone: phone ?? '',
    };
  },

  async signIn(email: string, password: string): Promise<User> {
    const session = await supabaseClient.auth.signInWithPassword(email, password);
    const userId = session.user?.id;
    if (!userId) throw new Error('Invalid credentials');

    const profileRows = await supabaseClient
      .from('profiles')
      .query<any[]>(`select=*&user_id=eq.${userId}&limit=1`);
    const profile = profileRows[0];

    return {
      id: userId,
      email,
      name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      avatar: profile?.avatar_url ?? undefined,
    };
  },

  async logout() {
    await supabaseClient.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    const user = await supabaseClient.auth.getUser();
    if (!user) return null;
    const profileRows = await supabaseClient
      .from('profiles')
      .query<any[]>(`select=*&user_id=eq.${user.id}&limit=1`);
    const profile = profileRows[0];

    return {
      id: user.id,
      email: user.email,
      name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      avatar: profile?.avatar_url ?? undefined,
    };
  },

  async updateProfile(userId: string, updates: Record<string, unknown>) {
    await supabaseClient.from('profiles').update(`user_id=eq.${userId}`, updates);
  },
};

export default authService;
