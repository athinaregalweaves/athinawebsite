import { sareeProducts, type SareeProduct } from "@/data/sareeData";
import { type StoredProductData, getImageBlob } from "@/lib/adminProductStorage";
import { API_BASE_URL } from "@/lib/env";

const STORAGE_KEY = "athina_admin_products_v1";
const API_BASE = API_BASE_URL;

/** Newest `created_at` first; tie-break by `updated_at`, then ATH_# SKU, then id. */
export function sortProductsNewestFirst(products: SareeProduct[]): SareeProduct[] {
  const athNum = (sku: string) => {
    const m = String(sku || "").match(/^ATH[_-]?(\d+)$/i);
    return m ? parseInt(m[1], 10) : -1;
  };
  return [...products].sort((a, b) => {
    const ta = Date.parse(a.createdAt || a.updatedAt || "") || 0;
    const tb = Date.parse(b.createdAt || b.updatedAt || "") || 0;
    if (tb !== ta) return tb - ta;
    const ua = Date.parse(a.updatedAt || "") || 0;
    const ub = Date.parse(b.updatedAt || "") || 0;
    if (ub !== ua) return ub - ua;
    const na = athNum(a.sku);
    const nb = athNum(b.sku);
    if (na >= 0 && nb >= 0 && nb !== na) return nb - na;
    return String(b.id).localeCompare(String(a.id));
  });
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function isMainImage(img: any): boolean {
  const v = img?.isMain ?? img?.is_main;
  return v === true || v === 1 || v === "1" || v === "true" || v === "yes";
}

function getImageUrl(img: any): string {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (typeof img === "object") {
    const candidates = [
      img.url,
      img.image,
      img.src,
      img.image_url,
      img.imageUrl,
      img.path,
      img.file,
    ];
    const found = candidates.find((v) => typeof v === "string" && v.trim().length > 0);
    if (found) return normalizeImageUrl(found as string);
  }
  return "";
}

function normalizeImageUrl(url: string): string {
  if (!url) return "";
  // Fix broken paths stored earlier like:
  //   /api/../uploads//img_....jpg
  // Convert them to:
  //   /uploads/img_....jpg
  const [pathPart, queryPart] = url.split("?");
  const normalizedPath = pathPart
    .replace(/^\/api\/\.\.\//, "/")
    .replace(/\/api\/\.\.\//g, "/")
    .replace(/\/uploads\/+/g, "/uploads/")
    .replace(/\/{2,}/g, "/");
  return queryPart ? `${normalizedPath}?${queryPart}` : normalizedPath;
}

export type FetchProductSource = "api" | "hardcoded" | "none";

export type FetchProductByIdResult = {
  product: SareeProduct | null;
  source: FetchProductSource;
};

/**
 * Fetch a single product by ID from the PHP API.
 * Falls back to hardcoded bundle if API fails.
 */
export async function fetchProductById(productId: string): Promise<FetchProductByIdResult> {
  try {
    const res = await fetch(`${API_BASE}/products.php?action=get&product_id=${encodeURIComponent(productId)}`);
    if (res.ok) {
      const p = await res.json();
      if (p && !p.error) {
        const images = Array.isArray(p.images) ? p.images : [];
        const mainImage = images.find((img: any) => isMainImage(img)) || images[0];
        const imageUrl = getImageUrl(mainImage) || "/placeholder.svg";
        return {
          source: "api",
          product: {
            id: p.product_id || p.id,
            itemName: p.item_name || p.itemName || "Untitled",
            sku: p.sku || "",
            price: Number(p.price) || 0,
            category: p.category || "",
            subcategory: p.subcategory || p.subCategory || "",
            fabric: p.fabric || "",
            image: imageUrl,
            itemNote: p.item_note || p.itemNote || "",
            description: p.description || "",
            originalPrice: Number(p.original_price || p.originalPrice) || 0,
            longDescription: p.long_description || p.longDescription || "",
            offerPercent: Number(p.offer_percent || p.offerPercent) || 0,
            mapLocation: p.map_location || p.mapLocation || "",
            weight: p.weight || "",
            length: p.length || "",
            blouseIncluded: p.blouse_included || p.blouseIncluded || "",
            careInstructions: p.care_instructions || p.careInstructions || "",
            tags: p.tags || "",
            originStory: p.origin_story || p.originStory || "",
            weavingProcess: p.weaving_process || p.weavingProcess || "",
            qualityAssurance: p.quality_assurance || p.qualityAssurance || "",
            storyImageOrigin: p.story_image_origin || p.storyImageOrigin || "",
            storyImageWeaving: p.story_image_weaving || p.storyImageWeaving || "",
            storyImageQuality: p.story_image_quality || p.storyImageQuality || "",
            storyImageBanner: p.story_image_banner || p.storyImageBanner || "",
            weave: p.weave || "",
            width: p.width || "",
            drapingStyle: p.draping_style || p.drapingStyle || "",
            certification: p.certification || "",
            images,
          } as SareeProduct,
        };
      }
    }
  } catch (err) {
    console.warn("[fetchProductById] API failed:", err);
  }

  const hardcoded = sareeProducts.find((p) => p.id === productId);
  if (hardcoded) {
    return { source: "hardcoded", product: hardcoded };
  }
  return { source: "none", product: null };
}

/**
 * Fetches all products from the PHP backend API first,
 * falls back to localStorage + hardcoded data if API fails.
 */
export async function getAllProducts(): Promise<SareeProduct[]> {
  try {
    const { ok, products } = await fetchFromAPI();
    // If API is reachable and has rows, it is the source of truth (including deletions).
    if (ok && products.length > 0) {
      return sortProductsNewestFirst(products);
    }
    // API unreachable, error body, or empty table → use bundled catalog + localStorage
  } catch (err) {
    console.warn("[getAllProducts] API fetch failed, using local fallback:", err);
  }

  return sortProductsNewestFirst(await getAllProductsLocal());
}

/** Fetch products from PHP backend */
async function fetchFromAPI(): Promise<{ ok: boolean; products: SareeProduct[] }> {
  const res = await fetchWithTimeout(`${API_BASE}/products.php?action=list&_ts=${Date.now()}`, {
    cache: "no-store",
  });
  if (!res.ok) return { ok: false, products: [] };
  const data = await res.json();
  if (!Array.isArray(data)) return { ok: false, products: [] };

  const products = data.map((p: any) => {
    const images = Array.isArray(p.images) ? p.images : [];
    const mainImage = images.find((img: any) => isMainImage(img)) || images[0];
    const imageUrl = getImageUrl(mainImage) || "/placeholder.svg";

    return {
      id: p.product_id || p.id,
      itemName: p.item_name || p.itemName || "Untitled",
      sku: p.sku || "",
      price: Number(p.price) || 0,
      category: p.category || "",
      subcategory: p.subcategory || p.subCategory || "",
      fabric: p.fabric || "",
      image: imageUrl,
      itemNote: p.item_note || p.itemNote || "",
      description: p.description || "",
      createdAt: p.created_at || p.createdAt || undefined,
      updatedAt: p.updated_at || p.updatedAt || undefined,
      // Extended fields for product detail page
      originalPrice: Number(p.original_price || p.originalPrice) || 0,
      longDescription: p.long_description || p.longDescription || "",
      offerPercent: Number(p.offer_percent || p.offerPercent) || 0,
      mapLocation: p.map_location || p.mapLocation || "",
      weight: p.weight || "",
      length: p.length || "",
      blouseIncluded: p.blouse_included || p.blouseIncluded || "",
      careInstructions: p.care_instructions || p.careInstructions || "",
      tags: p.tags || "",
      originStory: p.origin_story || p.originStory || "",
      weavingProcess: p.weaving_process || p.weavingProcess || "",
      qualityAssurance: p.quality_assurance || p.qualityAssurance || "",
      storyImageOrigin: p.story_image_origin || p.storyImageOrigin || "",
      storyImageWeaving: p.story_image_weaving || p.storyImageWeaving || "",
      storyImageQuality: p.story_image_quality || p.storyImageQuality || "",
      storyImageBanner: p.story_image_banner || p.storyImageBanner || "",
      weave: p.weave || "",
      width: p.width || "",
      drapingStyle: p.draping_style || p.drapingStyle || "",
      certification: p.certification || "",
      images,
    } as SareeProduct;
  });
  return { ok: true, products };
}

/** Local fallback using localStorage + hardcoded data */
async function getAllProductsLocal(): Promise<SareeProduct[]> {
  const stored = readAllStored();
  const baseIds = new Set(sareeProducts.map(p => p.id));
  
  const merged: SareeProduct[] = [];

  for (const p of sareeProducts) {
    const s = stored[p.id];
    if (!s) { merged.push(p); continue; }
    merged.push(await storedToSareeProduct(s, p));
  }

  for (const [id, s] of Object.entries(stored)) {
    if (!baseIds.has(id)) {
      merged.push(await storedToSareeProduct(s));
    }
  }

  return merged;
}

/** Synchronous version for places that can't await */
export function getAllProductsSync(): SareeProduct[] {
  const stored = readAllStored();
  const baseIds = new Set(sareeProducts.map(p => p.id));
  
  const merged: SareeProduct[] = sareeProducts.map(p => {
    const s = stored[p.id];
    if (!s) return p;
    return storedToSareeProductSync(s, p);
  });

  for (const [id, s] of Object.entries(stored)) {
    if (!baseIds.has(id)) {
      merged.push(storedToSareeProductSync(s));
    }
  }

  return merged;
}

function readAllStored(): Record<string, StoredProductData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function resolveImageUrl(url: string): Promise<string> {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("idb://")) {
    const idbKey = url.replace("idb://", "");
    try {
      const data = await getImageBlob(idbKey);
      if (data) return data;
    } catch {}
    return "/placeholder.svg";
  }
  return url;
}

async function storedToSareeProduct(s: StoredProductData, base?: SareeProduct): Promise<SareeProduct> {
  const mainImage = s.images.find(img => img.isMain) || s.images[0];
  const rawUrl = mainImage?.url || base?.image || "/placeholder.svg";
  const imageUrl = await resolveImageUrl(rawUrl);

  return {
    id: s.id,
    itemName: s.itemName || base?.itemName || "Untitled",
    sku: s.sku || base?.sku || "",
    price: s.price || base?.price || 0,
    category: s.category || base?.category || "",
    subcategory: s.subcategory || base?.subcategory || "",
    fabric: s.fabric || base?.fabric || "",
    image: imageUrl,
    itemNote: s.itemNote || base?.itemNote || "",
    description: s.description || base?.description || "",
  };
}

function storedToSareeProductSync(s: StoredProductData, base?: SareeProduct): SareeProduct {
  const mainImage = s.images.find(img => img.isMain) || s.images[0];
  const imageUrl = mainImage?.url && !mainImage.url.startsWith("idb://")
    ? mainImage.url
    : base?.image || "/placeholder.svg";

  return {
    id: s.id,
    itemName: s.itemName || base?.itemName || "Untitled",
    sku: s.sku || base?.sku || "",
    price: s.price || base?.price || 0,
    category: s.category || base?.category || "",
    subcategory: s.subcategory || base?.subcategory || "",
    fabric: s.fabric || base?.fabric || "",
    image: imageUrl,
    itemNote: s.itemNote || base?.itemNote || "",
    description: s.description || base?.description || "",
  };
}
