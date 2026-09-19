import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackOrder } from "@/lib/orderApi";

const OrderSuccess = () => {
  const location = useLocation();
  const orderNumber = (location.state as any)?.orderNumber || "ATH-XXXXXXXX";
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const demoOrders = JSON.parse(localStorage.getItem("demo_orders") || "[]");
        const demoMatch = demoOrders.find((o: any) => o.order_number === orderNumber);
        if (demoMatch) {
          if (active) setOrder(demoMatch);
          return;
        }
        const data = await trackOrder(orderNumber);
        if (active) setOrder(data);
      } catch {
        if (active) setOrder(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    if (orderNumber && orderNumber !== "ATH-XXXXXXXX") {
      void load();
    } else {
      setLoading(false);
    }
    return () => {
      active = false;
    };
  }, [orderNumber]);

  return (
    <main className="pt-20 md:pt-24">
      <div className="luxury-container py-20 md:py-32 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle size={40} className="text-green-600" />
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-light tracking-wide mb-4">Order Confirmed!</h1>
        <p className="font-body text-sm text-muted-foreground mb-8">
          Thank you for your purchase. Payment is received; our team will confirm and dispatch your order. You can track progress anytime.
        </p>

        <div className="bg-card border border-border p-6 mb-6">
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-2">Order Number</p>
          <p className="font-display text-2xl font-bold text-primary tracking-wider">{orderNumber}</p>
        </div>

        {!loading && order && (
          <div className="bg-card border border-border p-6 mb-6 text-left space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">Customer</p>
                <p className="font-body text-sm font-semibold">{order.customer_name}</p>
                <p className="font-body text-xs text-muted-foreground">{order.customer_email}</p>
                <p className="font-body text-xs text-muted-foreground">{order.customer_phone}</p>
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">Payment</p>
                <p className={`font-body text-sm font-bold ${order.payment_status === "paid" ? "text-green-700" : "text-accent"}`}>
                  {String(order.payment_status || "pending").toUpperCase()}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-1">
                  Total:{" "}
                  <span className="font-amount text-foreground">
                    ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">Delivery Address</p>
              <p className="font-body text-sm text-foreground">
                {order.address}, {order.city}, {order.state} - {order.pincode}
              </p>
            </div>
            {order.items?.length > 0 && (
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {order.items.map((item: any) => (
                    <div key={item.id || `${item.product_name}-${item.quantity}`} className="flex justify-between text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                      <span className="font-body">{item.product_name} x {item.quantity}</span>
                      <span className="font-amount">₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-accent/5 border border-accent/20 p-4 mb-8 text-left space-y-2">
          <div className="flex items-start gap-3">
            <Package size={18} className="text-accent mt-0.5" />
            <div>
              <p className="font-body text-sm font-bold">What happens next?</p>
              <p className="font-body text-xs text-muted-foreground mt-1">
                Our team will process this order manually. You can track updates as we move it from shipped to delivery and delivered.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/collections">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-body text-sm uppercase tracking-[0.15em] font-bold h-12 px-8">
              Continue Shopping <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
          <Link to={`/track-order?order=${orderNumber}`}>
            <Button variant="outline" className="border-primary text-primary font-body text-sm uppercase tracking-[0.15em] font-bold h-12 px-8">
              Track Order
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" className="border-border font-body text-sm uppercase tracking-[0.15em] font-bold h-12 px-8">
              My Orders
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default OrderSuccess;
