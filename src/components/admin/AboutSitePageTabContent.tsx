import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/api";
import type { AboutPageContent, SitePageIconName } from "@/types/sitePages";
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

type Props = {
  about: AboutPageContent;
  setAbout: Dispatch<SetStateAction<AboutPageContent>>;
  uploadKey: string | null;
  setUploadKey: (k: string | null) => void;
  onSave: () => void;
  saving: boolean;
};

export function AboutSitePageTabContent({ about, setAbout, uploadKey, setUploadKey, onSave, saving }: Props) {
  const { toast } = useToast();

  const upload = async (key: string, file: File, apply: (url: string) => void) => {
    setUploadKey(key);
    try {
      const { url } = await uploadImage(file);
      apply(url);
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
  };

  return (
    <div className="space-y-8">
      <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
        <h2 className="font-display text-lg font-semibold">Hero</h2>
        <Field label="Background image URL">
          <ImageUploadRow
            value={about.hero.imageUrl}
            onUrlChange={(v) => setAbout((p) => ({ ...p, hero: { ...p.hero, imageUrl: v } }))}
            uploading={uploadKey === "a-hero"}
            onFile={(file) => upload("a-hero", file, (url) => setAbout((p) => ({ ...p, hero: { ...p.hero, imageUrl: url } })))}
          />
        </Field>
        <Field label="Caption">
          <Input
            value={about.hero.caption}
            onChange={(e) => setAbout((p) => ({ ...p, hero: { ...p.hero, caption: e.target.value } }))}
          />
        </Field>
        <Field label="Title">
          <Input
            value={about.hero.title}
            onChange={(e) => setAbout((p) => ({ ...p, hero: { ...p.hero, title: e.target.value } }))}
          />
        </Field>
        <Field label="Subtitle (under title)">
          <Textarea
            rows={2}
            value={about.hero.subtitle}
            onChange={(e) => setAbout((p) => ({ ...p, hero: { ...p.hero, subtitle: e.target.value } }))}
          />
        </Field>
      </section>

      <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
        <h2 className="font-display text-lg font-semibold">Our story</h2>
        <Field label="Caption">
          <Input
            value={about.story.caption}
            onChange={(e) => setAbout((p) => ({ ...p, story: { ...p.story, caption: e.target.value } }))}
          />
        </Field>
        <Field label="Heading line 1">
          <Input
            value={about.story.headingLine1}
            onChange={(e) => setAbout((p) => ({ ...p, story: { ...p.story, headingLine1: e.target.value } }))}
          />
        </Field>
        <Field label="Heading line 2 (italic)">
          <Input
            value={about.story.headingLine2Italic}
            onChange={(e) => setAbout((p) => ({ ...p, story: { ...p.story, headingLine2Italic: e.target.value } }))}
          />
        </Field>
        {about.story.paragraphs.map((para, i) => (
          <Field key={i} label={`Paragraph ${i + 1}`}>
            <Textarea
              rows={4}
              value={para}
              onChange={(e) => {
                const next = [...about.story.paragraphs];
                next[i] = e.target.value;
                setAbout((p) => ({ ...p, story: { ...p.story, paragraphs: next } }));
              }}
            />
          </Field>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setAbout((p) => ({
              ...p,
              story: { ...p.story, paragraphs: [...p.story.paragraphs, ""] },
            }))
          }
        >
          Add paragraph
        </Button>
        <Field label="Side image URL">
          <ImageUploadRow
            value={about.story.sideImageUrl}
            onUrlChange={(v) => setAbout((p) => ({ ...p, story: { ...p.story, sideImageUrl: v } }))}
            uploading={uploadKey === "a-story"}
            onFile={(file) =>
              upload("a-story", file, (url) => setAbout((p) => ({ ...p, story: { ...p.story, sideImageUrl: url } })))
            }
          />
        </Field>
      </section>

      <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
        <h2 className="font-display text-lg font-semibold">Collections grid</h2>
        <Field label="Section caption">
          <Input
            value={about.collections.sectionCaption}
            onChange={(e) =>
              setAbout((p) => ({ ...p, collections: { ...p.collections, sectionCaption: e.target.value } }))
            }
          />
        </Field>
        <Field label="Heading">
          <Input
            value={about.collections.headingTitle}
            onChange={(e) =>
              setAbout((p) => ({ ...p, collections: { ...p.collections, headingTitle: e.target.value } }))
            }
          />
        </Field>
        {about.collections.items.map((it, i) => (
          <div key={i} className="border border-border/60 rounded p-4 space-y-2">
            <Field label="Title">
              <Input
                value={it.title}
                onChange={(e) => {
                  const next = [...about.collections.items];
                  next[i] = { ...next[i], title: e.target.value };
                  setAbout((p) => ({ ...p, collections: { ...p.collections, items: next } }));
                }}
              />
            </Field>
            <Field label="Description">
              <Textarea
                rows={2}
                value={it.desc}
                onChange={(e) => {
                  const next = [...about.collections.items];
                  next[i] = { ...next[i], desc: e.target.value };
                  setAbout((p) => ({ ...p, collections: { ...p.collections, items: next } }));
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
            setAbout((p) => ({
              ...p,
              collections: {
                ...p.collections,
                items: [...p.collections.items, { title: "", desc: "" }],
              },
            }))
          }
        >
          Add collection card
        </Button>
      </section>

      <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
        <h2 className="font-display text-lg font-semibold">Shopping journey</h2>
        <Field label="Section caption">
          <Input
            value={about.journey.sectionCaption}
            onChange={(e) =>
              setAbout((p) => ({ ...p, journey: { ...p.journey, sectionCaption: e.target.value } }))
            }
          />
        </Field>
        <Field label="Heading">
          <Input
            value={about.journey.headingTitle}
            onChange={(e) =>
              setAbout((p) => ({ ...p, journey: { ...p.journey, headingTitle: e.target.value } }))
            }
          />
        </Field>
        {about.journey.steps.map((st, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 border border-border/60 rounded p-4">
            <Input
              placeholder="Step"
              value={st.step}
              onChange={(e) => {
                const next = [...about.journey.steps];
                next[i] = { ...next[i], step: e.target.value };
                setAbout((p) => ({ ...p, journey: { ...p.journey, steps: next } }));
              }}
            />
            <Input
              placeholder="Title"
              value={st.title}
              onChange={(e) => {
                const next = [...about.journey.steps];
                next[i] = { ...next[i], title: e.target.value };
                setAbout((p) => ({ ...p, journey: { ...p.journey, steps: next } }));
              }}
            />
            <Input
              placeholder="Description"
              value={st.desc}
              onChange={(e) => {
                const next = [...about.journey.steps];
                next[i] = { ...next[i], desc: e.target.value };
                setAbout((p) => ({ ...p, journey: { ...p.journey, steps: next } }));
              }}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setAbout((p) => ({
              ...p,
              journey: { ...p.journey, steps: [...p.journey.steps, { step: "", title: "", desc: "" }] },
            }))
          }
        >
          Add step
        </Button>
      </section>

      <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
        <h2 className="font-display text-lg font-semibold">Stats row</h2>
        {about.stats.items.map((st, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 border border-border/60 rounded p-4">
            <Select
              value={st.icon}
              onValueChange={(v) => {
                const next = [...about.stats.items];
                next[i] = { ...next[i], icon: v as SitePageIconName };
                setAbout((p) => ({ ...p, stats: { ...p.stats, items: next } }));
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
            <Input
              placeholder="Value (e.g. 10+)"
              value={st.value}
              onChange={(e) => {
                const next = [...about.stats.items];
                next[i] = { ...next[i], value: e.target.value };
                setAbout((p) => ({ ...p, stats: { ...p.stats, items: next } }));
              }}
            />
            <Input
              placeholder="Label"
              value={st.label}
              onChange={(e) => {
                const next = [...about.stats.items];
                next[i] = { ...next[i], label: e.target.value };
                setAbout((p) => ({ ...p, stats: { ...p.stats, items: next } }));
              }}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setAbout((p) => ({
              ...p,
              stats: { ...p.stats, items: [...p.stats.items, { icon: "Award" as SitePageIconName, value: "", label: "" }] },
            }))
          }
        >
          Add stat
        </Button>
      </section>

      <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
        <h2 className="font-display text-lg font-semibold">Promises</h2>
        <Field label="Section caption">
          <Input
            value={about.promises.sectionCaption}
            onChange={(e) =>
              setAbout((p) => ({ ...p, promises: { ...p.promises, sectionCaption: e.target.value } }))
            }
          />
        </Field>
        <Field label="Heading">
          <Input
            value={about.promises.headingTitle}
            onChange={(e) =>
              setAbout((p) => ({ ...p, promises: { ...p.promises, headingTitle: e.target.value } }))
            }
          />
        </Field>
        {about.promises.items.map((it, i) => (
          <div key={i} className="border border-border/60 rounded p-4 space-y-2">
            <Field label="Icon">
              <Select
                value={it.icon}
                onValueChange={(v) => {
                  const next = [...about.promises.items];
                  next[i] = { ...next[i], icon: v as SitePageIconName };
                  setAbout((p) => ({ ...p, promises: { ...p.promises, items: next } }));
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
                  const next = [...about.promises.items];
                  next[i] = { ...next[i], title: e.target.value };
                  setAbout((p) => ({ ...p, promises: { ...p.promises, items: next } }));
                }}
              />
            </Field>
            <Field label="Description">
              <Textarea
                rows={2}
                value={it.desc}
                onChange={(e) => {
                  const next = [...about.promises.items];
                  next[i] = { ...next[i], desc: e.target.value };
                  setAbout((p) => ({ ...p, promises: { ...p.promises, items: next } }));
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
            setAbout((p) => ({
              ...p,
              promises: {
                ...p.promises,
                items: [...p.promises.items, { icon: "Heart" as SitePageIconName, title: "", desc: "" }],
              },
            }))
          }
        >
          Add promise
        </Button>
      </section>

      <section className="border border-border rounded-lg p-6 space-y-4 bg-background">
        <h2 className="font-display text-lg font-semibold">Bottom call-to-action</h2>
        <Field label="Caption">
          <Input
            value={about.cta.caption}
            onChange={(e) => setAbout((p) => ({ ...p, cta: { ...p.cta, caption: e.target.value } }))}
          />
        </Field>
        <Field label="Title">
          <Input
            value={about.cta.title}
            onChange={(e) => setAbout((p) => ({ ...p, cta: { ...p.cta, title: e.target.value } }))}
          />
        </Field>
        <Field label="Body">
          <Textarea
            rows={2}
            value={about.cta.body}
            onChange={(e) => setAbout((p) => ({ ...p, cta: { ...p.cta, body: e.target.value } }))}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Primary path">
            <Input
              value={about.cta.primaryPath}
              onChange={(e) => setAbout((p) => ({ ...p, cta: { ...p.cta, primaryPath: e.target.value } }))}
            />
          </Field>
          <Field label="Primary label">
            <Input
              value={about.cta.primaryLabel}
              onChange={(e) => setAbout((p) => ({ ...p, cta: { ...p.cta, primaryLabel: e.target.value } }))}
            />
          </Field>
          <Field label="Secondary path">
            <Input
              value={about.cta.secondaryPath}
              onChange={(e) => setAbout((p) => ({ ...p, cta: { ...p.cta, secondaryPath: e.target.value } }))}
            />
          </Field>
          <Field label="Secondary label">
            <Input
              value={about.cta.secondaryLabel}
              onChange={(e) => setAbout((p) => ({ ...p, cta: { ...p.cta, secondaryLabel: e.target.value } }))}
            />
          </Field>
        </div>
      </section>

      <Button onClick={onSave} disabled={saving} className="gap-2">
        <Save size={16} /> {saving ? "Saving…" : "Save About page"}
      </Button>
    </div>
  );
}
