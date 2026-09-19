import { API_BASE_URL } from "@/lib/env";
import { getAdminToken } from "@/lib/authStorage";

const STORAGE_KEY = "athina_collection_assignments";
const API_BASE = API_BASE_URL;

/** Built-in keys plus any custom key from Admin → Create collection */
export type CollectionType = string;

export interface CollectionDefinition {
  collection_key: string;
  display_name: string;
  /** One of `collectionIcons` keys; omitted/null → default icon on site */
  icon_key?: string | null;
  display_order?: number;
  image_url?: string | null;
}

interface CollectionAssignments {
  [productId: string]: CollectionType[];
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function getToken(): string | null {
  return getAdminToken();
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

function readAssignments(): CollectionAssignments {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeAssignments(data: CollectionAssignments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return fallback;
    const data = JSON.parse(text);
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

/** Custom collections (display names + URL keys). Public GET. */
export async function fetchCollectionDefinitions(): Promise<CollectionDefinition[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/collections.php?action=list-meta&_ts=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.collections) ? data.collections : [];
  } catch {
    return [];
  }
}

/** Built-in + custom definitions in storefront/admin display order. Public GET. */
export async function fetchAllCollectionDefinitions(): Promise<CollectionDefinition[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/collections.php?action=list-all-meta&_ts=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.collections) ? data.collections : [];
  } catch {
    return [];
  }
}

/** Single custom collection meta for public pages. */
export async function fetchCollectionMetaByKey(key: string): Promise<CollectionDefinition | null> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/collections.php?action=get-meta&key=${encodeURIComponent(key)}&_ts=${Date.now()}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const row = await res.json();
    if (row?.collection_key && row?.display_name) {
      return {
        collection_key: String(row.collection_key),
        display_name: String(row.display_name),
        icon_key: row.icon_key != null && row.icon_key !== "" ? String(row.icon_key) : null,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** Admin: create a new collection (adds row in collection_meta). */
export async function apiCreateCollection(
  displayName: string,
  collectionKey?: string,
  iconKey?: string
): Promise<CollectionDefinition> {
  const res = await fetchWithTimeout(`${API_BASE}/collections.php?action=create-collection`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      display_name: displayName.trim(),
      ...(collectionKey?.trim() ? { collection_key: collectionKey.trim().toLowerCase() } : {}),
      ...(iconKey?.trim() ? { icon_key: iconKey.trim() } : {}),
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success || !json.collection) {
    throw new Error(json.error || "Could not create collection");
  }
  return json.collection as CollectionDefinition;
}

/** Public: resolved display title (built-in defaults + DB override). */
export async function fetchCollectionDisplayName(key: string, fallback: string): Promise<string> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/collections.php?action=get-display&key=${encodeURIComponent(key)}&_ts=${Date.now()}`,
      { cache: "no-store" }
    );
    if (!res.ok) return fallback;
    const data = await res.json();
    if (data?.display_name && typeof data.display_name === "string") return data.display_name;
    return fallback;
  } catch {
    return fallback;
  }
}

/** Admin: rename and/or change icon (built-in or custom). */
export async function apiUpdateCollectionDisplayName(
  collectionKey: string,
  displayName: string,
  iconKey?: string | null,
  imageUrl?: string | null
): Promise<CollectionDefinition> {
  const body: Record<string, string> = {
    collection_key: collectionKey,
    display_name: displayName.trim(),
  };
  if (iconKey !== undefined) {
    body.icon_key = iconKey === null ? "" : String(iconKey).trim();
  }
  if (imageUrl !== undefined) {
    body.image_url = imageUrl === null ? "" : String(imageUrl).trim();
  }
  const res = await fetchWithTimeout(`${API_BASE}/collections.php?action=update-display`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success || !json.collection) {
    throw new Error(json.error || "Could not update collection");
  }
  return json.collection as CollectionDefinition;
}

/** Admin: delete custom collection and all its product assignments. */
export async function apiDeleteCustomCollection(collectionKey: string): Promise<void> {
  const res = await fetchWithTimeout(
    `${API_BASE}/collections.php?action=delete-collection&key=${encodeURIComponent(collectionKey)}&_ts=${Date.now()}`,
    { method: "DELETE", headers: authHeaders() }
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(json.error || "Could not delete collection");
  }
}

/** Admin: persist display order for both built-in and custom collections. */
export async function apiUpdateCollectionOrder(keysInOrder: string[]): Promise<CollectionDefinition[]> {
  const keys = keysInOrder
    .map((k) => String(k || "").trim())
    .filter((k) => k.length > 0);
  const res = await fetchWithTimeout(`${API_BASE}/collections.php?action=update-order`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ keys }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Could not update collection order");
  }
  return Array.isArray(json.collections) ? (json.collections as CollectionDefinition[]) : [];
}

// ─── Async API-backed functions ───

/** Fetch all assignments from server, cache in localStorage */
export async function fetchAllAssignments(): Promise<CollectionAssignments> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/collections.php?action=list&_ts=${Date.now()}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        writeAssignments(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('[collections] API fetch failed, using local cache:', err);
  }
  return readAssignments();
}

/** Fetch collections for a single product from server */
export async function fetchProductCollections(productId: string | number): Promise<CollectionType[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/collections.php?action=get&product_id=${encodeURIComponent(String(productId))}&_ts=${Date.now()}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data as CollectionType[];
    }
  } catch {}
  return readAssignments()[String(productId)] || [];
}

/** Add product to collection via API with local rollback on failure */
export async function apiAddProductToCollection(productId: string | number, collection: CollectionType): Promise<void> {
  addProductToCollection(productId, collection);
  try {
    const res = await fetchWithTimeout(`${API_BASE}/collections.php?action=add`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ product_id: String(productId), collection_type: collection }),
    });

    if (!res.ok) {
      removeProductFromCollection(productId, collection);
      throw new Error(await readErrorMessage(res, 'Failed to add product to collection'));
    }
  } catch (err) {
    removeProductFromCollection(productId, collection);
    console.warn('[collections] API add failed:', err);
    throw err instanceof Error ? err : new Error('Failed to add product to collection');
  }
}

/** Remove product from collection via API with local rollback on failure */
export async function apiRemoveProductFromCollection(productId: string | number, collection: CollectionType): Promise<void> {
  const hadCollection = getProductCollections(productId).includes(collection);
  removeProductFromCollection(productId, collection);
  try {
    const res = await fetchWithTimeout(`${API_BASE}/collections.php?action=remove&product_id=${encodeURIComponent(String(productId))}&collection_type=${encodeURIComponent(collection)}&_ts=${Date.now()}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!res.ok) {
      if (hadCollection) addProductToCollection(productId, collection);
      throw new Error(await readErrorMessage(res, 'Failed to remove product from collection'));
    }
  } catch (err) {
    if (hadCollection) addProductToCollection(productId, collection);
    console.warn('[collections] API remove failed:', err);
    throw err instanceof Error ? err : new Error('Failed to remove product from collection');
  }
}

/** Get product IDs for a collection from API cache */
export async function fetchProductIdsByCollection(collection: CollectionType): Promise<string[]> {
  const all = await fetchAllAssignments();
  return Object.entries(all)
    .filter(([, cols]) => cols.includes(collection))
    .map(([id]) => id);
}

// ─── Synchronous localStorage-only functions (kept for compatibility) ───

export function getProductCollections(productId: string | number): CollectionType[] {
  return readAssignments()[String(productId)] || [];
}

export function addProductToCollection(productId: string | number, collection: CollectionType) {
  const all = readAssignments();
  const key = String(productId);
  const current = all[key] || [];
  if (!current.includes(collection)) {
    all[key] = [...current, collection];
    writeAssignments(all);
  }
}

export function removeProductFromCollection(productId: string | number, collection: CollectionType) {
  const all = readAssignments();
  const key = String(productId);
  const current = all[key] || [];
  all[key] = current.filter(c => c !== collection);
  if (all[key].length === 0) delete all[key];
  writeAssignments(all);
}

export function getProductIdsByCollection(collection: CollectionType): string[] {
  const all = readAssignments();
  return Object.entries(all)
    .filter(([, cols]) => cols.includes(collection))
    .map(([id]) => id);
}
