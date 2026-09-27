"use client";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import styles from "./Statement.module.css";

const TEXT =
  "Long before ThePictureBoys, there were shaky home videos. For 12+ years we've been the ones holding the camera at every trip, festival and family gathering. Now we tell stories in frames.";
const ACCENT = new Set(["home", "videos.", "stories", "frames."]);

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return (
    <motion.span className={ACCENT.has(word) ? `${styles.accent} serif` : undefined} style={{ opacity, y }}>
      {word}{" "}
    </motion.span>
  );
}

/** Scroll-scrubbed manifesto: words light up as you scroll through. */
export function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = TEXT.split(" ");
  return (
    <section className={`${styles.statement} container`} data-section-tone="ember">
      <p className="eyebrow">Our story</p>
      <div ref={ref} className={`${styles.text} display`} aria-label={TEXT}>
        <span aria-hidden>
          {words.map((w, i) => (
            <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
          ))}
        </span>
      </div>
    </section>
  );
}
