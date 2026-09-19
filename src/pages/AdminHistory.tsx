import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory, updateHistory, deleteHistory, addHistory, verifyToken, type HistoryEntry } from "@/lib/api";
import { clearAdminSession } from "@/lib/authStorage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Clock, Trash2, Pencil, Save, Image as ImageIcon, RotateCcw, CheckCircle2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

const PAGE_LABELS: Record<string, string> = {
  sections: "Hero Sections",
  collections: "Collections",
  bridal: "Bridal Collection",
};

const AdminHistory = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [deletedEntries, setDeletedEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAction, setEditAction] = useState("");
  const [editName, setEditName] = useState("");
  const [filterPage, setFilterPage] = useState<string>("");
  const [showRecoverDialog, setShowRecoverDialog] = useState(false);
  const [showRestoredDialog, setShowRestoredDialog] = useState(false);
  const [restoredName, setRestoredName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadHistory = async () => {
    try {
      await verifyToken();
      const data = await getHistory(filterPage || undefined);
      setHistory(data);
    } catch {
      clearAdminSession();
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, [filterPage]);

  const handleDelete = async (id: number) => {
    const entry = history.find(h => h.id === id);
    if (entry) setDeletedEntries(prev => [entry, ...prev].slice(0, 20));
    await deleteHistory(id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
    toast({ title: "Deleted", description: "Entry moved to recover bin" });
  };

  const handleRecover = async (entry: HistoryEntry) => {
    const restored = await addHistory({
      page: entry.page,
      action: entry.action,
      item_name: entry.item_name,
      image_url: entry.image_url,
      old_data: entry.old_data || undefined,
    });
    setHistory(prev => [restored, ...prev]);
    setDeletedEntries(prev => prev.filter(d => d.id !== entry.id));
    setRestoredName(entry.item_name || entry.action);
    setShowRestoredDialog(true);
    setTimeout(() => setShowRestoredDialog(false), 2500);
  };

  const handleEdit = (entry: HistoryEntry) => {
    setEditingId(entry.id);
    setEditAction(entry.action);
    setEditName(entry.item_name);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    await updateHistory(editingId, { action: editAction, item_name: editName });
    setHistory((prev) => prev.map((h) => h.id === editingId ? { ...h, action: editAction, item_name: editName } : h));
    setEditingId(null);
    toast({ title: "History entry updated" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
      " · " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return <AdminLayout><div className="flex items-center justify-center h-full"><p className="font-body text-lg text-foreground/50">Loading...</p></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="px-4 py-4 sm:px-8 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Clock size={22} strokeWidth={1.5} className="text-maroon" />
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Edit History</h1>
            </div>
            <p className="font-body text-xs sm:text-sm text-foreground/50 mt-1">All changes — {history.length} entries</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {deletedEntries.length > 0 && (
              <Button variant="outline" onClick={() => setShowRecoverDialog(true)}
                className="border-border text-foreground/50 hover:text-maroon font-body text-xs h-8 sm:h-9 px-3 sm:px-4">
                <RotateCcw size={14} className="mr-1 sm:mr-2" /> Recover ({deletedEntries.length})
              </Button>
            )}
            {["", "sections", "collections", "bridal"].map((key) => (
              <Button key={key} size="sm" variant={filterPage === key ? "default" : "outline"}
                onClick={() => setFilterPage(key)}
                className={`font-body text-xs h-8 sm:h-9 px-3 sm:px-4 ${filterPage === key ? "bg-maroon text-ivory" : "border-border text-foreground/60"}`}>
                {key ? PAGE_LABELS[key] : "All"}
              </Button>
            ))}
          </div>
        </div>

        {/* Edit dialog */}
        <Dialog open={editingId !== null} onOpenChange={() => setEditingId(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Edit History Entry</DialogTitle>
              <DialogDescription className="font-body text-sm text-foreground/50">Update the action description or item name.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="font-body text-xs font-normal text-foreground/60 mb-1 block">Action</label>
                <Input value={editAction} onChange={(e) => setEditAction(e.target.value)}
                  className="bg-ivory-warm border-border text-foreground text-sm h-10" />
              </div>
              <div>
                <label className="font-body text-xs font-normal text-foreground/60 mb-1 block">Item Name</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="bg-ivory-warm border-border text-foreground text-sm h-10" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingId(null)} className="font-body text-sm h-9">Cancel</Button>
                <Button onClick={handleSaveEdit} className="bg-maroon hover:bg-maroon-light text-ivory font-body text-sm h-9 px-5">
                  <Save size={12} className="mr-2" /> Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Restored confirmation */}
        <Dialog open={showRestoredDialog} onOpenChange={setShowRestoredDialog}>
          <DialogContent className="sm:max-w-sm text-center">
            <DialogHeader className="items-center">
              <CheckCircle2 size={48} className="text-maroon mb-2" />
              <DialogTitle className="font-display text-xl">Recovered</DialogTitle>
              <DialogDescription className="font-body text-sm text-foreground/60">
                "{restoredName}" has been restored to history.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* Recover bin dialog */}
        <Dialog open={showRecoverDialog} onOpenChange={setShowRecoverDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-xl flex items-center gap-2">
                <RotateCcw size={18} /> Recover Deleted Entries
              </DialogTitle>
              <DialogDescription className="font-body text-sm text-foreground/50">
                {deletedEntries.length} deleted entries available for recovery.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 max-h-80 overflow-y-auto space-y-2">
              {deletedEntries.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 p-3 border border-border hover:bg-accent/20 transition-colors">
                  <div className="w-12 h-9 flex-shrink-0 border border-border overflow-hidden bg-muted">
                    {entry.image_url ? (
                      <img src={entry.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ImageIcon size={10} className="text-foreground/15" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-foreground font-normal truncate">{entry.action}</p>
                    <p className="font-body text-[10px] text-foreground/40">{PAGE_LABELS[entry.page] || entry.page}</p>
                  </div>
                  <Button size="sm" onClick={() => handleRecover(entry)}
                    className="bg-maroon hover:bg-maroon-light text-ivory font-body text-xs h-8 px-3">
                    <RotateCcw size={12} className="mr-1" /> Recover
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* History list */}
        {history.length === 0 ? (
          <div className="border border-border bg-background p-16 text-center">
            <Clock size={48} className="text-foreground/10 mx-auto mb-4" />
            <p className="font-body text-base text-foreground/40">No history yet. Changes will appear here after you save.</p>
          </div>
        ) : (
          <div className="border border-border overflow-hidden">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-b-0 hover:bg-accent/20 transition-colors">
                {/* Image thumbnail */}
                <div className="w-16 h-12 flex-shrink-0 border border-border overflow-hidden bg-muted">
                  {entry.image_url ? (
                    <img src={entry.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={14} className="text-foreground/15" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-body text-xs font-normal text-maroon bg-maroon/10 px-2 py-0.5">
                      {PAGE_LABELS[entry.page] || entry.page}
                    </span>
                    <span className="font-body text-[10px] text-foreground/30">{formatDate(entry.created_at)}</span>
                  </div>
                  <p className="font-body text-sm text-foreground font-normal truncate">{entry.action}</p>
                  {entry.item_name && (
                    <p className="font-body text-xs text-foreground/50 truncate">{entry.item_name}</p>
                  )}
                  {entry.old_data && (
                    <details className="mt-1">
                      <summary className="font-body text-[10px] text-foreground/30 cursor-pointer hover:text-foreground/50">View old data</summary>
                      <pre className="font-mono text-[10px] text-foreground/40 mt-1 bg-muted/50 p-2 overflow-x-auto max-h-24">
                        {JSON.stringify(entry.old_data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(entry)}
                    className="h-8 w-8 p-0 text-foreground/40 hover:text-maroon">
                    <Pencil size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(entry.id)}
                    className="h-8 w-8 p-0 text-foreground/40 hover:text-destructive">
                    <Trash2 size={14} />
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

export default AdminHistory;
