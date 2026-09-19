import { API_BASE_URL } from "@/lib/env";
import { hydrateCartFromStorage } from "@/hooks/useCart";
import { mergeGuestCartIntoCurrentUser } from "@/lib/cartStorage";
import {
  clearCustomerSession,
  getCustomerToken,
  getCustomerUserJson,
  getAdminToken,
  setCustomerSession,
} from "@/lib/authStorage";

const API_BASE = API_BASE_URL;

export interface CustomerUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  is_verified: boolean;
}

function readCustomerToken(): string | null {
  return getCustomerToken();
}

function customerAuthHeaders(): Record<string, string> {
  const token = readCustomerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getStoredCustomer(): CustomerUser | null {
  const data = getCustomerUserJson();
  if (!data) return null;
  try {
    const u = JSON.parse(data);
    if (u && typeof u === 'object' && typeof u.email === 'string') {
      return u as CustomerUser;
    }
    return null;
  } catch {
    return null;
  }
}

export function isCustomerLoggedIn(): boolean {
  return !!readCustomerToken();
}

export async function registerCustomer(data: { name: string; email: string; phone: string; password: string }): Promise<{ success: boolean; email: string }> {
  const res = await fetch(`${API_BASE}/customer-auth.php?action=register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const text = await res.text();
  const json = JSON.parse(text);
  if (!res.ok) throw new Error(json.error || 'Registration failed');
  return json;
}

export async function loginCustomer(email: string, password: string): Promise<{ token: string; user: CustomerUser } | { needsVerification: true; email: string }> {
  const res = await fetch(`${API_BASE}/customer-auth.php?action=login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  const json = JSON.parse(text);
  if (res.status === 403 && json.needsVerification) {
    return { needsVerification: true, email: json.email };
  }
  if (!res.ok) throw new Error(json.error || 'Login failed');
  return json;
}

export async function verifyOTP(email: string, otp: string): Promise<{ token: string; user: CustomerUser }> {
  const res = await fetch(`${API_BASE}/customer-auth.php?action=verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  const text = await res.text();
  const json = JSON.parse(text);
  if (!res.ok) throw new Error(json.error || 'Verification failed');
  return json;
}

export async function resendOTP(email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/customer-auth.php?action=resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || 'Failed to resend OTP');
  }
}

export async function getCustomerProfile(): Promise<CustomerUser> {
  const res = await fetch(`${API_BASE}/customer-auth.php?action=profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...customerAuthHeaders() },
  });
  if (!res.ok) throw new Error('Failed to load profile');
  const json = await res.json();
  return json.user;
}

export async function updateCustomerProfile(data: Partial<CustomerUser>): Promise<CustomerUser> {
  const res = await fetch(`${API_BASE}/customer-auth.php?action=update-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...customerAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  const json = await res.json();
  return json.user;
}

export async function logoutCustomer(): Promise<void> {
  try {
    await fetch(`${API_BASE}/customer-auth.php?action=logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...customerAuthHeaders() },
    });
  } catch {}
  clearCustomerSession();
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/customer-auth.php?action=forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('Failed to send reset OTP');
}

export async function resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/customer-auth.php?action=reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Password reset failed');
}

export function saveCustomerSession(token: string, user: CustomerUser) {
  setCustomerSession(token, user);
  mergeGuestCartIntoCurrentUser();
  hydrateCartFromStorage();
}

/** Exposed for checkout / guards (session-only token). */
export { getCustomerToken };

export interface CustomerAdminRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  is_verified: boolean;
  created_at: string;
  updated_at?: string | null;
}

export async function fetchAdminCustomerList(): Promise<CustomerAdminRow[]> {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/customer-auth.php?action=admin-list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  let json: { customers?: CustomerAdminRow[]; error?: string } = {};
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('Invalid response from server');
  }
  if (!res.ok || json.error) {
    throw new Error(typeof json.error === 'string' ? json.error : 'Failed to load customers');
  }
  return Array.isArray(json.customers) ? json.customers : [];
}
