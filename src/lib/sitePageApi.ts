import { CONTACT_PAGE_DEFAULT, SITE_PAGE_DEFAULTS } from "@/data/sitePageContentDefaults";
import { API_BASE_URL } from "@/lib/env";
import { mergeSitePageContent } from "@/lib/sitePageMerge";
import { getAdminToken } from "@/lib/authStorage";
import type { ContactPageContent, SitePageContentMap, SitePageKey } from "@/types/sitePages";

/** Ensures name/phone/email/preferredDate rows exist; merges custom labels from admin. */
export function normalizeContactPageContent(c: ContactPageContent): ContactPageContent {
  const byKey = new Map(c.form.fields.map((f) => [f.key, f]));
  const fields = CONTACT_PAGE_DEFAULT.form.fields.map((def) => ({
    ...def,
    ...byKey.get(def.key),
    key: def.key,
  }));
  return { ...c, form: { ...c.form, fields } };
}

const API_BASE = API_BASE_URL;

function authHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchSitePageContent<K extends SitePageKey>(key: K): Promise<SitePageContentMap[K]> {
  const def = SITE_PAGE_DEFAULTS[key];
  try {
    const res = await fetch(`${API_BASE}/page_content.php?key=${key}`);
    if (!res.ok) return def;
    const text = await res.text();
    if (!text || text.trim() === "" || text.trim() === "{}") return def;
    const patch = JSON.parse(text) as unknown;
    const merged = mergeSitePageContent(def, patch);
    if (key === "contact") {
      return normalizeContactPageContent(merged as ContactPageContent) as SitePageContentMap[K];
    }
    return merged;
  } catch {
    return def;
  }
}

export async function saveSitePageContent<K extends SitePageKey>(key: K, content: SitePageContentMap[K]): Promise<void> {
  const res = await fetch(`${API_BASE}/page_content.php?key=${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(content),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(typeof err.error === "string" ? err.error : "Failed to save page content");
  }
}
