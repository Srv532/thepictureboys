"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Wrapped-style colour shifts: any element with data-section-tone="ember|ocean|violet|paper|ink"
 * sets the page background while it fills the middle of the viewport.
 */
export function ToneObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-section-tone]"));
    root.dataset.tone = "ink";
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) root.dataset.tone = (e.target as HTMLElement).dataset.sectionTone!;
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.dataset.tone = "ink";
    };
  }, [pathname]);
  return null;
}
