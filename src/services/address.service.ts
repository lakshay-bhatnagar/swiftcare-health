import { Address } from '@/types';

const STORAGE_KEY = 'swiftcare_addresses';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get addresses from localStorage
const getStoredAddresses = (): Address[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save addresses to localStorage
const saveAddresses = (addresses: Address[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
};

export const addressService = {
  // Get all addresses
  getAddresses: async (): Promise<Address[]> => {
    await delay(300);
    return getStoredAddresses();
  },

  // Get address by ID
  getAddressById: async (id: string): Promise<Address | undefined> => {
    await delay(200);
    const addresses = getStoredAddresses();
    return addresses.find(a => a.id === id);
  },

  // Get default address
  getDefaultAddress: async (): Promise<Address | undefined> => {
    await delay(200);
    const addresses = getStoredAddresses();
    return addresses.find(a => a.isDefault) || addresses[0];
  },

  // Add new address
  addAddress: async (address: Omit<Address, 'id'>): Promise<Address> => {
    await delay(500);
    const addresses = getStoredAddresses();
    
    // If this is the first address or isDefault is true, update others
    if (address.isDefault || addresses.length === 0) {
      addresses.forEach(a => a.isDefault = false);
    }
    
    const newAddress: Address = {
      ...address,
      id: 'addr_' + Date.now(),
      isDefault: address.isDefault || addresses.length === 0,
    };
    
    addresses.push(newAddress);
    saveAddresses(addresses);
    return newAddress;
  },

  // Update address
  updateAddress: async (id: string, updates: Partial<Address>): Promise<Address> => {
    await delay(500);
    const addresses = getStoredAddresses();
    const index = addresses.findIndex(a => a.id === id);
    
    if (index === -1) {
      throw new Error('Address not found');
    }
    
    // If setting as default, unset others
    if (updates.isDefault) {
      addresses.forEach(a => a.isDefault = false);
    }
    
    addresses[index] = { ...addresses[index], ...updates };
    saveAddresses(addresses);
    return addresses[index];
  },

  // Delete address
  deleteAddress: async (id: string): Promise<void> => {
    await delay(400);
    let addresses = getStoredAddresses();
    const deletedAddress = addresses.find(a => a.id === id);
    addresses = addresses.filter(a => a.id !== id);
    
    // If deleted address was default, set first as default
    if (deletedAddress?.isDefault && addresses.length > 0) {
      addresses[0].isDefault = true;
    }
    
    saveAddresses(addresses);
  },

  // Set default address
  setDefaultAddress: async (id: string): Promise<void> => {
    await delay(300);
    const addresses = getStoredAddresses();
    addresses.forEach(a => {
      a.isDefault = a.id === id;
    });
    saveAddresses(addresses);
  },

  // Geocode address (mock)
  geocodeAddress: async (pincode: string): Promise<{ lat: number; lng: number } | null> => {
    await delay(600);
    // Mock geocoding based on pincode
    const mockCoords: Record<string, { lat: number; lng: number }> = {
      '400001': { lat: 18.9322, lng: 72.8347 },
      '110001': { lat: 28.6358, lng: 77.2245 },
      '560001': { lat: 12.9778, lng: 77.5909 },
    };
    return mockCoords[pincode] || { lat: 19.0760, lng: 72.8777 };
  },
};

export default addressService;
