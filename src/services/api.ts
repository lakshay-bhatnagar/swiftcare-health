// Mock API Service Layer
// In production, replace with actual API calls

import { Medicine, Pharmacy, Order } from '@/context/AppContext';

// Simulated network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Categories
export const categories = [
  { id: 'fever', name: 'Fever & Pain', icon: '🌡️', color: 'bg-red-100 dark:bg-red-900/30' },
  { id: 'cold', name: 'Cold & Cough', icon: '🤧', color: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'diabetes', name: 'Diabetes', icon: '💉', color: 'bg-purple-100 dark:bg-purple-900/30' },
  { id: 'heart', name: 'Heart Care', icon: '❤️', color: 'bg-pink-100 dark:bg-pink-900/30' },
  { id: 'vitamins', name: 'Vitamins', icon: '💊', color: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'skin', name: 'Skin Care', icon: '✨', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { id: 'stomach', name: 'Stomach', icon: '🫃', color: 'bg-orange-100 dark:bg-orange-900/30' },
  { id: 'first-aid', name: 'First Aid', icon: '🩹', color: 'bg-teal-100 dark:bg-teal-900/30' },
];

// Mock Pharmacies
export const mockPharmacies: Pharmacy[] = [
  {
    id: 'pharm-1',
    name: 'MedPlus Pharmacy',
    address: '123 Main Street, Downtown',
    distance: '0.5 km',
    deliveryTime: '10-12 mins',
    rating: 4.8,
    reviewCount: 2453,
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400',
    isOpen: true,
  },
  {
    id: 'pharm-2',
    name: 'Apollo Pharmacy',
    address: '456 Health Avenue',
    distance: '1.2 km',
    deliveryTime: '15-18 mins',
    rating: 4.6,
    reviewCount: 1876,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
    isOpen: true,
  },
  {
    id: 'pharm-3',
    name: 'Wellness Forever',
    address: '789 Care Street',
    distance: '2.0 km',
    deliveryTime: '18-22 mins',
    rating: 4.5,
    reviewCount: 1234,
    image: 'https://images.unsplash.com/photo-1631549916768-4119b4123a21?w=400',
    isOpen: true,
  },
];

// Mock Medicines
export const mockMedicines: Medicine[] = [
  {
    id: 'med-1',
    name: 'Paracetamol 500mg',
    genericName: 'Paracetamol',
    category: 'fever',
    price: 25,
    mrp: 30,
    discount: 17,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    description: 'Effective pain reliever and fever reducer. Suitable for headaches, body aches, and fever.',
    dosage: 'Take 1-2 tablets every 4-6 hours as needed. Maximum 8 tablets in 24 hours.',
    manufacturer: 'Cipla Ltd',
    prescriptionRequired: false,
    inStock: true,
    pharmacyId: 'pharm-1',
    pharmacyName: 'MedPlus Pharmacy',
  },
  {
    id: 'med-2',
    name: 'Cetirizine 10mg',
    genericName: 'Cetirizine',
    category: 'cold',
    price: 35,
    mrp: 45,
    discount: 22,
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400',
    description: 'Antihistamine for allergy relief. Treats sneezing, runny nose, and itchy eyes.',
    dosage: 'Take 1 tablet daily. Can be taken with or without food.',
    manufacturer: 'Sun Pharma',
    prescriptionRequired: false,
    inStock: true,
    pharmacyId: 'pharm-1',
    pharmacyName: 'MedPlus Pharmacy',
  },
  {
    id: 'med-3',
    name: 'Metformin 500mg',
    genericName: 'Metformin HCl',
    category: 'diabetes',
    price: 80,
    mrp: 95,
    discount: 16,
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
    description: 'Oral diabetes medicine that helps control blood sugar levels.',
    dosage: 'As prescribed by your doctor. Usually 1-2 times daily with meals.',
    manufacturer: 'Dr Reddy\'s',
    prescriptionRequired: true,
    inStock: true,
    pharmacyId: 'pharm-2',
    pharmacyName: 'Apollo Pharmacy',
  },
  {
    id: 'med-4',
    name: 'Vitamin D3 60K',
    genericName: 'Cholecalciferol',
    category: 'vitamins',
    price: 120,
    mrp: 150,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400',
    description: 'Essential vitamin for bone health and immune function.',
    dosage: 'Take 1 capsule weekly or as directed by physician.',
    manufacturer: 'Abbott',
    prescriptionRequired: false,
    inStock: true,
    pharmacyId: 'pharm-1',
    pharmacyName: 'MedPlus Pharmacy',
  },
  {
    id: 'med-5',
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole',
    category: 'stomach',
    price: 65,
    mrp: 80,
    discount: 19,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
    description: 'Reduces stomach acid production. Used for acidity and ulcers.',
    dosage: 'Take 1 capsule before breakfast. Do not crush or chew.',
    manufacturer: 'Mankind Pharma',
    prescriptionRequired: false,
    inStock: true,
    pharmacyId: 'pharm-2',
    pharmacyName: 'Apollo Pharmacy',
  },
  {
    id: 'med-6',
    name: 'Crocin Advance',
    genericName: 'Paracetamol',
    category: 'fever',
    price: 32,
    mrp: 38,
    discount: 16,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
    description: 'Fast-acting pain and fever relief tablet.',
    dosage: 'Take 1-2 tablets every 4-6 hours. Max 8 tablets per day.',
    manufacturer: 'GSK',
    prescriptionRequired: false,
    inStock: true,
    pharmacyId: 'pharm-3',
    pharmacyName: 'Wellness Forever',
  },
  {
    id: 'med-7',
    name: 'Azithromycin 500mg',
    genericName: 'Azithromycin',
    category: 'cold',
    price: 145,
    mrp: 180,
    discount: 19,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    description: 'Antibiotic used to treat various bacterial infections.',
    dosage: 'Take as prescribed. Usually once daily for 3-5 days.',
    manufacturer: 'Zydus Cadila',
    prescriptionRequired: true,
    inStock: true,
    pharmacyId: 'pharm-1',
    pharmacyName: 'MedPlus Pharmacy',
  },
  {
    id: 'med-8',
    name: 'Band-Aid Flex',
    genericName: 'Adhesive Bandage',
    category: 'first-aid',
    price: 55,
    mrp: 65,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400',
    description: 'Flexible fabric bandages for minor cuts and wounds.',
    dosage: 'Clean wound, apply bandage. Change daily.',
    manufacturer: 'Johnson & Johnson',
    prescriptionRequired: false,
    inStock: true,
    pharmacyId: 'pharm-1',
    pharmacyName: 'MedPlus Pharmacy',
  },
];

// API Functions
export const api = {
  // Auth
  sendOTP: async (email: string): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    console.log('OTP sent to:', email);
    return { success: true, message: 'OTP sent successfully' };
  },

  verifyOTP: async (email: string, otp: string): Promise<{ success: boolean; isNewUser: boolean; token?: string }> => {
    await delay(1200);
    // Mock verification - accept any 6-digit OTP
    if (otp.length === 6) {
      return { success: true, isNewUser: true, token: 'mock_jwt_token_' + Date.now() };
    }
    throw new Error('Invalid OTP');
  },

  // Pharmacies
  getNearbyPharmacies: async (): Promise<Pharmacy[]> => {
    await delay(800);
    return mockPharmacies;
  },

  // Medicines
  getMedicines: async (category?: string): Promise<Medicine[]> => {
    await delay(600);
    if (category) {
      return mockMedicines.filter(m => m.category === category);
    }
    return mockMedicines;
  },

  searchMedicines: async (query: string): Promise<Medicine[]> => {
    await delay(500);
    const q = query.toLowerCase();
    return mockMedicines.filter(
      m =>
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  },

  getMedicineById: async (id: string): Promise<Medicine | undefined> => {
    await delay(400);
    return mockMedicines.find(m => m.id === id);
  },

  // Orders
  placeOrder: async (orderData: Partial<Order>): Promise<Order> => {
    await delay(1500);
    const order: Order = {
      id: 'ORD' + Date.now(),
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      status: 'confirmed',
      placedAt: new Date(),
      deliveryAddress: orderData.deliveryAddress!,
      paymentMethod: orderData.paymentMethod || 'cod',
      pharmacy: mockPharmacies[0],
      estimatedDelivery: '10-15 mins',
    };
    return order;
  },

  // Emergency
  requestEmergencyVehicle: async (location: { lat: number; lng: number }): Promise<{ eta: string; hospital: string }> => {
    await delay(2000);
    return {
      eta: '8 mins',
      hospital: 'City General Hospital',
    };
  },
};

export default api;
