// services/profile.service.ts
import { supabase } from "../lib/supabase";

export const profileService = {
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name, phone, onboarding_completed')
            .eq('user_id', userId)
            .maybeSingle(); // Better than limit=1, returns null if not found

        if (error) {
            console.error("Error fetching profile:", error.message);
            return null;
        }

        return data;
    },

    async updateProfile(userId: string, updates: { full_name?: string; phone?: string; onboarding_completed?: boolean }) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};