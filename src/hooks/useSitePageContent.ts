import { useEffect, useState } from "react";
import { fetchSitePageContent } from "@/lib/sitePageApi";
import type { SitePageContentMap, SitePageKey } from "@/types/sitePages";

export function useSitePageContent<K extends SitePageKey>(key: K, fallback: SitePageContentMap[K]) {
  const [content, setContent] = useState<SitePageContentMap[K]>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchSitePageContent(key).then((c) => {
      if (alive) {
        setContent(c);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [key]);

  return { content, loading, setContent };
}
