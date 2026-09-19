import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken, addHistory } from "@/lib/api";
import { clearAdminSession } from "@/lib/authStorage";
import { type SareeProduct } from "@/data/sareeData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Crown, Clock, CheckCircle2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminBuiltinCollectionTitle from "@/components/admin/AdminBuiltinCollectionTitle";
import { fetchProductIdsByCollection, apiRemoveProductFromCollection } from "@/lib/collectionAssignments";
import { getAllProducts } from "@/lib/getAllProducts";

const PAGE_SIZE = 25;

const AdminBridal = () => {
  const [products, setProducts] = useState<SareeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showSavedDialog, setShowSavedDialog] = useState(false);
  const [lastAction, setLastAction] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    verifyToken()
      .then(async () => {
        const bridalIds = new Set((await fetchProductIdsByCollection("bridal")).map(String));
        const allProducts = await getAllProducts();
        const bridal = allProducts.filter((p) => bridalIds.has(String(p.id)));
        setProducts(bridal.map(p => ({ ...p })));
        setLoading(false);
      })
      .catch(() => { clearAdminSession(); navigate("/admin/login"); });
  }, [navigate]);

  const filtered = products.filter(p =>
    p.itemName.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalValue = products.reduce((s, p) => s + p.price, 0);

  useEffect(() => { setPage(1); }, [search]);

  const addHistoryEntry = (action: string) => {
    setLastAction(action);
    setShowSavedDialog(true);
    setTimeout(() => setShowSavedDialog(false), 2500);
  };

  const handleRemove = async (id: string) => {
    const product = products.find(p => p.id === id);
    const name = product?.itemName || "Item";
    await apiRemoveProductFromCollection(id, "bridal");
    setProducts(prev => prev.filter(p => p.id !== id));
    addHistoryEntry(`Removed "${name}" from Bridal`);
    addHistory({ page: 'bridal', action: `Removed "${name}"`, item_name: name, image_url: product?.image });
    toast({ title: "Removed from Bridal Collection" });
  };

  if (loading) {
    return <AdminLayout><div className="flex items-center justify-center h-full"><p className="font-body text-lg text-foreground/50">Loading...</p></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="px-8 py-8">
        <Dialog open={showSavedDialog} onOpenChange={setShowSavedDialog}>
          <DialogContent className="sm:max-w-sm text-center">
            <DialogHeader className="items-center">
              <CheckCircle2 size={48} className="text-maroon mb-2" />
              <DialogTitle className="font-display text-xl">Changes Saved</DialogTitle>
              <DialogDescription className="font-body text-sm text-foreground/60">
                {lastAction} — updated successfully.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <div className="flex items-center justify-between mb-8">
          <div>
            <AdminBuiltinCollectionTitle
              collectionKey="bridal"
              fallbackTitle="Bridal Sarees"
              icon={Crown}
              subtitle={`${products.length} bridal sarees`}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/admin/history")}
              className="border-border text-foreground/50 hover:text-maroon font-body text-sm h-11 px-4">
              <Clock size={14} className="mr-2" /> History
            </Button>
            <Button onClick={() => navigate("/admin/product/new?from=bridal")} className="bg-maroon hover:bg-maroon-light text-ivory font-body text-sm h-11 px-6">
              <Plus size={16} className="mr-2" /> Add Bridal Saree
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-background border border-border p-5 shadow-sm">
            <p className="font-body text-xs text-foreground/40 uppercase tracking-wider">Total Listings</p>
            <p className="font-body text-2xl font-normal tabular-nums text-maroon mt-1">{products.length}</p>
          </div>
          <div className="bg-background border border-border p-5 shadow-sm">
            <p className="font-body text-xs text-foreground/40 uppercase tracking-wider">Total Value</p>
            <p className="font-body text-2xl font-normal tabular-nums text-gold-dark mt-1">₹{(totalValue / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-background border border-border p-5 shadow-sm">
            <p className="font-body text-xs text-foreground/40 uppercase tracking-wider">Avg. Price</p>
            <p className="font-body text-2xl font-normal tabular-nums text-foreground mt-1">₹{products.length ? Math.floor(totalValue / products.length).toLocaleString() : 0}</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-background border border-border">
            <Crown size={48} className="mx-auto text-foreground/20 mb-4" />
            <p className="font-body text-lg text-foreground/50 mb-2">No bridal sarees yet</p>
            <p className="font-body text-sm text-foreground/40 mb-6">Go to Collections and use the ⋮ menu to add sarees to this collection.</p>
            <Button onClick={() => navigate("/admin/collections")} variant="outline" className="border-border text-foreground/60 hover:text-maroon">
              Go to Collections
            </Button>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="relative mb-6">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bridal sarees..."
                className="pl-12 bg-background border-border text-foreground text-base h-12" />
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="font-body text-sm text-foreground/40">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
            </div>

            {/* Table */}
            <div className="bg-background border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-cream border-b border-border">
                      <th className="text-left font-body text-sm font-medium text-foreground/60 py-4 px-4 w-12">#</th>
                      <th className="text-left font-body text-sm font-medium text-foreground/60 py-4 px-4">Image</th>
                      <th className="text-left font-body text-sm font-medium text-foreground/60 py-4 px-4">Name</th>
                      <th className="text-left font-body text-sm font-medium text-foreground/60 py-4 px-4">SKU</th>
                      <th className="text-left font-body text-sm font-medium text-foreground/60 py-4 px-4">Category</th>
                      <th className="text-left font-body text-sm font-medium text-foreground/60 py-4 px-4">Fabric</th>
                      <th className="text-right font-body text-sm font-medium text-foreground/60 py-4 px-4">Price</th>
                      <th className="text-center font-body text-sm font-medium text-foreground/60 py-4 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((product, i) => (
                      <tr key={product.id} className="border-b border-border/50 hover:bg-ivory-warm/50">
                        <td className="font-body text-xs font-normal tabular-nums text-foreground/30 py-3 px-4">{(page - 1) * PAGE_SIZE + i + 1}</td>
                        <td className="py-3 px-4">
                          <div className="w-12 h-16 bg-secondary overflow-hidden border border-border">
                            <img src={product.image} alt="" className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="font-body text-sm text-foreground py-3 px-4">{product.itemName}</td>
                        <td className="font-body text-xs text-foreground/50 py-3 px-4 font-mono">{product.sku}</td>
                        <td className="font-body text-sm text-foreground/70 py-3 px-4">{product.category}</td>
                        <td className="font-body text-sm text-foreground/70 py-3 px-4">{product.fabric}</td>
                        <td className="font-body text-sm text-foreground py-3 px-4 text-right font-normal tabular-nums">₹{product.price.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/product/${product.id}?from=bridal`)}
                              className="h-8 px-3 text-foreground/50 hover:text-maroon">
                              <Pencil size={14} />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleRemove(product.id)}
                              className="h-8 px-3 text-foreground/50 hover:text-destructive">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t border-border">
                  <p className="font-body text-sm text-foreground/40">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                      className="h-9 px-4 border-border text-foreground/60">
                      <ChevronLeft size={16} className="mr-1" /> Previous
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button key={pageNum} size="sm" variant={page === pageNum ? "default" : "outline"} onClick={() => setPage(pageNum)}
                            className={`h-9 w-9 p-0 ${page === pageNum ? "bg-maroon text-ivory" : "border-border text-foreground/60"}`}>
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                      className="h-9 px-4 border-border text-foreground/60">
                      Next <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBridal;
