import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { type SareeProduct } from "@/data/sareeData";
import { fetchProductIdsByCollection, fetchCollectionMetaByKey, type CollectionDefinition } from "@/lib/collectionAssignments";
import { getCollectionIconComponent } from "@/lib/collectionIcons";
import { getAllProducts } from "@/lib/getAllProducts";
import CollectionPageLayout from "@/components/CollectionPageLayout";
import { FolderOpen } from "lucide-react";

const CustomCollection = () => {
  const { slug } = useParams<{ slug: string }>();
  const key = slug ? decodeURIComponent(slug) : "";
  const [meta, setMeta] = useState<CollectionDefinition | null>(null);
  const [products, setProducts] = useState<SareeProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!key) {
      setLoading(false);
      return;
    }
    (async () => {
      const m = await fetchCollectionMetaByKey(key);
      setMeta(m);
      if (!m) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const [ids, all] = await Promise.all([fetchProductIdsByCollection(key), getAllProducts()]);
      const idSet = new Set(ids.map(String));
      setProducts(all.filter((p) => idSet.has(String(p.id))));
      setLoading(false);
    })();
  }, [key]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-foreground/50">Loading...</p>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="luxury-container py-24 text-center">
        <h1 className="font-display text-2xl text-foreground mb-2">Collection not found</h1>
        <p className="font-body text-muted-foreground">This collection may have been removed.</p>
      </div>
    );
  }

  const TitleIcon = getCollectionIconComponent(meta.icon_key);
  return (
    <CollectionPageLayout
      title={meta.display_name}
      titleIcon={
        <TitleIcon className="shrink-0 text-foreground" size={32} strokeWidth={1.35} aria-hidden />
      }
      caption="Curated collection"
      description={`Handpicked sarees in ${meta.display_name}. Assign more pieces from your admin panel.`}
      products={products}
      emptyIcon={<FolderOpen size={48} className="mx-auto text-foreground/20" />}
      emptyTitle="Collection coming soon"
      emptyDescription="We're adding pieces to this collection. Check back soon."
    />
  );
};

export default CustomCollection;
