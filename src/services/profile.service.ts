import { supabaseClient } from './supabaseClient';

export const profileService = {
    async getProfile(userId: string) {
        // We use .query because of your custom client structure
        const rows = await supabaseClient
            .from('profiles')
            .query<any[]>(`select=full_name,phone,onboarding_completed&user_id=eq.${userId}&limit=1`);

        return rows[0] || null;
    },

    async updateProfile(userId: string, updates: { full_name?: string; phone?: string; onboarding_completed?: boolean }) {
        return await supabaseClient
            .from('profiles')
            .update(`user_id=eq.${userId}`, updates);
    }
};