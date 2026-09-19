import { SareeProduct, sareeProducts } from "@/data/sareeData";

export function getSimilarProducts(
  product: SareeProduct,
  limit = 4,
  sourceProducts?: SareeProduct[]
): SareeProduct[] {
  const pool = (sourceProducts && sourceProducts.length > 0 ? sourceProducts : sareeProducts).filter(
    (p) => p.id !== product.id
  );

  // Same category first, then same fabric, exclude current
  const sameCategory = pool.filter((p) => p.category === product.category);
  const sameFabric = pool.filter((p) => p.fabric === product.fabric && p.category !== product.category);
  const combined = [...sameCategory, ...sameFabric];

  // Remove duplicates by id while preserving order.
  const unique = combined.filter((p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx);

  if (unique.length === 0) {
    return [...pool].sort(() => Math.random() - 0.5).slice(0, limit);
  }
  // Shuffle and take limit
  return unique.sort(() => Math.random() - 0.5).slice(0, limit);
}

export function getCategories(): string[] {
  return [...new Set(sareeProducts.map(p => p.category))].sort();
}
