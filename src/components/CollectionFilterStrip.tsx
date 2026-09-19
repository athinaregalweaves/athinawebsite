import { useRef } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { getCollectionIconComponent } from "@/lib/collectionIcons";
import type { CollectionFilterItem } from "@/lib/collectionFilterList";

interface CollectionFilterStripProps {
  items: CollectionFilterItem[];
  activeKey: string | null;
  onSelect: (key: string | null) => void;
}

const CollectionFilterStrip = ({ items, activeKey, onSelect }: CollectionFilterStripProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  return (
    <div className="relative group/strip">
      <button
        type="button"
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover/strip:opacity-100 transition-opacity duration-300 hover:border-gold hover:text-gold"
        aria-label="Scroll collections left"
      >
        <ChevronLeft size={14} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-0 overflow-x-auto py-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`flex items-center gap-2 px-5 py-2.5 transition-all duration-300 whitespace-nowrap border-b-2 ${
            !activeKey
              ? "border-gold text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          <LayoutGrid size={16} strokeWidth={1.5} />
          <span className="font-body text-[11px] font-bold uppercase tracking-[0.15em]">All</span>
        </button>

        {items.map((item) => {
          const Icon = getCollectionIconComponent(item.iconKey);
          const selected = activeKey === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`flex items-center gap-2 px-5 py-2.5 transition-all duration-300 whitespace-nowrap border-b-2 ${
                selected
                  ? "border-gold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon size={16} strokeWidth={1.5} className="shrink-0" />
              <span className="font-body text-[11px] font-bold uppercase tracking-[0.1em] max-w-[200px] truncate">
                {item.displayName}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover/strip:opacity-100 transition-opacity duration-300 hover:border-gold hover:text-gold"
        aria-label="Scroll collections right"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default CollectionFilterStrip;
