"use client";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { Picture } from "@/components/Picture";
import { TLink } from "@/components/motion/TLink";
import { RevealText } from "@/components/motion/RevealText";
import type { ImageAsset } from "@/lib/media";
import styles from "./FeaturedStack.module.css";

export type FeaturedCard = {
  slug: string;
  title: string;
  category: string;
  year: string;
  isFilm: boolean;
  cover: ImageAsset;
  preview?: string;
};

function Card({ card, i, total, progress }: { card: FeaturedCard; i: number; total: number; progress: MotionValue<number> }) {
  // Each card shrinks and darkens as the next one stacks over it.
  const start = i / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - i) * 0.04]);
  const brightness = useTransform(progress, [start, Math.min(1, start + 1 / total)], [1, i === total - 1 ? 1 : 0.45]);
  const filter = useTransform(brightness, (b) => `brightness(${b})`);
  return (
    <div className={styles.slot} style={{ top: `calc(12vh + ${i * 22}px)` }}>
      <motion.article className={styles.card} style={{ scale, filter }}>
        <TLink href={`/work/${card.slug}`} className={styles.link} data-cursor={card.isFilm ? "Play" : "View"}>
          <div className={styles.media}>
            <Picture image={card.cover} alt={card.title} fit="cover" sizes="(max-width: 760px) 100vw, 90vw" />
            {card.preview && <video className={styles.preview} src={card.preview} muted loop playsInline autoPlay preload="none" aria-hidden />}
          </div>
          <div className={styles.info}>
            <span className={styles.idx}>{String(i + 1).padStart(2, "0")}</span>
            <h3 className="display">{card.title}</h3>
            <span className="eyebrow">
              {card.category} · {card.year}
            </span>
          </div>
        </TLink>
      </motion.article>
    </div>
  );
}

export function FeaturedStack({ cards }: { cards: FeaturedCard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section className={styles.section} data-section-tone="violet">
      <div className={`${styles.head} container`}>
        <p className="eyebrow">Selected work</p>
        <RevealText as="h2" className={`${styles.title} display`} text="Featured frames" />
      </div>
      <div ref={ref} className={`${styles.stack} container`}>
        {cards.map((c, i) => (
          <Card key={c.slug} card={c} i={i} total={cards.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
