import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotal, getCount } = useCart();

  if (items.length === 0) {
    return (
      <main className="pt-20 md:pt-24">
        <div className="luxury-container py-20 md:py-32 text-center">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground/30 mb-6" />
          <h1 className="font-display text-3xl font-light tracking-wide mb-4">Your Bag is Empty</h1>
          <p className="font-body text-sm text-muted-foreground mb-8">Discover our handcrafted sarees and add your favourites</p>
          <Link to="/collections">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-body text-sm uppercase tracking-[0.15em] font-bold h-12 px-10">
              Explore Collections
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 md:pt-24">
      <div className="luxury-container py-8 md:py-12">
        <Link to="/collections" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>

        <h1 className="font-display text-3xl md:text-4xl font-light tracking-wide mb-2">Shopping Bag</h1>
        <p className="font-body text-sm text-muted-foreground mb-10">{getCount()} {getCount() === 1 ? 'item' : 'items'}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-5 bg-card border border-border p-4">
                <Link to={`/product/${product.id}`} className="w-24 h-32 shrink-0 overflow-hidden bg-secondary">
                  <img src={product.image} alt={product.itemName} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${product.id}`} className="font-display text-lg font-light hover:text-primary transition-colors line-clamp-1">
                    {product.itemName}
                  </Link>
                  <p className="font-body text-xs text-muted-foreground tracking-wider mt-1">{product.category} · {product.sku}</p>
                  <p className="font-amount text-lg text-primary mt-2">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} className="p-2 hover:bg-secondary transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="px-4 font-body text-sm font-bold">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} className="p-2 hover:bg-secondary transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(product.id)} className="text-destructive/60 hover:text-destructive transition-colors p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border p-6 sticky top-24">
              <h3 className="font-body text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-amount">₹{getTotal().toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold text-green-700">Free</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">GST (included)</span>
                  <span className="font-amount">₹{Math.round(getTotal() * 0.05).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="font-body text-sm font-bold uppercase tracking-wider">Total</span>
                  <span className="font-amount text-2xl text-primary">
                    ₹{getTotal().toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <Link to="/checkout">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-sm uppercase tracking-[0.2em] font-bold h-14">
                  Proceed to Checkout <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>

              <p className="font-body text-[10px] text-muted-foreground text-center mt-4">
                Secure payment via Razorpay · UPI, Cards, Net Banking
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
