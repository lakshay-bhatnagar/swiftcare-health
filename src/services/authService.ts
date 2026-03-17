import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

export const authService = {
  async signUp(email: string, password: string, fullName?: string, phone?: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) throw new Error(error.message);
    const userId = data.user?.id;
    if (!userId) throw new Error('Unable to create account');
    return { id: userId, email, name: fullName ?? '', phone: phone ?? '' };
  },

  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const userId = data.user?.id;
    if (!userId) throw new Error('Invalid credentials');

    // Profile fetch — your custom client is fine here for REST calls
    const { data: profileRows } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    const profile = profileRows?.[0];
    return {
      id: userId,
      email,
      name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      avatar: profile?.avatar_url ?? undefined,
    };
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profileRows } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);

    const profile = profileRows?.[0];
    return {
      id: user.id,
      email: user.email,
      name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      avatar: profile?.avatar_url ?? undefined,
    };
  },

  async updateProfile(userId: string, updates: Record<string, unknown>) {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  },
};

export default authService;
