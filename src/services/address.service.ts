import core from './addressService';
import { supabase } from "../lib/supabase"; // Use your standard client
import type { Address } from '@/types';

// Helper to get ID safely using the Supabase SDK
const getValidUserId = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session?.user) {
    throw new Error("User not authenticated");
  }
  
  return session.user.id;
};

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    const userId = await getValidUserId();
    return core.getAddresses(userId);
  },

  async getAddressById(id: string) {
    const userId = await getValidUserId();
    const addresses = await core.getAddresses(userId);
    return addresses.find((a) => a.id === id);
  },

  async getDefaultAddress() {
    const userId = await getValidUserId();
    const addresses = await core.getAddresses(userId);
    return addresses.find((a) => a.isDefault);
  },

  async addAddress(address: Omit<Address, 'id'>) {
    const userId = await getValidUserId();
    return core.addAddress(userId, address);
  },

  async updateAddress(id: string, updates: Partial<Address>) {
    // Note: ensure core.updateAddress doesn't need userId, 
    // or pass it if required by your core logic
    return core.updateAddress(id, updates);
  },

  async deleteAddress(id: string) {
    return core.deleteAddress(id);
  },

  async setDefaultAddress(id: string) {
    const userId = await getValidUserId();
    return core.setDefaultAddress(userId, id);
  },
};

export default addressService;