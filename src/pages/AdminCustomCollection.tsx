import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { verifyToken, addHistory } from "@/lib/api";
import { clearAdminSession } from "@/lib/authStorage";
import { type SareeProduct } from "@/data/sareeData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, FolderOpen, Clock, CheckCircle2, ExternalLink } from "lucide-react";
import { getCollectionIconComponent, DEFAULT_COLLECTION_ICON_KEY, isValidCollectionIconKey, type CollectionIconKey } from "@/lib/collectionIcons";
import { CollectionIconPicker } from "@/components/admin/CollectionIconPicker";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  fetchProductIdsByCollection,
  apiRemoveProductFromCollection,
  fetchCollectionMetaByKey,
  apiUpdateCollectionDisplayName,
  type CollectionDefinition,
} from "@/lib/collectionAssignments";
import { getAllProducts } from "@/lib/getAllProducts";

const PAGE_SIZE = 25;

const AdminCustomCollection = () => {
  const { slug } = useParams<{ slug: string }>();
  const key = slug ? decodeURIComponent(slug) : "";
  const [meta, setMeta] = useState<CollectionDefinition | null>(null);
  const [products, setProducts] = useState<SareeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showSavedDialog, setShowSavedDialog] = useState(false);
  const [lastAction, setLastAction] = useState("");
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftIconKey, setDraftIconKey] = useState<CollectionIconKey>(DEFAULT_COLLECTION_ICON_KEY);
  const [savingName, setSavingName] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!key) {
      setLoading(false);
      return;
    }
    verifyToken()
      .then(async () => {
        const m = await fetchCollectionMetaByKey(key);
        setMeta(m);
        if (!m) {
          setProducts([]);
          setLoading(false);
          return;
        }
        const ids = new Set((await fetchProductIdsByCollection(key)).map(String));
        const allProducts = await getAllProducts();
        const list = allProducts.filter((p) => ids.has(String(p.id)));
        setProducts(list.map((p) => ({ ...p })));
        setLoading(false);
      })
      .catch(() => {
        clearAdminSession();
        navigate("/admin/login");
      });
  }, [key, navigate]);

  const filtered = products.filter(
    (p) =>
      p.itemName.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalValue = products.reduce((s, p) => s + p.price, 0);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const addHistoryEntry = (action: string) => {
    setLastAction(action);
    setShowSavedDialog(true);
    setTimeout(() => setShowSavedDialog(false), 2500);
  };

  const handleRemove = async (id: string) => {
    const product = products.find((p) => p.id === id);
    const name = product?.itemName || "Item";
    await apiRemoveProductFromCollection(id, key);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addHistoryEntry(`Removed "${name}" from ${meta?.display_name || key}`);
    addHistory({ page: "collections", action: `Removed from ${key}`, item_name: name, image_url: product?.image });
    toast({ title: "Removed from collection" });
  };

  const saveDisplayName = async () => {
    const t = draftName.trim();
    if (t.length < 2 || !key) {
      toast({ title: "Name too short", variant: "destructive" });
      return;
    }
    setSavingName(true);
    try {
      const updated = await apiUpdateCollectionDisplayName(key, t, draftIconKey);
      setMeta(updated);
      setEditNameOpen(false);
      toast({ title: "Collection name saved" });
    } catch (e) {
      toast({
        title: "Could not save",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSavingName(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="font-body text-lg text-foreground/50">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!key || !meta) {
    return (
      <AdminLayout>
        <div className="px-8 py-16 text-center">
          <p className="font-body text-lg text-foreground/60 mb-4">Collection not found.</p>
          <Button variant="outline" onClick={() => navigate("/admin/collections")}>
            Back to Collections
          </Button>
        </div>
      </AdminLayout>
    );
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

        <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Edit collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="custom-coll-name" className="font-body text-sm">
                  Display name
                </Label>
                <Input
                  id="custom-coll-name"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="font-body"
                  maxLength={200}
                />
                <p className="font-body text-xs text-muted-foreground">URL stays /collection/{key}</p>
              </div>
              <CollectionIconPicker value={draftIconKey} onChange={setDraftIconKey} />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setEditNameOpen(false)} disabled={savingName}>
                Cancel
              </Button>
              <Button type="button" className="bg-maroon hover:bg-maroon-light text-ivory" onClick={() => void saveDisplayName()} disabled={savingName}>
                {savingName ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {(() => {
                const HIcon = getCollectionIconComponent(meta.icon_key);
                return <HIcon size={28} strokeWidth={1.35} className="text-gold-dark shrink-0" />;
              })()}
              <h1 className="font-display text-3xl font-bold text-foreground">{meta.display_name}</h1>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3 font-body text-xs border-border text-foreground/60 hover:text-maroon"
                onClick={() => {
                  setDraftName(meta.display_name);
                  setDraftIconKey(isValidCollectionIconKey(meta.icon_key) ? meta.icon_key : DEFAULT_COLLECTION_ICON_KEY);
                  setEditNameOpen(true);
                }}
              >
                <Pencil size={14} className="mr-1.5" />
                Edit
              </Button>
            </div>
            <p className="font-body text-base text-foreground/50 mt-1">
              {products.length} sarees · URL: /collection/{key}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button variant="outline" size="sm" className="font-body text-xs h-9" asChild>
                <Link to={`/collection/${encodeURIComponent(key)}`} target="_blank" rel="noreferrer">
                  <ExternalLink size={14} className="mr-1" /> View on site
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/admin/history")} className="border-border text-foreground/50 hover:text-maroon font-body text-sm h-11 px-4">
              <Clock size={14} className="mr-2" /> History
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/collections")} className="border-border font-body text-sm h-11 px-4">
              All sarees
            </Button>
            <Button onClick={() => navigate(`/admin/product/new?from=${encodeURIComponent(key)}`)} className="bg-maroon hover:bg-maroon-light text-ivory font-body text-sm h-11 px-6">
              <Plus size={16} className="mr-2" /> Add saree
            </Button>
          </div>
        </div>

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
            <p className="font-body text-2xl font-normal tabular-nums text-foreground mt-1">
              ₹{products.length ? Math.floor(totalValue / products.length).toLocaleString() : 0}
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-background border border-border">
            <FolderOpen size={48} className="mx-auto text-foreground/20 mb-4" />
            <p className="font-body text-lg text-foreground/50 mb-2">No sarees in this collection yet</p>
            <p className="font-body text-sm text-foreground/40 mb-6">Go to Collections and use the ⋮ menu to assign products here.</p>
            <Button onClick={() => navigate("/admin/collections")} variant="outline" className="border-border text-foreground/60 hover:text-maroon">
              Go to Collections
            </Button>
          </div>
        ) : (
          <>
            <div className="relative mb-6">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search this collection..."
                className="pl-12 bg-background border-border text-foreground text-base h-12"
              />
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="font-body text-sm text-foreground/40">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
            </div>

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
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/admin/product/${product.id}?from=${encodeURIComponent(key)}`)}
                              className="h-8 px-3 text-foreground/50 hover:text-maroon"
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => void handleRemove(product.id)} className="h-8 px-3 text-foreground/50 hover:text-destructive">
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
                    <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-9 px-4 border-border text-foreground/60">
                      <ChevronLeft size={16} className="mr-1" /> Previous
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            size="sm"
                            variant={page === pageNum ? "default" : "outline"}
                            onClick={() => setPage(pageNum)}
                            className={`h-9 w-9 p-0 ${page === pageNum ? "bg-maroon text-ivory" : "border-border text-foreground/60"}`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="h-9 px-4 border-border text-foreground/60">
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

export default AdminCustomCollection;
