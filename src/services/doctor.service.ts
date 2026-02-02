import { Doctor, Consultation, TimeSlot } from '@/types';

const CONSULTATIONS_KEY = 'swiftcare_consultations';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Doctors Data
export const mockDoctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Johnson',
    specialty: 'General Physician',
    experience: '12 years',
    rating: 4.9,
    reviews: 324,
    fee: 299,
    nextSlot: '10:30 AM',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
    about: 'Dr. Sarah Johnson is a highly experienced general physician with expertise in treating common ailments, chronic diseases, and preventive healthcare.',
    languages: ['English', 'Hindi'],
    education: ['MBBS - Johns Hopkins University', 'MD - Stanford Medical School'],
  },
  {
    id: 'doc-2',
    name: 'Dr. Michael Chen',
    specialty: 'Cardiologist',
    experience: '15 years',
    rating: 4.8,
    reviews: 256,
    fee: 499,
    nextSlot: '11:00 AM',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
    about: 'Dr. Michael Chen specializes in cardiovascular diseases and has performed over 1000 successful cardiac procedures.',
    languages: ['English', 'Mandarin'],
    education: ['MBBS - Harvard Medical School', 'DM Cardiology - AIIMS'],
  },
  {
    id: 'doc-3',
    name: 'Dr. Priya Sharma',
    specialty: 'Dermatologist',
    experience: '8 years',
    rating: 4.7,
    reviews: 189,
    fee: 349,
    nextSlot: '2:00 PM',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
    about: 'Dr. Priya Sharma is a board-certified dermatologist specializing in skin disorders, cosmetic dermatology, and laser treatments.',
    languages: ['English', 'Hindi', 'Marathi'],
    education: ['MBBS - Grant Medical College', 'MD Dermatology - KEM Hospital'],
  },
  {
    id: 'doc-4',
    name: 'Dr. Rahul Mehta',
    specialty: 'Pediatrician',
    experience: '10 years',
    rating: 4.9,
    reviews: 412,
    fee: 349,
    nextSlot: '3:30 PM',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
    about: 'Dr. Rahul Mehta is a pediatric specialist known for his gentle approach with children and expertise in childhood diseases.',
    languages: ['English', 'Hindi', 'Gujarati'],
    education: ['MBBS - BJMC Ahmedabad', 'MD Pediatrics - CMC Vellore'],
  },
  {
    id: 'doc-5',
    name: 'Dr. Anjali Gupta',
    specialty: 'Gynecologist',
    experience: '14 years',
    rating: 4.8,
    reviews: 287,
    fee: 449,
    nextSlot: '4:00 PM',
    image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400',
    about: 'Dr. Anjali Gupta specializes in women\'s health, pregnancy care, and minimally invasive gynecological surgeries.',
    languages: ['English', 'Hindi'],
    education: ['MBBS - Lady Hardinge Medical College', 'MS OBG - Safdarjung Hospital'],
  },
];

// Generate time slots
const generateTimeSlots = (date: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const times = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'];
  
  times.forEach((time, index) => {
    slots.push({
      id: `slot_${date}_${index}`,
      time,
      date,
      available: Math.random() > 0.3, // 70% availability
    });
  });
  
  return slots;
};

// Get consultations from localStorage
const getStoredConsultations = (): Consultation[] => {
  const stored = localStorage.getItem(CONSULTATIONS_KEY);
  if (!stored) return [];
  return JSON.parse(stored).map((c: any) => ({
    ...c,
    createdAt: new Date(c.createdAt),
  }));
};

// Save consultations to localStorage
const saveConsultations = (consultations: Consultation[]): void => {
  localStorage.setItem(CONSULTATIONS_KEY, JSON.stringify(consultations));
};

export const doctorService = {
  // Get all doctors
  getDoctors: async (specialty?: string): Promise<Doctor[]> => {
    await delay(500);
    if (specialty) {
      return mockDoctors.filter(d => 
        d.specialty.toLowerCase().includes(specialty.toLowerCase())
      );
    }
    return mockDoctors;
  },

  // Get doctor by ID
  getDoctorById: async (id: string): Promise<Doctor | undefined> => {
    await delay(300);
    return mockDoctors.find(d => d.id === id);
  },

  // Get available slots for a doctor
  getAvailableSlots: async (doctorId: string, date: string): Promise<TimeSlot[]> => {
    await delay(400);
    return generateTimeSlots(date);
  },

  // Book consultation
  bookConsultation: async (
    doctorId: string, 
    slot: TimeSlot, 
    mode: 'video' | 'chat'
  ): Promise<Consultation> => {
    await delay(800);
    
    const doctor = mockDoctors.find(d => d.id === doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }
    
    const consultations = getStoredConsultations();
    
    const newConsultation: Consultation = {
      id: 'consult_' + Date.now(),
      doctorId,
      doctor,
      userId: 'user_1',
      timeSlot: slot,
      status: 'scheduled',
      mode,
      createdAt: new Date(),
    };
    
    consultations.unshift(newConsultation);
    saveConsultations(consultations);
    
    return newConsultation;
  },

  // Get user's consultations
  getConsultations: async (): Promise<Consultation[]> => {
    await delay(400);
    return getStoredConsultations().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Get upcoming consultations
  getUpcomingConsultations: async (): Promise<Consultation[]> => {
    await delay(300);
    const consultations = getStoredConsultations();
    return consultations.filter(c => c.status === 'scheduled');
  },

  // Cancel consultation
  cancelConsultation: async (id: string): Promise<void> => {
    await delay(400);
    const consultations = getStoredConsultations();
    const consultation = consultations.find(c => c.id === id);
    
    if (consultation) {
      consultation.status = 'cancelled';
      saveConsultations(consultations);
    }
  },

  // Complete consultation
  completeConsultation: async (id: string, notes?: string, prescription?: string): Promise<void> => {
    await delay(400);
    const consultations = getStoredConsultations();
    const consultation = consultations.find(c => c.id === id);
    
    if (consultation) {
      consultation.status = 'completed';
      consultation.notes = notes;
      consultation.prescription = prescription;
      saveConsultations(consultations);
    }
  },
};

export default doctorService;
