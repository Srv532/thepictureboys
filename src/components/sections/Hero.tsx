"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { HeroFilm } from "@/components/gl/HeroFilm";
import { useIntroDone } from "@/components/motion/Intro";
import { RevealText } from "@/components/motion/RevealText";
import { Wordmark } from "@/components/motion/Wordmark";
import styles from "./Hero.module.css";

export function Hero({ film, poster }: { film: string; poster: string }) {
  const ref = useRef<HTMLElement>(null);
  const play = useIntroDone();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.86]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className={styles.hero}>
      <HeroFilm src={film} poster={poster} />
      <div className={styles.shade} />
      <motion.div className={styles.content} style={{ y, scale, opacity }}>
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={play ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Photography <span className={styles.dot}>●</span> Videography
        </motion.p>
        <Wordmark play={play} />
        <RevealText
          as="p"
          className={`${styles.tag} serif`}
          text="Stories told in frames."
          by="words"
          trigger="mount"
          play={play}
          delay={1.1}
        />
      </motion.div>
      <motion.div
        className={styles.cue}
        initial={{ opacity: 0 }}
        animate={play ? { opacity: 1 } : undefined}
        transition={{ delay: 1.8 }}
        aria-hidden
      >
        <span>Scroll</span>
        <i />
      </motion.div>
      <div className={styles.rec} aria-hidden>
        <span className={styles.recDot} /> REC <Timecode className={styles.tc} />
      </div>
    </section>
  );
}

/** Running SMPTE-style timecode (HH:MM:SS:FF at 24fps). */
function Timecode({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      const f = Math.floor((t % 1) * 24);
      if (ref.current)
        ref.current.textContent = `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(Math.floor(t) % 60)}:${pad(f)}`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>00:00:00:00</span>;
}
