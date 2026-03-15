import core from './addressService';
import { supabaseClient } from './supabaseClient';
import type { Address } from '@/types';

const getUserId = async () => {
  const user = await supabaseClient.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    return core.getAddresses(await getUserId());
  },
  async getAddressById(id: string) {
    return (await core.getAddresses(await getUserId())).find((a) => a.id === id);
  },
  async getDefaultAddress() {
    return (await core.getAddresses(await getUserId())).find((a) => a.isDefault);
  },
  async addAddress(address: Omit<Address, 'id'>) {
    return core.addAddress(await getUserId(), address);
  },
  async updateAddress(id: string, updates: Partial<Address>) {
    return core.updateAddress(id, updates);
  },
  async deleteAddress(id: string) {
    return core.deleteAddress(id);
  },
  async setDefaultAddress(id: string) {
    return core.setDefaultAddress(await getUserId(), id);
  },
};

export default addressService;
