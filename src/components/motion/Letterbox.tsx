"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import styles from "./Letterbox.module.css";

/** Cinema bars that part as the section scrolls into frame. */
export function Letterbox({ children, className, ...rest }: React.HTMLAttributes<HTMLElement> & { "data-section-tone"?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.25"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0]);
  return (
    <section ref={ref} className={`${styles.box} ${className ?? ""}`} {...rest}>
      {children}
      <motion.div className={`${styles.bar} ${styles.top}`} style={{ scaleY: scale }} aria-hidden />
      <motion.div className={`${styles.bar} ${styles.bottom}`} style={{ scaleY: scale }} aria-hidden />
    </section>
  );
}
