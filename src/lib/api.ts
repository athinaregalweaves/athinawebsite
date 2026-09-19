import { API_BASE_URL } from "@/lib/env";
import { clearAdminSession, getAdminToken } from "@/lib/authStorage";

// Hostinger API path
const API_BASE = API_BASE_URL;

export interface AdminUser {
  id: number;
  email: string;
  name: string;
}

export interface HomepageSection {
  id: number;
  section_key: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  /** Optional hero background: direct .mp4/.webm URL or YouTube / Vimeo page URL */
  video_url?: string;
  image_width: number;
  image_height: number;
  image_position?: string;
  image_zoom?: number;
  redirect_page: string;
  button_text: string;
  caption: string;
  is_active: number;
  show_on_collections?: number;
}

function getToken(): string | null {
  return getAdminToken();
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Auth — real Hostinger auth.php only (no demo_token / sample orders).
export async function loginAdmin(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
  const res = await fetch(`${API_BASE}/auth.php?action=login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();
  let data: { token?: string; user?: AdminUser; error?: string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Login server returned invalid response. Check api/auth.php is deployed.');
  }
  if (!res.ok || !data.token || !data.user) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Login failed');
  }
  return { token: data.token, user: data.user };
}

export async function verifyToken(): Promise<{ user: AdminUser }> {
  const token = getToken();
  if (!token) {
    throw new Error('No token found');
  }
  if (token.startsWith('demo_token_')) {
    throw new Error('Demo login is disabled. Please sign in again with your server admin account.');
  }

  const res = await fetch(`${API_BASE}/auth.php?action=verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });

  if (!res.ok) {
    throw new Error('Invalid token');
  }

  return res.json();
}

export async function logoutAdmin(): Promise<void> {
  const token = getToken();
  if (token && !token.startsWith('demo_token_')) {
    try {
      await fetch(`${API_BASE}/auth.php?action=logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
    } catch {}
  }
  clearAdminSession();
}

// Demo section data — use bundled asset paths as defaults
import heroImage from "@/assets/hero-saree.jpg";
import bridalBanner from "@/assets/bridal-banner.jpg";
import collectionTissue from "@/assets/collection-tissue.jpg";
import collectionLinen from "@/assets/collection-linen.jpg";

const DEMO_SECTIONS: HomepageSection[] = [
  { id: 1, section_key: 'hero', title: 'Timeless Sarees', subtitle: 'Crafted for Legacy', description: 'Discover curated handloom sarees designed for modern royalty. Each piece, a masterwork of Indian artistry.', image_url: heroImage, video_url: '', image_width: 1920, image_height: 1080, image_position: 'center 10%', image_zoom: 100, redirect_page: '/collections', button_text: 'Explore Collection', caption: 'Hyderabad · Heritage Handloom', is_active: 1, show_on_collections: 0 },
  { id: 2, section_key: 'bridal', title: 'Bridal Sarees', subtitle: 'for Grand Celebrations', description: 'Sarees crafted for the most celebrated moments. Each bridal piece is a masterwork of heritage weaving and timeless beauty.', image_url: bridalBanner, video_url: '', image_width: 1920, image_height: 1080, image_position: 'center 30%', image_zoom: 100, redirect_page: '/bridal', button_text: 'View Bridal Collection', caption: 'Bridal Couture', is_active: 1, show_on_collections: 1 },
  { id: 3, section_key: 'tissue', title: 'Tissue &', subtitle: 'Organza', description: 'Luminous tissue weaves and delicate organza sarees that capture light and movement with every drape.', image_url: collectionTissue, video_url: '', image_width: 1920, image_height: 1080, image_position: 'center center', image_zoom: 100, redirect_page: '/collections', button_text: 'Explore Tissue', caption: 'Ethereal Elegance', is_active: 1, show_on_collections: 1 },
  { id: 4, section_key: 'linen', title: 'Linen &', subtitle: 'Cotton', description: 'Everyday luxury in breathable linen and cotton weaves. Perfect for the modern woman who values comfort and craft.', image_url: collectionLinen, video_url: '', image_width: 1920, image_height: 1080, image_position: 'center center', image_zoom: 100, redirect_page: '/collections', button_text: 'Explore Linen', caption: 'Contemporary Heritage', is_active: 1, show_on_collections: 1 },
  { id: 5, section_key: 'bestseller', title: 'The Banarasi', subtitle: 'Legacy', description: 'Our most treasured collection — Banarasi silks handwoven by master artisans with pure gold and silver zari.', image_url: '', video_url: '', image_width: 1400, image_height: 1800, image_position: 'center center', image_zoom: 100, redirect_page: '/collections', button_text: 'Shop Banarasi', caption: 'Bestseller Collection', is_active: 1, show_on_collections: 0 },
];

// Sections
export async function getSections(): Promise<HomepageSection[]> {
  const res = await fetch(`${API_BASE}/sections.php`);
  if (!res.ok) throw new Error('Failed to load sections');
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return DEMO_SECTIONS;
  }
}

export async function updateSection(id: number, data: Partial<HomepageSection>): Promise<HomepageSection> {
  const res = await fetch(`${API_BASE}/sections.php?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update section');
  return res.json();
}

/** Admin: insert a new custom homepage section (shows on the home page after Bridal / Tissue / Linen). */
export async function createSection(data: Partial<HomepageSection> & { section_key?: string }): Promise<HomepageSection> {
  const res = await fetch(`${API_BASE}/sections.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to create section');
  }
  return res.json();
}

/** Admin: remove a custom section only (section_key must start with custom_). */
export async function deleteSection(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/sections.php?id=${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to delete section');
  }
}

export async function uploadImage(file: File): Promise<{ url: string; width: number; height: number }> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_BASE}/upload.php`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });
  if (!res.ok) {
    // Upload endpoint returns JSON with an `error` field, but show a helpful message either way.
    const text = await res.text().catch(() => "");
    let msg = "Upload failed";
    try {
      const data = JSON.parse(text);
      msg = (data?.error || data?.message || msg) as string;
    } catch {}
    throw new Error(`${msg} (HTTP ${res.status})`);
  }
  return res.json();
}

// Edit History
export interface HistoryEntry {
  id: number;
  page: string;
  action: string;
  item_name: string;
  image_url: string;
  old_data: Record<string, any> | null;
  created_at: string;
}

export async function getHistory(page?: string): Promise<HistoryEntry[]> {
  const url = page ? `${API_BASE}/history.php?page=${page}` : `${API_BASE}/history.php`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return [];
  try {
    return await res.json();
  } catch {
    return [];
  }
}

export async function addHistory(entry: { page: string; action: string; item_name: string; image_url?: string; old_data?: Record<string, any> }): Promise<HistoryEntry> {
  const res = await fetch(`${API_BASE}/history.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Failed to save history');
  return res.json();
}

export async function updateHistory(id: number, data: Partial<HistoryEntry>): Promise<void> {
  await fetch(`${API_BASE}/history.php?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
}

export async function deleteHistory(id: number): Promise<void> {
  await fetch(`${API_BASE}/history.php?id=${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

// Products API
export async function saveProduct(productData: Record<string, any>): Promise<any> {
  const res = await fetch(`${API_BASE}/products.php?action=save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = 'Failed to save product';
    try { msg = JSON.parse(text).error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteProduct(productId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products.php?action=delete&product_id=${encodeURIComponent(productId)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete product');
}

export async function getProducts(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/products.php?action=list`);
  if (!res.ok) return [];
  try { return await res.json(); } catch { return []; }
}
