"use client";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useScrollApi } from "./SmoothScroll";
import { useMotionMode } from "./MotionMode";
import styles from "./Transition.module.css";

type Phase = "idle" | "cover" | "reveal";
const TransitionContext = createContext<{ navigate: (href: string) => void }>({ navigate() {} });

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { scrollTo } = useScrollApi();
  const { mode } = useMotionMode();
  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("");
  const pending = useRef<string | null>(null);
  const [frame, setFrame] = useState(1);

  const navigate = useCallback(
    (href: string) => {
      const target = new URL(href, window.location.href);
      if (target.pathname === window.location.pathname) {
        if (target.hash) scrollTo(target.hash);
        else scrollTo(0);
        return;
      }
      if (mode === "reduced") {
        router.push(href);
        return;
      }
      setFrame((f) => f + 1);
      setLabel(target.pathname === "/" ? "Home" : target.pathname.split("/").filter(Boolean).pop()!.replace(/-/g, " "));
      pending.current = href;
      setPhase("cover");
    },
    [mode, router, scrollTo],
  );

  useEffect(() => {
    if (phase !== "cover") return;
    // Route changed while covered: jump to top, then reveal.
    scrollTo(0, { immediate: true });
    pending.current = null;
    const t = setTimeout(() => setPhase("reveal"), 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div
            key="curtain"
            className={styles.curtain}
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={phase === "cover" ? { clipPath: "inset(0% 0 0 0)" } : { clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => {
              if (phase === "cover" && pending.current) router.push(pending.current);
              else if (phase === "reveal") setPhase("idle");
            }}
            aria-hidden
          >
            <div className={styles.frame}>
              <span>FR {String(frame).padStart(3, "0")}</span>
              <span className={styles.rec} />
            </div>
            <div className={`${styles.label} display`}>{label}</div>
            <div className={styles.bars} />
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}

export const useTransitionNav = () => useContext(TransitionContext);
