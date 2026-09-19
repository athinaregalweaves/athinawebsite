import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AboutSitePageTabContent } from "@/components/admin/AboutSitePageTabContent";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { uploadImage, verifyToken, addHistory } from "@/lib/api";
import { clearAdminSession } from "@/lib/authStorage";
import { fetchSitePageContent, normalizeContactPageContent, saveSitePageContent } from "@/lib/sitePageApi";
import {
  ABOUT_PAGE_DEFAULT,
  CONTACT_PAGE_DEFAULT,
  HERITAGE_PAGE_DEFAULT,
  STORE_PAGE_DEFAULT,
} from "@/data/sitePageContentDefaults";
import type {
  AboutPageContent,
  ContactPageContent,
  HeritagePageContent,
  SitePageIconName,
  StorePageContent,
} from "@/types/sitePages";
import { Save, Upload } from "lucide-react";

const ICON_OPTIONS: SitePageIconName[] = [
  "Users",
  "Leaf",
  "Award",
  "ShieldCheck",
  "Eye",
  "Palette",
  "Lock",
  "Star",
  "MapPin",
  "Clock",
  "Phone",
  "Heart",
];

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="font-body text-xs text-foreground/70">{label}</Label>
    {children}
  </div>
);

const ImageUploadRow = ({
  value,
  onUrlChange,
  onFile,
  uploading,
}: {
  value: string;
  onUrlChange: (v: string) => void;
  onFile: (f: File) => void;
  uploading: boolean;
}) => (
  <div className="flex flex-col sm:flex-row gap-2">
    <Input value={value} onChange={(e) => onUrlChange(e.target.value)} className="font-body text-sm flex-1" />
    <label className="shrink-0 inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-background cursor-pointer hover:bg-muted/50 text-sm font-body disabled:opacity-50">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <Upload size={14} /> {uploading ? "Uploading…" : "Upload"}
    </label>
  </div>
);

const AdminSitePages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploadKey, setUploadKey] = useState<string | null>(null);

  const [heritage, setHeritage] = useState<HeritagePageContent>(HERITAGE_PAGE_DEFAULT);
  const [about, setAbout] = useState<AboutPageContent>(ABOUT_PAGE_DEFAULT);
  const [store, setStore] = useState<StorePageContent>(STORE_PAGE_DEFAULT);
  const [contact, setContact] = useState<ContactPageContent>(CONTACT_PAGE_DEFAULT);

  useEffect(() => {
    const init = async () => {
      try {
        await verifyToken();
        const [h, a, s, c] = await Promise.all([
          fetchSitePageContent("heritage"),
          fetchSitePageContent("about"),
          fetchSitePageContent("store"),
          fetchSitePageContent("contact"),
        ]);
        setHeritage(h);
        setAbout(a);
        setStore(s);
        setContact(c);
      } catch {
        clearAdminSession();
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const saveHeritage = async () => {
    setSaving("heritage");
    try {
      await saveSitePageContent("heritage", heritage);
      await addHistory({
        page: "site_pages",
        action: "Saved Heritage page",
        item_name: "heritage",
      });
      toast({ title: "Saved", description: "Heritage page is live for visitors." });
    } catch (e: unknown) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Save failed",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const saveAbout = async () => {
    setSaving("about");
    try {
      await saveSitePageContent("about", about);
      await addHistory({
        page: "site_pages",
        action: "Saved About page",
        item_name: "about",
      });
      toast({ title: "Saved", description: "About page is live for visitors." });
    } catch (e: unknown) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Save failed",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const saveStore = async () => {
    setSaving("store");
    try {
      await saveSitePageContent("store", store);
      await addHistory({
        page: "site_pages",
        action: "Saved Atelier (Store) page",
        item_name: "store",
      });
      toast({ title: "Saved", description: "Atelier page is live for visitors." });
    } catch (e: unknown) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Save failed",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const saveContact = async () => {
    setSaving("contact");
    try {
      await saveSitePageContent("contact", normalizeContactPageContent(contact));
      setContact(normalizeContactPageContent(contact));
      await addHistory({
        page: "site_pages",
        action: "Saved Contact page",
        item_name: "contact",
      });
      toast({ title: "Saved", description: "Contact page is live for visitors." });
    } catch (e: unknown) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Save failed",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="font-body text-lg text-foreground/50">Loading…</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Site pages</h1>
          <p className="font-body text-sm text-muted-foreground mt-2">
            Edit Heritage, About, Atelier (Store), and Contact. Text, images, maps, and buttons are stored on the server
            and shown on the public site.
          </p>
        </div>

        <Tabs defaultValue="heritage" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
            <TabsTrigger value="heritage" className="font-body">
              Heritage
            </TabsTrigger>
            <TabsTrigger value="about" className="font-body">
              About
            </TabsTrigger>
            <TabsTrigger value="store" className="font-body">
              Atelier (Store)
            </TabsTrigger>
            <TabsTrigger value="contact" className="font-body">
              Contact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="heritage" className="space-y-8">
            <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="font-display text-lg font-semibold">Hero</h2>
              <Field label="Background image URL">
                <ImageUploadRow
                  value={heritage.hero.imageUrl}
                  onUrlChange={(v) => setHeritage((p) => ({ ...p, hero: { ...p.hero, imageUrl: v } }))}
                  uploading={uploadKey === "h-hero"}
                  onFile={async (file) => {
                    setUploadKey("h-hero");
                    try {
                      const { url } = await uploadImage(file);
                      setHeritage((p) => ({ ...p, hero: { ...p.hero, imageUrl: url } }));
                      toast({ title: "Image uploaded" });
                    } catch (e: unknown) {
                      toast({
                        title: "Upload failed",
                        description: e instanceof Error ? e.message : "",
                        variant: "destructive",
                      });
                    } finally {
                      setUploadKey(null);
                    }
                  }}
                />
              </Field>
              <Field label="Caption">
                <Input
                  value={heritage.hero.caption}
                  onChange={(e) => setHeritage((p) => ({ ...p, hero: { ...p.hero, caption: e.target.value } }))}
                />
              </Field>
              <Field label="Title">
                <Input
                  value={heritage.hero.title}
                  onChange={(e) => setHeritage((p) => ({ ...p, hero: { ...p.hero, title: e.target.value } }))}
                />
              </Field>
            </section>

            <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="font-display text-lg font-semibold">Story</h2>
              <Field label="Caption">
                <Input
                  value={heritage.story.caption}
                  onChange={(e) => setHeritage((p) => ({ ...p, story: { ...p.story, caption: e.target.value } }))}
                />
              </Field>
              <Field label="Heading line 1">
                <Input
                  value={heritage.story.headingLine1}
                  onChange={(e) =>
                    setHeritage((p) => ({ ...p, story: { ...p.story, headingLine1: e.target.value } }))
                  }
                />
              </Field>
              <Field label="Heading line 2 (italic)">
                <Input
                  value={heritage.story.headingLine2Italic}
                  onChange={(e) =>
                    setHeritage((p) => ({ ...p, story: { ...p.story, headingLine2Italic: e.target.value } }))
                  }
                />
              </Field>
              {heritage.story.paragraphs.map((para, i) => (
                <Field key={i} label={`Paragraph ${i + 1}`}>
                  <Textarea
                    rows={3}
                    value={para}
                    onChange={(e) => {
                      const next = [...heritage.story.paragraphs];
                      next[i] = e.target.value;
                      setHeritage((p) => ({ ...p, story: { ...p.story, paragraphs: next } }));
                    }}
                  />
                </Field>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setHeritage((p) => ({
                    ...p,
                    story: { ...p.story, paragraphs: [...p.story.paragraphs, ""] },
                  }))
                }
              >
                Add paragraph
              </Button>
            </section>

            <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="font-display text-lg font-semibold">Timeline</h2>
              {heritage.timeline.map((row, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
  
                <Input
                  placeholder="Year"
                  value={row.year}
                  onChange={(e) => {
                    const next = [...heritage.timeline];
                    next[i] = { ...next[i], year: e.target.value };
                    setHeritage((p) => ({ ...p, timeline: next }));
                  }}
                />
              
                <div className="flex gap-2 items-center ">
                  <Input
                    placeholder="Event"
                    value={row.event}
                    onChange={(e) => {
                      const next = [...heritage.timeline];
                      next[i] = { ...next[i], event: e.target.value };
                      setHeritage((p) => ({ ...p, timeline: next }));
                    }}
                  />
              
                  {/* DELETE BUTTON — persist immediately; previously only “Save page” wrote to the server */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={saving === "heritage"}
                    onClick={async () => {
                      const previous = heritage;
                      const nextTimeline = previous.timeline.filter((_, index) => index !== i);
                      const updated = { ...previous, timeline: nextTimeline };
                      setHeritage(updated);
                      setSaving("heritage");
                      try {
                        await saveSitePageContent("heritage", updated);
                        await addHistory({
                          page: "site_pages",
                          action: "Removed Heritage timeline milestone",
                          item_name: "heritage",
                        });
                        toast({
                          title: "Milestone removed",
                          description: "Change is saved; it will stay after refresh.",
                        });
                      } catch (e: unknown) {
                        setHeritage(previous);
                        toast({
                          title: "Could not save",
                          description: e instanceof Error ? e.message : "Use “Save Heritage page” to try again.",
                          variant: "destructive",
                        });
                      } finally {
                        setSaving(null);
                      }
                    }}
                  >
                    ✕
                  </Button>
                </div>
              
              </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHeritage((p) => ({ ...p, timeline: [...p.timeline, { year: "", event: "" }] }))}
              >
                Add milestone
              </Button>
            </section>

            <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="font-display text-lg font-semibold">Craftsmanship</h2>
              <Field label="Image URL">
                <ImageUploadRow
                  value={heritage.craftsmanship.imageUrl}
                  onUrlChange={(v) =>
                    setHeritage((p) => ({ ...p, craftsmanship: { ...p.craftsmanship, imageUrl: v } }))
                  }
                  uploading={uploadKey === "h-craft"}
                  onFile={async (file) => {
                    setUploadKey("h-craft");
                    try {
                      const { url } = await uploadImage(file);
                      setHeritage((p) => ({ ...p, craftsmanship: { ...p.craftsmanship, imageUrl: url } }));
                      toast({ title: "Image uploaded" });
                    } catch (e: unknown) {
                      toast({
                        title: "Upload failed",
                        description: e instanceof Error ? e.message : "",
                        variant: "destructive",
                      });
                    } finally {
                      setUploadKey(null);
                    }
                  }}
                />
              </Field>
              <Field label="Caption">
                <Input
                  value={heritage.craftsmanship.caption}
                  onChange={(e) =>
                    setHeritage((p) => ({
                      ...p,
                      craftsmanship: { ...p.craftsmanship, caption: e.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Heading line 1">
                <Input
                  value={heritage.craftsmanship.headingLine1}
                  onChange={(e) =>
                    setHeritage((p) => ({
                      ...p,
                      craftsmanship: { ...p.craftsmanship, headingLine1: e.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="Heading line 2 (italic)">
                <Input
                  value={heritage.craftsmanship.headingLine2Italic}
                  onChange={(e) =>
                    setHeritage((p) => ({
                      ...p,
                      craftsmanship: { ...p.craftsmanship, headingLine2Italic: e.target.value },
                    }))
                  }
                />
              </Field>
              {heritage.craftsmanship.features.map((f, i) => (
                <div key={i} className="border border-border/60 rounded p-4 space-y-2">
                  <Field label="Icon">
                    <Select
                      value={f.icon}
                      onValueChange={(v) => {
                        const next = [...heritage.craftsmanship.features];
                        next[i] = { ...next[i], icon: v as SitePageIconName };
                        setHeritage((p) => ({ ...p, craftsmanship: { ...p.craftsmanship, features: next } }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map((ic) => (
                          <SelectItem key={ic} value={ic}>
                            {ic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Title">
                    <Input
                      value={f.title}
                      onChange={(e) => {
                        const next = [...heritage.craftsmanship.features];
                        next[i] = { ...next[i], title: e.target.value };
                        setHeritage((p) => ({ ...p, craftsmanship: { ...p.craftsmanship, features: next } }));
                      }}
                    />
                  </Field>
                  <Field label="Description">
                    <Textarea
                      rows={2}
                      value={f.desc}
                      onChange={(e) => {
                        const next = [...heritage.craftsmanship.features];
                        next[i] = { ...next[i], desc: e.target.value };
                        setHeritage((p) => ({ ...p, craftsmanship: { ...p.craftsmanship, features: next } }));
                      }}
                    />
                  </Field>
                </div>
              ))}
            </section>

            <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="font-display text-lg font-semibold">Weaving centers</h2>
              <Field label="Caption">
                <Input
                  value={heritage.weaving.caption}
                  onChange={(e) => setHeritage((p) => ({ ...p, weaving: { ...p.weaving, caption: e.target.value } }))}
                />
              </Field>
              <Field label="Heading line 1">
                <Input
                  value={heritage.weaving.headingLine1}
                  onChange={(e) =>
                    setHeritage((p) => ({ ...p, weaving: { ...p.weaving, headingLine1: e.target.value } }))
                  }
                />
              </Field>
              <Field label="Heading line 2 (italic)">
                <Input
                  value={heritage.weaving.headingLine2Italic}
                  onChange={(e) =>
                    setHeritage((p) => ({ ...p, weaving: { ...p.weaving, headingLine2Italic: e.target.value } }))
                  }
                />
              </Field>
              <Field label="Side image URL">
                <ImageUploadRow
                  value={heritage.weaving.sideImageUrl}
                  onUrlChange={(v) => setHeritage((p) => ({ ...p, weaving: { ...p.weaving, sideImageUrl: v } }))}
                  uploading={uploadKey === "h-weave"}
                  onFile={async (file) => {
                    setUploadKey("h-weave");
                    try {
                      const { url } = await uploadImage(file);
                      setHeritage((p) => ({ ...p, weaving: { ...p.weaving, sideImageUrl: url } }));
                      toast({ title: "Image uploaded" });
                    } catch (e: unknown) {
                      toast({
                        title: "Upload failed",
                        description: e instanceof Error ? e.message : "",
                        variant: "destructive",
                      });
                    } finally {
                      setUploadKey(null);
                    }
                  }}
                />
              </Field>
              {heritage.weaving.centers.map((c, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="Location"
                    value={c.loc}
                    onChange={(e) => {
                      const next = [...heritage.weaving.centers];
                      next[i] = { ...next[i], loc: e.target.value };
                      setHeritage((p) => ({ ...p, weaving: { ...p.weaving, centers: next } }));
                    }}
                  />
                  <Input
                    placeholder="Specialty"
                    value={c.specialty}
                    onChange={(e) => {
                      const next = [...heritage.weaving.centers];
                      next[i] = { ...next[i], specialty: e.target.value };
                      setHeritage((p) => ({ ...p, weaving: { ...p.weaving, centers: next } }));
                    }}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setHeritage((p) => ({
                    ...p,
                    weaving: { ...p.weaving, centers: [...p.weaving.centers, { loc: "", specialty: "" }] },
                  }))
                }
              >
                Add center
              </Button>
            </section>

            <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="font-display text-lg font-semibold">Bottom call-to-action</h2>
              <Field label="Title">
                <Input
                  value={heritage.cta.title}
                  onChange={(e) => setHeritage((p) => ({ ...p, cta: { ...p.cta, title: e.target.value } }))}
                />
              </Field>
              <Field label="Body">
                <Textarea
                  rows={2}
                  value={heritage.cta.body}
                  onChange={(e) => setHeritage((p) => ({ ...p, cta: { ...p.cta, body: e.target.value } }))}
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Primary button path (e.g. /store)">
                  <Input
                    value={heritage.cta.primaryPath}
                    onChange={(e) =>
                      setHeritage((p) => ({ ...p, cta: { ...p.cta, primaryPath: e.target.value } }))
                    }
                  />
                </Field>
                <Field label="Primary label">
                  <Input
                    value={heritage.cta.primaryLabel}
                    onChange={(e) =>
                      setHeritage((p) => ({ ...p, cta: { ...p.cta, primaryLabel: e.target.value } }))
                    }
                  />
                </Field>
                <Field label="Secondary button path">
                  <Input
                    value={heritage.cta.secondaryPath}
                    onChange={(e) =>
                      setHeritage((p) => ({ ...p, cta: { ...p.cta, secondaryPath: e.target.value } }))
                    }
                  />
                </Field>
                <Field label="Secondary label">
                  <Input
                    value={heritage.cta.secondaryLabel}
                    onChange={(e) =>
                      setHeritage((p) => ({ ...p, cta: { ...p.cta, secondaryLabel: e.target.value } }))
                    }
                  />
                </Field>
              </div>
            </section>

            <Button onClick={saveHeritage} disabled={saving === "heritage"} className="gap-2">
              <Save size={16} /> {saving === "heritage" ? "Saving…" : "Save Heritage page"}
            </Button>
          </TabsContent>

          <TabsContent value="about" className="space-y-8">
            <AboutSitePageTabContent
              about={about}
              setAbout={setAbout}
              uploadKey={uploadKey}
              setUploadKey={setUploadKey}
              onSave={saveAbout}
              saving={saving === "about"}
            />
          </TabsContent>

          <TabsContent value="store" className="space-y-8">
            <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="font-display text-lg font-semibold">Hero</h2>
              <Field label="Background image URL">
                <ImageUploadRow
                  value={store.hero.imageUrl}
                  onUrlChange={(v) => setStore((p) => ({ ...p, hero: { ...p.hero, imageUrl: v } }))}
                  uploading={uploadKey === "s-hero"}
                  onFile={async (file) => {
                    setUploadKey("s-hero");
                    try {
                      const { url } = await uploadImage(file);
                      setStore((p) => ({ ...p, hero: { ...p.hero, imageUrl: url } }));
                      toast({ title: "Image uploaded" });
                    } catch (e: unknown) {
                      toast({
                        title: "Upload failed",
                        description: e instanceof Error ? e.message : "",
                        variant: "destructive",
                      });
                    } finally {
                      setUploadKey(null);
                    }
                  }}
                />
              </Field>
              <Field label="Caption">
                <Input
                  value={store.hero.caption}
                  onChange={(e) => setStore((p) => ({ ...p, hero: { ...p.hero, caption: e.target.value } }))}
                />
              </Field>
              <Field label="Title line 1">
                <Input
                  value={store.hero.titleLine1}
                  onChange={(e) => setStore((p) => ({ ...p, hero: { ...p.hero, titleLine1: e.target.value } }))}
                />
              </Field>
              <Field label="Title line 2 (italic)">
                <Input
                  value={store.hero.titleLine2Italic}
                  onChange={(e) =>
                    setStore((p) => ({ ...p, hero: { ...p.hero, titleLine2Italic: e.target.value } }))
                  }
                />
              </Field>
            </section>

            <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="font-display text-lg font-semibold">Experience intro</h2>
              <Field label="Caption">
                <Input
                  value={store.intro.caption}
                  onChange={(e) => setStore((p) => ({ ...p, intro: { ...p.intro, caption: e.target.value } }))}
                />
              </Field>
              <Field label="Heading line 1">
                <Input
                  value={store.intro.headingLine1}
                  onChange={(e) =>
                    setStore((p) => ({ ...p, intro: { ...p.intro, headingLine1: e.target.value } }))
                  }
                />
              </Field>
              <Field label="Heading line 2 (italic)">
                <Input
                  value={store.intro.headingLine2Italic}
                  onChange={(e) =>
                    setStore((p) => ({ ...p, intro: { ...p.intro, headingLine2Italic: e.target.value } }))
                  }
                />
              </Field>
              {store.intro.paragraphs.map((para, i) => (
                <Field key={i} label={`Paragraph ${i + 1}`}>
                  <Textarea
                    rows={3}
                    value={para}
                    onChange={(e) => {
                      const next = [...store.intro.paragraphs];
                      next[i] = e.target.value;
                      setStore((p) => ({ ...p, intro: { ...p.intro, paragraphs: next } }));
                    }}
                  />
                </Field>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setStore((p) => ({
                    ...p,
                    intro: { ...p.intro, paragraphs: [...p.intro.paragraphs, ""] },
                  }))
                }
              >
                Add paragraph
              </Button>
              <Field label="Side image URL">
                <ImageUploadRow
                  value={store.intro.sideImageUrl}
                  onUrlChange={(v) => setStore((p) => ({ ...p, intro: { ...p.intro, sideImageUrl: v } }))}
                  uploading={uploadKey === "s-intro"}
                  onFile={async (file) => {
                    setUploadKey("s-intro");
                    try {
                      const { url } = await uploadImage(file);
                      setStore((p) => ({ ...p, intro: { ...p.intro, sideImageUrl: url } }));
                      toast({ title: "Image uploaded" });
                    } catch (e: unknown) {
                      toast({
                        title: "Upload failed",
                        description: e instanceof Error ? e.message : "",
                        variant: "destructive",
                      });
                    } finally {
                      setUploadKey(null);
                    }
                  }}
                />
              </Field>
            </section>

            <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="font-display text-lg font-semibold">Services</h2>
              <Field label="Section caption">
                <Input
                  value={store.services.sectionCaption}
                  onChange={(e) =>
                    setStore((p) => ({ ...p, services: { ...p.services, sectionCaption: e.target.value } }))
                  }
                />
              </Field>
              <Field label="Heading line 1">
                <Input
                  value={store.services.headingLine1}
                  onChange={(e) =>
                    setStore((p) => ({ ...p, services: { ...p.services, headingLine1: e.target.value } }))
                  }
                />
              </Field>
              <Field label="Heading line 2 (italic)">
                <Input
                  value={store.services.headingLine2Italic}
                  onChange={(e) =>
                    setStore((p) => ({ ...p, services: { ...p.services, headingLine2Italic: e.target.value } }))
                  }
                />
              </Field>
              {store.services.items.map((it, i) => (
                <div key={i} className="border border-border/60 rounded p-4 space-y-2">
                  <Field label="Icon">
                    <Select
                      value={it.icon}
                      onValueChange={(v) => {
                        const next = [...store.services.items];
                        next[i] = { ...next[i], icon: v as SitePageIconName };
                        setStore((p) => ({ ...p, services: { ...p.services, items: next } }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map((ic) => (
                          <SelectItem key={ic} value={ic}>
                            {ic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Title">
                    <Input
                      value={it.title}
                      onChange={(e) => {
                        const next = [...store.services.items];
                        next[i] = { ...next[i], title: e.target.value };
                        setStore((p) => ({ ...p, services: { ...p.services, items: next } }));
                      }}
                    />
                  </Field>
                  <Field label="Description">
                    <Textarea
                      rows={2}
                      value={it.desc}
                      onChange={(e) => {
                        const next = [...store.services.items];
                        next[i] = { ...next[i], desc: e.target.value };
                        setStore((p) => ({ ...p, services: { ...p.services, items: next } }));
                      }}
                    />
                  </Field>
                </div>
              ))}
            </section>

            <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="font-display text-lg font-semibold">Details strip (address / hours / phone)</h2>
              {store.details.items.map((it, i) => (
                <div key={i} className="border border-border/60 rounded p-4 space-y-2">
                  <Field label="Icon">
                    <Select
                      value={it.icon}
                      onValueChange={(v) => {
                        const next = [...store.details.items];
                        next[i] = { ...next[i], icon: v as SitePageIconName };
                        setStore((p) => ({ ...p, details: { ...p.details, items: next } }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map((ic) => (
                          <SelectItem key={ic} value={ic}>
                            {ic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Label">
                    <Input
                      value={it.label}
                      onChange={(e) => {
                        const next = [...store.details.items];
                        next[i] = { ...next[i], label: e.target.value };
                        setStore((p) => ({ ...p, details: { ...p.details, items: next } }));
                      }}
                    />
                  </Field>
                  <Field label="Value (use line breaks)">
                    <Textarea
                      rows={3}
                      value={it.value}
                      onChange={(e) => {
                        const next = [...store.details.items];
                        next[i] = { ...next[i], value: e.target.value };
                        setStore((p) => ({ ...p, details: { ...p.details, items: next } }));
                      }}
                    />
                  </Field>
                </div>
              ))}
            </section>

            <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="font-display text-lg font-semibold">Map</h2>
              <Field label="Section caption">
                <Input
                  value={store.map.sectionCaption}
                  onChange={(e) =>
                    setStore((p) => ({ ...p, map: { ...p.map, sectionCaption: e.target.value } }))
                  }
                />
              </Field>
              <Field label="Heading line 1">
                <Input
                  value={store.map.headingLine1}
                  onChange={(e) =>
                    setStore((p) => ({ ...p, map: { ...p.map, headingLine1: e.target.value } }))
                  }
                />
              </Field>
              <Field label="Heading line 2 (italic)">
                <Input
                  value={store.map.headingLine2Italic}
                  onChange={(e) =>
                    setStore((p) => ({ ...p, map: { ...p.map, headingLine2Italic: e.target.value } }))
                  }
                />
              </Field>
              <Field label="Google Maps embed URL">
                <Textarea
                  rows={3}
                  value={store.map.iframeSrc}
                  onChange={(e) =>
                    setStore((p) => ({ ...p, map: { ...p.map, iframeSrc: e.target.value } }))
                  }
                  className="font-mono text-xs"
                />
              </Field>
            </section>

            <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="font-display text-lg font-semibold">Bottom call-to-action</h2>
              <Field label="Title">
                <Input
                  value={store.cta.title}
                  onChange={(e) => setStore((p) => ({ ...p, cta: { ...p.cta, title: e.target.value } }))}
                />
              </Field>
              <Field label="Body">
                <Textarea
                  rows={2}
                  value={store.cta.body}
                  onChange={(e) => setStore((p) => ({ ...p, cta: { ...p.cta, body: e.target.value } }))}
                />
              </Field>
              <Field label="Book button path">
                <Input
                  value={store.cta.bookPath}
                  onChange={(e) => setStore((p) => ({ ...p, cta: { ...p.cta, bookPath: e.target.value } }))}
                />
              </Field>
              <Field label="Book button label">
                <Input
                  value={store.cta.bookLabel}
                  onChange={(e) => setStore((p) => ({ ...p, cta: { ...p.cta, bookLabel: e.target.value } }))}
                />
              </Field>
              <Field label="Call tel (href, e.g. +919701901999)">
                <Input
                  value={store.cta.callTel}
                  onChange={(e) => setStore((p) => ({ ...p, cta: { ...p.cta, callTel: e.target.value } }))}
                />
              </Field>
              <Field label="Call button label">
                <Input
                  value={store.cta.callLabel}
                  onChange={(e) => setStore((p) => ({ ...p, cta: { ...p.cta, callLabel: e.target.value } }))}
                />
              </Field>
            </section>

            <Button onClick={saveStore} disabled={saving === "store"} className="gap-2">
              <Save size={16} /> {saving === "store" ? "Saving…" : "Save Atelier page"}
            </Button>
          </TabsContent>

          <TabsContent value="contact" className="space-y-8">
            <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="font-display text-lg font-semibold">Header</h2>
              <Field label="Caption">
                <Input
                  value={contact.header.caption}
                  onChange={(e) => setContact((p) => ({ ...p, header: { ...p.header, caption: e.target.value } }))}
                />
              </Field>
              <Field label="Title (use luxury-heading class on site)">
                <Input
                  value={contact.header.title}
                  onChange={(e) => setContact((p) => ({ ...p, header: { ...p.header, title: e.target.value } }))}
                />
              </Field>
              <Field label="Intro body">
                <Textarea
                  rows={3}
                  value={contact.header.body}
                  onChange={(e) => setContact((p) => ({ ...p, header: { ...p.header, body: e.target.value } }))}
                />
              </Field>
            </section>

            <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="font-display text-lg font-semibold">Form labels</h2>
              <p className="font-body text-xs text-muted-foreground">
                Field keys are fixed for submissions; edit labels and placeholders only.
              </p>
              {contact.form.fields.map((f, i) => (
                <div key={f.key} className="border border-border/60 rounded p-4 space-y-2">
                  <p className="font-mono text-xs text-muted-foreground">Key: {f.key}</p>
                  <Field label="Label">
                    <Input
                      value={f.label}
                      onChange={(e) => {
                        const next = [...contact.form.fields];
                        next[i] = { ...next[i], label: e.target.value };
                        setContact((p) => ({ ...p, form: { ...p.form, fields: next } }));
                      }}
                    />
                  </Field>
                  <Field label="Placeholder">
                    <Input
                      value={f.placeholder}
                      onChange={(e) => {
                        const next = [...contact.form.fields];
                        next[i] = { ...next[i], placeholder: e.target.value };
                        setContact((p) => ({ ...p, form: { ...p.form, fields: next } }));
                      }}
                    />
                  </Field>
                </div>
              ))}
              <Field label="Message label">
                <Input
                  value={contact.form.messageLabel}
                  onChange={(e) =>
                    setContact((p) => ({ ...p, form: { ...p.form, messageLabel: e.target.value } }))
                  }
                />
              </Field>
              <Field label="Message placeholder">
                <Input
                  value={contact.form.messagePlaceholder}
                  onChange={(e) =>
                    setContact((p) => ({ ...p, form: { ...p.form, messagePlaceholder: e.target.value } }))
                  }
                />
              </Field>
              <Field label="Submit button label">
                <Input
                  value={contact.form.submitLabel}
                  onChange={(e) =>
                    setContact((p) => ({ ...p, form: { ...p.form, submitLabel: e.target.value } }))
                  }
                />
              </Field>
            </section>

            <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="font-display text-lg font-semibold">Thank-you message (after submit)</h2>
              <Field label="Caption">
                <Input
                  value={contact.thankYou.caption}
                  onChange={(e) =>
                    setContact((p) => ({ ...p, thankYou: { ...p.thankYou, caption: e.target.value } }))
                  }
                />
              </Field>
              <Field label="Title">
                <Input
                  value={contact.thankYou.title}
                  onChange={(e) =>
                    setContact((p) => ({ ...p, thankYou: { ...p.thankYou, title: e.target.value } }))
                  }
                />
              </Field>
              <Field label="Body">
                <Textarea
                  rows={2}
                  value={contact.thankYou.body}
                  onChange={(e) =>
                    setContact((p) => ({ ...p, thankYou: { ...p.thankYou, body: e.target.value } }))
                  }
                />
              </Field>
            </section>

            <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="font-display text-lg font-semibold">Sidebar</h2>
              <Field label="Map embed URL">
                <Textarea
                  rows={3}
                  value={contact.sidebar.mapIframeSrc}
                  onChange={(e) =>
                    setContact((p) => ({ ...p, sidebar: { ...p.sidebar, mapIframeSrc: e.target.value } }))
                  }
                  className="font-mono text-xs"
                />
              </Field>
              <Field label="Address (HTML allowed, e.g. &lt;br /&gt;)">
                <Textarea
                  rows={4}
                  value={contact.sidebar.addressHtml}
                  onChange={(e) =>
                    setContact((p) => ({ ...p, sidebar: { ...p.sidebar, addressHtml: e.target.value } }))
                  }
                />
              </Field>
              {contact.sidebar.phones.map((ph, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-border/60 rounded p-4">
                  <Field label="tel: href">
                    <Input
                      value={ph.href}
                      onChange={(e) => {
                        const next = [...contact.sidebar.phones];
                        next[i] = { ...next[i], href: e.target.value };
                        setContact((p) => ({ ...p, sidebar: { ...p.sidebar, phones: next } }));
                      }}
                    />
                  </Field>
                  <Field label="Display text">
                    <Input
                      value={ph.display}
                      onChange={(e) => {
                        const next = [...contact.sidebar.phones];
                        next[i] = { ...next[i], display: e.target.value };
                        setContact((p) => ({ ...p, sidebar: { ...p.sidebar, phones: next } }));
                      }}
                    />
                  </Field>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setContact((p) => ({
                    ...p,
                    sidebar: { ...p.sidebar, phones: [...p.sidebar.phones, { href: "", display: "" }] },
                  }))
                }
              >
                Add phone line
              </Button>
            </section>

            <Button onClick={saveContact} disabled={saving === "contact"} className="gap-2">
              <Save size={16} /> {saving === "contact" ? "Saving…" : "Save Contact page"}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSitePages;
