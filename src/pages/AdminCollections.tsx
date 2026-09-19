import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken, addHistory, deleteProduct, uploadImage } from "@/lib/api";
import { clearAdminSession } from "@/lib/authStorage";
import { type SareeProduct } from "@/data/sareeData";
import { getAllProducts } from "@/lib/getAllProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Clock, CheckCircle2, MoreVertical, Crown, Sparkles, Leaf, Check, Copy, FolderOpen, ExternalLink, ArrowUp, ArrowDown } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  getProductCollections,
  type CollectionType,
  type CollectionDefinition,
  fetchAllAssignments,
  fetchCollectionDefinitions,
  fetchAllCollectionDefinitions,
  apiAddProductToCollection,
  apiRemoveProductFromCollection,
  apiCreateCollection,
  apiDeleteCustomCollection,
  apiUpdateCollectionOrder,
  apiUpdateCollectionDisplayName,
} from "@/lib/collectionAssignments";
import { getCollectionIconComponent, DEFAULT_COLLECTION_ICON_KEY, type CollectionIconKey } from "@/lib/collectionIcons";
import { CollectionIconPicker } from "@/components/admin/CollectionIconPicker";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PAGE_SIZE = 25;

const BUILTIN_COLLECTION_OPTIONS: { key: CollectionType; label: string; icon: typeof Crown }[] = [
  { key: "bridal", label: "Bridal Collection", icon: Crown },
  { key: "tissue", label: "Tissue Collection", icon: Sparkles },
  { key: "linen", label: "Linen Collection", icon: Leaf },
];

const AdminCollections = () => {
  const [products, setProducts] = useState<SareeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showSavedDialog, setShowSavedDialog] = useState(false);
  const [lastAction, setLastAction] = useState("");
  const [assignmentVersion, setAssignmentVersion] = useState(0);
  const [customCollections, setCustomCollections] = useState<CollectionDefinition[]>([]);
  const [orderedCollections, setOrderedCollections] = useState<CollectionDefinition[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [savingCollectionImageKey, setSavingCollectionImageKey] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionKey, setNewCollectionKey] = useState("");
  const [newCollectionIcon, setNewCollectionIcon] = useState<CollectionIconKey>(DEFAULT_COLLECTION_ICON_KEY);
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<CollectionDefinition | null>(null);
  const [deletingCollectionKey, setDeletingCollectionKey] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const collectionOptions = useMemo(() => {
    const custom = customCollections.map((c) => ({
      key: c.collection_key,
      label: c.display_name,
      icon: getCollectionIconComponent(c.icon_key),
    }));
    return [...BUILTIN_COLLECTION_OPTIONS, ...custom];
  }, [customCollections]);

  const reloadCollectionsMeta = async () => {
    const [custom, all] = await Promise.all([
      fetchCollectionDefinitions(),
      fetchAllCollectionDefinitions(),
    ]);
    setCustomCollections(custom);
    setOrderedCollections(all);
  };

  useEffect(() => {
    verifyToken()
      .then(async () => {
        // Load products first so table appears quickly.
        const all = await getAllProducts();
        setProducts(all.map(p => ({ ...p })));
        setLoading(false);

        reloadCollectionsMeta().catch(() => {});

        // Refresh assignments in background; do not block page render.
        fetchAllAssignments()
          .then(() => setAssignmentVersion(v => v + 1))
          .catch(() => {});
      })
      .catch(() => { clearAdminSession(); navigate("/admin/login"); });
  }, [navigate]);

  const handleCreateCollection = async () => {
    const name = newCollectionName.trim();
    if (name.length < 2) {
      toast({ title: "Name too short", description: "Enter at least 2 characters.", variant: "destructive" });
      return;
    }
    setCreatingCollection(true);
    try {
      const created = await apiCreateCollection(name, newCollectionKey.trim() || undefined, newCollectionIcon);
      await reloadCollectionsMeta();
      setNewCollectionName("");
      setNewCollectionKey("");
      setNewCollectionIcon(DEFAULT_COLLECTION_ICON_KEY);
      setCreateDialogOpen(false);
      toast({ title: "Collection created", description: `"${created.display_name}" — add products from the ⋮ menu.` });
    } catch (e) {
      toast({
        title: "Could not create collection",
        description: e instanceof Error ? e.message : "Try a different name.",
        variant: "destructive",
      });
    } finally {
      setCreatingCollection(false);
    }
  };

  const filtered = products.filter(p =>
    p.itemName.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search]);

  const addHistoryEntry = (action: string) => {
    setLastAction(action);
    setShowSavedDialog(true);
    setTimeout(() => setShowSavedDialog(false), 2500);
  };

  const handleDelete = async (id: string) => {
    const product = products.find(p => p.id === id);
    const name = product?.itemName || "Item";
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      addHistoryEntry(`Removed "${name}"`);
      addHistory({ page: 'collections', action: `Removed "${name}"`, item_name: name, image_url: product?.image });
      toast({ title: "Listing removed" });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Could not delete product from database",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteCollection = async () => {
    if (!collectionToDelete) return;
    const key = collectionToDelete.collection_key;
    setDeletingCollectionKey(key);
    try {
      await apiDeleteCustomCollection(key);
      await reloadCollectionsMeta();
      await fetchAllAssignments();
      setAssignmentVersion((v) => v + 1);
      toast({
        title: "Collection deleted",
        description: `"${collectionToDelete.display_name}" and its product links were removed.`,
      });
      setCollectionToDelete(null);
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Could not delete collection.",
        variant: "destructive",
      });
    } finally {
      setDeletingCollectionKey(null);
    }
  };

  const moveCollection = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= orderedCollections.length || savingOrder) return;
    const draft = [...orderedCollections];
    const [item] = draft.splice(index, 1);
    draft.splice(nextIndex, 0, item);
    setOrderedCollections(draft);
    setSavingOrder(true);
    try {
      const saved = await apiUpdateCollectionOrder(draft.map((c) => c.collection_key));
      setOrderedCollections(saved);
      setCustomCollections(saved.filter((c) => !["bridal", "tissue", "linen"].includes(c.collection_key)));
      toast({ title: "Order updated", description: "Storefront collection strip now follows this order." });
    } catch (e) {
      await reloadCollectionsMeta();
      toast({
        title: "Could not save order",
        description: e instanceof Error ? e.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setSavingOrder(false);
    }
  };

  const saveCollectionImage = async (collection: CollectionDefinition, imageUrl: string | null) => {
    setSavingCollectionImageKey(collection.collection_key);
    try {
      await apiUpdateCollectionDisplayName(
        collection.collection_key,
        collection.display_name,
        collection.icon_key ?? null,
        imageUrl
      );
      await reloadCollectionsMeta();
      toast({ title: "Collection image saved" });
    } catch (e) {
      toast({
        title: "Could not save collection image",
        description: e instanceof Error ? e.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setSavingCollectionImageKey(null);
    }
  };

  const handleToggleCollection = async (productId: string, productName: string, collection: CollectionType, collectionLabel: string) => {
    try {
      const current = getProductCollections(productId);
      if (current.includes(collection)) {
        await apiRemoveProductFromCollection(productId, collection);
        toast({ title: `Removed from ${collectionLabel}` });
      } else {
        await apiAddProductToCollection(productId, collection);
        addHistoryEntry(`Added "${productName}" to ${collectionLabel}`);
        toast({ title: `Added to ${collectionLabel}` });
      }
      setAssignmentVersion(v => v + 1);
    } catch (error) {
      toast({
        title: "Collection update failed",
        description: error instanceof Error ? error.message : "Could not sync with Hostinger database",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <AdminLayout><div className="flex items-center justify-center h-full"><p className="font-body text-lg text-foreground/50">Loading...</p></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="px-8 py-8">
        {/* Saved confirmation dialog */}
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

        <Dialog
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) {
              setNewCollectionIcon(DEFAULT_COLLECTION_ICON_KEY);
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Create collection</DialogTitle>
              <DialogDescription className="font-body text-sm text-foreground/60">
                Give it a display name (like Bridal or Tissue). A URL key is created automatically, or you can set one below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="coll-name" className="font-body text-sm">Collection name</Label>
                <Input
                  id="coll-name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g. Festive Edit 2026"
                  className="font-body"
                />
              </div>
              <CollectionIconPicker value={newCollectionIcon} onChange={setNewCollectionIcon} />
              <div className="space-y-2">
                <Label htmlFor="coll-key" className="font-body text-sm text-foreground/70">URL key (optional)</Label>
                <Input
                  id="coll-key"
                  value={newCollectionKey}
                  onChange={(e) => setNewCollectionKey(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="e.g. festive-edit-2026"
                  className="font-body font-mono text-sm"
                />
                <p className="font-body text-xs text-muted-foreground">Lowercase, numbers, hyphens only. Leave blank to auto-generate from the name.</p>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={creatingCollection}>
                Cancel
              </Button>
              <Button type="button" className="bg-maroon hover:bg-maroon-light text-ivory" onClick={() => void handleCreateCollection()} disabled={creatingCollection}>
                {creatingCollection ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Collections</h1>
            <p className="font-body text-base text-foreground/50 mt-1">{products.length} sarees listed</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <Button variant="outline" onClick={() => navigate("/admin/history")}
              className="border-border text-foreground/50 hover:text-maroon font-body text-sm h-11 px-4">
              <Clock size={14} className="mr-2" /> History
            </Button>
            <Button variant="outline" onClick={() => setCreateDialogOpen(true)} className="border-maroon/40 text-maroon hover:bg-maroon/10 font-body text-sm h-11 px-4">
              <FolderOpen size={16} className="mr-2" /> Create collection
            </Button>
            <Button onClick={() => navigate("/admin/product/new")} className="bg-maroon hover:bg-maroon-light text-ivory font-body text-sm h-11 px-6">
              <Plus size={16} className="mr-2" /> Add Saree
            </Button>
          </div>
        </div>

        <AlertDialog open={collectionToDelete !== null} onOpenChange={(open) => !open && setCollectionToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">Delete this collection?</AlertDialogTitle>
              <AlertDialogDescription className="font-body text-foreground/70">
                {collectionToDelete ? (
                  <>
                    <span className="font-medium text-foreground">{collectionToDelete.display_name}</span>
                    {" "}(<code className="text-xs bg-muted px-1 py-0.5 rounded">/collection/{collectionToDelete.collection_key}</code>)
                    will be removed. All product links to this collection will be cleared. This cannot be undone.
                  </>
                ) : null}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-body" disabled={deletingCollectionKey !== null}>
                Cancel
              </AlertDialogCancel>
              <Button
                type="button"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
                disabled={deletingCollectionKey !== null}
                onClick={() => void confirmDeleteCollection()}
              >
                {deletingCollectionKey ? "Deleting…" : "Delete collection"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {orderedCollections.length > 0 && (
          <div className="mb-6 space-y-2">
            <span className="font-body text-xs text-foreground/50 uppercase tracking-wider block">Storefront order</span>
            <div className="flex flex-col gap-2 max-w-2xl">
              {orderedCollections.map((c, idx) => (
                <div key={c.collection_key} className="flex items-center justify-between gap-3 border border-border bg-background px-3 py-2.5">
                  <div className="min-w-0 flex items-start gap-2">
                    {(() => {
                      const CIcon = getCollectionIconComponent(c.icon_key);
                      return <CIcon size={18} strokeWidth={1.5} className="text-gold-dark shrink-0 mt-0.5" />;
                    })()}
                    <div className="min-w-0">
                      <p className="font-body text-sm font-medium text-foreground truncate">{c.display_name}</p>
                      <p className="font-body text-xs text-muted-foreground">/{["bridal", "tissue", "linen"].includes(c.collection_key) ? c.collection_key : `collection/${c.collection_key}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-10 h-10 border border-border overflow-hidden bg-muted shrink-0">
                      {c.image_url ? (
                        <img src={c.image_url} alt={c.display_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-foreground/35 font-body">No img</div>
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={savingCollectionImageKey === c.collection_key}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const { url } = await uploadImage(file);
                            await saveCollectionImage(c, url);
                          } catch (err) {
                            toast({
                              title: "Upload failed",
                              description: err instanceof Error ? err.message : "Could not upload image.",
                              variant: "destructive",
                            });
                          } finally {
                            e.target.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-body"
                        disabled={savingCollectionImageKey === c.collection_key}
                        asChild
                      >
                        <span>{savingCollectionImageKey === c.collection_key ? "Saving…" : "Image"}</span>
                      </Button>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => void moveCollection(idx, -1)}
                      disabled={idx === 0 || savingOrder}
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => void moveCollection(idx, 1)}
                      disabled={idx === orderedCollections.length - 1 || savingOrder}
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {customCollections.length > 0 && (
          <div className="mb-6 space-y-2">
            <span className="font-body text-xs text-foreground/50 uppercase tracking-wider block">Your collections</span>
            <div className="flex flex-col gap-2 max-w-2xl">
              {customCollections.map((c) => (
                <div
                  key={c.collection_key}
                  className="flex flex-wrap items-center justify-between gap-3 border border-border bg-background px-3 py-2.5"
                >
                  <div className="min-w-0 flex items-start gap-2">
                    {(() => {
                      const CIcon = getCollectionIconComponent(c.icon_key);
                      return <CIcon size={18} strokeWidth={1.5} className="text-gold-dark shrink-0 mt-0.5" />;
                    })()}
                    <div className="min-w-0">
                    <p className="font-body text-sm font-medium text-foreground truncate">{c.display_name}</p>
                    <p className="font-body text-xs text-muted-foreground">/collection/{c.collection_key}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-body"
                      onClick={() => navigate(`/admin/collection/${encodeURIComponent(c.collection_key)}`)}
                    >
                      Open
                      <ExternalLink size={12} className="ml-1.5 opacity-60" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-body text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setCollectionToDelete(c)}
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, SKU, or category..."
            className="pl-12 bg-background border-border text-foreground text-base h-12" />
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between mb-3">
          <p className="font-body text-sm text-foreground/40">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} sarees
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
                  <th className="text-center font-body text-sm font-medium text-foreground/60 py-4 px-4 w-16">Add To</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((product, i) => {
                  const collections = getProductCollections(product.id);
                  return (
                    <tr key={`${product.id}-${assignmentVersion}`} className="border-b border-border/50 hover:bg-ivory-warm/50">
                      <td className="font-body text-xs font-normal tabular-nums text-foreground/30 py-3 px-4">{(page - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="py-3 px-4">
                        <div className="w-12 h-16 bg-secondary overflow-hidden border border-border">
                          <img src={product.image} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </div>
                      </td>
                      <td className="font-body text-sm text-foreground py-3 px-4">
                        <div>
                          {product.itemName}
                          {collections.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {collections.map(c => (
                                <span key={c} className="inline-block px-2 py-0.5 text-[10px] font-body font-medium uppercase tracking-wider bg-maroon/10 text-maroon rounded-sm">
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="font-body text-xs text-foreground/50 py-3 px-4 font-mono">{product.sku}</td>
                      <td className="font-body text-sm text-foreground/70 py-3 px-4">{product.category}</td>
                      <td className="font-body text-sm text-foreground/70 py-3 px-4">{product.fabric}</td>
                      <td className="font-body text-sm text-foreground py-3 px-4 text-right font-normal tabular-nums">₹{product.price.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/product/${product.id}`)}
                            className="h-8 px-3 text-foreground/50 hover:text-maroon"
                            title="Edit">
                            <Pencil size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/admin/product/new?duplicate=${encodeURIComponent(product.id)}`)}
                            className="h-8 px-3 text-foreground/50 hover:text-maroon"
                            title="Duplicate (same details, new SKU, no images — add photos)">
                            <Copy size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(product.id)}
                            className="h-8 px-3 text-foreground/50 hover:text-destructive">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-foreground/50 hover:text-foreground">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel className="font-body text-xs text-foreground/40">Add to Collection</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {collectionOptions.map(opt => {
                              const isAssigned = collections.includes(opt.key);
                              return (
                                <DropdownMenuItem
                                  key={opt.key}
                                  onClick={() => handleToggleCollection(product.id, product.itemName, opt.key, opt.label)}
                                  className="font-body text-sm flex items-center gap-2 cursor-pointer"
                                >
                                  <opt.icon size={14} strokeWidth={1.5} />
                                  <span className="flex-1">{opt.label}</span>
                                  {isAssigned && <Check size={14} className="text-maroon" />}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t border-border">
            <p className="font-body text-sm text-foreground/40">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="h-9 px-4 border-border text-foreground/60">
                <ChevronLeft size={16} className="mr-1" /> Previous
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }
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
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCollections;
