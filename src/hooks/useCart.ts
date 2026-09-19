import { create } from 'zustand';
import type { SareeProduct } from '@/data/sareeData';
import {
  type CartItem,
  readCartItemsForCurrentUser,
  writeCartItemsForCurrentUser,
} from '@/lib/cartStorage';

export type { CartItem } from '@/lib/cartStorage';

interface CartStore {
  items: CartItem[];
  addItem: (product: SareeProduct) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: readCartItemsForCurrentUser(),

  addItem: (product) => {
    set((state) => {
      const existing = state.items.find(i => i.product.id === product.id);
      const newItems = existing
        ? state.items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...state.items, { product, quantity: 1 }];
      writeCartItemsForCurrentUser(newItems);
      return { items: newItems };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const newItems = state.items.filter(i => i.product.id !== productId);
      writeCartItemsForCurrentUser(newItems);
      return { items: newItems };
    });
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      const newItems = quantity <= 0
        ? state.items.filter(i => i.product.id !== productId)
        : state.items.map(i => i.product.id === productId ? { ...i, quantity } : i);
      writeCartItemsForCurrentUser(newItems);
      return { items: newItems };
    });
  },

  clearCart: () => {
    writeCartItemsForCurrentUser([]);
    set({ items: [] });
  },

  getTotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

/** Call after login / logout so the bag matches the current customer (or guest). */
export function hydrateCartFromStorage() {
  useCart.setState({ items: readCartItemsForCurrentUser() });
}
