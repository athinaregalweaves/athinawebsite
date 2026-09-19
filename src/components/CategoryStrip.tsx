import { useRef } from "react";
import { ChevronLeft, ChevronRight, Gem, Sparkles, Landmark, Flower2, Leaf, Diamond, Bug, TreePine, Cloud, Palette, Flame, Heart, Scissors, Crown, LayoutGrid } from "lucide-react";

interface CategoryStripProps {
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  categoryNames?: string[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Handloom Kora": <Gem size={18} strokeWidth={1.5} />,
  "Silk Sarees": <Sparkles size={18} strokeWidth={1.5} />,
  "Banarasi": <Landmark size={18} strokeWidth={1.5} />,
  "Kanchipuram": <Flower2 size={18} strokeWidth={1.5} />,
  "Tussar Silk": <Leaf size={18} strokeWidth={1.5} />,
  "Tissue & Organza": <Diamond size={18} strokeWidth={1.5} />,
  "Chanderi": <Bug size={18} strokeWidth={1.5} />,
  "Linen": <TreePine size={18} strokeWidth={1.5} />,
  "Cotton Sarees": <Cloud size={18} strokeWidth={1.5} />,
  "Printed Sarees": <Palette size={18} strokeWidth={1.5} />,
  "Festive Collection": <Flame size={18} strokeWidth={1.5} />,
  "Wedding Collection": <Heart size={18} strokeWidth={1.5} />,
  "Dress Material": <Scissors size={18} strokeWidth={1.5} />,
  "Limited Edition": <Crown size={18} strokeWidth={1.5} />,
};

const CategoryStrip = ({ activeCategory, setActiveCategory, categoryNames = [] }: CategoryStripProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  return (
    <div className="relative group/strip">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover/strip:opacity-100 transition-opacity duration-300 hover:border-gold hover:text-gold"
      >
        <ChevronLeft size={14} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-0 overflow-x-auto py-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          onClick={() => setActiveCategory(null)}
          className={`flex items-center gap-2 px-5 py-2.5 transition-all duration-300 whitespace-nowrap border-b-2 ${
            !activeCategory
              ? "border-gold text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          <LayoutGrid size={16} strokeWidth={1.5} />
          <span className="font-body text-[11px] font-bold uppercase tracking-[0.15em]">All</span>
        </button>

        {categoryNames.map((name) => (
          <button
            key={name}
            onClick={() => setActiveCategory(name)}
            className={`flex items-center gap-2 px-5 py-2.5 transition-all duration-300 whitespace-nowrap border-b-2 ${
              activeCategory === name
                ? "border-gold text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {categoryIcons[name] || <Gem size={16} strokeWidth={1.5} />}
            <span className="font-body text-[11px] font-bold uppercase tracking-[0.1em]">
              {name}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover/strip:opacity-100 transition-opacity duration-300 hover:border-gold hover:text-gold"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default CategoryStrip;
