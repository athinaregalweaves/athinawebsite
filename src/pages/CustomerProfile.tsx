import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCustomerProfile, updateCustomerProfile, logoutCustomer, isCustomerLoggedIn, getStoredCustomer, getCustomerToken, type CustomerUser } from "@/lib/customerApi";
import { setCustomerUserJson } from "@/lib/authStorage";
import { createPayment, verifyPayment, markPaymentFailed } from "@/lib/orderApi";
import { useWishlist } from "@/hooks/useWishlist";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, MapPin, Building2, Hash, LogOut, ArrowLeft, Save, Heart, Package, Search } from "lucide-react";
import SareeCard from "@/components/SareeCard";
import { API_BASE_URL } from "@/lib/env";

const API_BASE = API_BASE_URL;

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CustomerProfile = () => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "track" | "wishlist">("profile");
  const [trackInput, setTrackInput] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [retryingOrderId, setRetryingOrderId] = useState<number | null>(null);
  const wishlistItems = useWishlist((s) => s.items);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isCustomerLoggedIn()) {
      navigate("/login", { replace: true });
      return;
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const stored = getStoredCustomer();
    // Demo user — use localStorage data directly
    if (stored?.email === "customer@gmail.com") {
      setUser(stored);
      setForm({
        name: stored.name, phone: stored.phone, address: stored.address,
        city: stored.city, state: stored.state, pincode: stored.pincode,
      });
      setLoading(false);
      return;
    }
    try {
      const profile = await getCustomerProfile();
      setUser(profile);
      setForm({
        name: profile.name, phone: profile.phone, address: profile.address,
        city: profile.city, state: profile.state, pincode: profile.pincode,
      });
    } catch {
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      // Demo user — load from localStorage
      if (user?.email === "customer@gmail.com") {
        const demoOrders = JSON.parse(localStorage.getItem("demo_orders") || "[]");
        setOrders(demoOrders);
        setOrdersLoading(false);
        return;
      }
      const token = getCustomerToken();
      const res = await fetch(`${API_BASE}/orders.php?action=my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Error", description: "Failed to load orders", variant: "destructive" });
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders" && orders.length === 0) loadOrders();
  }, [activeTab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateCustomerProfile(form);
      setUser(updated);
      setCustomerUserJson(JSON.stringify(updated));
      toast({ title: "Profile Updated", description: "Your details have been saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutCustomer();
    toast({ title: "Logged Out", description: "See you soon!" });
    navigate("/", { replace: true });
  };

  const retryPayment = async (order: any) => {
    setRetryingOrderId(Number(order.id));
    try {
      // Demo account: mark paid locally.
      if (user?.email === "customer@gmail.com") {
        const demoOrders = JSON.parse(localStorage.getItem("demo_orders") || "[]");
        const updated = demoOrders.map((o: any) =>
          Number(o.id) === Number(order.id) ? { ...o, payment_status: "paid", status: "processing" } : o
        );
        localStorage.setItem("demo_orders", JSON.stringify(updated));
        setOrders(updated);
        toast({ title: "Payment Successful", description: "Demo order payment marked as paid." });
        return;
      }

      const paymentData = await createPayment(Number(order.id), Number(order.total_amount));
      const markAsFailed = async () => {
        try {
          await markPaymentFailed(Number(order.id));
          setOrders((prev) =>
            prev.map((o) =>
              Number(o.id) === Number(order.id) ? { ...o, payment_status: "failed", status: "pending" } : o
            )
          );
        } catch {
          // Non-fatal: backend may still be updated by gateway callbacks.
        }
      };

      const options = {
        key: paymentData.razorpay_key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "Athina Regal Weaves",
        description: `Retry payment for ${order.order_number}`,
        order_id: paymentData.razorpay_order_id,
        prefill: {
          name: order.customer_name || user?.name || "",
          email: order.customer_email || user?.email || "",
          contact: order.customer_phone || user?.phone || "",
        },
        theme: { color: "#722F37" },
        handler: async (response: any) => {
          try {
            await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              order_id: Number(order.id),
            });
            setOrders((prev) =>
              prev.map((o) =>
                Number(o.id) === Number(order.id) ? { ...o, payment_status: "paid", status: "processing" } : o
              )
            );
            toast({ title: "Payment Successful", description: "Order payment completed." });
          } catch {
            await markAsFailed();
            toast({ title: "Payment Verification Failed", description: "Payment marked as failed.", variant: "destructive" });
          } finally {
            setRetryingOrderId(null);
          }
        },
        modal: {
          ondismiss: async () => {
            await markAsFailed();
            toast({ title: "Payment Cancelled", description: "Order remains unpaid.", variant: "destructive" });
            setRetryingOrderId(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast({ title: "Retry failed", description: err?.message || "Could not start payment.", variant: "destructive" });
      setRetryingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <p className="font-body text-muted-foreground animate-pulse">Loading profile...</p>
      </div>
    );
  }

  const Field = ({ icon: Icon, label, field, type = "text", placeholder }: any) => (
    <div className="space-y-2">
      <label className="font-body text-sm font-bold text-muted-foreground block">{label}</label>
      <div className="relative">
        <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
        <Input type={type} value={(form as any)[field]} onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}
          className="pl-10 bg-background border-border h-12" placeholder={placeholder} />
      </div>
    </div>
  );

  const tabs = [
    { key: "profile" as const, label: "Profile", icon: User },
    { key: "orders" as const, label: "My Orders", icon: Package },
    { key: "track" as const, label: "Track order", icon: Search },
    { key: "wishlist" as const, label: `Wishlist (${wishlistItems.length})`, icon: Heart },
  ];

  return (
    <main className="pt-20 md:pt-24">
      <div className="luxury-container py-8 md:py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-primary">My Account</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">{user?.email}</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 font-body text-sm font-bold text-destructive hover:text-destructive/80 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 font-body text-sm font-bold transition-colors border-b-2 ${
                activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {activeTab === "profile" && (
          <div className="max-w-lg">
            <form onSubmit={handleSave} className="bg-card border border-border p-8 space-y-5">
              <Field icon={User} label="Full Name" field="name" placeholder="Your full name" />
              <Field icon={Phone} label="Phone Number" field="phone" placeholder="+91 98765 43210" />
              <Field icon={MapPin} label="Address" field="address" placeholder="Street address" />
              <div className="grid grid-cols-2 gap-4">
                <Field icon={Building2} label="City" field="city" placeholder="City" />
                <Field icon={Building2} label="State" field="state" placeholder="State" />
              </div>
              <Field icon={Hash} label="Pincode" field="pincode" placeholder="500001" />
              <Button type="submit" disabled={saving}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-sm uppercase tracking-[0.15em] font-bold h-12">
                <Save size={16} className="mr-2" />
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </div>
        )}

        {/* Track order tab */}
        {activeTab === "track" && (
          <div className="max-w-lg space-y-5">
            <p className="font-body text-sm text-muted-foreground">
              Enter the order number from your confirmation email (for example <span className="font-mono text-foreground">ATH-XXXXXXXX</span>
              ). You’ll see live status updates and complete order details.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const n = trackInput.trim();
                if (!n) return;
                navigate(`/track-order?order=${encodeURIComponent(n)}`);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Input
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                placeholder="e.g. ATH-A1B2C3D4"
                className="bg-background border-border h-12 font-body uppercase tracking-wider flex-1"
              />
              <Button
                type="submit"
                className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-body text-sm uppercase tracking-widest font-bold px-8 shrink-0"
              >
                <Search size={16} className="mr-2" />
                Track
              </Button>
            </form>
            <p className="font-body text-xs text-muted-foreground">
              Tip: from <span className="font-semibold text-foreground">My Orders</span>, use <span className="font-semibold text-foreground">Track</span> next to any purchase.
            </p>
          </div>
        )}

        {/* Orders tab */}
        {activeTab === "orders" && (
          <div>
            {ordersLoading ? (
              <p className="font-body text-muted-foreground animate-pulse py-12 text-center">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="font-body text-muted-foreground mb-4">No orders yet</p>
                <Link to="/collections" className="font-body text-sm font-bold text-primary hover:underline">Start Shopping</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-card border border-border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-display text-base font-bold text-primary">{order.order_number}</p>
                      <p className="font-body text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-amount text-lg text-primary">₹{Number(order.total_amount).toLocaleString("en-IN")}</p>
                        <div className="flex flex-col items-end gap-0.5 mt-1">
                          {order.payment_status === "paid" ? (
                            <>
                              <span className="font-body text-xs font-bold capitalize px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-900 border border-emerald-200/80">
                                Paid
                              </span>
                              <span className="font-body text-[10px] font-semibold text-muted-foreground capitalize">
                                Order · {order.status}
                              </span>
                            </>
                          ) : (
                            <span className="font-body text-xs font-bold capitalize px-2 py-0.5 rounded-sm bg-red-100 text-red-800 border border-red-200/80">
                              Payment failed
                            </span>
                          )}
                        </div>
                      </div>
                      {(order.payment_status === "failed" || order.payment_status === "pending") && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-[11px] font-bold"
                          disabled={retryingOrderId === Number(order.id)}
                          onClick={() => void retryPayment(order)}
                        >
                          {retryingOrderId === Number(order.id) ? "Opening..." : "Retry Payment"}
                        </Button>
                      )}
                      <Link to={`/track-order?order=${order.order_number}`}
                        className="font-body text-xs font-bold text-primary hover:underline flex items-center gap-1">
                        <Search size={12} /> Track
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist tab */}
        {activeTab === "wishlist" && (
          <div>
            {wishlistItems.length === 0 ? (
              <div className="text-center py-16">
                <Heart size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="font-body text-muted-foreground mb-4">Your wishlist is empty</p>
                <Link to="/collections" className="font-body text-sm font-bold text-primary hover:underline">Browse Collections</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlistItems.map((product) => (
                  <SareeCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default CustomerProfile;
