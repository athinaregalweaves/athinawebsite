import { useState, useEffect } from "react";
import { type SareeProduct } from "@/data/sareeData";
import { fetchProductIdsByCollection, fetchCollectionDisplayName } from "@/lib/collectionAssignments";
import { getAllProducts } from "@/lib/getAllProducts";
import CollectionPageLayout from "@/components/CollectionPageLayout";
import { Crown } from "lucide-react";

const DEFAULT_TITLE = "Bridal Sarees";

const BridalSarees = () => {
  const [bridalProducts, setBridalProducts] = useState<SareeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState(DEFAULT_TITLE);

  useEffect(() => {
    void fetchCollectionDisplayName("bridal", DEFAULT_TITLE).then(setPageTitle);
  }, []);

  useEffect(() => {
    (async () => {
      const [ids, all] = await Promise.all([fetchProductIdsByCollection("bridal"), getAllProducts()]);
      const idSet = new Set(ids.map(String));
      setBridalProducts(all.filter(p => idSet.has(String(p.id))));
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-foreground/50">Loading...</p></div>;

  return (
    <CollectionPageLayout
      title={pageTitle}
      caption="Bridal Couture"
      description="Sarees crafted for the most celebrated moments. Each bridal piece is a masterwork of heritage weaving and timeless beauty."
      products={bridalProducts}
      emptyIcon={<Crown size={48} className="mx-auto text-foreground/20" />}
      emptyTitle="Bridal Collection Coming Soon"
      emptyDescription="Our bridal collection is being curated. Assign products from Admin → Collections using the ⋮ menu."
    />
  );
};

export default BridalSarees;
