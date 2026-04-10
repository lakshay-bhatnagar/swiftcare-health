import type { Category, Medicine, Pharmacy, EmergencyRequest } from '@/types';
import medicineService from './medicineService';
import pharmacyService from './pharmacyService';

export const categories: Category[] = [
  { id: 'Fever & Pain', name: 'Fever & Pain', icon: '🌡️', color: 'bg-red-100 dark:bg-red-900/30' },
  { id: 'Cold & Cough', name: 'Cold & Cough', icon: '🤧', color: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'Diabetes Care', name: 'Diabetes Care', icon: '💉', color: 'bg-purple-100 dark:bg-purple-900/30' },
  { id: 'Heart Care', name: 'Heart Care', icon: '❤️', color: 'bg-pink-100 dark:bg-pink-900/30' },
  { id: 'Vitamins', name: 'Vitamins', icon: '💊', color: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'Skin Care', name: 'Skin Care', icon: '✨', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { id: 'Stomach Care', name: 'Stomach Care', icon: '🫃', color: 'bg-orange-100 dark:bg-orange-900/30' },
  { id: 'First Aid', name: 'First Aid', icon: '🩹', color: 'bg-teal-100 dark:bg-teal-900/30' },
];

export const mockPharmacies: Pharmacy[] = [];

export const api = {
  getCategories: async () => medicineService.getCategories(),
  getMedicines: async (categoryId?: string) => medicineService.getMedicines({ categoryId }),
  searchMedicines: async (search: string) => medicineService.getMedicines({ search }),
  getMedicineById: async (id: string): Promise<Medicine | null> => medicineService.getMedicineById(id),
  getNearbyPharmacies: async (): Promise<Pharmacy[]> => pharmacyService.getNearbyPharmacies(),
  requestEmergencyVehicle: async (_location: { lat: number; lng: number }): Promise<EmergencyRequest> => ({
    id: `emg-${Date.now()}`,
    userId: 'unknown',
    location: _location,
    status: 'requested',
    eta: '8 mins',
    hospital: 'SwiftCare General Hospital',
    createdAt: new Date(),
  }),
};
