import type { SareeProduct } from "@/data/sareeData";
import { getCustomerUserJson } from "@/lib/authStorage";

export interface CartItem {
  product: SareeProduct;
  quantity: number;
}

const GUEST_KEY = "athina_cart_guest";
const LEGACY_KEY = "athina_cart";

/** Per-account cart so switching users does not show another person's bag. */
export function getCartStorageKey(): string {
  const raw = getCustomerUserJson();
  if (!raw) return GUEST_KEY;
  try {
    const u = JSON.parse(raw);
    const id = u?.id;
    if (typeof id === "number" && Number.isFinite(id) && id >= 0) {
      return `athina_cart_u_${id}`;
    }
  } catch {
    /* ignore */
  }
  return GUEST_KEY;
}

function parseCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Load cart for the current storage key; migrate legacy `athina_cart` into guest once. */
export function readCartItemsForCurrentUser(): CartItem[] {
  const key = getCartStorageKey();
  let raw = localStorage.getItem(key);
  if (!raw && key === GUEST_KEY) {
    raw = localStorage.getItem(LEGACY_KEY);
    if (raw) {
      localStorage.setItem(GUEST_KEY, raw);
      localStorage.removeItem(LEGACY_KEY);
    }
  }
  return parseCart(raw);
}

export function writeCartItemsForCurrentUser(items: CartItem[]): void {
  const key = getCartStorageKey();
  if (items.length === 0) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(items));
  }
  if (key === GUEST_KEY) {
    localStorage.removeItem(LEGACY_KEY);
  }
}

/**
 * After login, merge guest bag into signed-in user's bag so items aren't lost.
 * Quantities are summed for duplicate product ids.
 */
export function mergeGuestCartIntoCurrentUser(): void {
  const userKey = getCartStorageKey();
  if (userKey === GUEST_KEY) return;

  const guestItems = parseCart(localStorage.getItem(GUEST_KEY));
  if (guestItems.length === 0) return;

  const existingUserItems = parseCart(localStorage.getItem(userKey));
  const byId = new Map<string, CartItem>();

  for (const item of existingUserItems) {
    byId.set(item.product.id, item);
  }
  for (const item of guestItems) {
    const prev = byId.get(item.product.id);
    if (prev) {
      byId.set(item.product.id, { ...prev, quantity: prev.quantity + item.quantity });
    } else {
      byId.set(item.product.id, item);
    }
  }

  localStorage.setItem(userKey, JSON.stringify(Array.from(byId.values())));
  localStorage.removeItem(GUEST_KEY);
  localStorage.removeItem(LEGACY_KEY);
}
