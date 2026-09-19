import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, state } = useLocation();
  const navigationType = useNavigationType();
  const preserveScroll = Boolean((state as { preserveScroll?: boolean } | null)?.preserveScroll);

  useEffect(() => {
    // Preserve scroll position on browser back/forward.
    if (navigationType === "POP") return;
    if (preserveScroll) return;
    window.scrollTo(0, 0);
  }, [pathname, navigationType, preserveScroll]);

  return null;
};

export default ScrollToTop;
