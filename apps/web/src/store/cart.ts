'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  variantG: number;
  price: number;
  quantity: number;
  image: string | null;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  
  // Computed
  getTotalItems: () => number;
  getSubtotal: () => number;
  getShippingCost: (freeShippingThreshold?: number) => number;
  getTotal: (freeShippingThreshold?: number) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const existingItem = get().items.find(
          (i) => i.productId === item.productId && i.variantG === item.variantG
        );

        if (existingItem) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === existingItem.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          }));
        } else {
          set((state) => ({
            items: [
              ...state.items,
              {
                ...item,
                id: `${item.productId}-${item.variantG}-${Date.now()}`,
              },
            ],
          }));
        }
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      setCartOpen: (open) => {
        set({ isOpen: open });
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getShippingCost: (freeShippingThreshold = 1000) => {
        const subtotal = get().getSubtotal();
        return subtotal >= freeShippingThreshold ? 0 : 150;
      },

      getTotal: (freeShippingThreshold = 1000) => {
        return get().getSubtotal() + get().getShippingCost(freeShippingThreshold);
      },
    }),
    {
      name: 'jardin-verde-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
