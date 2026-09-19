import { useState, useEffect } from "react";
import { type SareeProduct } from "@/data/sareeData";
import { fetchProductIdsByCollection, fetchCollectionDisplayName } from "@/lib/collectionAssignments";
import { getAllProducts } from "@/lib/getAllProducts";
import CollectionPageLayout from "@/components/CollectionPageLayout";
import { Sparkles } from "lucide-react";

const DEFAULT_TITLE = "Tissue & Organza Sarees";

const TissueSarees = () => {
  const [tissueProducts, setTissueProducts] = useState<SareeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState(DEFAULT_TITLE);

  useEffect(() => {
    void fetchCollectionDisplayName("tissue", DEFAULT_TITLE).then(setPageTitle);
  }, []);

  useEffect(() => {
    (async () => {
      const [ids, all] = await Promise.all([fetchProductIdsByCollection("tissue"), getAllProducts()]);
      const idSet = new Set(ids.map(String));
      setTissueProducts(all.filter(p => idSet.has(String(p.id))));
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-foreground/50">Loading...</p></div>;

  return (
    <CollectionPageLayout
      title={pageTitle}
      caption="Ethereal Elegance"
      description="Luminous tissue weaves and delicate organza sarees that capture light and movement with every drape."
      products={tissueProducts}
      emptyIcon={<Sparkles size={48} className="mx-auto text-foreground/20" />}
      emptyTitle="Tissue Collection Coming Soon"
      emptyDescription="Our tissue collection is being curated. Assign products from Admin → Collections using the ⋮ menu."
    />
  );
};

export default TissueSarees;
