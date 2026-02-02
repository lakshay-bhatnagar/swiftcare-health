import { Pharmacy, Medicine } from '@/types';
import { mockPharmacies, mockMedicines } from './api';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const pharmacyService = {
  // Get all pharmacies
  getPharmacies: async (): Promise<Pharmacy[]> => {
    await delay(500);
    return mockPharmacies;
  },

  // Get nearby pharmacies (sorted by distance)
  getNearbyPharmacies: async (lat?: number, lng?: number): Promise<Pharmacy[]> => {
    await delay(600);
    // In production, would calculate actual distances
    return mockPharmacies.sort((a, b) => {
      const distA = parseFloat(a.distance);
      const distB = parseFloat(b.distance);
      return distA - distB;
    });
  },

  // Get pharmacy by ID
  getPharmacyById: async (id: string): Promise<Pharmacy | undefined> => {
    await delay(300);
    return mockPharmacies.find(p => p.id === id);
  },

  // Get medicines from a specific pharmacy
  getPharmacyMedicines: async (pharmacyId: string): Promise<Medicine[]> => {
    await delay(500);
    return mockMedicines.filter(m => m.pharmacyId === pharmacyId);
  },

  // Search pharmacies
  searchPharmacies: async (query: string): Promise<Pharmacy[]> => {
    await delay(400);
    const q = query.toLowerCase();
    return mockPharmacies.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
    );
  },

  // Check if pharmacy is open
  isPharmacyOpen: async (pharmacyId: string): Promise<boolean> => {
    await delay(200);
    const pharmacy = mockPharmacies.find(p => p.id === pharmacyId);
    return pharmacy?.isOpen ?? false;
  },

  // Get pharmacy delivery time estimate
  getDeliveryEstimate: async (pharmacyId: string, deliveryType: 'quick' | 'normal'): Promise<string> => {
    await delay(300);
    const pharmacy = mockPharmacies.find(p => p.id === pharmacyId);
    if (!pharmacy) return '30-45 mins';
    
    if (deliveryType === 'quick') {
      return pharmacy.deliveryTime;
    }
    // Normal delivery takes longer
    const [min, max] = pharmacy.deliveryTime.split('-').map(t => parseInt(t));
    return `${min + 15}-${max + 20} mins`;
  },
};

export default pharmacyService;
