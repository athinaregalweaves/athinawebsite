/** Deep-merge API patches into bundled defaults; arrays from patch replace entirely. */
export function mergeSitePageContent<T>(defaults: T, patch: unknown): T {
  if (patch === undefined || patch === null) return defaults;
  if (Array.isArray(defaults)) {
    return (Array.isArray(patch) ? patch : defaults) as T;
  }
  if (
    typeof defaults === "object" &&
    defaults !== null &&
    typeof patch === "object" &&
    patch !== null &&
    !Array.isArray(patch)
  ) {
    const out = { ...defaults } as Record<string, unknown>;
    const p = patch as Record<string, unknown>;
    for (const key of Object.keys(p)) {
      if (!(key in out)) continue;
      const bk = out[key];
      const pk = p[key];
      if (Array.isArray(bk)) {
        out[key] = Array.isArray(pk) ? pk : bk;
      } else if (typeof bk === "object" && bk !== null && !Array.isArray(bk)) {
        out[key] = mergeSitePageContent(bk, pk);
      } else {
        out[key] = pk;
      }
    }
    return out as T;
  }
  return patch as T;
}
