"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackAddToCart, trackViewContent, trackPurchase } from "@/lib/meta-pixel";

export function MetaPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.fbq !== "function") return;
    window.fbq("track", "PageView");
  }, [pathname]);

  return null;
}

export { trackAddToCart, trackViewContent, trackPurchase };
