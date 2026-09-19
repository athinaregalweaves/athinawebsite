import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { verifyToken, uploadImage, saveProduct } from "@/lib/api";
import { clearAdminSession } from "@/lib/authStorage";
import { sareeProducts, type SareeProduct } from "@/data/sareeData";
import { fetchProductById, getAllProducts } from "@/lib/getAllProducts";
import { nextAthSkuFromCatalog } from "@/lib/productIdentifiers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft, Plus, X, Percent, MapPin, IndianRupee } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getStoredProductWithImages, normalizeProductImages, saveStoredProductWithImages } from "@/lib/adminProductStorage";

interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
  uploadState?: "uploaded" | "failed";
}

const MB = 1024 * 1024;
const MAX_ACCEPT_BYTES = 100 * MB;
const TARGET_UPLOAD_BYTES = 8 * MB;
const MIN_QUALITY = 0.45;
const DEFAULT_IMAGE_MIME = "image/jpeg";
const CUSTOM_CATEGORY_OPTIONS_KEY = "athina_admin_custom_categories_v1";
const CUSTOM_FABRIC_OPTIONS_KEY = "athina_admin_custom_fabrics_v1";
const CUSTOM_SUBCATEGORY_OPTIONS_KEY = "athina_admin_custom_subcategories_v1";

function readStringList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((v) => String(v || "").trim())
      .filter((v) => v.length > 0);
  } catch {
    return [];
  }
}

function writeStringList(key: string, values: string[]) {
  if (typeof window === "undefined") return;
  const seen = new Set<string>();
  const clean: string[] = [];
  for (const v of values) {
    const s = String(v || "").trim();
    if (!s) continue;
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    clean.push(s);
  }
  localStorage.setItem(key, JSON.stringify(clean));
}

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not decode image"));
    };
    img.src = objectUrl;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not encode image"));
        return;
      }
      resolve(blob);
    }, mimeType, quality);
  });

async function compressImageForUpload(file: File): Promise<{ file: File; compressed: boolean }> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`"${file.name}" is not an image file.`);
  }
  if (file.size <= TARGET_UPLOAD_BYTES) {
    return { file, compressed: false };
  }
  if (file.size > MAX_ACCEPT_BYTES) {
    throw new Error(`"${file.name}" is larger than 100MB. Please choose a smaller source file.`);
  }

  const source = await loadImage(file);
  let width = source.naturalWidth || source.width;
  let height = source.naturalHeight || source.height;
  if (!width || !height) {
    throw new Error(`"${file.name}" has invalid dimensions.`);
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is unavailable in this browser.");
  }

  const outputMime = file.type === "image/png" ? "image/jpeg" : (file.type || DEFAULT_IMAGE_MIME);
  let quality = 0.86;
  let bestBlob: Blob | null = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToBlob(canvas, outputMime, quality);
    bestBlob = blob;

    if (blob.size <= TARGET_UPLOAD_BYTES) {
      const ext = outputMime === "image/webp" ? "webp" : "jpg";
      const safeName = file.name.replace(/\.[a-z0-9]+$/i, "");
      return {
        file: new File([blob], `${safeName}-compressed.${ext}`, { type: outputMime }),
        compressed: true,
      };
    }

    quality = Math.max(MIN_QUALITY, quality - 0.08);
    width *= 0.86;
    height *= 0.86;
  }

  if (!bestBlob) {
    throw new Error(`Could not compress "${file.name}".`);
  }

  const ext = outputMime === "image/webp" ? "webp" : "jpg";
  const safeName = file.name.replace(/\.[a-z0-9]+$/i, "");
  return {
    file: new File([bestBlob], `${safeName}-compressed.${ext}`, { type: outputMime }),
    compressed: true,
  };
}

/** Align gallery URLs with list/detail pages (fixes /api/../uploads paths). */
function normalizeImageUrl(url: string): string {
  if (!url) return "";
  const [pathPart, queryPart] = url.split("?");
  const normalizedPath = pathPart
    .replace(/^\/api\/\.\.\//, "/")
    .replace(/\/api\/\.\.\//g, "/")
    .replace(/\/uploads\/+/g, "/uploads/")
    .replace(/\/{2,}/g, "/");
  return queryPart ? `${normalizedPath}?${queryPart}` : normalizedPath;
}

function isMainImageFlag(img: unknown, index: number, all: unknown[]): boolean {
  if (img && typeof img === "object") {
    const o = img as Record<string, unknown>;
    const v = o.isMain ?? o.is_main;
    if (v === true || v === 1 || v === "1" || v === "true") return true;
  }
  if (index !== 0) return false;
  return !all.some((x) => {
    if (!x || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    const v = o.isMain ?? o.is_main;
    return v === true || v === 1 || v === "1" || v === "true";
  });
}

function editorImagesFromFetched(p: SareeProduct & { images?: unknown[] }): ProductImage[] {
  const raw = p.images;
  if (Array.isArray(raw) && raw.length > 0) {
    const mapped: ProductImage[] = [];
    raw.forEach((img, i) => {
      const url =
        typeof img === "string"
          ? img
          : img && typeof img === "object"
            ? (["url", "image", "src", "image_url", "path"] as const)
                .map((k) => (img as Record<string, unknown>)[k])
                .find((v) => typeof v === "string" && (v as string).trim()) ?? ""
            : "";
      if (!url || typeof url !== "string") return;
      mapped.push({
        id: String(
          img && typeof img === "object" && ((img as Record<string, unknown>).id ?? (img as Record<string, unknown>).image_id)
            ? ((img as Record<string, unknown>).id ?? (img as Record<string, unknown>).image_id)
            : `img_${i}`
        ),
        url: normalizeImageUrl(url),
        isMain: isMainImageFlag(img, i, raw),
      });
    });
    return normalizeProductImages(mapped);
  }
  if (p.image) {
    return normalizeProductImages([{ id: "main", url: normalizeImageUrl(String(p.image)), isMain: true }]);
  }
  return [];
}

type ExtendedProduct = SareeProduct & {
  longDescription?: string;
  mapLocation?: string;
  weight?: string;
  length?: string;
  blouseIncluded?: string;
  careInstructions?: string;
  tags?: string;
  originStory?: string;
  weavingProcess?: string;
  qualityAssurance?: string;
  storyImageOrigin?: string;
  storyImageWeaving?: string;
  storyImageQuality?: string;
  storyImageBanner?: string;
  weave?: string;
  width?: string;
  drapingStyle?: string;
  certification?: string;
  images?: unknown[];
};

function applyFetchedProductToForm(
  p: ExtendedProduct,
  setters: {
    setName: (v: string) => void;
    setSku: (v: string) => void;
    setPrice: (v: number | "") => void;
    setOriginalPrice: (v: number) => void;
    setCategory: (v: string) => void;
    setSubcategory: (v: string) => void;
    setFabric: (v: string) => void;
    setDescription: (v: string) => void;
    setItemNote: (v: string) => void;
    setLongDescription: (v: string) => void;
    setImages: (v: ProductImage[]) => void;
    setOfferPercent: (v: number) => void;
    setMapLocation: (v: string) => void;
    setWeight: (v: string) => void;
    setLength: (v: string) => void;
    setBlouseIncluded: (v: string) => void;
    setCareInstructions: (v: string) => void;
    setTags: (v: string) => void;
    setOriginStory: (v: string) => void;
    setWeavingProcess: (v: string) => void;
    setQualityAssurance: (v: string) => void;
    setStoryImageOrigin: (v: string) => void;
    setStoryImageWeaving: (v: string) => void;
    setStoryImageQuality: (v: string) => void;
    setStoryImageBanner: (v: string) => void;
    setWeave: (v: string) => void;
    setWidth: (v: string) => void;
    setDrapingStyle: (v: string) => void;
    setCertification: (v: string) => void;
  }
) {
  const s = setters;
  s.setName(p.itemName || "");
  s.setSku(p.sku || "");
  s.setPrice(p.price ?? 0);
  const op = p.originalPrice && p.originalPrice > 0 ? p.originalPrice : Math.floor(Number(p.price || 0) * 1.25);
  s.setOriginalPrice(op || 0);
  s.setCategory(p.category || "");
  s.setSubcategory((p as any).subcategory || (p as any).subCategory || "");
  s.setFabric(p.fabric || "");
  s.setDescription(p.description || "");
  s.setItemNote(p.itemNote || "");
  s.setLongDescription(p.longDescription || "");
  s.setOfferPercent(Number(p.offerPercent) || 0);
  s.setMapLocation(p.mapLocation || "Jubilee Hills, Hyderabad");
  s.setWeight(p.weight || "");
  s.setLength(p.length || "5.5 meters");
  s.setBlouseIncluded(p.blouseIncluded || "Yes (0.8m unstitched)");
  s.setCareInstructions(p.careInstructions || "Dry clean only. Store in muslin cloth.");
  s.setTags(p.tags || "");
  s.setOriginStory(p.originStory || "");
  s.setWeavingProcess(p.weavingProcess || "");
  s.setQualityAssurance(p.qualityAssurance || "");
  s.setStoryImageOrigin(p.storyImageOrigin || "");
  s.setStoryImageWeaving(p.storyImageWeaving || "");
  s.setStoryImageQuality(p.storyImageQuality || "");
  s.setStoryImageBanner(p.storyImageBanner || "");
  s.setWeave(p.weave || "Handwoven");
  s.setWidth(p.width || "45 inches (approx.)");
  s.setDrapingStyle(p.drapingStyle || "Nivi, Bengali, or Gujarati style");
  s.setCertification(p.certification || "GI Tagged · Handloom Mark");
  s.setImages(editorImagesFromFetched(p));
}

const AdminProductEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Product fields
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState<number | "">(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [fabric, setFabric] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [itemNote, setItemNote] = useState("");
  const [images, setImages] = useState<ProductImage[]>([]);
  const [offerPercent, setOfferPercent] = useState(0);
  
  const [mapLocation, setMapLocation] = useState("Jubilee Hills, Hyderabad");
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("5.5 meters");
  const [blouseIncluded, setBlouseIncluded] = useState("Yes (0.8m unstitched)");
  const [careInstructions, setCareInstructions] = useState("Dry clean only. Store in muslin cloth.");
  const [tags, setTags] = useState("");
  const [originStory, setOriginStory] = useState("");
  const [weavingProcess, setWeavingProcess] = useState("");
  const [qualityAssurance, setQualityAssurance] = useState("");
  const [storyImageOrigin, setStoryImageOrigin] = useState("");
  const [storyImageWeaving, setStoryImageWeaving] = useState("");
  const [storyImageQuality, setStoryImageQuality] = useState("");
  const [storyImageBanner, setStoryImageBanner] = useState("");
  const [weave, setWeave] = useState("Handwoven");
  const [width, setWidth] = useState("45 inches (approx.)");
  const [drapingStyle, setDrapingStyle] = useState("Nivi, Bengali, or Gujarati style");
  const [certification, setCertification] = useState("GI Tagged · Handloom Mark");
  const [returnTo, setReturnTo] = useState("/admin/collections");
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [customCategoryOptions, setCustomCategoryOptions] = useState<string[]>([]);
  const [customSubcategoryOptions, setCustomSubcategoryOptions] = useState<string[]>([]);
  const [customFabricOptions, setCustomFabricOptions] = useState<string[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<SareeProduct[]>([]);

  useEffect(() => {
    setCustomCategoryOptions(readStringList(CUSTOM_CATEGORY_OPTIONS_KEY));
    setCustomSubcategoryOptions(readStringList(CUSTOM_SUBCATEGORY_OPTIONS_KEY));
    setCustomFabricOptions(readStringList(CUSTOM_FABRIC_OPTIONS_KEY));
  }, []);

  const categoryOptions = useMemo(() => {
    const s = new Set(
      [...sareeProducts.map((p) => p.category), ...customCategoryOptions]
        .map((v) => String(v || "").trim())
        .filter((v) => v.length > 0)
    );
    if (category) s.add(String(category));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [category, customCategoryOptions]);

  const fabricOptions = useMemo(() => {
    const s = new Set(
      [...sareeProducts.map((p) => p.fabric), ...customFabricOptions]
        .map((v) => String(v || "").trim())
        .filter((v) => v.length > 0)
    );
    if (fabric) s.add(String(fabric));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [fabric, customFabricOptions]);

  const subcategoryOptions = useMemo(() => {
    const fromCatalog = catalogProducts
      .filter((p) => !category || String(p.category || "").trim() === String(category || "").trim())
      .map((p) => String((p as any).subcategory || "").trim())
      .filter((v) => v.length > 0);
    const s = new Set(
      [
        ...fromCatalog,
        ...customSubcategoryOptions,
      ]
        .map((v) => String(v || "").trim())
        .filter((v) => v.length > 0)
    );
    if (subcategory) s.add(String(subcategory));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [catalogProducts, category, subcategory, customSubcategoryOptions]);

  useEffect(() => {
    if (!subcategory) return;
    if (!subcategoryOptions.some((s) => s.toLowerCase() === subcategory.toLowerCase())) {
      setSubcategory("");
    }
  }, [subcategory, subcategoryOptions]);

  const handleCategorySelect = (value: string) => {
    if (value !== "custom") {
      setCategory(value);
      return;
    }
    const input = window.prompt("Enter custom category");
    const custom = (input || "").trim();
    if (!custom) return;
    setCustomCategoryOptions((prev) => {
      const next = [...prev, custom];
      writeStringList(CUSTOM_CATEGORY_OPTIONS_KEY, next);
      return readStringList(CUSTOM_CATEGORY_OPTIONS_KEY);
    });
    setCategory(custom);
  };

  const handleFabricSelect = (value: string) => {
    if (value !== "custom") {
      setFabric(value);
      return;
    }
    const input = window.prompt("Enter custom fabric");
    const custom = (input || "").trim();
    if (!custom) return;
    setCustomFabricOptions((prev) => {
      const next = [...prev, custom];
      writeStringList(CUSTOM_FABRIC_OPTIONS_KEY, next);
      return readStringList(CUSTOM_FABRIC_OPTIONS_KEY);
    });
    setFabric(custom);
  };

  const handleSubcategorySelect = (value: string) => {
    if (value !== "custom") {
      setSubcategory(value);
      return;
    }
    const input = window.prompt("Enter subcategory");
    const custom = (input || "").trim();
    if (!custom) return;
    setCustomSubcategoryOptions((prev) => {
      const next = [...prev, custom];
      writeStringList(CUSTOM_SUBCATEGORY_OPTIONS_KEY, next);
      return readStringList(CUSTOM_SUBCATEGORY_OPTIONS_KEY);
    });
    setSubcategory(custom);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await verifyToken();
        if (cancelled) return;

        if (isNew) {
          const all = await getAllProducts();
          if (cancelled) return;
          setCatalogProducts(all);
          const nextSku = nextAthSkuFromCatalog(all);
          setSku(nextSku);

          const duplicateFromId = searchParams.get("duplicate")?.trim() || "";
          if (duplicateFromId) {
            const { product: src } = await fetchProductById(duplicateFromId);
            if (cancelled) return;
            if (src) {
              applyFetchedProductToForm(src as ExtendedProduct, {
                setName,
                setSku,
                setPrice,
                setOriginalPrice,
                setCategory,
                setSubcategory,
                setFabric,
                setDescription,
                setItemNote,
                setLongDescription,
                setImages,
                setOfferPercent,
                setMapLocation,
                setWeight,
                setLength,
                setBlouseIncluded,
                setCareInstructions,
                setTags,
                setOriginStory,
                setWeavingProcess,
                setQualityAssurance,
                setStoryImageOrigin,
                setStoryImageWeaving,
                setStoryImageQuality,
                setStoryImageBanner,
                setWeave,
                setWidth,
                setDrapingStyle,
                setCertification,
              });
              setImages([]);
              setSku(nextSku);
              setName(`${src.itemName} (Copy)`);
            } else {
              toast({
                title: "Duplicate failed",
                description: "Could not load the original product. You can still add a new listing.",
                variant: "destructive",
              });
            }
          }
        } else if (!isNew && id) {
          const all = await getAllProducts();
          if (cancelled) return;
          setCatalogProducts(all);

          const { product: remote, source: remoteSource } = await fetchProductById(id);
          if (cancelled) return;

          if (remote) {
            applyFetchedProductToForm(remote as ExtendedProduct, {
              setName,
              setSku,
              setPrice,
              setOriginalPrice,
              setCategory,
              setSubcategory,
              setFabric,
              setDescription,
              setItemNote,
              setLongDescription,
              setImages,
              setOfferPercent,
              setMapLocation,
              setWeight,
              setLength,
              setBlouseIncluded,
              setCareInstructions,
              setTags,
              setOriginStory,
              setWeavingProcess,
              setQualityAssurance,
              setStoryImageOrigin,
              setStoryImageWeaving,
              setStoryImageQuality,
              setStoryImageBanner,
              setWeave,
              setWidth,
              setDrapingStyle,
              setCertification,
            });

            const staticProduct = sareeProducts.find((p) => p.id === id);
            const ld = (remote as ExtendedProduct).longDescription;
            if (staticProduct && !(ld && String(ld).trim())) {
              setLongDescription(
                `${staticProduct.itemName} — a masterfully handcrafted saree from our ${staticProduct.category} collection. Woven with ${staticProduct.fabric} by skilled artisans, this piece embodies the rich textile heritage of India. Perfect for festive occasions, weddings, and celebrations.`
              );
              setOfferPercent(10);
              setOriginStory(
                `This ${staticProduct.fabric} saree traces its lineage to the renowned weaving clusters of Varanasi and Hyderabad — regions that have been the beating heart of India's textile heritage for over five centuries. The silk threads are sourced from the finest mulberry farms of South India, where sericulture has been practised with devotion for generations.\n\nOur artisans belong to families that have woven for royal courts and temple ceremonies. The design vocabulary — from temple borders to peacock motifs — is drawn from centuries-old pattern books known as nakshas, passed down as guarded family heirlooms.`
              );
              setWeavingProcess(
                `The creation begins on a traditional pit loom — a wooden contraption requiring the weaver to sit with legs in a pit below, operating foot pedals with rhythmic precision. For a ${staticProduct.fabric} weave of this complexity, a single saree takes 15 to 45 days. The zari is drawn through pure silver wire coated with gold, creating a luminous sheen.\n\nEach pattern is woven directly into the fabric using the jacquard technique, where every motif requires separate bobbins — sometimes exceeding 5,000 threads working in harmony. A single error means unravelling hours of work. No two handwoven sarees are ever truly identical.\n\nThe finishing involves hand-cutting from the loom, inspection under natural light, and gentle steaming to set the fibres — resulting in fabric that drapes with liquid grace.`
              );
              setQualityAssurance(
                `Every saree undergoes a rigorous 12-point quality inspection. Our ${staticProduct.fabric} sarees carry the prestigious Handloom Mark issued by the Government of India, guaranteeing 100% handwoven authenticity.`
              );
              setWeight("450g");
              setTags(`${staticProduct.category}, ${staticProduct.fabric}`);
            }
          }

          const storedProduct = await getStoredProductWithImages(id);
          if (cancelled) return;
          // Browser drafts (localStorage) must not override live DB rows — that caused wrong SKU/name in Edit.
          if (storedProduct && remoteSource !== "api") {
            setName(storedProduct.itemName || "");
            setSku(storedProduct.sku || "");
            setPrice(storedProduct.price || 0);
            setOriginalPrice(storedProduct.originalPrice || 0);
            setCategory(storedProduct.category || "");
            setSubcategory((storedProduct as any).subcategory || "");
            setFabric(storedProduct.fabric || "");
            setDescription(storedProduct.description || "");
            setLongDescription(storedProduct.longDescription || "");
            setItemNote(storedProduct.itemNote || "");
            setImages(normalizeProductImages(storedProduct.images));
            setOfferPercent(storedProduct.offerPercent || 0);
            setMapLocation(storedProduct.mapLocation || "Jubilee Hills, Hyderabad");
            setWeight(storedProduct.weight || "");
            setLength(storedProduct.length || "5.5 meters");
            setBlouseIncluded(storedProduct.blouseIncluded || "Yes (0.8m unstitched)");
            setCareInstructions(storedProduct.careInstructions || "Dry clean only. Store in muslin cloth.");
            setTags(storedProduct.tags || "");
            setOriginStory(storedProduct.originStory || "");
            setWeavingProcess(storedProduct.weavingProcess || "");
            setQualityAssurance(storedProduct.qualityAssurance || "");
            setStoryImageOrigin(storedProduct.storyImageOrigin || "");
            setStoryImageWeaving(storedProduct.storyImageWeaving || "");
            setStoryImageQuality(storedProduct.storyImageQuality || "");
            setStoryImageBanner(storedProduct.storyImageBanner || "");
            setWeave(storedProduct.weave || "Handwoven");
            setWidth(storedProduct.width || "45 inches (approx.)");
            setDrapingStyle(storedProduct.drapingStyle || "Nivi, Bengali, or Gujarati style");
            setCertification(storedProduct.certification || "GI Tagged · Handloom Mark");
          }
        }

        const from = searchParams.get("from");
        if (from === "bridal") setReturnTo("/admin/bridal");
        else if (from === "tissue") setReturnTo("/admin/tissue");
        else if (from === "linen") setReturnTo("/admin/linen");
        else if (from && /^[a-z0-9][a-z0-9-]{0,62}$/.test(from)) {
          setReturnTo(`/admin/collection/${encodeURIComponent(from)}`);
        }
      } catch {
        clearAdminSession();
        navigate("/admin/login");
        return;
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isNew, navigate, searchParams]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const remainingSlots = Math.max(0, 8 - images.length);
    if (remainingSlots === 0) {
      toast({ title: "Image limit reached", description: "You can add up to 8 images.", variant: "destructive" });
      e.target.value = "";
      return;
    }

    const selectedFiles = Array.from(files).slice(0, remainingSlots);
    setUploadingImages(true);
    let localFallbackCount = 0;
    let firstUploadError: string | null = null;
    const baseTime = Date.now();
    let compressedCount = 0;

    const filesToUpload: File[] = [];
    for (const originalFile of selectedFiles) {
      try {
        const { file: preparedFile, compressed } = await compressImageForUpload(originalFile);
        filesToUpload.push(preparedFile);
        if (compressed) compressedCount += 1;
      } catch (err) {
        toast({
          title: "Image skipped",
          description: err instanceof Error ? err.message : `Could not process "${originalFile.name}".`,
          variant: "destructive",
        });
      }
    }

    if (!filesToUpload.length) {
      setUploadingImages(false);
      e.target.value = "";
      return;
    }

    // Show images immediately (instant UI). Upload completion will replace the URLs.
    const previewImages: ProductImage[] = filesToUpload.map((file, index) => {
      const imageId = `img_${baseTime}_${index}`;
      const previewUrl = URL.createObjectURL(file);
      return { id: imageId, url: previewUrl, isMain: false };
    });

    setImages(prev => normalizeProductImages([...prev, ...previewImages]));

    try {
      await Promise.all(
        filesToUpload.map(async (file, index) => {
          const preview = previewImages[index];
          let didUpload = false;
          try {
            const uploaded = await uploadImage(file);
            // Replace blob preview with hosted URL.
            setImages(prev =>
              prev.map(img => (img.id === preview.id ? { ...img, url: uploaded.url } : img))
            );
            didUpload = true;
          } catch (err) {
            localFallbackCount += 1;
            if (!firstUploadError) {
              firstUploadError = err instanceof Error ? err.message : "Upload failed";
            }
            // Do NOT convert to data: URL (slow). Keep the blob preview, but mark as failed.
            setImages(prev =>
              prev.map(img => (img.id === preview.id ? { ...img, uploadState: "failed" } : img))
            );
          } finally {
            // Revoke only when upload succeeded (we replaced the URL with hosted URL).
            if (didUpload && preview.url.startsWith("blob:")) {
              try {
                URL.revokeObjectURL(preview.url);
              } catch {
                // Best-effort cleanup.
              }
            }
          }
        })
      );

      toast({
        title: "Images added",
        description: localFallbackCount > 0
          ? `${filesToUpload.length} added (${localFallbackCount} stored locally due to upload issue).${firstUploadError ? ` First error: ${firstUploadError}` : ""}`
          : `${filesToUpload.length} uploaded successfully.${compressedCount > 0 ? ` Auto-compressed: ${compressedCount}.` : ""}`,
      });
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const removeImage = (imgId: string) => {
    setImages(prev => {
      const removed = prev.find(i => i.id === imgId);
      if (removed?.url?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(removed.url);
        } catch {}
      }
      const filtered = prev.filter(i => i.id !== imgId);
      if (filtered.length > 0 && !filtered.some(i => i.isMain)) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  const setMainImage = (imgId: string) => {
    setImages(prev => prev.map(i => ({ ...i, isMain: i.id === imgId })));
  };

  const handleSave = async () => {
    if (!name?.trim()) {
      toast({ title: "Missing fields", description: "Product name is required.", variant: "destructive" });
      return;
    }
    if (!sku?.trim()) {
      toast({ title: "Missing fields", description: "SKU is missing. Reload the page to generate one.", variant: "destructive" });
      return;
    }

    if (price === "" || price === undefined || price === null) {
      toast({ title: "Missing fields", description: "Selling Price is required. Please fill in the Pricing section.", variant: "destructive" });
      return;
    }

    const storageId = !isNew && id ? id : (sku.trim() || name.trim().toLowerCase().replace(/\s+/g, "-"));
    if (!storageId) {
      toast({ title: "Missing fields", description: "Please provide a product identifier (SKU).", variant: "destructive" });
      return;
    }

    setSaving(true);
    const normalizedImages = normalizeProductImages(images);

    // Filter out data: URLs for API (only send hosted URLs)
    const apiImages = normalizedImages.map(img => ({
      id: img.id,
      url: img.url.startsWith("data:") || img.url.startsWith("blob:") ? "" : img.url,
      isMain: img.isMain,
    })).filter(img => img.url);

    const hasUnuploadedImages = normalizedImages.some(
      img => img.url.startsWith("data:") || img.url.startsWith("blob:") || img.uploadState === "failed"
    );
    if (hasUnuploadedImages) {
      toast({
        title: "Upload failed for some images",
        description: "Please re-upload the failed images. Save Product is blocked until all images are hosted on the server.",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    const productPayload = {
      product_id: storageId,
      item_name: name,
      sku,
      price,
      original_price: originalPrice,
      category,
      subcategory,
      fabric,
      description,
      long_description: longDescription,
      item_note: itemNote,
      images: apiImages,
      offer_percent: offerPercent,
      map_location: mapLocation,
      weight,
      length,
      blouse_included: blouseIncluded,
      care_instructions: careInstructions,
      tags,
      origin_story: originStory,
      weaving_process: weavingProcess,
      quality_assurance: qualityAssurance,
      story_image_origin: storyImageOrigin,
      story_image_weaving: storyImageWeaving,
      story_image_quality: storyImageQuality,
      story_image_banner: storyImageBanner,
      weave,
      width,
      draping_style: drapingStyle,
      certification,
    };

    try {
      // Save to backend first (this is what matters for Home/Collections).
      // Local IndexedDB write can be expensive, so do it without blocking the UI.
      const localPayload = {
        id: storageId,
        itemName: name,
        sku,
        price,
        originalPrice,
        category,
        subcategory,
        fabric,
        description,
        longDescription,
        itemNote,
        images: normalizedImages,
        offerPercent,
        mapLocation,
        weight,
        length,
        blouseIncluded,
        careInstructions,
        tags,
        originStory,
        weavingProcess,
        qualityAssurance,
        storyImageOrigin,
        storyImageWeaving,
        storyImageQuality,
        storyImageBanner,
        weave,
        width,
        drapingStyle,
        certification,
        updatedAt: new Date().toISOString(),
      };
      await saveProduct(productPayload);
      console.log("[AdminProductEditor] Product synced to backend:", storageId);

      void saveStoredProductWithImages(localPayload)
        .then(() => console.log("[AdminProductEditor] Product saved locally:", storageId))
        .catch(() => {});

      toast({ title: "Product saved!", description: `${name} has been synced to Hostinger successfully.` });
      navigate(returnTo);
    } catch (err) {
      console.error("[AdminProductEditor] Save failed:", err);
      const description = err instanceof Error && err.message
        ? `${err.message}. Local draft is still saved on this device.`
        : "Could not save product to Hostinger database. Local draft is still saved on this device.";
      toast({ title: "Save failed", description, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const clampOfferPercent = (v: number) => Math.max(0, Math.min(90, v));
  const calcOfferPercentFromPrices = (sp: number, op: number) => {
    if (op <= 0) return 0;
    const raw = ((op - sp) / op) * 100;
    if (!Number.isFinite(raw)) return 0;
    return clampOfferPercent(Math.round(raw));
  };
  const calcSellingPriceFromOffer = (op: number, percent: number) => {
    if (op <= 0) return 0;
    const p = clampOfferPercent(percent);
    return Math.max(0, Math.round(op * (1 - p / 100)));
  };

  const numericPrice = typeof price === "number" ? price : 0;
  // Selling price (SP) is what you want the customer to pay.
  // We keep SP/OP/Offer% always consistent in the input handlers below.
  const discountedPrice = numericPrice;

  if (loading) {
    return <AdminLayout><div className="flex items-center justify-center h-full"><p className="font-body text-lg text-foreground/50">Loading...</p></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="px-8 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(returnTo)} className="text-foreground/50 hover:text-foreground">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-semibold text-foreground">
              {isNew ? (searchParams.get("duplicate") ? "Duplicate Saree" : "Add New Saree") : "Edit Saree"}
            </h1>
            <p className="font-body text-base text-foreground/50 mt-1">
              {isNew
                ? searchParams.get("duplicate")
                  ? "Copied details without images — add photos, then save"
                  : "Fill in all details for the new listing"
                : `Editing: ${name}`}
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving || uploadingImages} className="bg-maroon hover:bg-maroon-light text-ivory font-body text-sm h-11 px-8">
            <Save size={16} className="mr-2" /> Save Product
          </Button>
        </div>

        {/* ===== IMAGES SECTION ===== */}
        <div className="bg-background border border-border p-6 shadow-sm mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-1">Product Images</h2>
          <p className="font-body text-sm text-foreground/40 mb-6">Add up to 8 images. Click an image to set as thumbnail.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {images.map((img) => (
              <div key={img.id} className={`relative aspect-[3/4] border-2 overflow-hidden cursor-pointer group ${img.isMain ? "border-maroon" : "border-border hover:border-gold/50"}`}
                onClick={() => setMainImage(img.id)}>
                <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                {img.isMain && (
                  <div className="absolute top-2 left-2 bg-maroon text-ivory px-2 py-0.5">
                    <span className="font-body text-[10px] uppercase tracking-wider font-normal">Thumbnail</span>
                  </div>
                )}
                <button onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-background/90 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={14} className="text-destructive" />
                </button>
              </div>
            ))}

            {images.length < 8 && (
              <label className="aspect-[3/4] border-2 border-dashed border-border bg-cream flex flex-col items-center justify-center cursor-pointer hover:border-gold/50 transition-colors">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                <Plus size={28} className="text-foreground/20 mb-2" />
                <span className="font-body text-xs text-foreground/30">{uploadingImages ? "Uploading..." : "Add Images"}</span>
              </label>
            )}
          </div>
          <p className="font-body text-xs text-foreground/30">{images.length}/8 images uploaded. Click image to set as main thumbnail.</p>
        </div>

        {/* ===== BASIC DETAILS ===== */}
        <div className="bg-background border border-border p-6 shadow-sm mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-6">Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Product Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-ivory-warm border-border text-foreground text-base h-12" placeholder="e.g. Handloom Banarasi Silk" />
            </div>
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">SKU Code</label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                readOnly={isNew}
                title={isNew ? "SKU is generated automatically for new products" : undefined}
                className={`bg-ivory-warm border-border text-foreground text-base h-12 font-mono ${isNew ? "opacity-90 cursor-default" : ""}`}
                placeholder={isNew ? "Auto-generated" : "e.g. ATH_16"}
              />
              {isNew && (
                <p className="font-body text-xs text-foreground/45 mt-1">Assigned automatically (ATH_…) from your catalog. Editable after save from Edit.</p>
              )}
            </div>
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Item Note</label>
              <Input value={itemNote} onChange={(e) => setItemNote(e.target.value)} className="bg-ivory-warm border-border text-foreground text-base h-12" placeholder="e.g. HL KORA/151-5230" />
            </div>
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Tags</label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} className="bg-ivory-warm border-border text-foreground text-base h-12" placeholder="e.g. Bridal, Wedding, Silk" />
            </div>
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Category</label>
              <Select value={category} onValueChange={handleCategorySelect}>
                <SelectTrigger className="bg-ivory-warm border-border text-foreground text-base h-12"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(c => <SelectItem key={c} value={c} className="text-base">{c}</SelectItem>)}
                  <SelectItem value="custom" className="text-base">+ Add Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Subcategory</label>
              <Select value={subcategory} onValueChange={handleSubcategorySelect}>
                <SelectTrigger className="bg-ivory-warm border-border text-foreground text-base h-12"><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                <SelectContent>
                  {subcategoryOptions.map(s => <SelectItem key={s} value={s} className="text-base">{s}</SelectItem>)}
                  <SelectItem value="custom" className="text-base">+ Add Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Fabric</label>
              <Select value={fabric} onValueChange={handleFabricSelect}>
                <SelectTrigger className="bg-ivory-warm border-border text-foreground text-base h-12"><SelectValue placeholder="Select fabric" /></SelectTrigger>
                <SelectContent>
                  {fabricOptions.map(f => <SelectItem key={f} value={f} className="text-base">{f}</SelectItem>)}
                  <SelectItem value="custom" className="text-base">+ Add Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ===== DESCRIPTION ===== */}
        <div className="bg-background border border-border p-6 shadow-sm mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-6">Description</h2>
          <div className="space-y-5">
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Short Description (Card Preview)</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-ivory-warm border-border text-foreground text-base min-h-[80px]" placeholder="Brief description shown on product cards..." />
            </div>
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Full Product Description</label>
              <Textarea value={longDescription} onChange={(e) => setLongDescription(e.target.value)} className="bg-ivory-warm border-border text-foreground text-base min-h-[160px]" placeholder="Detailed description for the product page..." />
            </div>
          </div>
        </div>

        {/* ===== CRAFT STORY (Editable Sections) ===== */}
        <div className="bg-background border border-border p-6 shadow-sm mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-1">Craft Story Sections</h2>
          <p className="font-body text-sm text-foreground/40 mb-6">These appear as storytelling sections on the product page. Select an image for each section from your uploaded gallery.</p>
          <div className="space-y-8">

            {/* Story Image Picker Component */}
            {[
              { label: "Hero Banner Image", desc: "Full-width banner shown at the top of the story section", value: storyImageBanner, setter: setStoryImageBanner },
              { label: "Origin & Heritage", desc: "Shown alongside the origin story text", value: storyImageOrigin, setter: setStoryImageOrigin, textarea: true, textValue: originStory, textSetter: setOriginStory, textPlaceholder: "Tell the origin story of this saree — where the silk comes from, the weaving region, the artisan heritage..." },
              { label: "The Weaving Process", desc: "Shown alongside the weaving process text", value: storyImageWeaving, setter: setStoryImageWeaving, textarea: true, textValue: weavingProcess, textSetter: setWeavingProcess, textPlaceholder: "Describe the weaving technique — pit loom, jacquard, zari work, time taken, thread count..." },
              { label: "Quality & Assurance", desc: "Shown alongside the quality assurance text", value: storyImageQuality, setter: setStoryImageQuality, textarea: true, textValue: qualityAssurance, textSetter: setQualityAssurance, textPlaceholder: "Describe quality checks, certifications (GI Tag, Handloom Mark), thread purity, sustainability..." },
            ].map(({ label, desc, value, setter, textarea, textValue, textSetter, textPlaceholder }) => (
              <div key={label} className="border border-border/50 p-5 bg-cream/30">
                <label className="font-body text-sm font-normal text-foreground/70 mb-1 block">{label}</label>
                <p className="font-body text-xs text-foreground/30 mb-3">{desc}</p>

                {/* Image Selector */}
                <div className="mb-4">
                  <p className="font-body text-xs font-normal text-foreground/50 mb-2 uppercase tracking-wider">Select Image</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setter("")}
                      className={`w-16 h-20 border-2 flex items-center justify-center text-xs font-body transition-all ${
                        !value ? "border-maroon bg-maroon/5 text-maroon" : "border-border bg-background text-foreground/30 hover:border-foreground/30"
                      }`}
                    >
                      Auto
                    </button>
                    {images.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setter(img.url)}
                        className={`w-16 h-20 overflow-hidden border-2 transition-all ${
                          value === img.url ? "border-maroon ring-1 ring-maroon" : "border-border opacity-50 hover:opacity-80"
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  {value && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-8 h-10 overflow-hidden border border-maroon">
                        <img src={value} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-body text-xs text-foreground/40">Selected</span>
                    </div>
                  )}
                </div>

                {/* Text Area (if applicable) */}
                {textarea && textSetter && (
                  <Textarea value={textValue} onChange={(e) => textSetter(e.target.value)} className="bg-ivory-warm border-border text-foreground text-base min-h-[120px]" placeholder={textPlaceholder} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===== PRICING & OFFERS ===== */}
        <div className="bg-background border border-border p-6 shadow-sm mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <IndianRupee size={20} className="text-gold-dark" /> Pricing & Offers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Selling Price (₹)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setPrice("");
                    setOfferPercent(0);
                    return;
                  }
                  const v = parseInt(raw) || 0;
                  setPrice(v);
                  // If OP is available, auto-calculate discount% from SP and OP.
                  setOfferPercent(originalPrice > 0 ? calcOfferPercentFromPrices(v, originalPrice) : 0);
                }}
                className="bg-ivory-warm border-border text-foreground text-lg h-12 font-normal tabular-nums"
              />
            </div>
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Original Price (₹)</label>
              <Input
                type="number"
                value={originalPrice}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 0;
                  setOriginalPrice(v);
                  // If SP is available, auto-calculate discount% from SP and OP.
                  if (v > 0 && typeof price === "number") {
                    setOfferPercent(calcOfferPercentFromPrices(price, v));
                  } else {
                    setOfferPercent(0);
                  }
                }}
                className="bg-ivory-warm border-border text-foreground text-base h-12"
              />
            </div>
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 flex items-center gap-1">
                <Percent size={14} /> Offer Discount (%)
              </label>
              <Input
                type="number"
                value={offerPercent}
                onChange={(e) => {
                  const v = clampOfferPercent(parseInt(e.target.value) || 0);
                  setOfferPercent(v);
                  // If OP is available, auto-calculate SP from OP and discount%.
                  if (originalPrice > 0) {
                    setPrice(calcSellingPriceFromOffer(originalPrice, v));
                  }
                }}
                className="bg-ivory-warm border-border text-foreground text-base h-12"
                min={0}
                max={90}
              />
            </div>
          </div>

          {/* Price Preview */}
          <div className="mt-6 p-4 bg-cream border border-border">
            <p className="font-body text-xs text-foreground/40 uppercase tracking-wider mb-2">Customer sees:</p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-amount text-2xl text-maroon">₹{discountedPrice.toLocaleString("en-IN")}</span>
              {offerPercent > 0 && (
                <>
                  <span className="font-amount-muted text-base text-foreground/40 line-through">₹{originalPrice.toLocaleString("en-IN")}</span>
                  <span className="font-amount-muted text-sm text-green-700 bg-green-50 px-2 py-0.5">{offerPercent}% OFF</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ===== PRODUCT SPECS ===== */}
        <div className="bg-background border border-border p-6 shadow-sm mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-6">Product Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Weight</label>
              <Input value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-ivory-warm border-border text-foreground text-base h-12" placeholder="e.g. 450g" />
            </div>
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Length</label>
              <Input value={length} onChange={(e) => setLength(e.target.value)} className="bg-ivory-warm border-border text-foreground text-base h-12" placeholder="e.g. 5.5 meters" />
            </div>
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Blouse Piece</label>
              <Input value={blouseIncluded} onChange={(e) => setBlouseIncluded(e.target.value)} className="bg-ivory-warm border-border text-foreground text-base h-12" />
            </div>
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Weave Type</label>
              <Input value={weave} onChange={(e) => setWeave(e.target.value)} className="bg-ivory-warm border-border text-foreground text-base h-12" placeholder="e.g. Handwoven" />
            </div>
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Width</label>
              <Input value={width} onChange={(e) => setWidth(e.target.value)} className="bg-ivory-warm border-border text-foreground text-base h-12" placeholder="e.g. 45 inches (approx.)" />
            </div>
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Draping Style</label>
              <Input value={drapingStyle} onChange={(e) => setDrapingStyle(e.target.value)} className="bg-ivory-warm border-border text-foreground text-base h-12" placeholder="e.g. Nivi, Bengali, or Gujarati style" />
            </div>
            <div>
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Certification</label>
              <Input value={certification} onChange={(e) => setCertification(e.target.value)} className="bg-ivory-warm border-border text-foreground text-base h-12" placeholder="e.g. GI Tagged · Handloom Mark" />
            </div>
            <div className="md:col-span-2">
              <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Care Instructions</label>
              <Textarea value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} className="bg-ivory-warm border-border text-foreground text-base min-h-[100px]" placeholder="Each line becomes a bullet point on the product page..." />
            </div>
          </div>
        </div>

        {/* ===== LOCATION / MAP ===== */}
        <div className="bg-background border border-border p-6 shadow-sm mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <MapPin size={20} className="text-maroon" /> Store Location
          </h2>
          <div>
            <label className="font-body text-sm font-normal text-foreground/70 mb-2 block">Map Location / Address</label>
            <Input value={mapLocation} onChange={(e) => setMapLocation(e.target.value)} className="bg-ivory-warm border-border text-foreground text-base h-12" placeholder="e.g. Jubilee Hills, Hyderabad" />
          </div>
          <div className="mt-4 bg-cream border border-border h-48 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={32} className="text-foreground/20 mx-auto mb-2" />
              <p className="font-body text-sm text-foreground/30">{mapLocation}</p>
              <p className="font-body text-xs text-foreground/20 mt-1">Map preview will show after deployment</p>
            </div>
          </div>
        </div>

        {/* Save Button Bottom */}
        <div className="flex justify-end gap-4 mt-8 mb-12">
          <Button variant="outline" onClick={() => navigate(returnTo)} className="border-border text-foreground/60 h-12 px-8 text-base">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || uploadingImages} className="bg-maroon hover:bg-maroon-light text-ivory font-body text-base h-12 px-10">
            <Save size={16} className="mr-2" /> Save Product
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductEditor;
