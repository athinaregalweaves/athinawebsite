import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { type SareeProduct } from "@/data/sareeData";
import { useWishlist } from "@/hooks/useWishlist";

interface SareeCardProps {
  product: SareeProduct;
}

const SareeCard = ({ product }: SareeCardProps) => {
  const location = useLocation();
  const { isWishlisted, toggleItem } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const originalPrice = (product as any).originalPrice ?? 0;
  const offerPercent = (product as any).offerPercent ?? 0;
  const showOffer = originalPrice > product.price && offerPercent > 0;

  const rememberCollectionsPosition = (el: HTMLElement) => {
    if (typeof window === "undefined") return;
    const cardTop = el.getBoundingClientRect().top;
    sessionStorage.setItem("athina:collections:lastProductId", String(product.id));
    sessionStorage.setItem("athina:collections:lastCardTop", String(cardTop));
    sessionStorage.setItem("athina:collections:scrollY", String(window.scrollY || 0));
  };

  return (
    <div className="saree-card group relative block animate-fade-in-up" data-product-id={String(product.id)}>
      {/* Wishlist button */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleItem(product); }}
        className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={16} className={wishlisted ? "fill-primary text-primary" : "text-foreground/50"} />
      </button>

      <Link
        to={`/product/${product.id}`}
        state={{
          fromPath: location.pathname,
          fromScrollY: window.scrollY || 0,
        }}
        onClick={(e) => rememberCollectionsPosition(e.currentTarget as HTMLElement)}
      >
        <div className="saree-card-image aspect-[3/4] bg-secondary relative overflow-hidden">
          <img
            src={product.image}
            alt={product.itemName}
            className="w-full h-full object-cover object-center scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-all duration-500" />
          <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <span className="font-body text-[10px] font-bold uppercase tracking-[0.3em] text-ivory bg-charcoal/80 px-4 py-2 inline-block">
              View Details
            </span>
          </div>
        </div>
        <div className="pt-5 pb-2">
          <p className="font-body text-[10px] uppercase tracking-[0.3em] font-semibold text-gold mb-2">{product.sku}</p>
          <h3 className="font-body text-base md:text-lg font-semibold tracking-normal leading-snug">{product.itemName}</h3>
          <div className="mt-2">
            <p className="flex flex-wrap items-baseline gap-2">
              <span className="font-amount text-base md:text-lg tracking-tight text-maroon">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {showOffer && (
                <>
                  <span className="font-amount-muted text-sm text-foreground/45 line-through">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm font-bold text-green-700 bg-green-50 px-2 py-0.5 font-amount-muted">
                    {offerPercent}% OFF
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SareeCard;
