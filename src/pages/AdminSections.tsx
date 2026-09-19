import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSections, updateSection, createSection, deleteSection, uploadImage, verifyToken, addHistory, type HomepageSection } from "@/lib/api";
import { clearAdminSession } from "@/lib/authStorage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import RedirectDestinationPicker from "@/components/admin/RedirectDestinationPicker";
import { fetchCollectionDefinitions, type CollectionDefinition } from "@/lib/collectionAssignments";
import { getBlogPosts } from "@/lib/blogStorage";
import { resolveRedirectLabel } from "@/lib/homepageRedirectOptions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload, ChevronDown, ChevronUp, Plus, Trash2, Check, Clock, CheckCircle2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero — Timeless Sarees",
  bridal: "Bridal Sarees",
  tissue: "Tissue & Organza",
  linen: "Linen & Cotton",
  bestseller: "Bestseller — Banarasi Legacy",
};

const IMAGE_POSITION_OPTIONS = [
  { value: "center top", label: "Top" },
  { value: "center 20%", label: "Upper" },
  { value: "center center", label: "Center" },
  { value: "center 70%", label: "Lower" },
  { value: "center bottom", label: "Bottom" },
  { value: "left center", label: "Left" },
  { value: "right center", label: "Right" },
];

const clampPercent = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function tokenToPercent(token: string, axis: "x" | "y"): number {
  const t = String(token || "").trim().toLowerCase();
  if (t.endsWith("%")) {
    const parsed = Number.parseFloat(t.slice(0, -1));
    if (Number.isFinite(parsed)) return clampPercent(parsed);
  }
  if (t === "left") return 0;
  if (t === "right") return 100;
  if (t === "top") return 0;
  if (t === "bottom") return 100;
  if (t === "center") return 50;
  return axis === "x" ? 50 : 50;
}

function parseImagePosition(value?: string): { x: number; y: number } {
  const raw = String(value || "").trim();
  if (!raw) return { x: 50, y: 50 };
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { x: 50, y: 50 };
  return {
    x: tokenToPercent(parts[0], "x"),
    y: tokenToPercent(parts[1], "y"),
  };
}

function formatImagePosition(x: number, y: number): string {
  return `${clampPercent(x)}% ${clampPercent(y)}%`;
}

function imagePositionFromClientPoint(
  clientX: number,
  clientY: number,
  rect: DOMRect
): { x: number; y: number } {
  if (rect.width <= 0 || rect.height <= 0) return { x: 50, y: 50 };
  const px = ((clientX - rect.left) / rect.width) * 100;
  const py = ((clientY - rect.top) / rect.height) * 100;
  return { x: clampPercent(px), y: clampPercent(py) };
}

const AdminSections = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [editHistory, setEditHistory] = useState<Record<number, string[]>>({});
  const [showSavedDialog, setShowSavedDialog] = useState(false);
  const [lastSavedName, setLastSavedName] = useState("");
  const [collectionDefs, setCollectionDefs] = useState<CollectionDefinition[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const blogPosts = useMemo(() => getBlogPosts(), []);

  useEffect(() => {
    fetchCollectionDefinitions().then(setCollectionDefs);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await verifyToken();
        const data = await getSections();
        setSections([...data].sort((a, b) => a.id - b.id));
      } catch {
        clearAdminSession();
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const handleUpdate = (id: number, field: string, value: string | number) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleSave = async (section: HomepageSection) => {
    setSaving(section.id);
    try {
      await updateSection(section.id, {
        title: section.title, subtitle: section.subtitle, description: section.description,
        image_url: section.image_url, video_url: section.video_url ?? "", image_width: section.image_width, image_height: section.image_height,
        image_position: section.image_position ?? "center center",
        image_zoom: Number(section.image_zoom || 100),
        redirect_page: section.redirect_page, button_text: section.button_text, caption: section.caption,
        show_on_collections: section.show_on_collections ? 1 : 0,
      });
      setSavedId(section.id);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setEditHistory((prev) => ({
        ...prev,
        [section.id]: [now, ...(prev[section.id] || [])].slice(0, 5),
      }));
      setLastSavedName(SECTION_LABELS[section.section_key] || section.title);
      setShowSavedDialog(true);
      setTimeout(() => { setSavedId(null); setShowSavedDialog(false); }, 2500);
      // Save to history
      await addHistory({
        page: 'sections',
        action: `Updated "${SECTION_LABELS[section.section_key] || section.title}"`,
        item_name: section.title + ' ' + section.subtitle,
        image_url: section.image_url,
        old_data: { title: section.title, subtitle: section.subtitle, description: section.description, caption: section.caption },
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const handleImageUpload = async (sectionId: number, file: File) => {
    setUploading(sectionId);
    try {
      const { url, width, height } = await uploadImage(file);
      handleUpdate(sectionId, "image_url", url);
      handleUpdate(sectionId, "image_width", width);
      handleUpdate(sectionId, "image_height", height);
      toast({ title: "Image uploaded", description: `${width}×${height}px` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const handleAddSection = async () => {
    try {
      const created = await createSection({
        title: "New Section",
        subtitle: "",
        description: "",
        image_url: "",
        video_url: "",
        image_width: 1920,
        image_height: 1080,
        redirect_page: "/collections",
        button_text: "Explore",
        caption: "Featured",
        is_active: 1,
        show_on_collections: 0,
        image_position: "center center",
        image_zoom: 100,
      });
      setSections((prev) => [...prev, created].sort((a, b) => a.id - b.id));
      setExpandedId(created.id);
      toast({ title: "Section created", description: "Upload an image, edit text, then save." });
    } catch (e) {
      toast({
        title: "Could not create section",
        description: e instanceof Error ? e.message : "Check sections.php on the server.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number, sectionKey: string) => {
    if (!sectionKey.startsWith("custom_")) return;
    try {
      await deleteSection(id);
      setSections((prev) => prev.filter((s) => s.id !== id));
      if (expandedId === id) setExpandedId(null);
      toast({ title: "Section removed from homepage" });
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : undefined,
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
                {lastSavedName} has been updated successfully.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Hero Sections</h1>
            <p className="font-body text-sm text-foreground/50 mt-1">
              Click any row to edit · <strong className="font-medium text-foreground/70">Add Section</strong> creates a new block on the home page (after Bridal, Tissue & Linen). Save after editing.
            </p>
            <p className="font-body text-xs text-foreground/50 mt-1">
              Tip: turn on <strong className="font-medium text-foreground/70">Show on Collections fabric row</strong> and use <strong className="font-medium text-foreground/70">Replace Image</strong> to control the images shown on `/collections`.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* History link */}
            <Button variant="outline" onClick={() => navigate("/admin/history")}
              className="border-border text-foreground/50 hover:text-maroon font-body text-sm h-10 px-4">
              <Clock size={14} className="mr-2" /> History
            </Button>
            <Button onClick={() => void handleAddSection()} className="bg-maroon hover:bg-maroon-light text-ivory font-body text-sm h-10 px-5">
              <Plus size={14} className="mr-2" /> Add Section
            </Button>
          </div>
        </div>

        <div className="border border-border overflow-hidden">
          {sections.map((section) => {
            const isExpanded = expandedId === section.id;
            const justSaved = savedId === section.id;

            return (
              <div key={section.id} className="border-b border-border last:border-b-0">
                {/* Edit history strip */}
                {editHistory[section.id]?.length > 0 && (
                  <div className="flex items-center gap-2 px-5 py-1.5 bg-muted/50 border-b border-border">
                    <Clock size={10} className="text-foreground/30" />
                    <span className="font-body text-[10px] text-foreground/40">
                      Edited: {editHistory[section.id].map((t, i) => (
                        <span key={i}>{i > 0 ? ' · ' : ''}{t}</span>
                      ))}
                    </span>
                  </div>
                )}
                {/* Row preview — always visible */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : section.id)}
                  className={`flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors hover:bg-accent/30 ${isExpanded ? 'bg-accent/20' : ''} ${justSaved ? 'bg-accent/40' : ''}`}
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-14 flex-shrink-0 border border-border overflow-hidden bg-muted relative">
                    {section.image_url ? (
                      <img src={section.image_url} alt={section.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/20 text-xs font-body">No img</div>
                    )}
                    {section.section_key === "hero" && section.video_url?.trim() ? (
                      <span className="absolute bottom-0 right-0 bg-charcoal/85 text-ivory text-[9px] font-normal px-1 py-0.5 font-body">VIDEO</span>
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base font-semibold text-foreground truncate">
                      {SECTION_LABELS[section.section_key] || section.title || "New Section"}
                    </h3>
                    <p className="font-body text-xs text-foreground/50 truncate">{section.description}</p>
                  </div>

                  {/* Caption badge */}
                  <span className="font-body text-xs text-foreground/40 bg-muted px-2 py-1 hidden sm:inline">{section.caption}</span>

                  {/* Collections occasion badge */}
                  {section.show_on_collections === 1 ? (
                    <span className="font-body text-[10px] text-maroon bg-maroon/10 px-2 py-1 hidden md:inline">
                      Collections row
                    </span>
                  ) : null}

                  {/* Redirect badge */}
                  <span className="font-body text-xs text-foreground/40 bg-muted px-2 py-1 hidden md:inline max-w-[200px] truncate" title={section.redirect_page}>
                    {resolveRedirectLabel(section.redirect_page, collectionDefs, blogPosts)}
                  </span>

                  {/* Status */}
                  {justSaved && <Check size={16} className="text-green-600 flex-shrink-0" />}

                  {/* Expand icon */}
                  {isExpanded ? <ChevronUp size={16} className="text-foreground/40 flex-shrink-0" /> : <ChevronDown size={16} className="text-foreground/40 flex-shrink-0" />}
                </div>

                {/* Expanded edit panel */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 bg-background border-t border-border">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                      {/* Left: Fields */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="font-body text-xs font-normal text-foreground/60 mb-1 block">Caption</label>
                            <Input value={section.caption} onChange={(e) => handleUpdate(section.id, "caption", e.target.value)}
                              className="bg-ivory-warm border-border text-foreground text-sm h-10" />
                          </div>
                          <div>
                            <label className="font-body text-xs font-normal text-foreground/60 mb-1 block">Button Text</label>
                            <Input value={section.button_text} onChange={(e) => handleUpdate(section.id, "button_text", e.target.value)}
                              className="bg-ivory-warm border-border text-foreground text-sm h-10" />
                          </div>
                        </div>
                        <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={section.show_on_collections === 1}
                              onChange={(e) => handleUpdate(section.id, "show_on_collections", e.target.checked ? 1 : 0)}
                              className="h-4 w-4 accent-maroon"
                            />
                            <span className="font-body text-xs text-foreground/80">
                              Show on Collections fabric row
                            </span>
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="font-body text-xs font-normal text-foreground/60 mb-1 block">Title</label>
                            <Input value={section.title} onChange={(e) => handleUpdate(section.id, "title", e.target.value)}
                              className="bg-ivory-warm border-border text-foreground text-sm h-10" />
                          </div>
                          <div>
                            <label className="font-body text-xs font-normal text-foreground/60 mb-1 block">Subtitle</label>
                            <Input value={section.subtitle} onChange={(e) => handleUpdate(section.id, "subtitle", e.target.value)}
                              className="bg-ivory-warm border-border text-foreground text-sm h-10" />
                          </div>
                        </div>
                        <div>
                          <label className="font-body text-xs font-normal text-foreground/60 mb-1 block">Description</label>
                          <Textarea value={section.description} onChange={(e) => handleUpdate(section.id, "description", e.target.value)}
                            className="bg-ivory-warm border-border text-foreground text-sm min-h-[70px]" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="min-w-0">
                            <label className="font-body text-xs font-normal text-foreground/60 mb-1 block">Redirect To</label>
                            <RedirectDestinationPicker
                              collections={collectionDefs}
                              value={section.redirect_page}
                              onChange={(path) => handleUpdate(section.id, "redirect_page", path)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-body text-xs font-normal text-foreground/60 mb-1 block">W (px)</label>
                              <Input type="number" value={section.image_width} onChange={(e) => handleUpdate(section.id, "image_width", parseInt(e.target.value) || 0)}
                                className="bg-ivory-warm border-border text-foreground text-sm h-10" />
                            </div>
                            <div>
                              <label className="font-body text-xs font-normal text-foreground/60 mb-1 block">H (px)</label>
                              <Input type="number" value={section.image_height} onChange={(e) => handleUpdate(section.id, "image_height", parseInt(e.target.value) || 0)}
                                className="bg-ivory-warm border-border text-foreground text-sm h-10" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="font-body text-xs font-normal text-foreground/60 mb-1 block">Image Framing</label>
                          <select
                            value={
                              IMAGE_POSITION_OPTIONS.some((opt) => opt.value === (section.image_position || "center center"))
                                ? (section.image_position || "center center")
                                : "__custom__"
                            }
                            onChange={(e) => {
                              if (e.target.value === "__custom__") return;
                              handleUpdate(section.id, "image_position", e.target.value);
                            }}
                            className="w-full bg-ivory-warm border border-border text-foreground text-sm h-10 px-3 focus:outline-none focus:border-gold"
                          >
                            {IMAGE_POSITION_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                            <option value="__custom__">Custom (use drag grid)</option>
                          </select>
                          {(() => {
                            const pos = parseImagePosition(section.image_position || "center center");
                            const zoom = Math.max(50, Math.min(200, Number(section.image_zoom || 100)));
                            return (
                              <div className="space-y-2">
                                <p className="font-body text-[11px] text-foreground/50">
                                  Drag on image preview grid to set focus point ({pos.x}% , {pos.y}%).
                                </p>
                                <div>
                                  <div className="flex items-center justify-between">
                                    <label className="font-body text-[11px] text-foreground/60">Zoom</label>
                                    <span className="font-body text-[11px] text-foreground/60">{zoom}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={50}
                                    max={200}
                                    step={1}
                                    value={zoom}
                                    onChange={(e) => handleUpdate(section.id, "image_zoom", Number(e.target.value))}
                                    className="w-full accent-maroon"
                                  />
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Right: Image (+ hero video URL) */}
                      <div className="space-y-3">
                        <div
                          className="border border-border overflow-hidden bg-muted aspect-video relative touch-none select-none"
                          onPointerDown={(e) => {
                            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                            const next = imagePositionFromClientPoint(e.clientX, e.clientY, rect);
                            handleUpdate(section.id, "image_position", formatImagePosition(next.x, next.y));
                          }}
                          onPointerMove={(e) => {
                            if ((e.buttons & 1) !== 1) return;
                            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                            const next = imagePositionFromClientPoint(e.clientX, e.clientY, rect);
                            handleUpdate(section.id, "image_position", formatImagePosition(next.x, next.y));
                          }}
                        >
                          {section.image_url ? (
                            <>
                              <img
                                src={section.image_url}
                                alt={section.title}
                                className="w-full h-full object-cover"
                                style={{
                                  objectPosition: section.image_position || "center center",
                                  transform: `scale(${Math.max(50, Math.min(200, Number(section.image_zoom || 100))) / 100})`,
                                  transformOrigin: "center center",
                                }}
                              />
                              {(() => {
                                const pos = parseImagePosition(section.image_position || "center center");
                                return (
                                  <>
                                    <div className="absolute inset-0 pointer-events-none">
                                      <div className="absolute left-1/3 top-0 bottom-0 w-px bg-ivory/35" />
                                      <div className="absolute left-2/3 top-0 bottom-0 w-px bg-ivory/35" />
                                      <div className="absolute top-1/3 left-0 right-0 h-px bg-ivory/35" />
                                      <div className="absolute top-2/3 left-0 right-0 h-px bg-ivory/35" />
                                      <div
                                        className="absolute w-3 h-3 rounded-full bg-gold border border-charcoal/70 -translate-x-1/2 -translate-y-1/2 shadow"
                                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                      />
                                    </div>
                                  </>
                                );
                              })()}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-foreground/20 font-body text-sm">No image</div>
                          )}
                        </div>
                        <div>
                          <input type="file" accept="image/jpeg,image/png,image/webp" id={`upload-${section.id}`} className="hidden"
                            onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(section.id, file); }} />
                          <Button onClick={() => document.getElementById(`upload-${section.id}`)?.click()} disabled={uploading === section.id}
                            variant="outline" className="w-full border-maroon/20 text-maroon hover:bg-maroon/5 font-body text-xs h-9">
                            <Upload size={12} className="mr-1" /> {uploading === section.id ? "Uploading..." : "Replace Image"}
                          </Button>
                        </div>
                        {section.section_key === "hero" && (
                          <div className="space-y-2 pt-1 border-t border-border">
                            <label className="font-body text-xs font-normal text-foreground/60 block">Hero video (optional)</label>
                            <Input
                              value={section.video_url ?? ""}
                              onChange={(e) => handleUpdate(section.id, "video_url", e.target.value)}
                              placeholder="https://…/video.mp4 or YouTube / Vimeo link"
                              className="bg-ivory-warm border-border text-foreground text-xs h-9 font-mono"
                            />
                            <p className="font-body text-[11px] text-foreground/50 leading-snug">
                              Paste a direct <strong>.mp4</strong> (H.264 recommended for iPhone/Safari) or <strong>.webm</strong> link, or a <strong>YouTube</strong> / <strong>Vimeo</strong> page URL. WebM is skipped on Safari/iOS. When set, video plays behind the hero text; the image is the poster and fallback. Save after editing.
                            </p>
                            {(section.video_url ?? "").trim() ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-destructive hover:text-destructive font-body"
                                onClick={() => handleUpdate(section.id, "video_url", "")}
                              >
                                Remove video URL
                              </Button>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action bar */}
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                      {section.section_key.startsWith("custom_") ? (
                        <Button onClick={() => void handleDelete(section.id, section.section_key)} variant="ghost"
                          className="text-destructive hover:bg-destructive/5 font-body text-xs h-9 px-3">
                          <Trash2 size={12} className="mr-1" /> Delete
                        </Button>
                      ) : <div />}
                      <Button onClick={() => handleSave(section)} disabled={saving === section.id}
                        className="bg-maroon hover:bg-maroon-light text-ivory font-body text-sm h-9 px-6">
                        <Save size={12} className="mr-2" /> {saving === section.id ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSections;
