import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  User, Address, Medicine, CartItem, Order, Notification,
  Consultation, Prescription, Coupon
} from '@/types';
import addressService from '@/services/address.service';
import orderService from '@/services/order.service';
import notificationService from '@/services/notification.service';
import prescriptionService from '@/services/prescription.service';
import { doctorService } from '@/services/doctor.service';
import { Session } from '@supabase/supabase-js';
import { supabase } from "../lib/supabase";
import { profileService } from '@/services/profile.service';

// Re-export types for backward compatibility
export type { User, Address, Medicine, CartItem, Order, Notification, Consultation, Prescription };
export type { Pharmacy } from '@/types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  cart: CartItem[];
  orders: Order[];
  addresses: Address[];
  selectedAddress: Address | null;
  notifications: Notification[];
  unreadNotificationCount: number;
  consultations: Consultation[];
  prescriptions: Prescription[];
  appliedCoupon: Coupon | null;
  darkMode: boolean;
  hasSeenOnboarding: boolean;
}

interface AppContextType extends AppState {
  // Auth
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;

  // Cart
  addToCart: (medicine: Medicine) => void;
  removeFromCart: (medicineId: string) => void;
  updateCartQuantity: (medicineId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getUniquePharmacies: () => string[];

  // Addresses
  loadAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<Address>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setSelectedAddress: (address: Address | null) => void;
  setDefaultAddress: (id: string) => Promise<void>;

  // Orders
  loadOrders: () => Promise<void>;
  addOrder: (order: Order) => void;

  // Notifications
  loadNotifications: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;

  // Consultations
  loadConsultations: () => Promise<void>;
  addConsultation: (consultation: Consultation) => void;

  // Prescriptions
  loadPrescriptions: () => Promise<void>;
  addPrescription: (prescription: Prescription) => void;
  removePrescription: (id: string) => Promise<void>;

  // Coupons
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;

  // UI
  toggleDarkMode: () => void;
  completeOnboarding: (name: string) => Promise<void>;

  // Auth loading
  loadingUser: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'swiftcare_state';

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  cart: [],
  orders: [],
  addresses: [],
  selectedAddress: null,
  notifications: [],
  unreadNotificationCount: 0,
  consultations: [],
  prescriptions: [],
  appliedCoupon: null,
  darkMode: false,
  hasSeenOnboarding: false,
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        user: parsed.user || null,
        isAuthenticated: parsed.isAuthenticated || false,
        cart: parsed.cart || [],
        orders: [],
        addresses: [],
        selectedAddress: null,
        notifications: [],
        unreadNotificationCount: 0,
        consultations: [],
        prescriptions: [],
        appliedCoupon: null,
        darkMode: parsed.darkMode || false,
        hasSeenOnboarding: parsed.hasSeenOnboarding || false,
      };
    }
    return {
      user: null,
      isAuthenticated: false,
      cart: [],
      orders: [],
      addresses: [],
      selectedAddress: null,
      notifications: [],
      unreadNotificationCount: 0,
      consultations: [],
      prescriptions: [],
      appliedCoupon: null,
      darkMode: false,
      hasSeenOnboarding: false,
    };
  });

  const [loadingUser, setLoadingUser] = useState(true);

  // ==================== ADDRESSES ====================
  const loadAddresses = useCallback(async () => {
    try {
      const addresses = await addressService.getAddresses();
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0] || null;
      setState(prev => ({
        ...prev,
        addresses,
        selectedAddress: prev.selectedAddress || defaultAddress,
      }));
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  }, []);

  // ==================== ORDERS ====================
  const loadOrders = useCallback(async () => {
    try {
      const orders = await orderService.getOrders();
      setState(prev => ({ ...prev, orders }));
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  }, []);

  // ==================== NOTIFICATIONS ====================
  const loadNotifications = useCallback(async () => {
    try {
      const notifications = await notificationService.getNotifications();
      const unreadCount = notifications.filter(n => !n.read).length;
      setState(prev => ({
        ...prev,
        notifications,
        unreadNotificationCount: unreadCount,
      }));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  // ==================== CONSULTATIONS ====================
  const loadConsultations = useCallback(async () => {
    try {
      const consultations = await doctorService.getConsultations();
      setState(prev => ({ ...prev, consultations }));
    } catch (error) {
      console.error('Failed to load consultations:', error);
    }
  }, []);

  // ==================== PRESCRIPTIONS ====================
  const loadPrescriptions = useCallback(async () => {
    try {
      const prescriptions = await prescriptionService.getPrescriptions();
      setState(prev => ({ ...prev, prescriptions }));
    } catch (error) {
      console.error('Failed to load prescriptions:', error);
    }
  }, []);

  // Inside AppProvider component in AppContext.tsx

  const [isInitialLoading, setIsInitialLoading] = useState(false);

  const loadAllUserData = useCallback(async () => {
    // Prevent multiple simultaneous loads
    // if (isInitialLoading) return;
    // setIsInitialLoading(true);

    try {
      console.log("📥 Starting data fetch for user...");
      await Promise.allSettled([
        loadAddresses(),
        loadOrders(),
        loadNotifications(),
        loadConsultations(),
        loadPrescriptions(),
      ]);
      console.log("Data fetch successfully");
    } catch (err) {
      console.error("Data fetch failed", err);
    }
    // Remove isInitialLoading from the dependency array below!
  }, [loadAddresses, loadOrders, loadNotifications, loadConsultations, loadPrescriptions]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setLoadingUser(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user && isMounted) {
          const profile = await profileService.getProfile(user.id).catch(() => null);

          // 1. SET STATE
          setState(prev => ({
            ...prev,
            user: {
              id: user.id,
              email: user.email || '',
              name: profile?.full_name || user.user_metadata?.name || 'User',
              phone: profile?.phone || user.phone || ''
            },
            isAuthenticated: true
          }));

          // 2. WAIT A MOMENT
          // Sometimes the Supabase internal cache needs a millisecond to sync
          await new Promise(resolve => setTimeout(resolve, 100));

          // 3. FETCH DATA
          await loadAllUserData();
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        if (isMounted) setLoadingUser(false);
      }
    };

    init();

    // Listen for login/logout only (ignore the initial session restore here)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setState(initialState); // Reset to clean state
        localStorage.removeItem(STORAGE_KEY);
      }
      if (event === 'SIGNED_IN') {
        init(); // Re-run init on fresh login
      }
    });

    return () => { subscription.unsubscribe(); isMounted = false; };
  }, []); // ← empty deps, runs once only

  // Persist minimal state to localStorage
  useEffect(() => {
    const toPersist = {
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      cart: state.cart,
      darkMode: state.darkMode,
      hasSeenOnboarding: state.hasSeenOnboarding,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
  }, [state.user, state.isAuthenticated, state.cart, state.darkMode, state.hasSeenOnboarding]);

  // Apply dark mode
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  // Load data on mount
  // REMOVE this entire useEffect — it double-fires and causes extra failures
  // useEffect(() => {
  //   if (!state.user) return;
  //   loadAddresses();
  //   loadOrders();
  //   loadNotifications();
  //   loadConsultations();
  //   loadPrescriptions();
  // }, [state.user]);

  // ==================== AUTH ====================
  const login = (user: User) => {
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: true
    }));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      cart: [],
      appliedCoupon: null,
    }));
  };

  const updateUser = (updates: Partial<User>) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }));
  };

  // ==================== CART ====================
  const addToCart = (medicine: Medicine) => {
    setState(prev => {
      const existing = prev.cart.find(item => item.medicine.id === medicine.id);
      if (existing) {
        return {
          ...prev,
          cart: prev.cart.map(item =>
            item.medicine.id === medicine.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { ...prev, cart: [...prev.cart, { medicine, quantity: 1 }] };
    });
  };

  const removeFromCart = (medicineId: string) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.filter(item => item.medicine.id !== medicineId),
    }));
  };

  const updateCartQuantity = (medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setState(prev => ({
      ...prev,
      cart: prev.cart.map(item =>
        item.medicine.id === medicineId ? { ...item, quantity } : item
      ),
    }));
  };

  const clearCart = () => {
    setState(prev => ({ ...prev, cart: [], appliedCoupon: null }));
  };

  const getCartTotal = () => {
    return state.cart.reduce((total, item) => total + item.medicine.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return state.cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getUniquePharmacies = () => {
    return [...new Set(state.cart.map(item => item.medicine.pharmacyId))];
  };


  const addAddress = async (address: Omit<Address, 'id'>): Promise<Address> => {
    const newAddress = await addressService.addAddress(address);
    await loadAddresses();
    if (address.isDefault || state.addresses.length === 0) {
      setState(prev => ({ ...prev, selectedAddress: newAddress }));
    }
    return newAddress;
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    await addressService.updateAddress(id, updates);
    await loadAddresses();
  };

  const deleteAddress = async (id: string) => {
    await addressService.deleteAddress(id);
    await loadAddresses();
    if (state.selectedAddress?.id === id) {
      setState(prev => ({
        ...prev,
        selectedAddress: prev.addresses[0] || null
      }));
    }
  };

  const setSelectedAddress = (address: Address | null) => {
    setState(prev => ({ ...prev, selectedAddress: address }));
  };

  const setDefaultAddress = async (id: string) => {
    await addressService.setDefaultAddress(id);
    await loadAddresses();
  };


  const addOrder = (order: Order) => {
    setState(prev => ({ ...prev, orders: [order, ...prev.orders] }));
  };


  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    await notificationService.addNotification(notification);
    await loadNotifications();
  };

  const markNotificationAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    await loadNotifications();
  };

  const markAllNotificationsAsRead = async () => {
    await notificationService.markAllAsRead();
    await loadNotifications();
  };

  const clearNotifications = async () => {
    await notificationService.clearAll();
    await loadNotifications();
  };


  const addConsultation = (consultation: Consultation) => {
    setState(prev => ({ ...prev, consultations: [consultation, ...prev.consultations] }));
  };


  const addPrescription = (prescription: Prescription) => {
    setState(prev => ({ ...prev, prescriptions: [prescription, ...prev.prescriptions] }));
  };

  const removePrescription = async (id: string) => {
    await prescriptionService.deletePrescription(id);
    await loadPrescriptions();
  };

  // ==================== COUPONS ====================
  const applyCoupon = (coupon: Coupon) => {
    setState(prev => ({ ...prev, appliedCoupon: coupon }));
  };

  const removeCoupon = () => {
    setState(prev => ({ ...prev, appliedCoupon: null }));
  };

  // ==================== UI ====================
  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const completeOnboarding = async (name: string) => {
    if (!state.user?.id) return;

    try {
      // Save to DB
      await profileService.updateProfile(state.user.id, {
        full_name: name,
        onboarding_completed: true
      });

      // Update Local State
      setState(prev => ({
        ...prev,
        hasSeenOnboarding: true,
        user: prev.user ? { ...prev.user, name } : null
      }));
    } catch (error) {
      console.error("Failed to save onboarding data", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        getUniquePharmacies,
        loadAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setSelectedAddress,
        setDefaultAddress,
        loadOrders,
        addOrder,
        loadNotifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        loadConsultations,
        addConsultation,
        loadPrescriptions,
        addPrescription,
        removePrescription,
        applyCoupon,
        removeCoupon,
        toggleDarkMode,
        completeOnboarding,
        loadingUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
