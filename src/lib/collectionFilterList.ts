import { fetchAllCollectionDefinitions } from "@/lib/collectionAssignments";

export type CollectionFilterItem = {
  key: string;
  displayName: string;
  iconKey: string | null;
  imageUrl?: string | null;
};

function formatOrphanKey(key: string): string {
  return key
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/**
 * All collections the shop should show in the filter strip: built-in (always) +
 * every custom collection from the server, plus any keys that appear in assignments
 * but are not in meta (legacy/orphan). Names come from the API / admin when available.
 */
export async function buildCollectionFilterList(
  assignments: Record<string, string[]>
): Promise<CollectionFilterItem[]> {
  const inUse = new Set<string>();
  for (const cols of Object.values(assignments)) {
    for (const c of cols) {
      if (c) inUse.add(String(c).trim());
    }
  }

  const defs = await fetchAllCollectionDefinitions();
  const result: CollectionFilterItem[] = [];
  for (const c of defs) {
    result.push({
      key: c.collection_key,
      displayName: c.display_name,
      iconKey: c.icon_key ?? null,
      imageUrl: c.image_url ?? null,
    });
  }

  const covered = new Set(defs.map((c) => String(c.collection_key).trim()));
  const orphans: CollectionFilterItem[] = [];
  for (const k of inUse) {
    if (covered.has(k)) continue;
    orphans.push({ key: k, displayName: formatOrphanKey(k), iconKey: null, imageUrl: null });
  }
  orphans.sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" }));
  return [...result, ...orphans];
}
