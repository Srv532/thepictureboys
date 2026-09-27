"use client";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useMotionMode } from "./MotionMode";

gsap.registerPlugin(ScrollTrigger);

type ScrollApi = {
  lock: () => void;
  unlock: () => void;
  scrollTo: (target: number | string | HTMLElement, opts?: { immediate?: boolean }) => void;
};
const ScrollContext = createContext<ScrollApi>({ lock() {}, unlock() {}, scrollTo() {} });

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { mode, ready } = useMotionMode();
  const lenis = useRef<Lenis | null>(null);
  const locks = useRef(0);

  useEffect(() => {
    if (!ready || mode !== "desktop") return;
    // Lenis smooths wheel/trackpad only; keyboard, scrollbar and find-in-page keep native behaviour.
    const l = new Lenis({ autoRaf: false, lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenis.current = l;
    l.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      lenis.current = null;
    };
  }, [mode, ready]);

  useEffect(() => {
    // Refresh pinned/scrubbed scenes once fonts and media have settled.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  const lock = useCallback(() => {
    locks.current += 1;
    lenis.current?.stop();
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.paddingRight = `${gap}px`;
  }, []);
  const unlock = useCallback(() => {
    locks.current = Math.max(0, locks.current - 1);
    if (locks.current) return;
    lenis.current?.start();
    document.documentElement.style.overflow = "";
    document.documentElement.style.paddingRight = "";
  }, []);
  const scrollTo = useCallback<ScrollApi["scrollTo"]>((target, opts) => {
    if (lenis.current) {
      lenis.current.scrollTo(target, { immediate: opts?.immediate, duration: 1.4 });
      return;
    }
    const top =
      typeof target === "number"
        ? target
        : (typeof target === "string" ? document.querySelector<HTMLElement>(target) : target)?.getBoundingClientRect()
            .top ?? 0;
    window.scrollTo({
      top: typeof target === "number" ? top : top + window.scrollY,
      behavior: opts?.immediate ? "instant" : "smooth",
    });
  }, []);

  const api = useMemo(() => ({ lock, unlock, scrollTo }), [lock, unlock, scrollTo]);
  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}

export const useScrollApi = () => useContext(ScrollContext);
