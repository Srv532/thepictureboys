"use client";
import { motion } from "motion/react";
import styles from "./Wordmark.module.css";

const WORDS = ["The", "Picture", "Boys"];
// Letters that get a paint drip, echoing the graffiti mark.
const DRIPS = new Set([0, 4, 8, 11, 13]);

/** Graffiti-inspired kinetic wordmark: letters spray in, then drips run. */
export function Wordmark({ play = true, className }: { play?: boolean; className?: string }) {
  let index = 0;
  return (
    <h1 className={`${styles.mark} ${className ?? ""}`} aria-label="ThePictureBoys">
      <span aria-hidden className={styles.inner}>
        {WORDS.map((w) => (
          <span className={styles.word} key={w}>
            {Array.from(w).map((c) => {
              const i = index++;
              return (
                <motion.span
                  key={i}
                  className={styles.letter}
                  style={{ "--i": i } as React.CSSProperties}
                  initial={{ opacity: 0, y: "40%", rotate: i % 2 ? 10 : -10, scale: 1.5, filter: "blur(14px)" }}
                  animate={play ? { opacity: 1, y: "0%", rotate: i % 2 ? 2 : -2, scale: 1, filter: "blur(0px)" } : undefined}
                  transition={{ delay: 0.15 + i * 0.045, type: "spring", stiffness: 260, damping: 18 }}
                  whileHover={{ y: "-8%", rotate: i % 2 ? -4 : 4, transition: { type: "spring", stiffness: 500, damping: 12 } }}
                >
                  {c}
                  {DRIPS.has(i) && (
                    <motion.i
                      className={styles.drip}
                      initial={{ scaleY: 0 }}
                      animate={play ? { scaleY: 1 } : undefined}
                      transition={{ delay: 1 + i * 0.05, duration: 1.4, ease: [0.5, 0, 0.2, 1] }}
                    />
                  )}
                </motion.span>
              );
            })}
          </span>
        ))}
      </span>
    </h1>
  );
}
