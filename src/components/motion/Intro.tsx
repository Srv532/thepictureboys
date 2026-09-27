"use client";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useContext, useEffect, useState } from "react";
import { useMotionMode } from "./MotionMode";
import { useScrollApi } from "./SmoothScroll";
import styles from "./Intro.module.css";

const IntroContext = createContext(true);
/** True once the opening sequence has finished (or was skipped). */
export const useIntroDone = () => useContext(IntroContext);

const KEY = "tpb-intro-seen";
const COUNT = [3, 2, 1];
const BLADES = 8;

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const { mode, ready } = useMotionMode();
  const { lock, unlock } = useScrollApi();
  const [phase, setPhase] = useState<"pending" | "count" | "open" | "done">("pending");
  const [n, setN] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!ready) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {}
    if (seen || mode === "reduced") {
      // Syncing with sessionStorage/media query, which are only readable after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("done");
      return;
    }
    setPhase("count");
    lock();
    const start = performance.now();
    let raf = 0;
    const loop = () => {
      const t = (performance.now() - start) / 1800;
      setPct(Math.min(100, Math.round(t * 100)));
      setN(Math.min(COUNT.length - 1, Math.floor(t * COUNT.length)));
      if (t < 1) raf = requestAnimationFrame(loop);
      else setPhase("open");
    };
    raf = requestAnimationFrame(loop);
    const skip = () => setPhase((p) => (p === "count" ? "open" : p));
    window.addEventListener("keydown", skip);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", skip);
    };
  }, [ready, mode, lock]);

  useEffect(() => {
    if (phase !== "open") return;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    const t = setTimeout(() => {
      setPhase("done");
      unlock();
    }, 1300);
    return () => clearTimeout(t);
  }, [phase, unlock]);

  return (
    <IntroContext.Provider value={phase === "done" || phase === "open"}>
      {children}
      <AnimatePresence>
        {phase !== "done" && (
          <motion.div
            className={styles.intro}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setPhase((p) => (p === "count" ? "open" : p))}
            aria-hidden
            data-testid="intro"
          >
            {/* The iris: a hole whose edge is ringed by rotating blades. */}
            <motion.div
              className={styles.hole}
              initial={{ width: 0, height: 0 }}
              animate={phase === "open" ? { width: "260vmax", height: "260vmax" } : { width: 0, height: 0 }}
              transition={{ duration: 1.25, ease: [0.76, 0, 0.24, 1] }}
            />
            <motion.svg
              className={styles.blades}
              viewBox="-100 -100 200 200"
              animate={
                phase === "open" ? { rotate: -120, scale: 9, opacity: 0 } : { rotate: [0, 8, 0], scale: 1, opacity: 1 }
              }
              transition={
                phase === "open"
                  ? { duration: 1.2, ease: [0.76, 0, 0.24, 1] }
                  : { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }
            >
              {Array.from({ length: BLADES }, (_, i) => (
                <path
                  key={i}
                  d="M0 -96 L58 -76 L22 -8 L-6 -30 Z"
                  transform={`rotate(${(360 / BLADES) * i})`}
                  className={styles.blade}
                />
              ))}
              <circle r="96" className={styles.rim} />
            </motion.svg>

            {phase === "count" && (
              <div className={styles.leader}>
                <div className={styles.sweep} />
                <svg viewBox="0 0 200 200" className={styles.rings}>
                  <circle cx="100" cy="100" r="86" />
                  <circle cx="100" cy="100" r="70" />
                  <line x1="0" y1="100" x2="200" y2="100" />
                  <line x1="100" y1="0" x2="100" y2="200" />
                </svg>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={n}
                    className={`${styles.num} display`}
                    initial={{ opacity: 0, scale: 1.4, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.35 }}
                  >
                    {COUNT[n]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
            <div className={styles.meta}>
              <span>ThePictureBoys</span>
              <span>{String(pct).padStart(3, "0")}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </IntroContext.Provider>
  );
}
