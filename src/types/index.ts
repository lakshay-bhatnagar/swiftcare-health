// ============= Core Application Types =============

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar?: string;
}

export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  full_name: string;
  phone_number: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  mrp: number;
  discount: number;
  image: string;
  description: string;
  dosage: string;
  manufacturer: string;
  prescriptionRequired: boolean;
  inStock: boolean;
  pharmacyId: string;
  pharmacyName: string;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: string;
  deliveryTime: string;
  rating: number;
  reviewCount: number;
  image: string;
  isOpen: boolean;
  phone?: string;
  email?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  userId: string;
  items: CartItem[];
  pharmacyIds: string[];
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  deliveryType: 'quick' | 'normal';
  paymentMethod: 'stripe' | 'upi' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  address: Address;
  status: 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: Date;
  estimatedDelivery: string;
  pharmacy: Pharmacy;
  couponCode?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'consultation' | 'prescription' | 'promo' | 'system';
  read: boolean;
  createdAt: Date;
  data?: Record<string, any>;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  fee: number;
  nextSlot: string;
  image: string;
  about?: string;
  languages?: string[];
  education?: string[];
  availableSlots?: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  time: string;
  date: string;
  available: boolean;
}

export interface Consultation {
  id: string;
  doctorId: string;
  doctor: Doctor;
  userId: string;
  timeSlot: TimeSlot;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  mode: 'video' | 'chat';
  notes?: string;
  prescription?: string;
  createdAt: Date;
}

export interface Coupon {
  code: string;
  discountType: 'flat' | 'percent';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiry: Date;
  isActive: boolean;
  description?: string;
}

export interface Prescription {
  id: string;
  imageUrl: string;
  uploadDate: Date;
  name?: string;
  linkedMedicines: string[];
  verified: boolean;
}

export interface EmergencyRequest {
  id: string;
  userId: string;
  location: { lat: number; lng: number };
  status: 'requested' | 'dispatched' | 'arrived' | 'completed';
  eta: string;
  hospital: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  createdAt: Date;
}

// Category type
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}
