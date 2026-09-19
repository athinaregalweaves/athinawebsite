import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { trackOrder } from "@/lib/orderApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Package, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";

/** Manual order flow: paid → processing → confirmed → shipped → delivery → delivered */
const STATUS_STEPS = [
  { key: "pending", label: "Order placed", icon: Clock },
  { key: "processing", label: "Payment received · Preparing", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivery", label: "Out for delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const orderFromUrl = (searchParams.get("order") || "").trim();
  const [orderNumber, setOrderNumber] = useState(orderFromUrl);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const doTrack = useCallback(async (num: string) => {
    const trimmed = num.trim();
    if (!trimmed) return;
    setLoading(true);
    setOrder(null);
    const demoOrders = JSON.parse(localStorage.getItem("demo_orders") || "[]");
    const demoMatch = demoOrders.find((o: any) => o.order_number === trimmed);
    if (demoMatch) {
      setOrder(demoMatch);
      setLoading(false);
      return;
    }
    try {
      const data = await trackOrder(trimmed);
      setOrder(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Try again";
      toast({ title: "Order Not Found", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (orderFromUrl) {
      setOrderNumber(orderFromUrl);
      void doTrack(orderFromUrl);
    }
  }, [orderFromUrl, doTrack]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    await doTrack(orderNumber);
  };

  const getStepIndex = (status: string) => {
    if (status === "cancelled") return -1;
    return STATUS_STEPS.findIndex(s => s.key === status);
  };

  const currentStep = order ? getStepIndex(order.status) : -1;

  return (
    <main className="pt-20 md:pt-24">
      <div className="luxury-container py-8 md:py-16 max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="font-display text-3xl md:text-4xl font-light tracking-wide mb-3">Track Your Order</h1>
        <p className="font-body text-sm text-muted-foreground mb-8">Enter your order number to check the status</p>

        <form onSubmit={handleTrack} className="flex gap-3 mb-10">
          <Input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. ATH-A1B2C3D4"
            className="bg-card border-border h-12 font-body uppercase tracking-wider"
          />
          <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-body text-sm uppercase tracking-widest font-bold h-12 px-6">
            <Search size={16} className="mr-2" />
            {loading ? "..." : "Track"}
          </Button>
        </form>

        {order && (
          <div className="bg-card border border-border p-6 md:p-8 space-y-8 animate-fade-in">
            {/* Order header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Order Number</p>
                <p className="font-display text-xl font-bold text-primary">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Total Amount</p>
                <p className="font-amount text-xl text-primary">
                  ₹{Number(order.total_amount).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Cancelled state */}
            {order.status === "cancelled" ? (
              <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 p-4">
                <XCircle size={24} className="text-destructive" />
                <div>
                  <p className="font-body text-sm font-bold text-destructive">Order Cancelled</p>
                  <p className="font-body text-xs text-muted-foreground">This order has been cancelled.</p>
                </div>
              </div>
            ) : (
              /* Progress tracker */
              <div className="relative">
                <div className="flex justify-between">
                  {STATUS_STEPS.map((step, i) => {
                    const isActive = i <= currentStep;
                    const isCurrent = i === currentStep;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCurrent ? "bg-primary border-primary text-primary-foreground scale-110" :
                          isActive ? "bg-primary/20 border-primary text-primary" :
                          "bg-muted border-border text-muted-foreground"
                        }`}>
                          <Icon size={18} />
                        </div>
                        <p className={`font-body text-[10px] mt-2 text-center ${isActive ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {/* Progress bar */}
                <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-border -z-10">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.max(0, currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Order items */}
            {order.items?.length > 0 && (
              <div>
                <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Items</p>
                <div className="space-y-3">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-body text-sm">{item.product_name}</p>
                        <p className="font-body text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-amount text-sm text-primary">
                        ₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">Shipping To</p>
                <p className="font-body font-medium">{order.customer_name}</p>
                <p className="font-body text-muted-foreground">{order.address}, {order.city}</p>
                <p className="font-body text-muted-foreground">{order.state} - {order.pincode}</p>
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">Payment</p>
                <p className={`font-body font-bold ${order.payment_status === 'paid' ? 'text-green-700' : 'text-accent'}`}>
                  {order.payment_status?.toUpperCase()}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-1">
                  Ordered: {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default TrackOrder;
