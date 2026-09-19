import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "@/lib/api";
import { clearAdminSession, getAdminToken } from "@/lib/authStorage";
import { sareeProducts, type SareeProduct } from "@/data/sareeData";
import { getAllProducts } from "@/lib/getAllProducts";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingBag, Tag, Layers, Package, TrendingUp, IndianRupee,
  Users, BarChart3, Calendar, ArrowUpRight, ArrowDownRight, Eye,
  Globe, ShoppingCart, Heart, Shirt, Download, FileSpreadsheet
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, Area, AreaChart
} from "recharts";
import * as XLSX from "xlsx";
import { API_BASE_URL } from "@/lib/env";
import { dedupeOrdersList } from "@/lib/dedupeOrders";

// Export helpers
const downloadCSVReport = (products: typeof sareeProducts, chartData: any[], orders: any[]) => {
  const now = new Date().toLocaleDateString("en-IN");
  let csv = `Athina Regal Weaves - Full Report\nGenerated: ${now}\n\n`;
  const avgPx = products.length ? Math.floor(products.reduce((s, p) => s + p.price, 0) / products.length) : 0;

  // Summary
  csv += `SUMMARY\nTotal Products,${products.length}\nAverage Price,₹${avgPx.toLocaleString("en-IN")}\nCategories,${[...new Set(products.map(p=>p.category))].length}\nFabric Types,${[...new Set(products.map(p=>p.fabric))].length}\n\n`;

  // Sales Analytics
  csv += `SALES ANALYTICS\nPeriod,Sales,Revenue,Orders\n`;
  chartData.forEach(d => { csv += `${d.label},${d.sales},₹${d.revenue.toLocaleString("en-IN")},${d.orders}\n`; });
  csv += `\n`;

  // Category breakdown
  csv += `CATEGORY BREAKDOWN\nCategory,Count,Min Price,Max Price\n`;
  [...new Set(products.map(p=>p.category))].forEach(cat => {
    const items = products.filter(p=>p.category===cat);
    csv += `${cat},${items.length},₹${Math.min(...items.map(p=>p.price)).toLocaleString("en-IN")},₹${Math.max(...items.map(p=>p.price)).toLocaleString("en-IN")}\n`;
  });
  csv += `\n`;

  // Fabric breakdown
  csv += `FABRIC DISTRIBUTION\nFabric,Count\n`;
  [...new Set(products.map(p=>p.fabric))].forEach(fab => {
    csv += `${fab},${products.filter(p=>p.fabric===fab).length}\n`;
  });
  csv += `\n`;

  // Product list
  csv += `FULL PRODUCT LIST\nID,Name,Category,Fabric,Price\n`;
  products.forEach(p => { csv += `${p.id},${p.itemName},${p.category},${p.fabric},₹${p.price.toLocaleString("en-IN")}\n`; });

  // Orders
  if (orders.length) {
    csv += `\nRECENT ORDERS\nOrder #,Customer,Amount,Status\n`;
    orders.forEach((o: any) => { csv += `${o.order_number},${o.customer_name},₹${Number(o.total_amount).toLocaleString("en-IN")},${o.status}\n`; });
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Athina_Report_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const downloadExcelReport = (products: typeof sareeProducts, chartData: any[], orders: any[]) => {
  const wb = XLSX.utils.book_new();
  const avgPx = products.length ? Math.floor(products.reduce((s, p) => s + p.price, 0) / products.length) : 0;

  // Summary sheet
  const summaryData = [
    ["Athina Regal Weaves - Dashboard Report"],
    ["Generated", new Date().toLocaleDateString("en-IN")],
    [],
    ["Metric", "Value"],
    ["Total Products", products.length],
    ["Average Price", avgPx],
    ["Categories", [...new Set(products.map(p=>p.category))].length],
    ["Fabric Types", [...new Set(products.map(p=>p.fabric))].length],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  ws1["!cols"] = [{ wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Summary");

  // Sales Analytics sheet
  const salesRows = [["Period", "Sales", "Revenue (₹)", "Orders"], ...chartData.map(d => [d.label, d.sales, d.revenue, d.orders])];
  const ws2 = XLSX.utils.aoa_to_sheet(salesRows);
  ws2["!cols"] = [{ wch: 18 }, { wch: 10 }, { wch: 15 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Sales Analytics");

  // Category sheet
  const catRows = [["Category", "Count", "Min Price (₹)", "Max Price (₹)"]];
  [...new Set(products.map(p=>p.category))].forEach(cat => {
    const items = products.filter(p=>p.category===cat);
    catRows.push([cat, items.length as any, Math.min(...items.map(p=>p.price)) as any, Math.max(...items.map(p=>p.price)) as any]);
  });
  const ws3 = XLSX.utils.aoa_to_sheet(catRows);
  ws3["!cols"] = [{ wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Categories");

  // Fabric sheet
  const fabRows = [["Fabric", "Count"]];
  [...new Set(products.map(p=>p.fabric))].forEach(fab => {
    fabRows.push([fab, products.filter(p=>p.fabric===fab).length as any]);
  });
  const ws4 = XLSX.utils.aoa_to_sheet(fabRows);
  ws4["!cols"] = [{ wch: 22 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws4, "Fabrics");

  // Products sheet
  const prodRows = [["ID", "Name", "Category", "Fabric", "Price (₹)"], ...products.map(p => [p.id, p.itemName, p.category, p.fabric, p.price])];
  const ws5 = XLSX.utils.aoa_to_sheet(prodRows);
  ws5["!cols"] = [{ wch: 10 }, { wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws5, "All Products");

  // Orders sheet
  if (orders.length) {
    const orderRows = [["Order #", "Customer", "Email", "Phone", "Amount (₹)", "Status", "Payment"], ...orders.map((o: any) => [o.order_number, o.customer_name, o.customer_email, o.customer_phone, Number(o.total_amount), o.status, o.payment_status])];
    const ws6 = XLSX.utils.aoa_to_sheet(orderRows);
    ws6["!cols"] = [{ wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws6, "Orders");
  }

  XLSX.writeFile(wb, `Athina_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
};

const API_BASE = API_BASE_URL;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Build chart buckets from real order rows (no random demo numbers). */
function aggregateOrdersForChart(
  orders: any[],
  period: string
): { label: string; sales: number; revenue: number; orders: number }[] {
  const now = new Date();
  const p = period === "custom" ? "30days" : period;

  if (p === "7days") {
    const out: { label: string; sales: number; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = startOfDay(new Date(now));
      d.setDate(d.getDate() - i);
      const end = new Date(d);
      end.setDate(end.getDate() + 1);
      const dayOrders = orders.filter((o) => {
        const t = new Date(o.created_at);
        return !isNaN(t.getTime()) && t >= d && t < end;
      });
      const revenue = dayOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
      out.push({
        label: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
        sales: dayOrders.length,
        revenue,
        orders: dayOrders.length,
      });
    }
    return out;
  }

  if (p === "30days") {
    const out: { label: string; sales: number; revenue: number; orders: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = startOfDay(new Date(now));
      d.setDate(d.getDate() - i);
      const end = new Date(d);
      end.setDate(end.getDate() + 1);
      const dayOrders = orders.filter((o) => {
        const t = new Date(o.created_at);
        return !isNaN(t.getTime()) && t >= d && t < end;
      });
      const revenue = dayOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
      out.push({
        label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        sales: dayOrders.length,
        revenue,
        orders: dayOrders.length,
      });
    }
    return out;
  }

  if (p === "12months") {
    const out: { label: string; sales: number; revenue: number; orders: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const monthOrders = orders.filter((o) => {
        const t = new Date(o.created_at);
        return !isNaN(t.getTime()) && t >= d && t < end;
      });
      const revenue = monthOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
      out.push({
        label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        sales: monthOrders.length,
        revenue,
        orders: monthOrders.length,
      });
    }
    return out;
  }

  const startYear = now.getFullYear() - 4;
  const out: { label: string; sales: number; revenue: number; orders: number }[] = [];
  for (let y = startYear; y <= now.getFullYear(); y++) {
    const d = new Date(y, 0, 1);
    const end = new Date(y + 1, 0, 1);
    const yearOrders = orders.filter((o) => {
      const t = new Date(o.created_at);
      return !isNaN(t.getTime()) && t >= d && t < end;
    });
    const revenue = yearOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
    out.push({
      label: String(y),
      sales: yearOrders.length,
      revenue,
      orders: yearOrders.length,
    });
  }
  return out;
}

const CHART_COLORS = [
  "hsl(350, 50%, 22%)", // maroon/primary
  "hsl(35, 65%, 48%)",  // gold/accent
  "hsl(350, 35%, 32%)", // maroon-light
  "hsl(35, 45%, 68%)",  // gold-light
  "hsl(20, 8%, 35%)",   // muted
  "hsl(35, 70%, 35%)",  // gold-dark
];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30days");
  const [chartType, setChartType] = useState<"revenue" | "sales" | "orders">("revenue");
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoad, setOrdersLoad] = useState<"idle" | "live" | "error">("idle");
  const [catalog, setCatalog] = useState<SareeProduct[]>([]);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const navigate = useNavigate();

  const productsForReport = catalog.length > 0 ? catalog : sareeProducts;

  useEffect(() => {
    verifyToken()
      .then(() => setLoading(false))
      .catch(() => { clearAdminSession(); navigate("/admin/login"); });
  }, [navigate]);

  useEffect(() => {
    getAllProducts().then(setCatalog).catch(() => setCatalog([]));
  }, []);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    fetch(`${API_BASE}/orders.php?action=list&page=1&limit=1000`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        const text = await r.text();
        try {
          const d = JSON.parse(text);
          if (!r.ok || d.error) {
            setOrders([]);
            setOrdersLoad("error");
            return;
          }
          setOrders(dedupeOrdersList(Array.isArray(d.orders) ? d.orders : []));
          setOrdersLoad("live");
        } catch {
          setOrders([]);
          setOrdersLoad("error");
        }
      })
      .catch(() => {
        setOrders([]);
        setOrdersLoad("error");
      });
  }, []);

  const chartData = useMemo(() => aggregateOrdersForChart(orders, period), [orders, period]);

  const totalRevenue = useMemo(
    () => orders.reduce((s, o) => s + Number(o.total_amount || 0), 0),
    [orders]
  );
  const totalOrders = useMemo(() => orders.length, [orders]);

  const categories = useMemo(
    () => [...new Set(catalog.map((p) => p.category))].filter(Boolean),
    [catalog]
  );
  const fabrics = useMemo(
    () => [...new Set(catalog.map((p) => p.fabric))].filter(Boolean),
    [catalog]
  );
  const totalListed = catalog.length;
  const avgPrice = catalog.length
    ? Math.floor(catalog.reduce((s, p) => s + p.price, 0) / catalog.length)
    : 0;

  const categoryPieData = categories.map((cat, i) => ({
    name: cat,
    value: catalog.filter((p) => p.category === cat).length,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const fabricBarData = fabrics
    .map((fab) => ({
      name: fab.length > 12 ? fab.slice(0, 12) + "…" : fab,
      count: catalog.filter((p) => p.fabric === fab).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const priceDistribution = [
    { range: "Under ₹5K", count: catalog.filter((p) => p.price < 5000).length },
    { range: "₹5K-₹10K", count: catalog.filter((p) => p.price >= 5000 && p.price < 10000).length },
    { range: "₹10K-₹20K", count: catalog.filter((p) => p.price >= 10000 && p.price < 20000).length },
    { range: "₹20K-₹50K", count: catalog.filter((p) => p.price >= 20000 && p.price < 50000).length },
    { range: "₹50K+", count: catalog.filter((p) => p.price >= 50000).length },
  ];

  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="font-body text-xl text-foreground/50">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  const StatCard = ({ icon: Icon, label, value, sub, trend, iconColor, valueClassName }: any) => (
    <div className="bg-background border border-border p-3 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <Icon size={18} strokeWidth={1.5} className={iconColor} />
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-medium ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className={`text-xl sm:text-3xl tabular-nums text-foreground tracking-tight ${valueClassName ?? "font-body font-normal"}`}>
        {value}
      </p>
      <p className="font-body text-[10px] sm:text-sm text-muted-foreground mt-1">{label}</p>
      {sub && <p className="font-body text-[10px] sm:text-xs text-foreground/40 mt-0.5">{sub}</p>}
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-background border border-border p-3 shadow-lg text-sm">
        <p className="font-body font-normal text-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="font-body text-muted-foreground">
            {p.name}:{" "}
            {p.name === "revenue" ? (
              <span className="font-amount text-foreground">₹{p.value.toLocaleString("en-IN")}</span>
            ) : (
              p.value
            )}
          </p>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="font-body text-xs sm:text-sm text-muted-foreground mt-1">
              Store performance overview
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="font-body text-xs gap-1.5 border-border"
              onClick={() => downloadCSVReport(productsForReport as typeof sareeProducts, chartData, orders)}
            >
              <Download size={14} /> CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="font-body text-xs gap-1.5 border-border"
              onClick={() => downloadExcelReport(productsForReport as typeof sareeProducts, chartData, orders)}
            >
              <FileSpreadsheet size={14} /> Excel
            </Button>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px] bg-background border-border font-body text-sm">
                <Calendar size={14} className="mr-1 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {period === "custom" && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-background border border-border p-3">
            <Input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="w-full sm:w-40 font-body text-sm" />
            <span className="text-muted-foreground font-body text-sm">to</span>
            <Input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="w-full sm:w-40 font-body text-sm" />
            <Button size="sm" variant="outline" className="font-body text-sm w-full sm:w-auto">Apply</Button>
          </div>
        )}

        {ordersLoad === "error" && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 font-body text-sm text-destructive">
            Orders could not be loaded (invalid response or server error). Fix <code className="text-xs">api/orders.php</code> on Hostinger.
          </div>
        )}

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} iconColor="text-primary" valueClassName="font-amount" />
          <StatCard icon={ShoppingCart} label="Total Orders" value={totalOrders.toLocaleString("en-IN")} iconColor="text-accent" />
          <StatCard icon={ShoppingBag} label="Products Listed" value={totalListed.toLocaleString("en-IN")} iconColor="text-primary" sub={catalog.length ? `₹${avgPrice.toLocaleString("en-IN")} avg` : "Loading catalog…"} />
          <StatCard icon={Layers} label="Categories" value={categories.length} iconColor="text-accent" sub={`${fabrics.length} fabrics`} />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue/Sales Chart - Takes 2 cols */}
          <div className="lg:col-span-2 bg-background border border-border p-3 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">Sales Analytics</h3>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  {ordersLoad === "live" ? "From orders in your database" : ordersLoad === "error" ? "No order data — fix orders API" : "Loading…"}
                </p>
              </div>
              <div className="flex gap-1">
                {(["revenue", "sales", "orders"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className={`px-3 py-1 text-xs font-body capitalize transition-colors ${
                      chartType === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(350, 50%, 22%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(350, 50%, 22%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 18%, 78%)" />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(20, 8%, 35%)" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fill: "hsl(20, 8%, 35%)" }} tickFormatter={v => chartType === "revenue" ? `₹${(v / 1000).toFixed(0)}K` : v} width={45} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={chartType}
                  stroke="hsl(350, 50%, 22%)"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Pie */}
          <div className="bg-background border border-border p-5 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Category Mix</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [`${v} products`, name]} />
                <Legend
                  formatter={(value) => <span className="font-body text-xs text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Second Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fabric Distribution Bar */}
          <div className="bg-background border border-border p-5 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Top Fabrics</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={fabricBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 18%, 78%)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(20, 8%, 35%)" }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fill: "hsl(20, 8%, 35%)" }} />
                <Tooltip formatter={(v: number) => [`${v} products`]} />
                <Bar dataKey="count" fill="hsl(35, 65%, 48%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Price Distribution */}
          <div className="bg-background border border-border p-5 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Price Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={priceDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 18%, 78%)" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: "hsl(20, 8%, 35%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(20, 8%, 35%)" }} />
                <Tooltip formatter={(v: number) => [`${v} products`]} />
                <Bar dataKey="count" fill="hsl(350, 50%, 22%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Website Showcase & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Website Pages Showcase */}
          <div className="bg-background border border-border p-5 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe size={18} className="text-primary" /> Website Showcase
            </h3>
            <div className="space-y-3">
              {[
                { name: "Homepage", path: "/", icon: Eye, desc: "Hero, Bridal, Tissue & Linen sections" },
                { name: "Collections", path: "/collections", icon: Layers, desc: `${totalListed} sarees across ${categories.length} categories` },
                { name: "Bridal Sarees", path: "/bridal", icon: Heart, desc: "Premium bridal collection showcase" },
                { name: "Store", path: "/store", icon: ShoppingBag, desc: "Full catalog with filters & search" },
                { name: "Heritage", path: "/heritage", icon: Shirt, desc: "Brand story & craftsmanship" },
                { name: "Contact", path: "/contact", icon: Users, desc: "Customer inquiries & support" },
              ].map(pg => (
                <div
                  key={pg.path}
                  className="flex items-center justify-between p-3 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => window.open(pg.path, "_blank")}
                >
                  <div className="flex items-center gap-3">
                    <pg.icon size={18} className="text-accent" />
                    <div>
                      <p className="font-body text-sm font-normal text-foreground">{pg.name}</p>
                      <p className="font-body text-xs text-muted-foreground">{pg.desc}</p>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-background border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" /> Recent Orders
              </h3>
              <button
                onClick={() => navigate("/admin/orders")}
                className="font-body text-xs text-accent hover:underline"
              >
                View All →
              </button>
            </div>
            {recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.map((order: any) => (
                  <div key={order.id || order.order_number} className="flex items-center justify-between p-3 border border-border/50">
                    <div>
                      <p className="font-body text-sm font-normal tabular-nums text-foreground">#{order.order_number}</p>
                      <p className="font-body text-xs text-muted-foreground">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-amount text-sm text-foreground">₹{Number(order.total_amount).toLocaleString("en-IN")}</p>
                      <span className={`inline-block px-2 py-0.5 text-xs font-body capitalize rounded ${
                        order.status === "delivered" ? "bg-green-100 text-green-800" :
                        order.status === "shipped" ? "bg-cyan-100 text-cyan-800" :
                        order.status === "cancelled" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <ShoppingCart size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="font-body text-sm text-muted-foreground">No orders yet</p>
                <p className="font-body text-xs text-foreground/40 mt-1">Orders will appear here once customers start purchasing</p>
              </div>
            )}
          </div>
        </div>

        {/* Category & Fabric Summary Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-background border border-border p-5 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Category Breakdown</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-body text-xs font-medium text-muted-foreground py-2">Category</th>
                  <th className="text-center font-body text-xs font-medium text-muted-foreground py-2">Listed</th>
                  <th className="text-right font-body text-xs font-medium text-muted-foreground py-2">Price Range</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => {
                  const items = sareeProducts.filter(p => p.category === cat);
                  return (
                    <tr key={cat} className="border-b border-border/30">
                      <td className="font-body text-sm text-foreground py-2.5">{cat}</td>
                      <td className="text-center font-body text-sm font-normal tabular-nums text-foreground py-2.5">{items.length}</td>
                      <td className="text-right font-amount text-xs text-muted-foreground py-2.5">
                        ₹{Math.min(...items.map(p => p.price)).toLocaleString("en-IN")} – ₹{Math.max(...items.map(p => p.price)).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-background border border-border p-5 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Fabric Types</h3>
            <div className="grid grid-cols-2 gap-3">
              {fabrics.map(fab => {
                const count = sareeProducts.filter(p => p.fabric === fab).length;
                return (
                  <div key={fab} className="border border-border/50 p-3 text-center">
                    <p className="text-xl font-normal tabular-nums text-foreground font-body">{count}</p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">{fab}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
