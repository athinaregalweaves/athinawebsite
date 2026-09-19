import { useState, useEffect } from "react";
import { type SareeProduct } from "@/data/sareeData";
import { fetchProductIdsByCollection, fetchCollectionDisplayName } from "@/lib/collectionAssignments";
import { getAllProducts } from "@/lib/getAllProducts";
import CollectionPageLayout from "@/components/CollectionPageLayout";
import { Leaf } from "lucide-react";

const DEFAULT_TITLE = "Linen & Cotton Sarees";

const LinenSarees = () => {
  const [linenProducts, setLinenProducts] = useState<SareeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState(DEFAULT_TITLE);

  useEffect(() => {
    void fetchCollectionDisplayName("linen", DEFAULT_TITLE).then(setPageTitle);
  }, []);

  useEffect(() => {
    (async () => {
      const [ids, all] = await Promise.all([fetchProductIdsByCollection("linen"), getAllProducts()]);
      const idSet = new Set(ids.map(String));
      setLinenProducts(all.filter(p => idSet.has(String(p.id))));
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-foreground/50">Loading...</p></div>;

  return (
    <CollectionPageLayout
      title={pageTitle}
      caption="Contemporary Heritage"
      description="Everyday luxury in breathable linen and cotton weaves. Perfect for the modern woman who values comfort and craft."
      products={linenProducts}
      emptyIcon={<Leaf size={48} className="mx-auto text-foreground/20" />}
      emptyTitle="Linen Collection Coming Soon"
      emptyDescription="Our linen collection is being curated. Assign products from Admin → Collections using the ⋮ menu."
    />
  );
};

export default LinenSarees;
