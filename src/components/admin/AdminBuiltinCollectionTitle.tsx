import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fetchCollectionDisplayName, apiUpdateCollectionDisplayName } from "@/lib/collectionAssignments";

type BuiltinKey = "bridal" | "tissue" | "linen";

interface AdminBuiltinCollectionTitleProps {
  collectionKey: BuiltinKey;
  /** Used if the API fails or before load */
  fallbackTitle: string;
  icon: LucideIcon;
  subtitle: string;
}

const AdminBuiltinCollectionTitle = ({ collectionKey, fallbackTitle, icon: Icon, subtitle }: AdminBuiltinCollectionTitleProps) => {
  const [title, setTitle] = useState(fallbackTitle);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    void fetchCollectionDisplayName(collectionKey, fallbackTitle).then(setTitle);
  }, [collectionKey, fallbackTitle]);

  const openEdit = () => {
    setDraft(title);
    setEditOpen(true);
  };

  const save = async () => {
    const t = draft.trim();
    if (t.length < 2) {
      toast({ title: "Name too short", description: "Use at least 2 characters.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const updated = await apiUpdateCollectionDisplayName(collectionKey, t);
      setTitle(updated.display_name);
      setEditOpen(false);
      toast({ title: "Collection name saved" });
    } catch (e) {
      toast({
        title: "Could not save",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Icon size={24} strokeWidth={1.5} className="text-gold-dark shrink-0" />
          <h1 className="font-display text-3xl font-semibold text-foreground">{title}</h1>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-3 font-body text-xs border-border text-foreground/60 hover:text-maroon"
            onClick={openEdit}
          >
            <Pencil size={14} className="mr-1.5" />
            Edit name
          </Button>
        </div>
        <p className="font-body text-base text-foreground/50 mt-1">{subtitle}</p>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit collection name</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="builtin-coll-edit-name" className="font-body text-sm">
              Display name
            </Label>
            <Input
              id="builtin-coll-edit-name"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="font-body"
              maxLength={200}
            />
            <p className="font-body text-xs text-muted-foreground">
              This title appears on this admin screen and on the public collection page for this range.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" className="bg-maroon hover:bg-maroon-light text-ivory" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminBuiltinCollectionTitle;
