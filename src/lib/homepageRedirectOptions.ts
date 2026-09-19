import type { BlogPost } from "@/data/blogData";
import type { CollectionDefinition } from "@/lib/collectionAssignments";

/** Common public destinations for homepage section CTAs */
export const HOMEPAGE_REDIRECT_PRESETS = [
  { value: "/", label: "Home" },
  { value: "/collections", label: "Collections (grid)" },
  { value: "/bridal", label: "Bridal" },
  { value: "/tissue", label: "Tissue & Organza" },
  { value: "/linen", label: "Linen & Cotton" },
  { value: "/heritage", label: "Heritage" },
  { value: "/store", label: "Atelier (Store)" },
  { value: "/blog", label: "Blog (index)" },
  { value: "/contact", label: "Contact" },
  { value: "/about", label: "About Us" },
  { value: "/wishlist", label: "Wishlist" },
  { value: "/cart", label: "Cart" },
  { value: "/track-order", label: "Track order" },
  { value: "/login", label: "Sign in" },
  { value: "/privacy-policy", label: "Privacy policy" },
  { value: "/terms-conditions", label: "Terms & conditions" },
  { value: "/refund-policy", label: "Refund policy" },
  { value: "/shipping-policy", label: "Shipping policy" },
  { value: "/register", label: "Sign up" },
  { value: "/profile", label: "My profile" },
  { value: "/checkout", label: "Checkout" },
] as const;

const PRESET_VALUES = new Set(HOMEPAGE_REDIRECT_PRESETS.map((p) => p.value));

export function collectionPath(collectionKey: string): string {
  return `/collection/${encodeURIComponent(collectionKey)}`;
}

export type RedirectOption = {
  path: string;
  /** Search matches this display name only (not URL or slug). */
  label: string;
  group: string;
};

/** Site presets + curated collections only (search matches display names). Blog URLs: use Custom path. */
export function buildRedirectOptions(collections: CollectionDefinition[]): RedirectOption[] {
  const pages: RedirectOption[] = HOMEPAGE_REDIRECT_PRESETS.map((p) => ({
    path: p.value,
    label: p.label,
    group: "Site pages",
  }));

  const cols: RedirectOption[] = collections.map((c) => {
    const path = collectionPath(c.collection_key);
    return {
      path,
      label: c.display_name.trim() || c.collection_key,
      group: "Curated collections",
    };
  });

  return [...pages, ...cols];
}

/** Friendly label for a saved redirect path (for badges and picker trigger). */
export function resolveRedirectLabel(
  path: string,
  collections: CollectionDefinition[],
  blogPosts: BlogPost[]
): string {
  const p = path.trim() || "/";
  if (PRESET_VALUES.has(p)) {
    const preset = HOMEPAGE_REDIRECT_PRESETS.find((x) => x.value === p);
    if (preset) return preset.label;
  }
  if (p.startsWith("/collection/")) {
    const key = decodeURIComponent(p.slice("/collection/".length).split("/")[0] || "");
    if (!key) return "Select a collection…";
    const c = collections.find((x) => x.collection_key === key);
    if (c) return c.display_name;
  }
  if (p.startsWith("/blog/")) {
    const slug = decodeURIComponent(p.slice("/blog/".length).split("/")[0] || "");
    const b = blogPosts.find((x) => x.slug === slug);
    if (b) return b.headline;
  }
  return p;
}
