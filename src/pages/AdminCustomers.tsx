import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { verifyToken } from "@/lib/api";
import { clearAdminSession } from "@/lib/authStorage";
import { fetchAdminCustomerList, type CustomerAdminRow } from "@/lib/customerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, RefreshCw, Mail, Phone, MapPin, UserCheck } from "lucide-react";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<CustomerAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<CustomerAdminRow | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const rows = await fetchAdminCustomerList();
      setCustomers(rows);
    } catch (e: any) {
      toast({
        title: "Could not load customers",
        description: e?.message || "Check customer-auth.php and admin token.",
        variant: "destructive",
      });
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyToken()
      .then(() => load())
      .catch(() => {
        clearAdminSession();
        navigate("/admin/login", { replace: true });
      });
  }, [navigate]);

  const filtered = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Customers</h1>
            <p className="font-body text-xs sm:text-sm text-muted-foreground">
              {customers.length} people who signed up on your site. Normal sign-in uses the same account — they appear as
              soon as they register (verify OTP). Refresh after sign-ups. Address fills from Profile or checkout.
            </p>
          </div>
          <Button onClick={load} variant="outline" size="sm" className="font-body" disabled={loading}>
            <RefreshCw size={14} className="mr-2" /> Refresh
          </Button>
        </div>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, email, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border h-10 font-body text-sm"
          />
        </div>

        <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Name", "Email", "Phone", "City", "Verified", "Joined", "Last active", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-body text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center font-body text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center font-body text-muted-foreground">
                    <p>No customers in the database yet.</p>
                    <p className="text-xs mt-2 max-w-md mx-auto">
                      Users must use <strong>Sign up</strong> on the live site (not the local demo login). After
                      registration they appear here. Upload <code className="text-[11px]">customer-auth.php</code> and
                      check your database connection.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-body font-medium">{c.name}</td>
                    <td className="px-4 py-3 font-body text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 font-body font-normal tabular-nums">{c.phone || "—"}</td>
                    <td className="px-4 py-3 font-body">{c.city || "—"}</td>
                    <td className="px-4 py-3">
                      {c.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-normal text-green-700">
                          <UserCheck size={14} /> Yes
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground">
                      {c.updated_at
                        ? new Date(c.updated_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(c)} className="h-7 px-2">
                        <Eye size={14} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-background border border-border max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">Customer</p>
                  <p className="font-body text-xl font-normal text-primary">{selected.name}</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">ID #{selected.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-muted-foreground hover:text-foreground text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-2">
                  <Mail size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-body text-xs text-muted-foreground">Email</p>
                    <a href={`mailto:${selected.email}`} className="font-body font-medium hover:underline">
                      {selected.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-body text-xs text-muted-foreground">Phone</p>
                    <p className="font-body font-normal tabular-nums">{selected.phone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-body text-xs text-muted-foreground">Shipping address</p>
                    <p className="font-body">
                      {selected.address || "—"}
                      <br />
                      {[selected.city, selected.state].filter(Boolean).join(", ")}
                      {selected.pincode ? ` ${selected.pincode}` : ""}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-normal text-foreground">Verified: </span>
                    {selected.is_verified ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="font-normal text-foreground">Joined: </span>
                    {selected.created_at
                      ? new Date(selected.created_at).toLocaleString("en-IN")
                      : "—"}
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

export default AdminCustomers;
