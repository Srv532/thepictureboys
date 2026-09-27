"use client";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { useMotionMode } from "./MotionMode";
import styles from "./Cursor.module.css";

/**
 * Custom cursor for fine pointers. Elements opt in with:
 *   data-cursor="Play" | "View" | "Drag"   → ring grows and shows the label
 *   data-magnetic                           → element is pulled toward the pointer
 */
export function Cursor() {
  const { mode } = useMotionMode();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [label, setLabel] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (mode !== "desktop") return;
    document.documentElement.classList.add("has-cursor");
    let magnet: HTMLElement | null = null;

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      setLabel(labelled?.dataset.cursor ?? null);
      setHover(Boolean(t?.closest("a, button, [role=button], input, [data-cursor]")));

      const m = t?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (magnet && magnet !== m) magnet.style.transform = "";
      magnet = m;
      if (m) {
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        m.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px)`;
      }
    };
    const leave = () => {
      x.set(-100);
      y.set(-100);
    };
    const pd = () => setDown(true);
    const pu = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", pd);
    window.addEventListener("pointerup", pu);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointerup", pu);
      if (magnet) magnet.style.transform = "";
    };
  }, [mode, x, y]);

  if (mode !== "desktop") return null;
  const size = label ? 96 : hover ? 56 : 14;
  return (
    <>
      <motion.div className={styles.dot} style={{ x, y }} aria-hidden />
      <motion.div
        className={`${styles.ring} ${label ? styles.labelled : ""}`}
        style={{ x: sx, y: sy }}
        animate={{ width: size, height: size, scale: down ? 0.85 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        aria-hidden
      >
        {label && <span>{label}</span>}
      </motion.div>
    </>
  );
}
