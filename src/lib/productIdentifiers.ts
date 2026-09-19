import type { SareeProduct } from "@/data/sareeData";

/** Matches ATH_05, ATH-12, ath_7, etc. */
const ATH_NUM_RE = /^ATH[_-]?(\d+)$/i;

/**
 * Next SKU like ATH_06 after ATH_05, ATH_15 — uses max numeric suffix across id + sku.
 */
export function nextAthSkuFromCatalog(products: Pick<SareeProduct, "id" | "sku">[]): string {
  let max = 0;
  for (const p of products) {
    for (const raw of [p.sku, p.id]) {
      const m = String(raw ?? "").trim().match(ATH_NUM_RE);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  }
  const next = max + 1;
  const tail = next < 100 ? String(next).padStart(2, "0") : String(next);
  return `ATH_${tail}`;
}
