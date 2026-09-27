"use client";
import { motion } from "motion/react";
import { RevealText } from "@/components/motion/RevealText";
import styles from "./Services.module.css";

export function Services({ items }: { items: readonly { title: string; text: string }[] }) {
  return (
    <section className={`${styles.services} container`} data-section-tone="paper">
      <p className="eyebrow">What we do</p>
      <RevealText as="h2" className={`${styles.title} display`} text="Through our lens" />
      <ul className={styles.list}>
        {items.map((s, i) => (
          <motion.li
            key={s.title}
            className={styles.item}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.no}>0{i + 1}</span>
            <h3 className="display">{s.title}</h3>
            <p>{s.text}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
