import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "@/lib/api";
import { clearAdminSession } from "@/lib/authStorage";
import { getBlogPosts, saveBlogOverride, resetBlogOverride, addCustomBlog, deleteBlog, isCustomBlog, type BlogOverride } from "@/lib/blogStorage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Save, ChevronDown, ChevronUp, RotateCcw, Search, FileText, Image as ImageIcon, Plus, Trash2, PlusCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import type { BlogPost } from "@/data/blogData";

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [editData, setEditData] = useState<Record<number, BlogOverride>>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBlog, setNewBlog] = useState({
    headline: "", slug: "", excerpt: "", category: "", author: "Athina Editorial",
    readTime: "8 min", date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    body: [""], image: "", images: [] as { src: string; caption: string }[],
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      try {
        await verifyToken();
        setPosts(getBlogPosts());
      } catch {
        clearAdminSession();
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const filtered = posts.filter(
    (p) =>
      p.headline.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const getEdit = (id: number) => editData[id] || {};

  const updateEdit = (id: number, partial: Partial<BlogOverride>) => {
    setEditData((prev) => ({ ...prev, [id]: { ...prev[id], ...partial } }));
  };

  const handleSave = (post: BlogPost) => {
    setSaving(post.id);
    const edit = getEdit(post.id);
    saveBlogOverride(post.id, edit);
    setPosts(getBlogPosts());
    setEditData((prev) => {
      const copy = { ...prev };
      delete copy[post.id];
      return copy;
    });
    toast({ title: "Blog Saved", description: `"${edit.headline || post.headline}" updated successfully.` });
    setSaving(null);
  };

  const handleReset = (id: number) => {
    resetBlogOverride(id);
    setPosts(getBlogPosts());
    setEditData((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    toast({ title: "Reset", description: "Blog post restored to default." });
  };

  const handleBodyChange = (postId: number, paraIndex: number, value: string) => {
    const post = posts.find((p) => p.id === postId)!;
    const currentBody = getEdit(postId)?.body || [...post.body];
    const newBody = [...currentBody];
    newBody[paraIndex] = value;
    updateEdit(postId, { body: newBody });
  };

  const addParagraph = (postId: number) => {
    const post = posts.find((p) => p.id === postId)!;
    const currentBody = getEdit(postId)?.body || [...post.body];
    updateEdit(postId, { body: [...currentBody, ""] });
  };

  const removeParagraph = (postId: number, index: number) => {
    const post = posts.find((p) => p.id === postId)!;
    const currentBody = getEdit(postId)?.body || [...post.body];
    updateEdit(postId, { body: currentBody.filter((_, i) => i !== index) });
  };

  const handleImageChange = (postId: number, imgIndex: number, field: "src" | "caption", value: string) => {
    const post = posts.find((p) => p.id === postId)!;
    const currentImages = getEdit(postId)?.images || [...post.images];
    const newImages = currentImages.map((img, i) => (i === imgIndex ? { ...img, [field]: value } : img));
    updateEdit(postId, { images: newImages });
  };

  const addImage = (postId: number) => {
    const post = posts.find((p) => p.id === postId)!;
    const currentImages = getEdit(postId)?.images || [...post.images];
    updateEdit(postId, { images: [...currentImages, { src: "", caption: "" }] });
  };

  const removeImage = (postId: number, index: number) => {
    const post = posts.find((p) => p.id === postId)!;
    const currentImages = getEdit(postId)?.images || [...post.images];
    updateEdit(postId, { images: currentImages.filter((_, i) => i !== index) });
  };

  const handleCreateBlog = () => {
    if (!newBlog.headline.trim() || !newBlog.slug.trim()) {
      toast({ title: "Required", description: "Headline and slug are required.", variant: "destructive" });
      return;
    }
    const slug = newBlog.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    addCustomBlog({ ...newBlog, slug, id: 0 } as any);
    setPosts(getBlogPosts());
    setShowAddDialog(false);
    setNewBlog({
      headline: "", slug: "", excerpt: "", category: "", author: "Athina Editorial",
      readTime: "8 min", date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      body: [""], image: "", images: [],
    });
    toast({ title: "Blog Created", description: `"${newBlog.headline}" added successfully.` });
  };

  const handleDeleteBlog = (id: number) => {
    deleteBlog(id);
    setPosts(getBlogPosts());
    setExpandedId(null);
    toast({ title: "Deleted", description: "Blog post removed." });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Blog Management</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">{posts.length} articles in The Athina Chronicle</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2 bg-gold hover:bg-gold-light text-charcoal font-normal whitespace-nowrap">
              <PlusCircle className="w-4 h-4" /> Add Blog
            </Button>
          </div>
        </div>

        {/* Blog List */}
        <div className="space-y-3">
          {filtered.map((post) => {
            const isExpanded = expandedId === post.id;
            const edit = getEdit(post.id);
            const hasChanges = Object.keys(edit).length > 0;

            return (
              <div key={post.id} className="border border-border bg-background rounded-sm overflow-hidden">
                {/* Row Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : post.id)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-ivory-warm/50 transition-colors text-left"
                >
                  <img src={post.image} alt="" className="w-14 h-10 object-cover rounded-sm flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-body text-sm font-normal text-foreground truncate">{post.headline}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-gold uppercase tracking-wider font-normal">{post.category}</span>
                      <span className="text-[10px] text-muted-foreground">{post.date}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {post.body.length} para
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> {post.images.length} img
                      </span>
                    </div>
                  </div>
                  {hasChanges && <span className="text-[9px] bg-gold/20 text-gold px-2 py-0.5 rounded font-normal uppercase">Unsaved</span>}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {/* Expanded Editor */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-6 space-y-6 bg-ivory-warm/30">
                    {/* Meta fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground mb-1 block">Headline</label>
                        <Input
                          value={edit.headline ?? post.headline}
                          onChange={(e) => updateEdit(post.id, { headline: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground mb-1 block">Category</label>
                        <Input
                          value={edit.category ?? post.category}
                          onChange={(e) => updateEdit(post.id, { category: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground mb-1 block">Author</label>
                        <Input
                          value={edit.author ?? post.author}
                          onChange={(e) => updateEdit(post.id, { author: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground mb-1 block">Read Time</label>
                        <Input
                          value={edit.readTime ?? post.readTime}
                          onChange={(e) => updateEdit(post.id, { readTime: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground mb-1 block">Date</label>
                        <Input
                          value={edit.date ?? post.date}
                          onChange={(e) => updateEdit(post.id, { date: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground mb-1 block">Excerpt</label>
                      <Textarea
                        value={edit.excerpt ?? post.excerpt}
                        onChange={(e) => updateEdit(post.id, { excerpt: e.target.value })}
                        rows={2}
                      />
                    </div>

                    {/* Cover Image */}
                    <div>
                      <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground mb-1 block">Cover Image URL</label>
                      <div className="flex gap-3 items-start">
                        {(edit.image ?? post.image) && (
                          <img src={edit.image ?? post.image} alt="" className="w-24 h-16 object-cover rounded-sm border border-border flex-shrink-0" />
                        )}
                        <Input
                          value={edit.image ?? post.image}
                          onChange={(e) => updateEdit(post.id, { image: e.target.value })}
                          placeholder="https://..."
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Body Paragraphs */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground">Body Paragraphs</label>
                        <Button size="sm" variant="outline" onClick={() => addParagraph(post.id)} className="text-xs gap-1">
                          <Plus className="w-3 h-3" /> Add Paragraph
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {(edit.body || post.body).map((para, i) => (
                          <div key={i} className="relative">
                            <div className="flex items-start gap-2">
                              <span className="text-[10px] font-mono text-muted-foreground mt-3 w-6 text-right flex-shrink-0">§{i + 1}</span>
                              <Textarea
                                value={para}
                                onChange={(e) => handleBodyChange(post.id, i, e.target.value)}
                                rows={3}
                                className="flex-1 text-sm"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeParagraph(post.id, i)}
                                className="text-destructive/50 hover:text-destructive mt-1 px-2"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Images */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground">Images & Captions</label>
                        <Button size="sm" variant="outline" onClick={() => addImage(post.id)} className="text-xs gap-1">
                          <Plus className="w-3 h-3" /> Add Image
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(edit.images || post.images).map((img, i) => (
                          <div key={i} className="border border-border rounded-sm overflow-hidden bg-background">
                            {img.src && <img src={img.src} alt={img.caption} className="w-full h-32 object-cover" />}
                            {!img.src && <div className="w-full h-32 bg-muted flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground/30" /></div>}
                            <div className="p-2 space-y-1.5">
                              <Input
                                value={img.src}
                                onChange={(e) => handleImageChange(post.id, i, "src", e.target.value)}
                                placeholder="Image URL..."
                                className="text-xs"
                              />
                              <Input
                                value={img.caption}
                                onChange={(e) => handleImageChange(post.id, i, "caption", e.target.value)}
                                placeholder="Caption..."
                                className="text-xs"
                              />
                              <Button size="sm" variant="ghost" onClick={() => removeImage(post.id, i)} className="text-destructive/50 hover:text-destructive text-[10px] px-2 h-6 w-full">
                                <Trash2 className="w-3 h-3 mr-1" /> Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center flex-wrap gap-3 pt-2 border-t border-border">
                      <Button onClick={() => handleSave(post)} disabled={!hasChanges || saving === post.id} className="gap-2 bg-maroon hover:bg-maroon/90 text-white">
                        <Save className="w-4 h-4" />
                        {saving === post.id ? "Saving..." : "Save Changes"}
                      </Button>
                      {!isCustomBlog(post.id) && (
                        <Button variant="outline" onClick={() => handleReset(post.id)} className="gap-2 text-xs">
                          <RotateCcw className="w-3 h-3" /> Reset to Default
                        </Button>
                      )}
                      <Button variant="destructive" onClick={() => handleDeleteBlog(post.id)} className="gap-2 text-xs">
                        <Trash2 className="w-3 h-3" /> Delete Blog
                      </Button>
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-xs text-gold hover:underline"
                      >
                        Preview Article →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No blogs match your search.</p>
          </div>
        )}
      </div>

      {/* Add Blog Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Add New Blog Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground mb-1 block">Headline *</label>
                <Input value={newBlog.headline} onChange={(e) => setNewBlog({ ...newBlog, headline: e.target.value })} placeholder="Enter blog headline..." />
              </div>
              <div>
                <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground mb-1 block">URL Slug *</label>
                <Input value={newBlog.slug} onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value })} placeholder="e.g. my-new-blog-post" />
              </div>
              <div>
                <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground mb-1 block">Category</label>
                <Input value={newBlog.category} onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })} placeholder="e.g. Heritage & Craft" />
              </div>
              <div>
                <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground mb-1 block">Author</label>
                <Input value={newBlog.author} onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground mb-1 block">Read Time</label>
                <Input value={newBlog.readTime} onChange={(e) => setNewBlog({ ...newBlog, readTime: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground mb-1 block">Date</label>
                <Input value={newBlog.date} onChange={(e) => setNewBlog({ ...newBlog, date: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground mb-1 block">Excerpt</label>
              <Textarea value={newBlog.excerpt} onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })} rows={2} placeholder="Short description..." />
            </div>

            <div>
              <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground mb-1 block">Cover Image URL</label>
              <Input value={newBlog.image} onChange={(e) => setNewBlog({ ...newBlog, image: e.target.value })} placeholder="https://..." />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground">Body Paragraphs</label>
                <Button size="sm" variant="outline" onClick={() => setNewBlog({ ...newBlog, body: [...newBlog.body, ""] })} className="text-xs gap-1">
                  <Plus className="w-3 h-3" /> Add
                </Button>
              </div>
              {newBlog.body.map((para, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span className="text-[10px] font-mono text-muted-foreground mt-3 w-5 text-right">§{i + 1}</span>
                  <Textarea
                    value={para}
                    onChange={(e) => {
                      const body = [...newBlog.body];
                      body[i] = e.target.value;
                      setNewBlog({ ...newBlog, body });
                    }}
                    rows={2}
                    className="flex-1 text-sm"
                    placeholder="Write paragraph..."
                  />
                  {newBlog.body.length > 1 && (
                    <Button size="sm" variant="ghost" onClick={() => setNewBlog({ ...newBlog, body: newBlog.body.filter((_, idx) => idx !== i) })} className="text-destructive/50 hover:text-destructive px-2">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateBlog} className="gap-2 bg-gold hover:bg-gold-light text-charcoal font-normal">
                <PlusCircle className="w-4 h-4" /> Create Blog
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBlog;
