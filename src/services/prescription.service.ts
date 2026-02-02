import { Prescription } from '@/types';

const STORAGE_KEY = 'swiftcare_prescriptions';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get prescriptions from localStorage
const getStoredPrescriptions = (): Prescription[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  return JSON.parse(stored).map((p: any) => ({
    ...p,
    uploadDate: new Date(p.uploadDate),
  }));
};

// Save prescriptions to localStorage
const savePrescriptions = (prescriptions: Prescription[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prescriptions));
};

export const prescriptionService = {
  // Get all prescriptions
  getPrescriptions: async (): Promise<Prescription[]> => {
    await delay(400);
    return getStoredPrescriptions().sort((a, b) => 
      new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
  },

  // Get prescription by ID
  getPrescriptionById: async (id: string): Promise<Prescription | undefined> => {
    await delay(300);
    const prescriptions = getStoredPrescriptions();
    return prescriptions.find(p => p.id === id);
  },

  // Upload prescription (mock - stores base64 or URL)
  uploadPrescription: async (imageData: string, name?: string): Promise<Prescription> => {
    await delay(1000);
    
    const prescriptions = getStoredPrescriptions();
    
    const newPrescription: Prescription = {
      id: 'rx_' + Date.now(),
      imageUrl: imageData, // In production, this would be uploaded to storage
      uploadDate: new Date(),
      name: name || `Prescription ${prescriptions.length + 1}`,
      linkedMedicines: [],
      verified: false,
    };
    
    prescriptions.unshift(newPrescription);
    savePrescriptions(prescriptions);
    
    return newPrescription;
  },

  // Update prescription
  updatePrescription: async (id: string, updates: Partial<Prescription>): Promise<Prescription> => {
    await delay(400);
    const prescriptions = getStoredPrescriptions();
    const index = prescriptions.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Prescription not found');
    }
    
    prescriptions[index] = { ...prescriptions[index], ...updates };
    savePrescriptions(prescriptions);
    return prescriptions[index];
  },

  // Delete prescription
  deletePrescription: async (id: string): Promise<void> => {
    await delay(400);
    let prescriptions = getStoredPrescriptions();
    prescriptions = prescriptions.filter(p => p.id !== id);
    savePrescriptions(prescriptions);
  },

  // Link medicines to prescription
  linkMedicines: async (id: string, medicineIds: string[]): Promise<void> => {
    await delay(300);
    const prescriptions = getStoredPrescriptions();
    const prescription = prescriptions.find(p => p.id === id);
    
    if (prescription) {
      prescription.linkedMedicines = medicineIds;
      savePrescriptions(prescriptions);
    }
  },

  // Verify prescription (mock - would be done by pharmacist)
  verifyPrescription: async (id: string): Promise<void> => {
    await delay(500);
    const prescriptions = getStoredPrescriptions();
    const prescription = prescriptions.find(p => p.id === id);
    
    if (prescription) {
      prescription.verified = true;
      savePrescriptions(prescriptions);
    }
  },

  // Convert file to base64 (helper for upload)
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  },
};

export default prescriptionService;
