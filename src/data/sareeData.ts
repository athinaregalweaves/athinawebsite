import sareeProduct1 from "@/assets/saree-product-1.jpg";

export interface SareeProduct {
  id: string;
  itemNote: string;
  itemName: string;
  sku: string;
  price: number;
  // Optional pricing metadata for displaying offers on cards/pages.
  originalPrice?: number;
  offerPercent?: number;
  category: string;
  subcategory?: string;
  fabric: string;
  image: string;
  description?: string;
  /** ISO datetime from API (`created_at`) — used to show newest listings first */
  createdAt?: string;
  /** ISO datetime from API (`updated_at`) */
  updatedAt?: string;
}

export const sareeProducts: SareeProduct[] = [
  {
    id: "p1",
    itemNote: "New Arrival",
    itemName: "Purple Brocade Silk Saree",
    sku: "ATH-001",
    price: 12500,
    category: "Silk",
    fabric: "Brocade Silk",
    image: sareeProduct1,
    description: "Elegant purple brocade silk saree with intricate geometric pattern and contrasting teal border with floral motifs.",
  },
];

export interface Category {
  name: string;
  slug: string;
  description: string;
}

export const categories: Category[] = [];

export function getUniqueFabrics(): string[] {
  return [...new Set(sareeProducts.map(p => p.fabric))].sort();
}

export function getProductsByCategory(category: string): SareeProduct[] {
  return sareeProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

export function getProductById(id: string): SareeProduct | undefined {
  return sareeProducts.find(p => p.id === id);
}
