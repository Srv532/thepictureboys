"use client";
import { motion } from "motion/react";
import styles from "./Members.module.css";

type Member = { name: string; first: string; last: string; role: string; instagram: { handle: string; url: string } };

export function Members({ members }: { members: readonly Member[] }) {
  return (
    <section className={`${styles.members} container`} data-section-tone="violet">
      <p className="eyebrow">The people behind the lens</p>
      <div className={styles.grid}>
        {members.map((m, i) => (
          <motion.article
            key={m.name}
            className={styles.card}
            initial={{ opacity: 0, y: 80, rotate: i ? 2 : -2 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.1, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.no}>0{i + 1}</span>
            <h2 className={`${styles.name} display`}>
              <span>{m.first}</span>
              <span className={styles.outline}>{m.last}</span>
            </h2>
            <p className={styles.role}>{m.role}</p>
            <a className={styles.ig} href={m.instagram.url} target="_blank" rel="noreferrer" data-magnetic>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
              {m.instagram.handle}
            </a>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
