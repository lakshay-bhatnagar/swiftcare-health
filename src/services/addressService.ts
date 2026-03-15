import type { Address } from '@/types';
import { supabaseClient } from './supabaseClient';

const mapAddress = (row: any): Address => ({
  id: row.id,
  label: row.label || 'Home',
  name: row.name || '',
  phone: row.phone || '',
  addressLine1: row.address_line1,
  addressLine2: row.address_line2 ?? '',
  city: row.city,
  state: row.state,
  pincode: row.postal_code,
  latitude: row.latitude ?? undefined,
  longitude: row.longitude ?? undefined,
  isDefault: !!row.is_default,
});

export const addressService = {
  async getAddresses(userId: string): Promise<Address[]> {
    const rows = await supabaseClient.from('addresses').query<any[]>(`select=*&user_id=eq.${userId}&order=created_at.desc`);
    return rows.map(mapAddress);
  },

  async addAddress(userId: string, address: Omit<Address, 'id'>): Promise<Address> {
    if (address.isDefault) {
      await supabaseClient.from('addresses').update(`user_id=eq.${userId}`, { is_default: false });
    }

    const [row] = await supabaseClient.from('addresses').insert<any[]>([{ 
      user_id: userId,
      label: address.label,
      address_line1: address.addressLine1,
      address_line2: address.addressLine2,
      city: address.city,
      state: address.state,
      postal_code: address.pincode,
      country: 'India',
      latitude: address.latitude,
      longitude: address.longitude,
      is_default: address.isDefault,
    }]);

    return mapAddress(row);
  },

  async updateAddress(id: string, updates: Partial<Address>): Promise<void> {
    const payload: Record<string, unknown> = {};
    if (updates.label) payload.label = updates.label;
    if (updates.addressLine1) payload.address_line1 = updates.addressLine1;
    if (updates.addressLine2 !== undefined) payload.address_line2 = updates.addressLine2;
    if (updates.city) payload.city = updates.city;
    if (updates.state) payload.state = updates.state;
    if (updates.pincode) payload.postal_code = updates.pincode;
    if (updates.isDefault !== undefined) payload.is_default = updates.isDefault;
    await supabaseClient.from('addresses').update(`id=eq.${id}`, payload);
  },

  async deleteAddress(id: string) {
    await supabaseClient.from('addresses').delete(`id=eq.${id}`);
  },

  async setDefaultAddress(userId: string, id: string) {
    await supabaseClient.from('addresses').update(`user_id=eq.${userId}`, { is_default: false });
    await supabaseClient.from('addresses').update(`id=eq.${id}`, { is_default: true });
  },
};

export default addressService;
