import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { verifyToken } from "@/lib/api";
import { clearAdminSession, getAdminToken } from "@/lib/authStorage";
import { API_BASE_URL } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Trash2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AdminReview = {
  id: number;
  product_id: string;
  name: string;
  rating: number;
  text: string;
  location: string;
  created_at: string;
};

const AdminReviews = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AdminReview[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_BASE_URL}/reviews.php?action=admin-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`);
      setRows(Array.isArray(json.reviews) ? json.reviews : []);
    } catch (e: unknown) {
      toast({
        title: "Could not load reviews",
        description: e instanceof Error ? e.message : "Load failed",
        variant: "destructive",
      });
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyToken()
      .then(() => void load())
      .catch(() => {
        clearAdminSession();
        navigate("/admin/login", { replace: true });
      });
  }, [navigate]);

  const removeReview = async (id: number) => {
    const ok = window.confirm("Are you sure you want to delete this review? This cannot be undone.");
    if (!ok) return;
    setDeletingId(id);
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_BASE_URL}/reviews.php?action=admin-delete&id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Deleted", description: "Review removed." });
    } catch (e: unknown) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Could not delete review.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Reviews</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">{rows.length} total reviews</p>
          </div>
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground font-body">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground font-body">No reviews yet.</div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="border border-border bg-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-body font-normal">{r.name}</p>
                      <p className="font-body text-xs text-muted-foreground">Product: {r.product_id}</p>
                      <p className="font-body text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={i < r.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}
                        />
                      ))}
                    </div>
                    <p className="font-body text-sm text-foreground/80">{r.text}</p>
                    {r.location ? (
                      <p className="font-body text-xs text-muted-foreground">Location: {r.location}</p>
                    ) : null}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => void removeReview(r.id)}
                    disabled={deletingId === r.id}
                    title="Delete review"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;

