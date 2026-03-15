import React, { createContext, useContext, useMemo, useState } from 'react';
import type { CartItem, Medicine } from '@/types';

type CartContextValue = {
  cart: CartItem[];
  addToCart: (medicine: Medicine) => void;
  removeFromCart: (medicineId: string) => void;
  updateCartQuantity: (medicineId: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const value = useMemo(
    () => ({
      cart,
      addToCart: (medicine: Medicine) =>
        setCart((prev) => {
          const existing = prev.find((i) => i.medicine.id === medicine.id);
          if (existing) return prev.map((i) => (i.medicine.id === medicine.id ? { ...i, quantity: i.quantity + 1 } : i));
          return [...prev, { medicine, quantity: 1 }];
        }),
      removeFromCart: (medicineId: string) => setCart((prev) => prev.filter((i) => i.medicine.id !== medicineId)),
      updateCartQuantity: (medicineId: string, quantity: number) =>
        setCart((prev) => prev.map((i) => (i.medicine.id === medicineId ? { ...i, quantity } : i)).filter((i) => i.quantity > 0)),
    }),
    [cart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
};
