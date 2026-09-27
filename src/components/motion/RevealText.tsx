"use client";
import { motion, type Variants } from "motion/react";
import { createElement, type ElementType } from "react";
import styles from "./RevealText.module.css";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  by?: "chars" | "words";
  delay?: number;
  stagger?: number;
  /** "inView" animates when scrolled to; "mount" animates when `play` becomes true. */
  trigger?: "inView" | "mount";
  play?: boolean;
};

const container = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});
const piece: Variants = {
  hidden: { y: "110%", rotate: 6 },
  show: { y: "0%", rotate: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
};

/** Kinetic headline: each word/char rises out of a mask. Screen readers get the plain text. */
export function RevealText({ text, as = "h2", className, by = "chars", delay = 0, stagger, trigger = "inView", play = true }: Props) {
  const words = text.split(" ");
  const s = stagger ?? (by === "chars" ? 0.028 : 0.07);
  const animateProps =
    trigger === "inView"
      ? { whileInView: "show", viewport: { once: true, amount: 0.4 } }
      : { animate: play ? "show" : "hidden" };

  return createElement(
    as,
    { className, "aria-label": text },
    <motion.span className={styles.line} variants={container(s, delay)} initial="hidden" {...animateProps} aria-hidden>
      {words.map((w, wi) => (
        <span className={styles.word} key={wi}>
          {by === "words" ? (
            <motion.span className={styles.piece} variants={piece}>
              {w}
            </motion.span>
          ) : (
            Array.from(w).map((c, ci) => (
              <motion.span className={styles.piece} variants={piece} key={ci}>
                {c}
              </motion.span>
            ))
          )}
          {wi < words.length - 1 && " "}
        </span>
      ))}
    </motion.span>,
  );
}
