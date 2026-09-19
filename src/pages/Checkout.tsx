import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { createOrder, createPayment, verifyPayment, markPaymentFailed } from "@/lib/orderApi";
import { isCustomerLoggedIn, getStoredCustomer, updateCustomerProfile, saveCustomerSession, getCustomerToken } from "@/lib/customerApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Lock, CreditCard } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const { items, getTotal, clearCart, getCount } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const customer = getStoredCustomer();
  const loggedIn = isCustomerLoggedIn();

  const [form, setForm] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    city: customer?.city || "",
    state: customer?.state || "",
    pincode: customer?.pincode || "",
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Load saved checkout details (from pre-auth fill)
  useEffect(() => {
    const saved = localStorage.getItem("checkout_details");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm(f => ({ ...f, ...parsed }));
      } catch {}
    }
  }, []);

  if (items.length === 0) {
    return (
      <main className="pt-20 md:pt-24">
        <div className="luxury-container py-20 text-center">
          <h1 className="font-display text-3xl font-light mb-4">Your bag is empty</h1>
          <Link to="/collections" className="text-primary font-body font-bold">Continue Shopping</Link>
        </div>
      </main>
    );
  }

  const isDemoUser = customer?.email === "customer@gmail.com";

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // If not logged in, save details and redirect to register
    if (!loggedIn) {
      localStorage.setItem("checkout_details", JSON.stringify(form));
      toast({ title: "Almost there!", description: "Create a quick account to complete your order" });
      navigate("/register?redirect=/checkout", { replace: true });
      return;
    }

    const pinDigits = form.pincode.replace(/\s/g, "");
    if (!/^\d{6}$/.test(pinDigits)) {
      toast({
        title: "Invalid pincode",
        description: "Enter a valid 6-digit Indian postal code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const orderItems = items.map(({ product, quantity }) => ({
        product_id: product.id,
        product_name: product.itemName,
        product_sku: product.sku,
        price: product.price,
        quantity,
      }));

      // Demo mode — simulate order without backend
      if (isDemoUser) {
        const orderNumber = "ATH-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        const demoOrder = {
          id: Date.now(),
          order_number: orderNumber,
          customer_name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          items: orderItems,
          total_amount: getTotal(),
          status: "confirmed",
          payment_status: "paid",
          created_at: new Date().toISOString(),
        };
        // Save to localStorage for demo tracking
        const existingOrders = JSON.parse(localStorage.getItem("demo_orders") || "[]");
        existingOrders.unshift(demoOrder);
        localStorage.setItem("demo_orders", JSON.stringify(existingOrders));

        clearCart();
        toast({ title: "Payment Successful!", description: "Demo order placed successfully" });
        navigate("/order-success", { state: { orderNumber }, replace: true });
        return;
      }

      // Real flow with Razorpay
      const { order_id, order_number } = await createOrder({
        ...form,
        items: orderItems,
        total: getTotal(),
        customer_id: customer?.id,
      });

      try {
        const updated = await updateCustomerProfile({
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        });
        const tok = getCustomerToken();
        if (tok) saveCustomerSession(tok, updated);
      } catch {
        /* non-fatal: order still proceeds */
      }

      const paymentData = await createPayment(order_id, getTotal());
      const markAsFailed = async () => {
        try {
          await markPaymentFailed(order_id);
        } catch {
          // Non-fatal for user; admin can still adjust from dashboard if needed.
        }
      };

      const options = {
        key: paymentData.razorpay_key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "Athina Regal Weaves",
        description: `Order ${order_number}`,
        order_id: paymentData.razorpay_order_id,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#722F37" },
        handler: async (response: any) => {
          try {
            await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              order_id,
            });
            clearCart();
            navigate("/order-success", { state: { orderNumber: order_number }, replace: true });
          } catch {
            await markAsFailed();
            toast({ title: "Payment Verification Failed", description: "Contact us if amount was deducted", variant: "destructive" });
          }
        },
        modal: {
          ondismiss: async () => {
            await markAsFailed();
            toast({ title: "Payment Cancelled", description: "Order is marked as payment failed." });
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <main className="pt-20 md:pt-24">
      <div className="luxury-container py-8 md:py-12">
        <Link to="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Bag
        </Link>

        <h1 className="font-display text-3xl md:text-4xl font-light tracking-wide mb-10">Checkout</h1>

        <form onSubmit={handleCheckout}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            {/* Shipping Details */}
            <div className="lg:col-span-2 space-y-8">
            {!loggedIn && (
                <div className="bg-accent/5 border border-accent/20 p-4 rounded">
                  <p className="font-body text-sm text-muted-foreground">
                    Fill in your details below. You'll create a quick account before payment.
                    Already have one? <Link to="/login?redirect=/checkout" className="text-primary font-bold">Sign in</Link>
                  </p>
                </div>
              )}

              <div>
                <h2 className="font-body text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-5">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-body text-sm font-bold text-muted-foreground">Full Name *</label>
                    <Input value={form.name} onChange={update("name")} className="bg-background border-border h-12" placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <label className="font-body text-sm font-bold text-muted-foreground">Email *</label>
                    <Input type="email" value={form.email} onChange={update("email")} className="bg-background border-border h-12" placeholder="your@email.com" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-body text-sm font-bold text-muted-foreground">Phone *</label>
                    <Input type="tel" value={form.phone} onChange={update("phone")} className="bg-background border-border h-12" placeholder="+91 98765 43210" required />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-body text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-5">Shipping Address</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="font-body text-sm font-bold text-muted-foreground">Street Address *</label>
                    <Input value={form.address} onChange={update("address")} className="bg-background border-border h-12" placeholder="House/flat no, street, area" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-body text-sm font-bold text-muted-foreground">City *</label>
                      <Input value={form.city} onChange={update("city")} className="bg-background border-border h-12" placeholder="City" required />
                    </div>
                    <div className="space-y-2">
                      <label className="font-body text-sm font-bold text-muted-foreground">State *</label>
                      <Input value={form.state} onChange={update("state")} className="bg-background border-border h-12" placeholder="State" required />
                    </div>
                  </div>
                  <div className="space-y-2 max-w-xs">
                    <label className="font-body text-sm font-bold text-muted-foreground">Pincode *</label>
                    <Input
                      value={form.pincode}
                      onChange={update("pincode")}
                      className="bg-background border-border h-12"
                      placeholder="500001"
                      inputMode="numeric"
                      maxLength={6}
                      pattern="\d{6}"
                      title="6-digit Indian pincode"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border p-6 sticky top-24">
                <h3 className="font-body text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">
                  Order Summary · {getCount()} items
                </h3>

                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-3">
                      <div className="w-14 h-18 shrink-0 overflow-hidden bg-secondary">
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-sm line-clamp-1">{product.itemName}</p>
                        <p className="font-body text-xs text-muted-foreground">Qty: {quantity}</p>
                        <p className="font-amount text-sm text-primary">₹{(product.price * quantity).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2 mb-6">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-amount">₹{getTotal().toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-700">Free</span>
                  </div>
                  <div className="flex justify-between font-body text-sm font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="font-amount text-xl text-primary">
                      ₹{getTotal().toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <Button type="submit" disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-sm uppercase tracking-[0.15em] font-bold h-14">
                  <CreditCard size={18} className="mr-2" />
                  {loading ? "Processing..." : loggedIn ? `Pay ₹${getTotal().toLocaleString("en-IN")}` : "Continue to Create Account"}
                </Button>

                {/* Policy links near payment CTA (common compliance requirement). */}
                <div className="mt-4 text-center">
                  <p className="font-body text-[10px] text-muted-foreground leading-relaxed">
                    By paying, you agree to our{" "}
                    <Link to="/privacy-policy" className="text-gold hover:underline font-semibold">Privacy Policy</Link>,{" "}
                    <Link to="/terms-conditions" className="text-gold hover:underline font-semibold">Terms &amp; Conditions</Link>,{" "}
                    <Link to="/shipping-policy" className="text-gold hover:underline font-semibold">Shipping Policy</Link>, and{" "}
                    <Link to="/refund-policy" className="text-gold hover:underline font-semibold">Refund &amp; Cancellation</Link>.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 mt-4">
                  <Lock size={12} className="text-muted-foreground" />
                  <span className="font-body text-[10px] text-muted-foreground">Secured by Razorpay · 256-bit SSL</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Checkout;
