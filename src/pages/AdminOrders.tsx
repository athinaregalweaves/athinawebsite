import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { verifyToken } from "@/lib/api";
import { clearAdminSession, getAdminToken } from "@/lib/authStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, ChevronLeft, ChevronRight, Eye, RefreshCw, Copy } from "lucide-react";
import { API_BASE_URL } from "@/lib/env";
import { dedupeOrdersList } from "@/lib/dedupeOrders";

const API_BASE = API_BASE_URL;

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivery", "delivered", "cancelled"];
const PAYMENT_OPTIONS = ["pending", "paid", "failed", "refunded"] as const;
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-cyan-100 text-cyan-800",
  delivery: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};
const PAYMENT_COLORS: Record<string, string> = {
  pending: "text-yellow-700",
  paid: "text-green-700",
  failed: "text-red-700",
  refunded: "text-orange-700",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    verifyToken()
      .then(() => fetchOrders())
      .catch(() => { clearAdminSession(); navigate("/admin/login", { replace: true }); });
  }, [page]);

  /** Keep list in sync with Razorpay / other tabs; pause when tab hidden. */
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      const token = getAdminToken();
      if (!token) return;
      fetchOrders({ silent: true });
    };
    const id = window.setInterval(tick, 45000);
    const onVis = () => { if (document.visibilityState === "visible") tick(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [page]);

  const fetchOrders = async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);
    if (!silent) setLoading(true);
    const token = getAdminToken();

    try {
      const res = await fetch(`${API_BASE}/orders.php?action=admin-list&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (!res.ok || data.error) {
          if (!silent) {
            toast({
              title: "Orders API error",
              description: typeof data.error === "string" ? data.error : `HTTP ${res.status}`,
              variant: "destructive",
            });
          }
          if (!silent) {
            setOrders([]);
            setTotal(0);
            setPages(1);
          }
          return;
        }
        setOrders(dedupeOrdersList(Array.isArray(data.orders) ? data.orders : []));
        setTotal(Number(data.total) || 0);
        setPages(Number(data.pages) || 1);
      } catch {
        if (!silent) {
          setOrders([]);
          setTotal(0);
          setPages(1);
          toast({
            title: "Could not load orders",
            description: "The server did not return valid JSON. Upload api/orders.php or check PHP errors on the server.",
            variant: "destructive",
          });
        }
      }
    } catch {
      if (!silent) {
        setOrders([]);
        setTotal(0);
        setPages(1);
        toast({
          title: "Could not load orders",
          description: "Network error or API unreachable.",
          variant: "destructive",
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const updateStatus = async (orderId: number, status: string) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_BASE}/orders.php?action=update-status&id=${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        toast({
          title: "Could not update status",
          description: typeof data.error === "string" ? data.error : `HTTP ${res.status}`,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Order updated",
        description: `Status set to ${status}`,
      });
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        const detailRes = await fetch(`${API_BASE}/orders.php?action=admin-detail&id=${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const detail = await detailRes.json().catch(() => null);
        if (detailRes.ok && detail?.order_number) setSelectedOrder(detail);
        else setSelectedOrder((p: any) => (p ? { ...p, status } : p));
      }
    } catch {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const updatePaymentStatus = async (orderId: number, payment_status: string) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_BASE}/orders.php?action=update-payment-status&id=${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ payment_status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        toast({
          title: "Could not update payment",
          description: typeof data.error === "string" ? data.error : `HTTP ${res.status}`,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Payment updated",
        description: `Payment: ${payment_status}`,
      });
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        const detailRes = await fetch(`${API_BASE}/orders.php?action=admin-detail&id=${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const detail = await detailRes.json().catch(() => null);
        if (detailRes.ok && detail?.order_number) setSelectedOrder(detail);
        else setSelectedOrder((p: any) => (p ? { ...p, payment_status } : p));
      }
    } catch {
      toast({ title: "Error", description: "Failed to update payment", variant: "destructive" });
    }
  };

  const viewOrderDetails = async (order: any) => {
    const token = getAdminToken();
    if (!token) {
      setSelectedOrder(order);
      return;
    }
    try {
      const detailRes = await fetch(`${API_BASE}/orders.php?action=admin-detail&id=${encodeURIComponent(String(order.id))}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const detailText = await detailRes.text();
      let data: any = null;
      try {
        data = JSON.parse(detailText);
      } catch {
        data = null;
      }
      if (detailRes.ok && data && !data.error && data.order_number) {
        const items =
          Array.isArray(data.items) && data.items.length > 0
            ? data.items
            : Array.isArray(order.items)
              ? order.items
              : [];
        setSelectedOrder({ ...order, ...data, items });
        return;
      }
      const trackRes = await fetch(
        `${API_BASE}/orders.php?action=track&order_number=${encodeURIComponent(String(order.order_number || ""))}`
      );
      const trackText = await trackRes.text();
      try {
        const trackData = JSON.parse(trackText);
        if (trackRes.ok && trackData && !trackData.error) {
          const items =
            Array.isArray(trackData.items) && trackData.items.length > 0
              ? trackData.items
              : Array.isArray(order.items)
                ? order.items
                : [];
          setSelectedOrder({ ...order, ...trackData, items });
          return;
        }
      } catch {
        /* ignore */
      }
      toast({
        title: "Could not load order details",
        description: data?.error || "Try again or check orders.php on the server.",
        variant: "destructive",
      });
      setSelectedOrder(order);
    } catch {
      setSelectedOrder(order);
    }
  };

  const copyText = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Copied", description: `${label} copied to clipboard.` });
    } catch {
      toast({ title: "Copy failed", description: `Could not copy ${label.toLowerCase()}.`, variant: "destructive" });
    }
  };

  const filtered = orders.filter(o => {
    const matchesSearch = !searchQuery || 
      o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Orders</h1>
            <p className="font-body text-xs sm:text-sm text-muted-foreground max-w-xl">
              {total} total orders · auto-refresh every 45s when this tab is visible.
              After online payment, status is <strong className="font-semibold text-foreground/80">Processing</strong> until you set{" "}
              <strong className="font-semibold text-foreground/80">Confirmed</strong>. Then update manually as shipped, delivery, and delivered.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={fetchOrders} variant="outline" size="sm" className="font-body">
              <RefreshCw size={14} className="mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search order #, name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border h-10 font-body text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-card border-border h-10 font-body text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUS_OPTIONS.map(s => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Order #", "Customer", "Amount", "Status", "Payment", "Date", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center font-body text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center font-body text-muted-foreground">No orders found</td></tr>
              ) : filtered.map(order => (
                <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-body font-normal tabular-nums text-primary">{order.order_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-body font-medium">{order.customer_name}</p>
                    <p className="font-body text-xs text-muted-foreground">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 font-amount text-sm">
                    ₹{Number(order.total_amount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <Select value={order.status} onValueChange={(val) => updateStatus(order.id, val)}>
                      <SelectTrigger className={`h-7 text-xs font-normal border-0 w-[120px] ${STATUS_COLORS[order.status] || ""}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => (
                          <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={order.payment_status || "pending"}
                      onValueChange={(val) => updatePaymentStatus(order.id, val)}
                    >
                      <SelectTrigger
                        className={`h-7 text-xs font-normal border-0 w-[110px] capitalize bg-transparent ${PAYMENT_COLORS[order.payment_status] || PAYMENT_COLORS.pending}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_OPTIONS.map((p) => (
                          <SelectItem key={p} value={p} className="capitalize text-xs">
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => viewOrderDetails(order)} className="h-7 px-2">
                      <Eye size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="font-body text-xs text-muted-foreground">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={14} />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* Order detail modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
            <div className="bg-background border border-border max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Order Details</p>
                  <p className="font-body text-xl font-normal tabular-nums text-primary">{selectedOrder.order_number}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-body text-xs text-muted-foreground">Customer</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-[10px]"
                        onClick={() =>
                          void copyText(
                            "Customer details",
                            `Name: ${selectedOrder.customer_name || ""}\nEmail: ${selectedOrder.customer_email || ""}\nPhone: ${selectedOrder.customer_phone || ""}`
                          )
                        }
                      >
                        <Copy size={12} className="mr-1" />
                        Copy
                      </Button>
                    </div>
                    <p className="font-body font-medium">{selectedOrder.customer_name}</p>
                    <p className="font-body text-xs">{selectedOrder.customer_email}</p>
                    <p className="font-body text-xs">{selectedOrder.customer_phone}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-body text-xs text-muted-foreground">Shipping</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-[10px]"
                        onClick={() =>
                          void copyText(
                            "Shipping details",
                            `Address: ${selectedOrder.address || ""}\nCity: ${selectedOrder.city || ""}\nState: ${selectedOrder.state || ""}\nPincode: ${selectedOrder.pincode || ""}`
                          )
                        }
                      >
                        <Copy size={12} className="mr-1" />
                        Copy
                      </Button>
                    </div>
                    <p className="font-body text-xs">{selectedOrder.address}</p>
                    <p className="font-body text-xs">{selectedOrder.city}, {selectedOrder.state} {selectedOrder.pincode}</p>
                  </div>
                </div>

                {selectedOrder.items?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-body text-xs font-normal uppercase tracking-wider text-muted-foreground">Items</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-[10px]"
                        onClick={() =>
                          void copyText(
                            "Items details",
                            selectedOrder.items
                              .map((item: any) => `${item.product_name} x ${item.quantity} - ₹${(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}`)
                              .join("\n")
                          )
                        }
                      >
                        <Copy size={12} className="mr-1" />
                        Copy
                      </Button>
                    </div>
                    {selectedOrder.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between py-2 border-b border-border text-sm">
                        <span className="font-body">{item.product_name} × {item.quantity}</span>
                        <span className="font-amount text-sm">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-3 text-primary">
                      <span className="font-body">Total</span>
                      <span className="font-amount">₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="font-body text-xs text-muted-foreground mb-1">Order status</p>
                    <Select value={selectedOrder.status} onValueChange={(val) => updateStatus(selectedOrder.id, val)}>
                      <SelectTrigger className="h-10 font-body text-sm w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => (
                          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground mb-1">Payment</p>
                    <Select
                      value={selectedOrder.payment_status || "pending"}
                      onValueChange={(val) => updatePaymentStatus(selectedOrder.id, val)}
                    >
                      <SelectTrigger className="h-10 font-body text-sm w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_OPTIONS.map((p) => (
                          <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
