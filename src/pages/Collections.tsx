import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { categories, type SareeProduct } from "@/data/sareeData";
import { getAllProducts } from "@/lib/getAllProducts";
import { getSections, type HomepageSection } from "@/lib/api";
import { fetchAllAssignments } from "@/lib/collectionAssignments";
import { buildCollectionFilterList, type CollectionFilterItem } from "@/lib/collectionFilterList";
import { getCollectionIconComponent } from "@/lib/collectionIcons";
import SareeCard from "@/components/SareeCard";
import FilterSidebar from "@/components/FilterSidebar";
import { SlidersHorizontal, Search, X, LayoutGrid, Rows3 } from "lucide-react";

const Collections = () => {
  const navigationType = useNavigationType();
  const location = useLocation();
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [activeFabric, setActiveFabric] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 99999]);
  const [sortBy, setSortBy] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [allProducts, setAllProducts] = useState<SareeProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [collectionItems, setCollectionItems] = useState<CollectionFilterItem[]>([]);
  const [fabricSections, setFabricSections] = useState<HomepageSection[]>([]);
  const [activeCollectionKey, setActiveCollectionKey] = useState<string | null>(null);
  const SCROLL_KEY = "athina:collections:scrollY";
  const COLLECTION_KEY = "athina:collections:activeCollectionKey";
  const canPersistScrollRef = useRef(navigationType !== "POP");
  const hasMountedCollectionRef = useRef(false);

  useEffect(() => {
    setLoadingProducts(true);
    getAllProducts()
      .then(setAllProducts)
      .finally(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    getSections()
      .then((data) => setFabricSections((data || []).filter((s) => Number(s.is_active) === 1)))
      .catch(() => setFabricSections([]));
  }, []);

  // Persist current Collections scroll position continuously.
  useEffect(() => {
    let raf = 0;
    const save = () => {
      if (!canPersistScrollRef.current) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY || 0));
      });
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      window.removeEventListener("scroll", save);
      if (raf) cancelAnimationFrame(raf);
      if (canPersistScrollRef.current) {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY || 0));
      }
    };
  }, []);

  // On browser back/forward, restore exact previous position.
  useEffect(() => {
    const restoreRequested =
      navigationType === "POP" ||
      Boolean((location.state as { preserveScroll?: boolean } | null)?.preserveScroll);
    if (!restoreRequested) return;
    const savedCollection = sessionStorage.getItem(COLLECTION_KEY);
    if (savedCollection) {
      setActiveCollectionKey(savedCollection === "__all__" ? null : savedCollection);
    }
    const requestedY = Number((location.state as { restoreScrollY?: number } | null)?.restoreScrollY || 0);
    const lastProductId = sessionStorage.getItem("athina:collections:lastProductId");
    const lastCardTop = Number(sessionStorage.getItem("athina:collections:lastCardTop") || 0);
    const raw = sessionStorage.getItem(SCROLL_KEY);
    const y = requestedY > 0 ? requestedY : (raw ? Number(raw) : 0);
    if (!Number.isFinite(y) || y <= 0) {
      canPersistScrollRef.current = true;
      return;
    }
    const restore = () => {
      if (lastProductId) {
        const nodes = Array.from(document.querySelectorAll("[data-product-id]")) as HTMLElement[];
        const el = nodes.find((n) => n.dataset.productId === lastProductId) || null;
        if (el && Number.isFinite(lastCardTop) && lastCardTop > 0) {
          const absTop = el.getBoundingClientRect().top + window.scrollY;
          const target = Math.max(0, absTop - lastCardTop);
          window.scrollTo(0, target);
          return;
        }
      }
      window.scrollTo(0, y);
    };
    restore();
    requestAnimationFrame(restore);
    setTimeout(() => {
      restore();
      canPersistScrollRef.current = true;
    }, 120);
  }, [navigationType, loadingProducts, location.state]);

  // Persist active collection selection for back navigation restore.
  useEffect(() => {
    if (!hasMountedCollectionRef.current) {
      hasMountedCollectionRef.current = true;
      return;
    }
    sessionStorage.setItem(COLLECTION_KEY, activeCollectionKey ?? "__all__");
  }, [activeCollectionKey]);

  const refreshAssignmentsAndList = useCallback(async () => {
    const map = await fetchAllAssignments();
    setAssignments(map);
    const list = await buildCollectionFilterList(map);
    setCollectionItems(list);
  }, []);

  const collectionKeyFromRedirect = useCallback((redirectPage: string): string | null | undefined => {
    const p = String(redirectPage || "").trim();
    if (!p) return undefined;
    if (p === "/collections") return null;
    if (p === "/bridal") return "bridal";
    if (p === "/tissue") return "tissue";
    if (p === "/linen") return "linen";
    const m = p.match(/^\/collection\/(.+)$/);
    if (m) return decodeURIComponent(m[1] || "").trim() || undefined;
    return undefined;
  }, []);

  const collectionKeySet = useMemo(
    () => new Set(collectionItems.map((c) => String(c.key || "").trim().toLowerCase())),
    [collectionItems]
  );

  const fabricCards = useMemo(() => {
    const cards = fabricSections
      .filter((s) => (s.show_on_collections ?? 0) === 1)
      .map((s) => {
        const key = collectionKeyFromRedirect(s.redirect_page || "");
        return {
          id: s.id,
          title: s.title?.trim() || "Collection",
          image: s.image_url?.trim() || "",
          imagePosition: s.image_position?.trim() || "center center",
          imageZoom: Number(s.image_zoom || 100),
          redirect: s.redirect_page?.trim() || "",
          key,
        };
      })
      .filter((c) => c.image && c.redirect && c.key !== undefined)
      .filter((c) => (c.key === null ? true : collectionKeySet.has(String(c.key).toLowerCase())));

    const uniq = new Set<string>();
    return cards.filter((c) => {
      const k = c.key === null ? "__all__" : String(c.key).toLowerCase();
      if (uniq.has(k)) return false;
      uniq.add(k);
      return true;
    });
  }, [fabricSections, collectionKeyFromRedirect, collectionKeySet]);

  const topStripItems = useMemo(() => {
    const byKey = new Map<string, (typeof fabricCards)[number]>();
    for (const c of fabricCards) {
      const k = c.key === null ? "__all__" : String(c.key).toLowerCase();
      byKey.set(k, c);
    }

    const allItem = byKey.get("__all__");
    return [
      {
        id: "__all__",
        title: "All",
        key: null as string | null,
        image: allItem?.image || "",
        imagePosition: allItem?.imagePosition || "center center",
        imageZoom: allItem?.imageZoom || 100,
        iconKey: null as string | null,
        redirect: "/collections",
      },
      ...collectionItems.map((c) => {
        const k = String(c.key || "").toLowerCase();
        const card = byKey.get(k);
        return {
          id: `collection-${c.key}`,
          title: c.displayName,
          key: c.key,
          image: card?.image || c.imageUrl || "",
          imagePosition: card?.imagePosition || "center center",
          imageZoom: card?.imageZoom || 100,
          iconKey: c.iconKey || null,
          redirect: c.key === "bridal" ? "/bridal" : c.key === "tissue" ? "/tissue" : c.key === "linen" ? "/linen" : `/collection/${encodeURIComponent(c.key)}`,
        };
      }),
    ];
  }, [fabricCards, collectionItems]);

  const handleSelectCollection = useCallback((key: string | null) => {
    setActiveCollectionKey(key);
    // Manual tab/filter switch should start from top of the listing.
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleFabricClick = useCallback((redirectPage: string, key: string | null | undefined) => {
    if (key !== undefined) {
      handleSelectCollection(key);
      return;
    }
    navigate(redirectPage || "/collections");
  }, [handleSelectCollection, navigate]);

  useEffect(() => {
    void refreshAssignmentsAndList();
  }, [refreshAssignmentsAndList]);

  useEffect(() => {
    if (loadingProducts) return;
    void refreshAssignmentsAndList();
  }, [loadingProducts, refreshAssignmentsAndList]);

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    if (activeCollectionKey) {
      const norm = (v: string) => String(v || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const wantRaw = String(activeCollectionKey).trim();
      const want = norm(wantRaw);
      const matchesCollection = (p: SareeProduct) => {
        const productKeys = [String(p.id), String(p.sku || "").trim()]
          .map((k) => String(k || "").trim())
          .filter((k) => k.length > 0);

        const assignmentEntries = Object.entries(assignments);
        for (const [assignmentKey, rows] of assignmentEntries) {
          const assignmentKeyNorm = norm(assignmentKey);
          const keyMatches = productKeys.some((k) => {
            const kNorm = norm(k);
            return k === assignmentKey || kNorm === assignmentKeyNorm;
          });
          if (!keyMatches) continue;
          if ((rows || []).some((c) => norm(String(c)) === want)) return true;
        }
        return false;
      };
      products = products.filter(matchesCollection);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.itemName.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          String((p as any).subcategory || "").toLowerCase().includes(q)
      );
    }
    if (activeCategory) {
      products = products.filter((p) => p.category === activeCategory);
    }
    if (activeSubcategory) {
      products = products.filter((p) => String((p as any).subcategory || "").trim() === activeSubcategory);
    }
    if (activeFabric) {
      products = products.filter((p) => p.fabric === activeFabric);
    }
    products = products.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case "default":
        // Show older collections first (top) as requested.
        products = [...products].reverse();
        break;
      case "price-asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        products.sort((a, b) => a.itemName.localeCompare(b.itemName));
        break;
    }

    return products;
  }, [allProducts, activeCollectionKey, assignments, activeCategory, activeSubcategory, activeFabric, priceRange, sortBy, searchQuery]);

  const activeCollectionLabel = activeCollectionKey
    ? collectionItems.find((c) => c.key === activeCollectionKey)?.displayName ?? null
    : null;
  const categoryNames = useMemo(() => {
    // Keep order as it comes from admin/product data; dedupe case-insensitively.
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const p of allProducts) {
      const raw = String(p.category || "").trim();
      if (!raw) continue;
      const key = raw.toLowerCase();
      if (key === "custom") continue;
      if (seen.has(key)) continue;
      seen.add(key);
      ordered.push(raw);
    }
    return ordered;
  }, [allProducts]);

  const subcategoryNames = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const p of allProducts) {
      if (activeCategory && p.category !== activeCategory) continue;
      const raw = String((p as any).subcategory || "").trim();
      if (!raw) continue;
      const key = raw.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      ordered.push(raw);
    }
    return ordered;
  }, [allProducts, activeCategory]);

  useEffect(() => {
    if (!activeCategory) return;
    if (!categoryNames.some((c) => c.toLowerCase() === activeCategory.toLowerCase())) {
      setActiveCategory(null);
    }
  }, [activeCategory, categoryNames]);

  useEffect(() => {
    if (!activeSubcategory) return;
    if (!subcategoryNames.some((c) => c.toLowerCase() === activeSubcategory.toLowerCase())) {
      setActiveSubcategory(null);
    }
  }, [activeSubcategory, subcategoryNames]);

  useEffect(() => {
    setActiveSubcategory(null);
  }, [activeCategory]);

  const activeDesc =
    activeCollectionKey && activeCollectionLabel
      ? `Showing pieces in “${activeCollectionLabel}”. Choose All to browse every piece.`
      : activeCategory
        ? activeSubcategory
          ? `Showing ${activeSubcategory} under ${activeCategory}.`
          : categories.find((c) => c.name === activeCategory)?.description || `Showing ${activeCategory} sarees.`
        : "Explore our complete collection of handwoven heritage sarees.";

  const activeFilters = [
    activeCollectionKey ? activeCollectionLabel || "Collection" : null,
    activeCategory,
    activeSubcategory,
    activeFabric,
    priceRange[0] > 0 || priceRange[1] < 99999 ? "Price" : null,
  ].filter(Boolean);

  return (
    <main className="pt-20 md:pt-24">
      <FilterSidebar
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeSubcategory={activeSubcategory}
        setActiveSubcategory={setActiveSubcategory}
        activeFabric={activeFabric}
        setActiveFabric={setActiveFabric}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalProducts={filteredProducts.length}
        activeCollectionKey={activeCollectionKey}
        setActiveCollectionKey={handleSelectCollection}
        collectionFilterOptions={collectionItems}
        categoryOptions={categoryNames}
        subcategoryOptions={subcategoryNames}
      />

      {/* Header */}
      <section className="luxury-container py-8 md:py-10 text-center">
        <p className="luxury-caption text-gold mb-2">Our Collections</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Curated Sarees</h1>
        <div className="w-14 h-[2px] mx-auto my-4 bg-gold" />
        <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          {activeDesc}
        </p>
      </section>

      {/* Shop by Fabric: compact horizontal strip */}
      <section className="luxury-container pt-0.5 md:pt-1 pb-0.5 border-y border-border/70">
        <div className="hidden md:flex items-center justify-center mb-1">
          <h2 className="font-body text-xs uppercase tracking-[0.28em] font-semibold text-foreground/70">
            Shop by Fabric
          </h2>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto py-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {topStripItems.map((card) => {
            const isActive =
              (card.key === null && !activeCollectionKey) ||
              (card.key !== null && card.key === activeCollectionKey);
            const Icon = getCollectionIconComponent(card.iconKey || undefined);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleFabricClick(card.redirect, card.key)}
                className={`shrink-0 inline-flex items-center gap-2 px-1 py-1 transition-all duration-200 ${
                  isActive ? "text-foreground" : "text-foreground/80 hover:text-foreground"
                }`}
                aria-pressed={isActive}
              >
                {card.image ? (
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden shrink-0 border transition-colors ${
                    isActive ? "border-gold" : "border-border/70"
                  }`}>
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: card.imagePosition,
                        transform: `scale(${Math.max(50, Math.min(200, Number(card.imageZoom || 100))) / 100})`,
                      }}
                    />
                  </div>
                ) : (
                  <span className={`w-10 h-10 md:w-12 md:h-12 rounded-full shrink-0 inline-flex items-center justify-center border transition-colors ${
                    isActive ? "border-gold" : "border-border/70"
                  }`}>
                    <Icon size={16} strokeWidth={1.5} className="opacity-80" />
                  </span>
                )}
                <span className={`font-body text-[11px] md:text-xs uppercase tracking-[0.12em] font-semibold text-left leading-tight whitespace-nowrap ${
                  isActive ? "text-foreground" : "text-foreground/80"
                }`}>
                  {card.title}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Search + Toolbar */}
      <div className="luxury-container pt-5">
        {/* Search bar */}
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search by name, SKU, fabric, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/50 border border-border font-body text-base font-medium pl-12 pr-12 py-3.5 focus:outline-none focus:border-gold focus:bg-background transition-all duration-300 placeholder:text-muted-foreground/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2.5 font-body text-[13px] font-bold uppercase tracking-[0.2em] text-foreground hover:text-gold transition-colors border border-border px-5 py-2.5 hover:border-gold"
            >
              <SlidersHorizontal size={14} strokeWidth={2.5} />
              Filters
              {activeFilters.length > 0 && (
                <span className="bg-gold text-charcoal text-[11px] font-bold w-5 h-5 flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>

            <div className="hidden md:block min-w-[210px]">
              <select
                value={activeCategory ?? "__all__"}
                onChange={(e) => setActiveCategory(e.target.value === "__all__" ? null : e.target.value)}
                className="w-full bg-secondary/50 border border-border font-body text-[12px] font-bold uppercase tracking-[0.08em] px-3 py-2.5 focus:outline-none focus:border-gold focus:bg-background transition-all duration-300"
              >
                <option value="__all__">All categories</option>
                {categoryNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden md:block min-w-[220px]">
              <select
                value={activeSubcategory ?? "__all__"}
                onChange={(e) => setActiveSubcategory(e.target.value === "__all__" ? null : e.target.value)}
                className="w-full bg-secondary/50 border border-border font-body text-[12px] font-bold uppercase tracking-[0.08em] px-3 py-2.5 focus:outline-none focus:border-gold focus:bg-background transition-all duration-300"
              >
                <option value="__all__">All subcategories</option>
                {subcategoryNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick sort pills */}
            <div className="hidden md:flex items-center gap-1.5">
              {[
                { value: "default", label: "Curated" },
                { value: "price-asc", label: "Price ↑" },
                { value: "price-desc", label: "Price ↓" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`font-body text-[12px] font-bold uppercase tracking-[0.15em] px-3 py-2 transition-all duration-300 ${
                    sortBy === opt.value
                      ? "bg-charcoal text-ivory"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Grid toggle */}
            <div className="hidden md:flex items-center border border-border">
              <button
                onClick={() => setGridCols(3)}
                className={`p-2 transition-colors ${gridCols === 3 ? "bg-charcoal text-ivory" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Rows3 size={16} />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-2 transition-colors ${gridCols === 4 ? "bg-charcoal text-ivory" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            <p className="font-body text-base font-semibold text-muted-foreground">
              {filteredProducts.length} pieces
            </p>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="font-body text-[12px] uppercase tracking-[0.2em] font-semibold text-muted-foreground mr-1">
              Active:
            </span>
            {activeCollectionKey && activeCollectionLabel && (
              <button
                onClick={() => setActiveCollectionKey(null)}
                className="font-body text-[12px] font-bold uppercase tracking-[0.1em] bg-charcoal text-ivory px-4 py-2 flex items-center gap-2 hover:bg-maroon transition-colors max-w-[min(100%,220px)]"
              >
                <span className="truncate">{activeCollectionLabel}</span>
                <X size={10} className="text-gold shrink-0" />
              </button>
            )}
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="font-body text-[12px] font-bold uppercase tracking-[0.15em] bg-charcoal text-ivory px-4 py-2 flex items-center gap-2 hover:bg-maroon transition-colors"
              >
                {activeCategory}
                <X size={10} className="text-gold" />
              </button>
            )}
            {activeFabric && (
              <button
                onClick={() => setActiveFabric(null)}
                className="font-body text-[12px] font-bold uppercase tracking-[0.15em] bg-charcoal text-ivory px-4 py-2 flex items-center gap-2 hover:bg-maroon transition-colors"
              >
                {activeFabric}
                <X size={10} className="text-gold" />
              </button>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 99999) && (
              <button
                onClick={() => setPriceRange([0, 99999])}
                className="font-body font-amount text-[12px] uppercase tracking-[0.15em] bg-charcoal text-ivory px-4 py-2 flex items-center gap-2 hover:bg-maroon transition-colors"
              >
                ₹{priceRange[0].toLocaleString("en-IN")} – {priceRange[1] >= 99999 ? "25,000+" : `₹${priceRange[1].toLocaleString("en-IN")}`}
                <X size={10} className="text-gold" />
              </button>
            )}
            <button
              onClick={() => {
                setActiveCollectionKey(null);
                setActiveCategory(null);
                setActiveFabric(null);
                setPriceRange([0, 99999]);
                setSortBy("default");
              }}
              className="font-body text-[12px] font-bold uppercase tracking-[0.2em] text-maroon hover:text-maroon-light transition-colors ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Product Grid */}
      <section className="luxury-container pb-20 md:pb-32">
        {loadingProducts ? (
          <div className="text-center py-20">
            <h3 className="luxury-subheading mb-4">Loading collection...</h3>
            <p className="luxury-body text-muted-foreground">
              Please wait while we fetch the latest sarees.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="luxury-subheading mb-4">No sarees found</h3>
            <p className="luxury-body text-muted-foreground mb-6">
              Try adjusting your filters or search terms.
            </p>
            <button
              onClick={() => {
                setActiveCollectionKey(null);
                setActiveCategory(null);
                setActiveFabric(null);
                setPriceRange([0, 99999]);
                setSortBy("default");
                setSearchQuery("");
              }}
              className="luxury-btn-gold"
            >
              Reset Everything
            </button>
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 gap-4 md:gap-8 ${
              gridCols === 3
                ? "md:grid-cols-2 lg:grid-cols-3"
                : "md:grid-cols-3 lg:grid-cols-4"
            }`}
          >
            {filteredProducts.map((product) => (
              <SareeCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Collections;
