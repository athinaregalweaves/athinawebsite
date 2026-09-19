import { create } from 'zustand';
import { SareeProduct } from '@/data/sareeData';

interface WishlistStore {
  items: SareeProduct[];
  addItem: (product: SareeProduct) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: SareeProduct) => void;
  isWishlisted: (productId: string) => boolean;
  getCount: () => number;
}

function readWishlistFromStorage(): SareeProduct[] {
  const raw = localStorage.getItem('athina_wishlist');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const useWishlist = create<WishlistStore>((set, get) => ({
  items: readWishlistFromStorage(),

  addItem: (product) => {
    set((state) => {
      if (state.items.find(i => i.id === product.id)) return state;
      const newItems = [...state.items, product];
      localStorage.setItem('athina_wishlist', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const newItems = state.items.filter(i => i.id !== productId);
      localStorage.setItem('athina_wishlist', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  toggleItem: (product) => {
    const exists = get().items.find(i => i.id === product.id);
    if (exists) get().removeItem(product.id);
    else get().addItem(product);
  },

  isWishlisted: (productId) => get().items.some(i => i.id === productId),
  getCount: () => get().items.length,
}));
