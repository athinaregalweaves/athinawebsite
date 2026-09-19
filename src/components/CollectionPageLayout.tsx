import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { sareeProducts, categories, type SareeProduct } from "@/data/sareeData";
import SareeCard from "@/components/SareeCard";
import FilterSidebar from "@/components/FilterSidebar";
import CategoryStrip from "@/components/CategoryStrip";
import { SlidersHorizontal, Search, X, LayoutGrid, Rows3 } from "lucide-react";

interface CollectionPageLayoutProps {
  title: string;
  caption: string;
  description: string;
  products: SareeProduct[];
  /** Small line icon before title (e.g. custom collection logo) */
  titleIcon?: React.ReactNode;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}

const CollectionPageLayout = ({
  title,
  caption,
  description,
  titleIcon,
  products,
  emptyIcon,
  emptyTitle = "Collection Coming Soon",
  emptyDescription = "We're curating this collection. Check back soon for beautiful sarees.",
}: CollectionPageLayoutProps) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeFabric, setActiveFabric] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 99999]);
  const [sortBy, setSortBy] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.itemName.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (activeFabric) {
      result = result.filter((p) => p.fabric === activeFabric);
    }
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.itemName.localeCompare(b.itemName));
        break;
    }

    return result;
  }, [products, activeCategory, activeFabric, priceRange, sortBy, searchQuery]);

  const activeDesc = activeCategory
    ? categories.find((c) => c.name === activeCategory)?.description
    : description;

  const activeFilters = [
    activeCategory,
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
        activeFabric={activeFabric}
        setActiveFabric={setActiveFabric}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalProducts={filteredProducts.length}
      />

      {/* Header */}
      <section className="luxury-container py-8 md:py-10 text-center">
        <p className="luxury-caption text-gold mb-2">{caption}</p>
        <h1 className="font-display text-3xl md:text-4xl font-normal tracking-tight flex items-center justify-center gap-3 flex-wrap">
          {titleIcon}
          <span>{title}</span>
        </h1>
        <div className="w-14 h-[2px] mx-auto my-4 bg-gold" />
        <p className="font-body text-base md:text-lg text-foreground/80 max-w-2xl mx-auto">
          {activeDesc}
        </p>
      </section>

      {/* Category Strip */}
      <div className="border-y border-border bg-background/80 backdrop-blur-sm sticky top-[72px] z-30">
        <div className="luxury-container">
          <CategoryStrip
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        </div>
      </div>

      {/* Search + Toolbar */}
      <div className="luxury-container pt-5">
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60" />
                <input
            type="text"
            placeholder="Search by name, SKU, fabric, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 border border-border font-body text-base font-medium pl-12 pr-12 py-3.5 focus:outline-none focus:border-gold focus:bg-background transition-all duration-300 placeholder:text-foreground/50"
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

            <p className="font-body text-base font-semibold text-foreground/80">
              {filteredProducts.length} pieces
            </p>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="font-body text-[12px] uppercase tracking-[0.2em] font-semibold text-foreground/70 mr-1">
              Active:
            </span>
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
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
            <h3 className="luxury-subheading mb-4">{products.length === 0 ? emptyTitle : "No sarees found"}</h3>
            <p className="luxury-body text-foreground/80 mb-6">
              {products.length === 0 ? emptyDescription : "Try adjusting your filters or search terms."}
            </p>
            {products.length === 0 ? (
              <Link to="/collections" className="luxury-btn-gold">Browse All Collections</Link>
            ) : (
              <button
                onClick={() => {
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
            )}
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

export default CollectionPageLayout;
