"use client";
import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import styles from "./Timeline.module.css";

const STEPS = [
  { when: "Childhood", title: "Shaky home videos", text: "Family trips, festivals and birthdays. We were always the ones holding the camera." },
  { when: "12+ years", title: "Behind a lens", text: "Phones, handycams, borrowed cameras. The habit never left, it only got sharper." },
  { when: "November", title: "ThePictureBoys begins", text: "Friends who shared the same instinct turned it into a name, exploring places and posting our best frames." },
  { when: "30.12.2025", title: "A new chapter", text: "ThePictureBoys continues as a duo, with the same passion and a bigger vision." },
  { when: "Today", title: "Stories told in frames", text: "Photography and videography built on one belief: every frame should tell a story." },
];

export function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <section className={`${styles.timeline} container`} data-section-tone="ember">
      <p className="eyebrow">How it started</p>
      <div ref={ref} className={styles.list}>
        <div className={styles.rail} aria-hidden>
          <motion.div className={styles.fill} style={{ scaleY }} />
        </div>
        {STEPS.map((s, i) => (
          <motion.div
            key={s.when}
            className={styles.step}
            initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.dot} aria-hidden />
            <span className={styles.when}>{s.when}</span>
            <h3 className="display">{s.title}</h3>
            <p>{s.text}</p>
            <span className={styles.idx} aria-hidden>{String(i + 1).padStart(2, "0")}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
