import { Link } from "react-router-dom";
import { useWishlist } from "@/hooks/useWishlist";
import SareeCard from "@/components/SareeCard";
import { Heart, ArrowRight } from "lucide-react";

const Wishlist = () => {
  const { items } = useWishlist();

  return (
    <main className="pt-20 md:pt-24">
      <section className="luxury-container py-8 md:py-10 text-center">
        <p className="luxury-caption text-gold mb-2">Your Favourites</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          My Wishlist
        </h1>
        <div className="w-14 h-[2px] mx-auto my-4 bg-gold" />
        <p className="font-body text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
          Sarees you've saved to revisit and purchase later — just like your personal lookbook.
        </p>
      </section>

      <section className="luxury-container pb-20 md:pb-32">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} strokeWidth={1.2} className="mx-auto text-muted-foreground/30 mb-6" />
            <h3 className="font-display text-xl font-bold mb-3">Your wishlist is empty</h3>
            <p className="font-body text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
              Tap the heart icon on any saree to save it here for later.
            </p>
            <Link
              to="/collections"
              className="luxury-btn-gold inline-flex items-center gap-2"
            >
              Browse Collections <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            <p className="font-body text-sm font-semibold text-muted-foreground mb-6">
              {items.length} {items.length === 1 ? "piece" : "pieces"} saved
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {items.map((product) => (
                <SareeCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default Wishlist;
