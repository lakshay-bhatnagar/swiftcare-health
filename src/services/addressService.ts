import type { Address } from '@/types';
import { supabase } from "../lib/supabase"; // Use the standard SDK instance

const mapAddress = (row: any): Address => ({
  id: row.id,
  label: row.label || 'Home',
  name: row.full_name || '', 
  phone: row.phone_number || '', 
  addressLine1: row.address_line1,
  addressLine2: row.address_line2 ?? '',
  city: row.city,
  state: row.state,
  pincode: row.pincode,
  latitude: row.latitude ?? undefined,
  longitude: row.longitude ?? undefined,
  isDefault: !!row.is_default,
});

export const addressService = {
  async getAddresses(userId: string): Promise<Address[]> {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching addresses:", error.message);
      throw error;
    }

    return (data || []).map(mapAddress);
  },

  async addAddress(userId: string, address: Omit<Address, 'id'>): Promise<Address> {
    // If setting a new default, unset others first
    if (address.isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert([{
        user_id: userId,
        label: address.label,
        full_name: address.name,
        phone_number: address.phone,
        address_line1: address.addressLine1,
        address_line2: address.addressLine2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: 'India',
        latitude: address.latitude,
        longitude: address.longitude,
        is_default: address.isDefault,
      }])
      .select()
      .single();

    if (error) {
      console.error("Error adding address:", error.message);
      throw error;
    }

    return mapAddress(data);
  },

  async updateAddress(id: string, updates: Partial<Address>): Promise<void> {
    const payload: Record<string, any> = {};
    
    // Map UI fields back to DB columns
    if (updates.label) payload.label = updates.label;
    if (updates.name) payload.full_name = updates.name;
    if (updates.phone) payload.phone_number = updates.phone;
    if (updates.addressLine1) payload.address_line1 = updates.addressLine1;
    if (updates.addressLine2 !== undefined) payload.address_line2 = updates.addressLine2;
    if (updates.city) payload.city = updates.city;
    if (updates.state) payload.state = updates.state;
    if (updates.pincode) payload.pincode = updates.pincode;
    if (updates.isDefault !== undefined) payload.is_default = updates.isDefault;

    const { error } = await supabase
      .from('addresses')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error("Error updating address:", error.message);
      throw error;
    }
  },

  async deleteAddress(id: string) {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting address:", error.message);
      throw error;
    }
  },

  async setDefaultAddress(userId: string, id: string) {
    // Transactional-ish: Reset all then set one
    const { error: resetError } = await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);

    if (resetError) throw resetError;

    const { error: setError } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id);

    if (setError) throw setError;
  },
};

export default addressService;