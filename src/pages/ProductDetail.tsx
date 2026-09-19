import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { type SareeProduct } from "@/data/sareeData";
import { fetchProductById, getAllProducts } from "@/lib/getAllProducts";
import { getSimilarProducts } from "@/lib/productUtils";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import SareeCard from "@/components/SareeCard";
import { useWishlist } from "@/hooks/useWishlist";
import {
  Heart, ShoppingBag, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Ruler, Shield, Truck, Star, Award, Leaf, Package,
  Clock, Gem, CheckCircle2, ChevronDown, MapPin, Scissors, X,
  Sparkles, Play, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/env";
import { getStoredCustomer, isCustomerLoggedIn } from "@/lib/customerApi";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<SareeProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [hoverPreviewImage, setHoverPreviewImage] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [allProductsForSimilar, setAllProductsForSimilar] = useState<SareeProduct[]>([]);
  const { isWishlisted, toggleItem } = useWishlist();
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewLocation, setReviewLocation] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [userReviews, setUserReviews] = useState<
    Array<{ id: string; name: string; rating: number; text: string; date: string; location: string; }>
  >([]);

  // reviews list is sourced from backend; no static placeholder reviews when using DB.
  const reviews = [...userReviews];
  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  useEffect(() => {
    const customer = getStoredCustomer();
    if (customer?.name) setReviewName(customer.name);
  }, []);

  useEffect(() => {
    setSelectedImage(0);
    setZoomed(false);
    setLoading(true);
    if (id) {
      fetchProductById(id).then(({ product: fetched }) => {
        setProduct(fetched);
        if (fetched) {
          // Build gallery from images array if available
          const imgs = (fetched as any).images;
          if (Array.isArray(imgs) && imgs.length > 0) {
            const urls = imgs
              .map((img: any) => img?.url || img?.image || img?.src || img?.image_url || img?.imageUrl || "")
              .map((u: string) =>
                // Fix broken paths stored earlier like `/api/../uploads//file.jpg`
                u
                  ? u
                      .replace(/^\/api\/\.\.\//, "/")
                      .replace(/\/api\/\.\.\//g, "/")
                      .replace(/\/uploads\/+/g, "/uploads/")
                      .replace(/\/{2,}/g, "/")
                  : u
              )
              .filter((u: any) => typeof u === "string" && u.trim().length > 0);
            if (urls.length > 0) setGalleryImages(urls);
            else setGalleryImages([fetched.image]);
          } else {
            setGalleryImages([fetched.image]);
          }
        }
        setLoading(false);
      }).catch(() => { setProduct(null); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [id]);

  // Load latest products so "You May Also Love" uses current images from API/admin.
  useEffect(() => {
    getAllProducts().then(setAllProductsForSimilar).catch(() => setAllProductsForSimilar([]));
  }, []);

  // Load reviews from backend (DB). Falls back to localStorage only if API fails.
  useEffect(() => {
    if (!id) return;
    const loadReviews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/reviews.php?action=list&product_id=${encodeURIComponent(String(id))}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            // Normalize keys for UI.
            setUserReviews(
              data
                .map((r: any) => ({
                  id: String(r.id ?? Date.now()),
                  name: String(r.name ?? "Anonymous"),
                  rating: Number(r.rating ?? 5),
                  text: String(r.text ?? r.review_text ?? ""),
                  date: String(r.date ?? ""),
                  location: String(r.location ?? ""),
                }))
                .filter((r: any) => r.text.length > 0)
            );
            return;
          }
        }
      } catch {
        // ignore and fallback below
      }

      // Fallback: load local cached reviews (legacy / offline).
      try {
        const raw = localStorage.getItem(`athina_reviews_${id}`);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setUserReviews(parsed);
      } catch {}
    };

    loadReviews();
  }, [id]);

  // Sticky CTA observer
  useEffect(() => {
    if (!ctaRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCTA(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, []);

  const images = product
    ? (galleryImages.length > 0 ? galleryImages : [product.image])
    : [];
  const activeImageIndex = hoverPreviewImage ?? selectedImage;
  const navState = (location.state as { fromPath?: string; fromScrollY?: number } | null) || null;
  const cameFromCollections = navState?.fromPath === "/collections";
  const collectionsBackState = {
    preserveScroll: true,
    restoreScrollY: Number(navState?.fromScrollY || 0),
  };

  useEffect(() => {
    images.forEach((src) => { const img = new Image(); img.src = src; });
  }, [images.length]);

  if (loading) {
    return (
      <main className="pt-24 md:pt-28 editorial-spacing text-center luxury-container">
        <p className="font-body text-lg text-foreground/50">Loading...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pt-24 md:pt-28 editorial-spacing text-center luxury-container">
        <h1 className="luxury-heading">Product Not Found</h1>
        <Link
          to="/collections"
          state={cameFromCollections ? collectionsBackState : undefined}
          className="luxury-btn mt-8 inline-block"
        >
          Back to Collections
        </Link>
      </main>
    );
  }

  const similar = getSimilarProducts(product, 4, allProductsForSimilar);

  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleAddToCart = () => {
    addItem(product);
    toast({ title: "Added to Bag", description: `${displayName} has been added to your shopping bag` });
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = reviewText.trim();
    const customer = getStoredCustomer();
    const trimmedName = (customer?.name || reviewName).trim();
    const trimmedLocation = reviewLocation.trim();

    if (!id) return;
    if (!isCustomerLoggedIn() || !customer) {
      toast({
        title: "Sign in required",
        description: "Please create account / sign in to add a review.",
        variant: "destructive",
      });
      setReviewModalOpen(false);
      navigate("/login");
      return;
    }
    if (!reviewRating) {
      toast({ title: "Rating required", description: "Please select star rating.", variant: "destructive" });
      return;
    }
    if (!trimmedText) {
      toast({ title: "Review required", description: "Please write something before submitting.", variant: "destructive" });
      return;
    }

    const payload = {
      product_id: String(id),
      rating: Math.max(1, Math.min(5, reviewRating)),
      name: trimmedName,
      location: trimmedLocation,
      text: trimmedText,
    };

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/reviews.php?action=add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || "Failed to submit review");

        // Refresh reviews from DB after successful submit.
        const listRes = await fetch(
          `${API_BASE_URL}/reviews.php?action=list&product_id=${encodeURIComponent(String(id))}&_ts=${Date.now()}`,
          { headers: { "Content-Type": "application/json" } }
        );
        const listJson = await listRes.json().catch(() => []);
        if (Array.isArray(listJson)) {
          setUserReviews(
            listJson
              .map((r: any) => ({
                id: String(r.id ?? Date.now()),
                name: String(r.name ?? "Anonymous"),
                rating: Number(r.rating ?? 5),
                text: String(r.text ?? r.review_text ?? ""),
                date: String(r.date ?? ""),
                location: String(r.location ?? ""),
              }))
              .filter((r: any) => r.text.length > 0)
          );
        }

        setReviewModalOpen(false);
        setReviewText("");
        setReviewLocation("");
        setReviewRating(0);
        toast({ title: "Review submitted!", description: "Thanks for sharing your feedback." });
      } catch (err) {
        // If backend fails, keep existing local behavior as a fallback.
        const next = [
          ...userReviews,
          {
            id: `${Date.now()}`,
            name: trimmedName,
            rating: payload.rating,
            text: trimmedText,
            date: "Just now",
            location: trimmedLocation || "Hyderabad",
          },
        ];
        setUserReviews(next);
        try {
          localStorage.setItem(`athina_reviews_${id}`, JSON.stringify(next));
        } catch {}
        setReviewModalOpen(false);
        setReviewText("");
        setReviewLocation("");
        setReviewRating(0);
        toast({
          title: "Saved locally (DB failed)",
          description: err instanceof Error ? err.message : "Please submit again later.",
          variant: "destructive",
        });
      }
    })();
  };

  const p = product as any;
  const openReviewModal = () => {
    const customer = getStoredCustomer();
    if (!isCustomerLoggedIn() || !customer) {
      toast({
        title: "Sign in required",
        description: "Please create account / sign in to give rating and review.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    setReviewName(customer.name || "");
    setReviewModalOpen(true);
  };

  const displayName = p.itemName;
  const displayCategory = p.category;
  const displayFabric = p.fabric;
  const displayItemNote = p.itemNote;
  const displayPrice = p.price;
  const rawOriginalPrice = typeof p.originalPrice === "number" && p.originalPrice > 0 ? p.originalPrice : 0;
  const rawOfferPercent = typeof p.offerPercent === "number" && p.offerPercent > 0 ? Math.max(0, Math.min(90, Math.round(p.offerPercent))) : 0;

  // If original price is missing but offer % exists, derive it so the UI stays consistent.
  const derivedOriginalPrice =
    rawOriginalPrice > 0
      ? rawOriginalPrice
      : rawOfferPercent > 0 && rawOfferPercent < 100
        ? Math.round(displayPrice / (1 - rawOfferPercent / 100))
        : 0;

  const displayOriginalPrice = derivedOriginalPrice;
  const displayOfferPercent =
    displayOriginalPrice > 0
      ? Math.max(0, Math.min(90, Math.round((1 - displayPrice / displayOriginalPrice) * 100)))
      : 0;
  const description = p.description || "";
  const longDescription = p.longDescription || "";
  const displayWeight = p.weight || "450–600 grams (varies by weave)";
  const displayLength = p.length || "5.5 meters (approx.)";
  const displayBlouse = p.blouseIncluded || "0.8 meters unstitched blouse piece included";
  const displayCareRaw = p.careInstructions || "Dry clean recommended for first wash\nHand wash separately in cold water with mild detergent\nDo not bleach or wring\nDry in shade, avoid direct sunlight\nIron on low heat with a cloth between\nStore folded with tissue paper in a breathable cover";
  const careInstructions = displayCareRaw.split("\n").map((s: string) => s.trim()).filter(Boolean);
  const occasionTags = p.tags
    ? p.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    : ["Wedding", "Bridal", "Festive", "Reception", "Puja"];

  const displayWeave = p.weave || "Handwoven";
  const displayWidth = p.width || "45 inches (approx.)";
  const displayDrapingStyle = p.drapingStyle || "Nivi, Bengali, or Gujarati style";
  const displayCertification = p.certification || "GI Tagged · Handloom Mark";
  const storyImageBanner = p.storyImageBanner || "";
  const storyImageOrigin = p.storyImageOrigin || "";
  const storyImageWeaving = p.storyImageWeaving || "";
  const storyImageQuality = p.storyImageQuality || "";
  const originStory = p.originStory || "";
  const weavingProcess = p.weavingProcess || "";
  const qualityAssurance = p.qualityAssurance || "";
  const hasOriginStorySection = Boolean(originStory.trim() || storyImageOrigin.trim());
  const hasWeavingSection = Boolean(weavingProcess.trim() || storyImageWeaving.trim());
  const hasQualitySection = Boolean(qualityAssurance.trim() || storyImageQuality.trim());

  const details = [
    { label: "Fabric", value: displayFabric },
    { label: "Category", value: displayCategory },
    { label: "Weave", value: displayWeave },
    { label: "Weight", value: displayWeight },
    { label: "Length", value: displayLength },
    { label: "Blouse Piece", value: displayBlouse },
    { label: "Occasion", value: occasionTags.join(", ") },
    { label: "Certification", value: displayCertification },
  ];

  const sizeGuide = [
    { key: "Length", value: displayLength },
    { key: "Width", value: displayWidth },
    { key: "Blouse", value: displayBlouse },
    { key: "Weight", value: displayWeight },
    { key: "Draping", value: displayDrapingStyle },
  ];

  return (
    <main className="overflow-x-hidden pt-20 md:pt-24 bg-background product-detail-readable">

      {/* ── Breadcrumb — aligned with product copy column on mobile ── */}
      <div className="luxury-container py-3 md:py-5">
        <nav className="flex items-center gap-1.5 font-body text-[11px] tracking-wider text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors duration-300">Home</Link>
          <ChevronRight size={10} className="text-border" />
          <Link
            to="/collections"
            state={cameFromCollections ? collectionsBackState : undefined}
            className="hover:text-foreground transition-colors duration-300"
          >
            Collections
          </Link>
          <ChevronRight size={10} className="text-border" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{displayName}</span>
        </nav>
      </div>


      {/* Review modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-[60] bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-background border border-border shadow-xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">Write a review</h3>
                <p className="font-body text-sm text-foreground/60 mt-1">Share your experience with this saree.</p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="w-10 h-10 rounded-full border border-border hover:bg-secondary/60 transition-colors flex items-center justify-center"
                aria-label="Close review modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitReview} className="px-6 py-5 space-y-5">
              <div>
                <p className="font-body text-sm font-bold text-foreground mb-2">Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s)}
                      className="transition-colors"
                      aria-label={`Set rating ${s}`}
                    >
                      <Star
                        size={22}
                        className={s <= reviewRating ? "fill-accent text-accent" : "text-border"}
                      />
                    </button>
                  ))}
                </div>
                {reviewRating === 0 ? (
                  <p className="font-body text-xs text-muted-foreground mt-2">Tap stars to set rating</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm font-bold text-foreground/70">Name</label>
                  <input
                    value={reviewName}
                    readOnly
                    className="mt-2 w-full bg-secondary/40 border border-border h-11 px-3 rounded-sm text-foreground"
                    placeholder="Name from account"
                  />
                </div>
                <div>
                  <label className="font-body text-sm font-bold text-foreground/70">Location</label>
                  <input
                    value={reviewLocation}
                    onChange={(e) => setReviewLocation(e.target.value)}
                    className="mt-2 w-full bg-secondary/40 border border-border h-11 px-3 rounded-sm text-foreground"
                    placeholder="City (optional)"
                  />
                </div>
              </div>

              <div>
                <label className="font-body text-sm font-bold text-foreground/70">Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="mt-2 w-full bg-secondary/40 border border-border px-3 py-2 rounded-sm text-foreground min-h-[120px]"
                  placeholder="Write your review..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 border border-border hover:bg-secondary/60 transition-colors font-body text-sm font-bold text-foreground/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-maroon hover:bg-maroon-light transition-colors font-body text-sm font-bold text-ivory"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  SECTION 1 — HERO: Gallery (edge-to-edge mobile) + Product Info */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="pb-12 md:pb-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2 lg:gap-16">
          {/* ── Gallery ── */}
          <div className="flex w-full min-w-0 gap-0 md:gap-3">
            {/* Vertical Thumbnails (Desktop) */}
            {images.length > 1 && (
              <div
                className="hidden md:flex flex-col gap-2.5 max-h-[720px] overflow-y-auto shrink-0 pr-1 hide-scrollbar"
                onMouseLeave={() => setHoverPreviewImage(null)}
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    onMouseEnter={() => setHoverPreviewImage(i)}
                    className={`w-[72px] h-[90px] shrink-0 overflow-hidden transition-all duration-300 border ${
                      activeImageIndex === i
                        ? "border-accent opacity-100 shadow-sm"
                        : "border-transparent opacity-40 hover:opacity-75"
                    }`}
                  >
                    <img src={img} alt={`${displayName} view ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image — full-bleed width on mobile */}
            <div className="min-w-0 flex-1 w-full">
              <div
                ref={imageRef}
                className="relative aspect-[3/4] w-full overflow-hidden bg-secondary/30 cursor-crosshair group md:rounded-sm"
                onClick={() => setZoomed(!zoomed)}
                onMouseMove={handleZoomMove}
                onMouseLeave={() => zoomed && setZoomed(false)}
              >
                <img
                  src={images[activeImageIndex]}
                  alt={displayName}
                  className="w-full h-full object-cover transition-transform duration-150 will-change-transform"
                  style={zoomed ? {
                    transform: "scale(2.5)",
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  } : {}}
                  draggable={false}
                />

                {/* Zoom hint */}
                <div className="absolute top-4 right-4 bg-foreground/60 backdrop-blur-sm text-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {zoomed ? <ZoomOut size={14} /> : <ZoomIn size={14} />}
                </div>

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-foreground/60 backdrop-blur-sm text-background px-3 py-1 font-body text-[10px] tracking-wider rounded-full">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(i => (i - 1 + images.length) % images.length); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm text-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(i => (i + 1) % images.length); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm text-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {/* Zoom instruction overlay */}
                {!zoomed && (
                  <div className="absolute inset-0 flex items-end justify-center pb-12 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-foreground/60 backdrop-blur-sm text-background font-body text-[10px] tracking-wider px-4 py-1.5 rounded-full">
                      Click to zoom · Hover to explore texture
                    </span>
                  </div>
                )}
              </div>

              {/* Mobile Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2 px-4 md:px-0 hide-scrollbar -mx-0 md:mx-0 snap-x snap-mandatory">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-[76px] shrink-0 snap-start overflow-hidden transition-all duration-300 border ${
                        selectedImage === i ? "border-accent opacity-100" : "border-border/40 opacity-50"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Product Info — padded on mobile, flush on lg+ */}
          <div className="space-y-6 px-4 pb-2 pt-6 sm:px-5 md:space-y-7 md:px-12 md:pt-8 lg:sticky lg:top-28 lg:self-start lg:space-y-7 lg:px-0 lg:pt-0 lg:pb-0">

            {/* Category + Badge */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
                  {displayCategory}
                </span>
                {displayItemNote && (
                  <span className="font-body text-[9px] font-bold uppercase tracking-[0.12em] bg-primary/8 text-primary px-2.5 py-1 border border-primary/15">
                    {displayItemNote}
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl md:text-[28px] lg:text-3xl font-semibold tracking-wide text-foreground leading-tight">
                {displayName}
              </h1>

              <p className="font-body text-sm md:text-base tracking-wider text-muted-foreground mt-2">
                SKU: {product.sku} · {displayFabric} · Handwoven
              </p>
            </div>

            {/* Rating */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={13} className={s <= 4 ? "fill-accent text-accent" : "text-border"} />
                ))}
              </div>
              <span className="font-body text-sm md:text-base text-foreground/70">
                {avgRating ? `${avgRating.toFixed(1)} · ${reviews.length} reviews` : "Be the first to review"}
              </span>
              <button
                onClick={openReviewModal}
                className="font-body text-sm md:text-base text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
              >
                Write a review
              </button>
            </div>

            {/* Price Block */}
            <div className="border-t border-b border-border/60 py-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-amount text-3xl text-maroon tracking-tight">
                  ₹{displayPrice.toLocaleString("en-IN")}
                </span>
                {displayOriginalPrice > displayPrice && (
                  <>
                    <span className="font-amount-muted text-base text-muted-foreground/50 line-through">
                      ₹{displayOriginalPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="font-body text-[10px] font-bold text-primary bg-primary/8 px-2 py-0.5 border border-primary/10">
                      {displayOfferPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="font-body text-sm md:text-base text-muted-foreground mt-1.5">
                Inclusive of all taxes · Free shipping across India
              </p>
            </div>

            {/* Short Description */}
            {description && (
              <p className="font-body text-base md:text-lg text-muted-foreground leading-[1.9] italic">
                "{description}"
              </p>
            )}

            {/* Occasion Tags */}
            <div>
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.15em] text-foreground mb-2.5">
                Perfect For
              </p>
              <div className="flex flex-wrap gap-2">
                {occasionTags.map(tag => (
                  <span
                    key={tag}
                    className="font-body text-[10px] tracking-wider text-muted-foreground border border-border/80 px-3 py-1.5 hover:border-accent hover:text-accent transition-colors duration-300 cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div ref={ctaRef} className="space-y-3">
              <div className="flex min-w-0 gap-2 sm:gap-3">
                <Button
                  onClick={handleAddToCart}
                  className="min-w-0 flex-1 bg-foreground hover:bg-foreground/90 text-background font-body text-[10px] sm:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.2em] font-bold h-[52px] sm:h-[54px] rounded-none transition-all duration-300 px-2 sm:px-4"
                >
                  <ShoppingBag size={16} className="mr-1.5 shrink-0 sm:mr-2" />
                  <span className="truncate">Add to Bag</span>
                </Button>
                <Link to="/checkout" className="min-w-0 flex-1" onClick={handleAddToCart}>
                  <Button className="h-[52px] w-full min-w-0 bg-accent hover:bg-accent/90 text-accent-foreground font-body text-[10px] sm:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.2em] font-bold sm:h-[54px] rounded-none transition-all duration-300 px-2 sm:px-4">
                    Buy Now
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    const wishlistProduct = {
                      id: product.id,
                      itemNote: displayItemNote,
                      itemName: displayName,
                      sku: product.sku,
                      price: displayPrice,
                      category: displayCategory,
                      fabric: displayFabric,
                      image: images[0],
                      description: description,
                    };
                    toggleItem(wishlistProduct);
                    const nowWishlisted = !isWishlisted(product.id);
                    toast({
                      title: nowWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
                      description: `${displayName} ${nowWishlisted ? "removed from" : "saved to"} your wishlist`,
                    });
                  }}
                  className={`h-[52px] w-[52px] shrink-0 rounded-none border-border transition-all duration-300 sm:h-[54px] sm:w-[54px] ${
                    isWishlisted(product.id) 
                      ? "bg-primary/8 border-primary text-primary" 
                      : "text-muted-foreground hover:text-primary hover:border-primary"
                  }`}
                >
                  <Heart size={18} className={isWishlisted(product.id) ? "fill-primary" : ""} />
                </Button>
              </div>
            </div>

            {/* Trust Strip — 2×2 on mobile for readability */}
            <div className="grid grid-cols-2 gap-px border border-border/40 bg-border/50 md:grid-cols-4">
              {[
                { icon: Shield, label: "100% Authentic", sub: "Guaranteed" },
                { icon: Award, label: "GI Tagged", sub: "Certified" },
                { icon: Truck, label: "Free Shipping", sub: "All India" },
                { icon: Package, label: "Gift Ready", sub: "Premium Box" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1 py-3.5 bg-background">
                  <Icon size={16} className="text-accent" />
                  <span className="font-body text-[8px] font-bold uppercase tracking-wider text-foreground">{label}</span>
                  <span className="font-body text-[7px] text-muted-foreground">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  SECTION 2 — EDITORIAL BLOG-STYLE STORY                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-12 py-12 md:py-28">

          {/* Editorial Header */}
          <div className="text-center mb-16 md:mb-24">
            <p className="luxury-caption text-accent mb-4">The Complete Story</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-[42px] font-semibold tracking-wide text-foreground leading-tight">
              {displayName}
            </h2>
            <div className="luxury-divider" />
            <p className="font-body text-[15px] md:text-base text-muted-foreground max-w-2xl mx-auto leading-[1.9] italic">
              {description || "A masterpiece born from centuries of tradition, handwoven with devotion by artisans who have inherited the art of the loom."}
            </p>
          </div>

          {/* ── Blog Block 1: Full-width hero banner image ── */}
          {(storyImageBanner || images.length > 0) && (
            <div className="mb-16 md:mb-24">
              <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-secondary/30">
                <img
                  src={storyImageBanner || images[0]}
                  alt={`${displayName} — detailed view`}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-body text-[10px] text-muted-foreground/60 text-center mt-3 uppercase tracking-[0.2em]">
                {displayName} — {displayFabric}
              </p>
            </div>
          )}

          {/* ── Blog Block 2: Description + Quick Facts ── */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-12 md:gap-16 mb-16 md:mb-24">
            <div>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground tracking-wide mb-2">
                About This Saree
              </h3>
              <div className="w-10 h-px bg-accent mb-6" />
              {longDescription ? (
                <div className="font-body text-base md:text-lg text-muted-foreground leading-[2] whitespace-pre-line">
                  {longDescription}
                </div>
              ) : (
                <p className="font-body text-base md:text-lg text-muted-foreground leading-[2]">
                  {description || "Each piece is a testament to centuries-old weaving traditions, handcrafted by master artisans who pour their heart into every thread. This exquisite saree features intricate motifs inspired by royal courts and temple architecture, woven with pure zari that catches light beautifully. The rich pallu and matching border complete this masterpiece."}
                </p>
              )}
            </div>

            {/* Floating Quick Facts */}
            <div className="border border-border/60 bg-secondary/20 p-6 self-start md:sticky md:top-28">
              <h4 className="font-body text-[10px] font-bold uppercase tracking-[0.15em] text-accent mb-5">
                Quick Facts
              </h4>
              {details.slice(0, 6).map(({ label, value }) => (
                <div key={label} className="flex justify-between items-baseline py-2.5 border-b border-border/30 last:border-0">
                  <span className="font-body text-[11px] text-muted-foreground">{label}</span>
                  <span className="font-body text-[11px] font-semibold text-foreground text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Blog Block 3: Side-by-side image + Origin Story ── */}
          {hasOriginStorySection && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 mb-16 md:mb-24 items-center">
              {storyImageOrigin && (
                <div className="aspect-[3/4] overflow-hidden bg-secondary/30 order-2 md:order-1">
                  <img
                    src={storyImageOrigin}
                    alt={`${displayName} — close-up detail`}
                    className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700"
                  />
                </div>
              )}
              <div className={`${storyImageOrigin ? "order-1 md:order-2" : "md:col-span-2 max-w-2xl mx-auto"}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-accent/8 border border-accent/20 flex items-center justify-center">
                    <MapPin size={16} className="text-accent" />
                  </div>
                  <p className="font-body text-[9px] font-bold uppercase tracking-[0.3em] text-accent"> </p>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground tracking-wide mb-2">
                  Origin & Heritage
                </h3>
                <div className="w-10 h-px bg-accent mb-5" />
                <p className="font-body text-base md:text-lg text-muted-foreground leading-[2] whitespace-pre-line">
                  {originStory}
                </p>
              </div>
            </div>
          )}

          {/* ── Blog Block 4: Full-width second image ── */}
          {images.length > 2 && (
            <div className="mb-16 md:mb-24">
              <div className="aspect-[16/7] overflow-hidden bg-secondary/30">
                <img
                  src={images[2]}
                  alt={`${displayName} — weaving detail`}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-body text-[10px] text-muted-foreground/60 text-center mt-3 uppercase tracking-[0.2em]">
                The art of handloom weaving
              </p>
            </div>
          )}

          {/* ── Blog Block 5: Weaving Process (text + image reversed) ── */}
          {hasWeavingSection && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 mb-16 md:mb-24 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-accent/8 border border-accent/20 flex items-center justify-center">
                    <Scissors size={16} className="text-accent" />
                  </div>
                  <p className="font-body text-[9px] font-bold uppercase tracking-[0.3em] text-accent"> </p>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground tracking-wide mb-2">
                  The Weaving Process
                </h3>
                <div className="w-10 h-px bg-accent mb-5" />
                <p className="font-body text-base md:text-lg text-muted-foreground leading-[2] whitespace-pre-line">
                  {weavingProcess}
                </p>
              </div>
              {storyImageWeaving ? (
                <div className="aspect-[3/4] overflow-hidden bg-secondary/30">
                  <img
                    src={storyImageWeaving}
                    alt={`${displayName} — weaving process`}
                    className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700"
                  />
                </div>
              ) : null}
            </div>
          )}

          {/* ── Blog Block 6: Quality Assurance ── */}
          {hasQualitySection && (
            <div className={`mb-16 md:mb-24 ${storyImageQuality ? "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center" : "max-w-2xl mx-auto text-center"}`}>
              {storyImageQuality && (
                <div className="aspect-[3/4] overflow-hidden bg-secondary/30">
                  <img src={storyImageQuality} alt={`${displayName} — quality`} className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />
                </div>
              )}
              <div>
                <div className={`flex items-center gap-3 mb-4 ${!storyImageQuality ? "justify-center" : ""}`}>
                  <div className="w-10 h-10 bg-accent/8 border border-accent/20 flex items-center justify-center">
                    <Gem size={16} className="text-accent" />
                  </div>
                  <p className="font-body text-[9px] font-bold uppercase tracking-[0.3em] text-accent"> </p>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground tracking-wide mb-2">
                  Quality & Assurance
                </h3>
                <div className={`w-10 h-px bg-accent mb-5 ${!storyImageQuality ? "mx-auto" : ""}`} />
                <p className="font-body text-base md:text-lg text-muted-foreground leading-[2] whitespace-pre-line">
                  {qualityAssurance}
                </p>
              </div>
            </div>
          )}

          {/* ── Blog Block 7: Two-image grid (if available) ── */}
          {images.length > 4 && (
            <div className="grid grid-cols-2 gap-4 mb-16 md:mb-24">
              <div className="aspect-[4/5] overflow-hidden bg-secondary/30">
                <img src={images[4]} alt={`${displayName} — styled view`} className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />
              </div>
              {images.length > 5 ? (
                <div className="aspect-[4/5] overflow-hidden bg-secondary/30">
                  <img src={images[5]} alt={`${displayName} — draped view`} className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />
                </div>
              ) : (
                <div className="aspect-[4/5] bg-foreground flex items-center justify-center">
                  <div className="text-center px-8">
                    <Sparkles size={28} className="text-accent mx-auto mb-4" />
                    <p className="font-display text-lg text-background font-semibold tracking-wide">Handwoven Perfection</p>
                    <p className="font-body text-[12px] text-background/40 mt-2">Every thread tells a story</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Heritage Stats (inline editorial) ── */}
          <div className="border-t border-b border-border/40 py-12 md:py-16 mb-16 md:mb-24">
            <div className="grid grid-cols-3 gap-6 md:gap-12 text-center">
              {[
                { number: "10+", label: "Years of Heritage" },
                { number: "15–45", label: "Days Per Saree" },
                { number: "100%", label: "Authentic Handloom" },
              ].map(({ number, label }) => (
                <div key={label}>
                  <p className="font-display text-2xl md:text-4xl font-bold text-foreground tracking-tight">{number}</p>
                  <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-accent mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Product Specifications (clean list) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">

            {/* Fabric Details */}
            <div>
              <h4 className="font-display text-lg font-semibold text-foreground tracking-wide mb-1 flex items-center gap-2">
                <Gem size={15} className="text-accent" />
                Product Details
              </h4>
              <div className="w-8 h-px bg-accent mb-4" />
              <div className="space-y-2.5">
                {details.map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-baseline">
                    <span className="font-body text-sm md:text-base text-muted-foreground">{label}</span>
                    <span className="font-body text-sm md:text-base font-semibold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Size & Draping + Care */}
            <div>
              <h4 className="font-display text-lg font-semibold text-foreground tracking-wide mb-1 flex items-center gap-2">
                <Ruler size={15} className="text-accent" />
                Size & Draping
              </h4>
              <div className="w-8 h-px bg-accent mb-4" />
              <div className="space-y-2.5">
                {sizeGuide.map(({ key, value: val }) => (
                  <p key={key} className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">{key}:</span> {val}
                  </p>
                ))}
              </div>
            </div>

            {/* Care */}
            <div>
              <h4 className="font-display text-lg font-semibold text-foreground tracking-wide mb-1 flex items-center gap-2">
                <Leaf size={15} className="text-accent" />
                Care Instructions
              </h4>
              <div className="w-8 h-px bg-accent mb-4" />
              <ul className="space-y-2">
                {careInstructions.map((item, i) => (
                  <li key={i} className="font-body text-sm md:text-base text-muted-foreground flex items-start gap-2 leading-relaxed">
                    <span className="w-1 h-1 bg-accent rounded-full mt-[7px] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Shipping & Returns (compact) ── */}
          <div className="mt-14 border-t border-border/40 pt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Truck, title: "Free Insured Shipping", desc: "Complimentary shipping across India in premium gift packaging. Delivered in 5–7 business days." },
                { icon: Package, title: "Premium Packaging", desc: "Hand-finished gift box with Certificate of Authenticity and Silk mark certified tag." },
                { icon: Clock, title: "7-Day Easy Returns", desc: "Hassle-free returns with full refund. Items must be unworn with tags. Free doorstep pickup." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-10 h-10 bg-accent/8 border border-accent/15 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-accent" />
                  </div>
                  <div>
                    <h5 className="font-body text-[12px] font-bold text-foreground mb-1">{title}</h5>
                    <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>



      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  SECTION 5 — CUSTOMER REVIEWS                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-border/60 bg-secondary/15">
        <div className="luxury-container py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <p className="luxury-caption text-accent mb-2">Customer Reviews</p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-wide text-foreground">
                Voices of Our Patrons
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className="fill-accent text-accent" />)}
              </div>
              <span className="font-body text-sm text-foreground/70">{avgRating ? `${avgRating.toFixed(1)} / 5 · ${reviews.length} reviews` : `0 / 5 · 0 reviews`}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <div key={i} className="p-6 border border-border/50 bg-background space-y-4 hover:shadow-sm transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 border border-accent/15 flex items-center justify-center">
                      <span className="font-display text-sm font-bold text-accent">{review.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-body text-[13px] font-semibold text-foreground">{review.name}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{review.location} · {review.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={11} className={s <= review.rating ? "fill-accent text-accent" : "text-border"} />
                    ))}
                  </div>
                </div>
                <p className="font-body text-[13px] text-muted-foreground leading-relaxed italic">
                  "{review.text}"
                </p>
                <span className="font-body text-[9px] text-accent font-semibold flex items-center gap-1">
                  <CheckCircle2 size={9} /> Verified Purchase
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  SECTION 6 — YOU MAY ALSO LOVE                                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {similar.length > 0 && (
        <section className="border-t border-border/60">
          <div className="luxury-container py-16 md:py-24">
            <div className="text-center mb-12">
              <p className="luxury-caption text-accent mb-2">Curated For You</p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-wide text-foreground">
                You May Also Love
              </h2>
              <div className="luxury-divider" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {similar.map((p) => (
                <SareeCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  SECTION 7 — NEED HELP CTA                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23ffffff'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }} />
        <div className="luxury-container py-14 md:py-20 text-center relative z-10">
          <p className="luxury-caption text-accent mb-3">Personal Styling</p>
          <h2 className="font-display text-xl md:text-2xl font-semibold tracking-wide text-background mb-2">
            Our Saree Stylists Are Here for You
          </h2>
          <p className="font-body text-[13px] text-background/40 mb-8 max-w-md mx-auto leading-relaxed">
            Get personalised recommendations, video calls to see the saree live, or visit our Jubilee Hills atelier.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/contact">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-body text-[10px] uppercase tracking-[0.2em] font-bold h-12 px-8 rounded-none transition-all duration-300">
                Book Store Visit
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-background/35 bg-background text-foreground hover:bg-background/90 font-body text-[10px] uppercase tracking-[0.2em] font-bold h-12 px-8 rounded-none transition-all duration-300">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  STICKY MOBILE CTA BAR                                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {showStickyCTA && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md animate-fade-in pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:p-4 md:pb-4">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-2 sm:gap-3">
            {/* Mini product info */}
            <div className="hidden md:flex items-center gap-3 flex-1 min-w-0">
              <img src={images[0]} alt="" className="w-10 h-12 object-cover shrink-0" />
              <div className="min-w-0">
                <p className="font-body text-[12px] font-semibold text-foreground truncate">{displayName}</p>
                <p className="font-amount text-[12px] text-maroon">
                  ₹{displayPrice.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Mobile price */}
            <div className="min-w-0 flex-1 md:hidden">
              <p className="font-amount truncate text-sm text-maroon leading-tight">
                ₹{displayPrice.toLocaleString("en-IN")}
              </p>
            </div>

            <Button
              onClick={handleAddToCart}
              className="h-11 min-w-0 flex-1 bg-foreground px-3 font-body text-[9px] font-bold uppercase tracking-[0.12em] text-background hover:bg-foreground/90 sm:px-5 sm:text-[10px] sm:tracking-[0.15em] rounded-none"
            >
              <ShoppingBag size={14} className="mr-1 shrink-0" />
              <span className="truncate">Add to Bag</span>
            </Button>
            <Link to="/checkout" onClick={handleAddToCart} className="min-w-0 flex-1">
              <Button className="h-11 w-full min-w-0 bg-accent px-3 font-body text-[9px] font-bold uppercase tracking-[0.12em] text-accent-foreground hover:bg-accent/90 sm:px-5 sm:text-[10px] sm:tracking-[0.15em] rounded-none">
                Buy Now
              </Button>
            </Link>
          </div>
        </div>
      )}

    </main>
  );
};

export default ProductDetail;
