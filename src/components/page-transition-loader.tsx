"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BrandLoading } from "@/components/brand-loading";

export const startPageTransition = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("dc:navigation-start"));
  }
};

export const PageTransitionLoader = () => {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const delayRef = useRef<number>();
  const fallbackRef = useRef<number>();

  useEffect(() => {
    const stop = () => {
      window.clearTimeout(delayRef.current);
      window.clearTimeout(fallbackRef.current);
      setVisible(false);
    };

    const start = () => {
      window.clearTimeout(delayRef.current);
      window.clearTimeout(fallbackRef.current);
      delayRef.current = window.setTimeout(() => setVisible(true), 120);
      fallbackRef.current = window.setTimeout(stop, 8000);
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (`${destination.pathname}${destination.search}` === `${window.location.pathname}${window.location.search}`) return;
      start();
    };

    document.addEventListener("click", onDocumentClick, true);
    window.addEventListener("dc:navigation-start", start);
    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      window.removeEventListener("dc:navigation-start", start);
      stop();
    };
  }, []);

  useEffect(() => {
    window.clearTimeout(delayRef.current);
    window.clearTimeout(fallbackRef.current);
    setVisible(false);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-[#f6f5ef]">
      <BrandLoading fullScreen label="" />
    </div>
  );
};
