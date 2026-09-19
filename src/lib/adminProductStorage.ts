export interface StoredProductImage {
  id: string;
  url: string;
  isMain: boolean;
}

export interface StoredProductData {
  id: string;
  itemName: string;
  sku: string;
  price: number;
  originalPrice: number;
  category: string;
  subcategory?: string;
  fabric: string;
  description: string;
  longDescription: string;
  itemNote: string;
  images: StoredProductImage[];
  offerPercent: number;
  mapLocation: string;
  weight: string;
  length: string;
  blouseIncluded: string;
  careInstructions: string;
  tags: string;
  originStory: string;
  weavingProcess: string;
  qualityAssurance: string;
  storyImageOrigin: string;
  storyImageWeaving: string;
  storyImageQuality: string;
  storyImageBanner: string;
  weave: string;
  width: string;
  drapingStyle: string;
  certification: string;
  updatedAt: string;
}

const STORAGE_KEY = "athina_admin_products_v1";
const IDB_NAME = "athina_product_images";
const IDB_STORE = "images";
const IDB_VERSION = 1;

function openImageDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveImageBlob(key: string, dataUrl: string): Promise<void> {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(dataUrl, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getImageBlob(key: string): Promise<string | null> {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

function readStorage(): Record<string, StoredProductData> {
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

function writeStorage(data: Record<string, StoredProductData>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getStoredProduct(id: string): StoredProductData | null {
  const all = readStorage();
  return all[id] || null;
}

export function saveStoredProduct(product: StoredProductData) {
  const all = readStorage();
  all[product.id] = product;
  try {
    writeStorage(all);
  } catch {
    const stripped = { ...product, images: product.images.map(img => ({
      ...img,
      url: img.url.startsWith("data:") ? `idb://${product.id}/${img.id}` : img.url,
    }))};
    all[product.id] = stripped;
    writeStorage(all);
  }
}

export async function saveStoredProductWithImages(product: StoredProductData): Promise<void> {
  const imagesSaved = await Promise.all(
    product.images.map(async (img) => {
      if (img.url.startsWith("data:")) {
        const idbKey = `${product.id}/${img.id}`;
        await saveImageBlob(idbKey, img.url);
        return { ...img, url: `idb://${product.id}/${img.id}` };
      }
      return img;
    })
  );
  const toStore = { ...product, images: imagesSaved };
  const all = readStorage();
  all[product.id] = toStore;
  writeStorage(all);
}

export async function getStoredProductWithImages(id: string): Promise<StoredProductData | null> {
  const product = getStoredProduct(id);
  if (!product) return null;
  const resolvedImages = await Promise.all(
    product.images.map(async (img) => {
      if (img.url.startsWith("idb://")) {
        const idbKey = img.url.replace("idb://", "");
        const data = await getImageBlob(idbKey);
        if (data) return { ...img, url: data };
      }
      return img;
    })
  );
  return { ...product, images: resolvedImages };
}

export function normalizeProductImages(images: StoredProductImage[]): StoredProductImage[] {
  if (!images.length) return [];
  const cleaned = images.filter((img) => Boolean(img.url));
  if (!cleaned.length) return [];

  const hasMain = cleaned.some((img) => img.isMain);
  if (hasMain) return cleaned;

  return cleaned.map((img, index) => ({ ...img, isMain: index === 0 }));
}
