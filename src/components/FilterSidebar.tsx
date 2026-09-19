import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { categories, getUniqueFabrics } from "@/data/sareeData";
import { Slider } from "@/components/ui/slider";
import { fetchCollectionDefinitions } from "@/lib/collectionAssignments";
import { getCollectionIconComponent, type CollectionIconKey } from "@/lib/collectionIcons";
import type { CollectionFilterItem } from "@/lib/collectionFilterList";

const BUILTIN_COLLECTION_NAV: { to: string; label: string; iconKey: CollectionIconKey }[] = [
  { to: "/bridal", label: "Bridal", iconKey: "crown" },
  { to: "/tissue", label: "Tissue & Organza", iconKey: "sparkles" },
  { to: "/linen", label: "Linen & Cotton", iconKey: "leaf" },
];

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  activeSubcategory?: string | null;
  setActiveSubcategory?: (subcat: string | null) => void;
  subcategoryOptions?: string[];
  activeFabric: string | null;
  setActiveFabric: (fab: string | null) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  totalProducts: number;
  /** On /collections: filter grid by collection without leaving the page */
  activeCollectionKey?: string | null;
  setActiveCollectionKey?: (key: string | null) => void;
  collectionFilterOptions?: CollectionFilterItem[];
  categoryOptions?: string[];
}

const fabrics = getUniqueFabrics();

const sortOptions = [
  { value: "default", label: "Curated" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
  { value: "name-asc", label: "A → Z" },
];

const FilterSidebar = ({
  isOpen,
  onClose,
  activeCategory,
  setActiveCategory,
  activeSubcategory = null,
  setActiveSubcategory,
  subcategoryOptions = [],
  activeFabric,
  setActiveFabric,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  totalProducts,
  activeCollectionKey = null,
  setActiveCollectionKey,
  collectionFilterOptions = [],
  categoryOptions = [],
}: FilterSidebarProps) => {
  const location = useLocation();
  const [customCollections, setCustomCollections] = useState<{ collection_key: string; display_name: string; icon_key?: string | null }[]>([]);

  useEffect(() => {
    fetchCollectionDefinitions()
      .then(setCustomCollections)
      .catch(() => setCustomCollections([]));
  }, []);

  const collectionLinkActive = (to: string) => {
    const p = location.pathname.replace(/\/$/, "") || "/";
    const t = to.replace(/\/$/, "");
    return p === t;
  };

  const customCollectionActive = (key: string) => {
    const m = location.pathname.match(/^\/collection\/(.+)$/);
    if (!m) return false;
    return decodeURIComponent(m[1]) === key;
  };

  const availableCategories = categoryOptions.length
    ? categoryOptions
    : categories.map((c) => c.name).filter((n) => String(n || "").trim().length > 0);

  const collectionFilterMode = typeof setActiveCollectionKey === "function";
  const hasFilters =
    activeCategory ||
    activeSubcategory ||
    activeFabric ||
    (collectionFilterMode && activeCollectionKey) ||
    priceRange[0] > 0 ||
    priceRange[1] < 99999 ||
    sortBy !== "default";

  const clearAll = () => {
    setActiveCategory(null);
    if (typeof setActiveSubcategory === "function") setActiveSubcategory(null);
    setActiveFabric(null);
    if (collectionFilterMode) setActiveCollectionKey(null);
    setPriceRange([0, 99999]);
    setSortBy("default");
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[360px] md:w-[400px] bg-background z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={18} strokeWidth={2} className="text-gold" />
            <span className="font-display text-xl font-bold">Refine</span>
          </div>
          <div className="flex items-center gap-4">
            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 font-body text-[10px] font-bold uppercase tracking-[0.2em] text-maroon hover:text-maroon-light transition-colors"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            )}
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center border border-border hover:bg-charcoal hover:text-ivory transition-all duration-300">
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8" style={{ scrollbarWidth: "thin" }}>
          {/* Result badge */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 bg-charcoal text-ivory font-body text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-2">
              {totalProducts} pieces
            </span>
            {hasFilters && (
              <span className="font-body text-[11px] text-foreground/70">filtered</span>
            )}
          </div>

          {/* Sort - pill style */}
          <div>
            <h3 className="font-body text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-4">Sort By</h3>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`px-4 py-2.5 font-body text-[11px] font-bold uppercase tracking-[0.15em] border transition-all duration-300 ${
                    sortBy === opt.value
                      ? "bg-charcoal text-ivory border-charcoal"
                      : "bg-transparent text-foreground/80 border-border hover:border-gold hover:text-gold"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range - Slider */}
          <div>
            <h3 className="font-body text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-4">Price Range</h3>
            <div className="px-1">
              <Slider
                min={0}
                max={25000}
                step={500}
                value={[priceRange[0], priceRange[1] > 25000 ? 25000 : priceRange[1]]}
                onValueChange={(val) => setPriceRange([val[0], val[1] === 25000 ? 99999 : val[1]])}
                className="mb-4"
              />
              <div className="flex items-center justify-between font-amount text-sm text-foreground/70">
                <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
                <span>{priceRange[1] >= 99999 ? "₹25,000+" : `₹${priceRange[1].toLocaleString("en-IN")}`}</span>
              </div>
            </div>
          </div>

          {/* Collections: full-page routes elsewhere; on /collections, filter the grid in place */}
          <div>
            <h3 className="font-body text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-4">Collections</h3>
            {collectionFilterMode ? (
              <>
                <p className="font-body text-[11px] text-foreground/55 mb-3 leading-snug">
                  Show only products assigned to each collection. Names match your admin / catalog.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCollectionKey(null);
                    }}
                    className={`py-3 px-2 font-body text-[11px] font-bold uppercase tracking-[0.1em] border text-center transition-all duration-300 ${
                      !activeCollectionKey
                        ? "bg-charcoal text-ivory border-charcoal"
                        : "bg-transparent text-foreground/80 border-border hover:border-gold hover:text-gold"
                    }`}
                  >
                    All
                  </button>
                  {collectionFilterOptions.map((c) => {
                    const Icon = getCollectionIconComponent(c.iconKey);
                    const active = activeCollectionKey === c.key;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => {
                          setActiveCollectionKey(c.key);
                        }}
                        className={`flex items-center gap-2 py-3 px-2 font-body text-[11px] font-bold uppercase tracking-[0.06em] border text-left transition-all duration-300 min-h-[3.25rem] ${
                          active
                            ? "bg-charcoal text-ivory border-charcoal"
                            : "bg-transparent text-foreground/80 border-border hover:border-gold hover:text-gold"
                        }`}
                      >
                        <Icon size={16} strokeWidth={1.5} className="shrink-0 opacity-90" />
                        <span className="leading-tight line-clamp-2">{c.displayName}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <p className="font-body text-[11px] text-foreground/55 mb-3 leading-snug">
                  Open a curated collection page (same as main navigation).
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {BUILTIN_COLLECTION_NAV.map(({ to, label, iconKey }) => {
                    const Icon = getCollectionIconComponent(iconKey);
                    const active = collectionLinkActive(to);
                    return (
                      <Link
                        key={to}
                        to={to}
                        onClick={onClose}
                        className={`flex items-center gap-2 py-3 px-2 font-body text-[11px] font-bold uppercase tracking-[0.08em] border text-left transition-all duration-300 min-h-[3.25rem] ${
                          active
                            ? "bg-charcoal text-ivory border-charcoal"
                            : "bg-transparent text-foreground/80 border-border hover:border-gold hover:text-gold"
                        }`}
                      >
                        <Icon size={16} strokeWidth={1.5} className="shrink-0 opacity-90" />
                        <span className="leading-tight line-clamp-2">{label}</span>
                      </Link>
                    );
                  })}
                  {customCollections.map((c) => {
                    const to = `/collection/${encodeURIComponent(c.collection_key)}`;
                    const Icon = getCollectionIconComponent(c.icon_key);
                    const active = customCollectionActive(c.collection_key);
                    return (
                      <Link
                        key={c.collection_key}
                        to={to}
                        onClick={onClose}
                        className={`flex items-center gap-2 py-3 px-2 font-body text-[11px] font-bold uppercase tracking-[0.06em] border text-left transition-all duration-300 min-h-[3.25rem] ${
                          active
                            ? "bg-charcoal text-ivory border-charcoal"
                            : "bg-transparent text-foreground/80 border-border hover:border-gold hover:text-gold"
                        }`}
                      >
                        <Icon size={16} strokeWidth={1.5} className="shrink-0 opacity-90" />
                        <span className="leading-tight line-clamp-2">{c.display_name}</span>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Category dropdown */}
          <div>
            <h3 className="font-body text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-4">Category</h3>
            <div className="space-y-2">
              <select
                value={activeCategory ?? "__all__"}
                onChange={(e) => setActiveCategory(e.target.value === "__all__" ? null : e.target.value)}
                className="w-full bg-secondary/50 border border-border font-body text-sm font-medium px-3 py-3 focus:outline-none focus:border-gold focus:bg-background transition-all duration-300"
              >
                <option value="__all__">All categories</option>
                {availableCategories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              {activeCategory && (
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className="font-body text-[11px] font-semibold text-maroon hover:text-maroon-light transition-colors"
                >
                  Clear category
                </button>
              )}
            </div>
          </div>

          {/* Subcategory dropdown */}
          <div>
            <h3 className="font-body text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-4">Subcategory</h3>
            <div className="space-y-2">
              <select
                value={activeSubcategory ?? "__all__"}
                onChange={(e) => (typeof setActiveSubcategory === "function"
                  ? setActiveSubcategory(e.target.value === "__all__" ? null : e.target.value)
                  : undefined)}
                className="w-full bg-secondary/50 border border-border font-body text-sm font-medium px-3 py-3 focus:outline-none focus:border-gold focus:bg-background transition-all duration-300"
              >
                <option value="__all__">All subcategories</option>
                {subcategoryOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              {activeSubcategory && typeof setActiveSubcategory === "function" && (
                <button
                  type="button"
                  onClick={() => setActiveSubcategory(null)}
                  className="font-body text-[11px] font-semibold text-maroon hover:text-maroon-light transition-colors"
                >
                  Clear subcategory
                </button>
              )}
            </div>
          </div>

          {/* Fabric - compact list */}
          <div>
            <h3 className="font-body text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-4">Fabric</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFabric(null)}
                className={`px-3 py-2 font-body text-[11px] font-semibold border transition-all duration-300 ${
                  !activeFabric
                    ? "bg-charcoal text-ivory border-charcoal"
                    : "bg-transparent text-foreground/80 border-border hover:border-gold hover:text-gold"
                }`}
              >
                All
              </button>
              {fabrics.map((fab) => (
                <button
                  key={fab}
                  onClick={() => setActiveFabric(fab)}
                  className={`px-3 py-2 font-body text-[11px] font-semibold border transition-all duration-300 ${
                    activeFabric === fab
                      ? "bg-charcoal text-ivory border-charcoal"
                      : "bg-transparent text-foreground/80 border-border hover:border-gold hover:text-gold"
                  }`}
                >
                  {fab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-border bg-background">
          <button
            onClick={onClose}
            className="luxury-btn-filled w-full text-center"
          >
            View {totalProducts} Results
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
