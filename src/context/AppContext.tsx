import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: Address;
  avatar?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: { lat: number; lng: number };
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
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: 'confirmed' | 'packed' | 'out_for_delivery' | 'delivered';
  placedAt: Date;
  deliveryAddress: Address;
  paymentMethod: string;
  pharmacy: Pharmacy;
  estimatedDelivery: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  cart: CartItem[];
  orders: Order[];
  darkMode: boolean;
  hasSeenOnboarding: boolean;
}

interface AppContextType extends AppState {
  login: (user: User) => void;
  logout: () => void;
  addToCart: (medicine: Medicine) => void;
  removeFromCart: (medicineId: string) => void;
  updateCartQuantity: (medicineId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  toggleDarkMode: () => void;
  completeOnboarding: () => void;
  addOrder: (order: Order) => void;
  updateUser: (user: Partial<User>) => void;
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

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('swiftcare_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        orders: parsed.orders?.map((o: any) => ({ ...o, placedAt: new Date(o.placedAt) })) || [],
      };
    }
    return {
      user: null,
      isAuthenticated: false,
      cart: [],
      orders: [],
      darkMode: false,
      hasSeenOnboarding: false,
    };
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem('swiftcare_state', JSON.stringify(state));
  }, [state]);

  // Apply dark mode
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const login = (user: User) => {
    setState(prev => ({ ...prev, user, isAuthenticated: true }));
  };

  const logout = () => {
    setState(prev => ({ ...prev, user: null, isAuthenticated: false, cart: [] }));
  };

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
    setState(prev => ({ ...prev, cart: [] }));
  };

  const getCartTotal = () => {
    return state.cart.reduce((total, item) => total + item.medicine.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return state.cart.reduce((count, item) => count + item.quantity, 0);
  };

  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const completeOnboarding = () => {
    setState(prev => ({ ...prev, hasSeenOnboarding: true }));
  };

  const addOrder = (order: Order) => {
    setState(prev => ({ ...prev, orders: [order, ...prev.orders] }));
  };

  const updateUser = (updates: Partial<User>) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        toggleDarkMode,
        completeOnboarding,
        addOrder,
        updateUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
