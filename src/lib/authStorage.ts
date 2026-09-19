/**
 * Auth tokens live in sessionStorage (tab-scoped), not localStorage.
 * They no longer appear under Application → Local Storage after login, and clear when the tab closes.
 * Note: DevTools can still read sessionStorage while the tab is open; true protection requires httpOnly cookies (server change).
 */

const KEYS = {
  admin_token: "admin_token",
  admin_user: "admin_user",
  admin_login_time: "admin_login_time",
  customer_token: "customer_token",
  customer_user: "customer_user",
} as const;

function store(): Storage {
  return sessionStorage;
}

/** One-time: move legacy localStorage auth into sessionStorage and strip local copies. */
export function migrateLegacyAuthFromLocalStorage(): void {
  if (typeof window === "undefined") return;
  (Object.keys(KEYS) as (keyof typeof KEYS)[]).forEach((key) => {
    const k = KEYS[key];
    const legacy = localStorage.getItem(k);
    if (legacy != null) {
      if (!store().getItem(k)) {
        try {
          store().setItem(k, legacy);
        } catch {
          /* quota */
        }
      }
      localStorage.removeItem(k);
    }
  });
}

function clearLocalAuthShadows(): void {
  (Object.keys(KEYS) as (keyof typeof KEYS)[]).forEach((key) => {
    localStorage.removeItem(KEYS[key]);
  });
}

// ——— Admin ———

export function getAdminToken(): string | null {
  return store().getItem(KEYS.admin_token);
}

export function getAdminLoginTime(): string | null {
  return store().getItem(KEYS.admin_login_time);
}

export function setAdminSession(token: string, user: object): void {
  store().setItem(KEYS.admin_token, token);
  store().setItem(KEYS.admin_user, JSON.stringify(user));
  store().setItem(KEYS.admin_login_time, String(Date.now()));
  clearLocalAuthShadows();
}

export function clearAdminSession(): void {
  store().removeItem(KEYS.admin_token);
  store().removeItem(KEYS.admin_user);
  store().removeItem(KEYS.admin_login_time);
  clearLocalAuthShadows();
}

// ——— Customer ———

export function getCustomerToken(): string | null {
  return store().getItem(KEYS.customer_token);
}

export function getCustomerUserJson(): string | null {
  return store().getItem(KEYS.customer_user);
}

export function setCustomerSession(token: string, user: object): void {
  store().setItem(KEYS.customer_token, token);
  store().setItem(KEYS.customer_user, JSON.stringify(user));
  clearLocalAuthShadows();
}

/** Update cached profile after API update (no token change). */
export function setCustomerUserJson(json: string): void {
  store().setItem(KEYS.customer_user, json);
  localStorage.removeItem(KEYS.customer_user);
}

export function clearCustomerSession(): void {
  store().removeItem(KEYS.customer_token);
  store().removeItem(KEYS.customer_user);
  clearLocalAuthShadows();
}
