import { useState, useEffect } from "react";
import { getSections, type HomepageSection } from "@/lib/api";

export function useHomepageSections() {
  const [state, setState] = useState<{
    sections: Record<string, HomepageSection>;
    orderedSections: HomepageSection[];
    loaded: boolean;
    hasData: boolean;
  }>({
    sections: {},
    orderedSections: [],
    loaded: false,
    hasData: false,
  });

  useEffect(() => {
    getSections()
      .then((data) => {
        const map: Record<string, HomepageSection> = {};
        data.forEach((s) => {
          map[s.section_key] = s;
        });
        // Commit all homepage-section state in one render to avoid default-then-custom hero flash.
        setState({
          sections: map,
          orderedSections: data,
          loaded: true,
          hasData: data.length > 0,
        });
      })
      .catch(() => {
        // Fallback: use defaults (no API available)
        setState((prev) => ({
          ...prev,
          loaded: true,
          hasData: false,
        }));
      });
  }, []);

  return {
    sections: state.sections,
    /** Same rows as the API, in display order (used for extra “Add section” blocks on the home page). */
    orderedSections: state.orderedSections,
    loaded: state.loaded,
    hasData: state.hasData,
  };
}
