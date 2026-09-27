"use client";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { WorkCard, type WorkItem } from "./WorkCard";
import styles from "./WorkGrid.module.css";

export function WorkGrid({ items, categories }: { items: WorkItem[]; categories: string[] }) {
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? items : items.filter((i) => i.category === filter);

  return (
    <LayoutGroup>
      <div className={styles.filters} role="group" aria-label="Filter by category">
        {["All", ...categories].map((c) => {
          const count = c === "All" ? items.length : items.filter((i) => i.category === c).length;
          return (
            <button key={c} className={styles.chip} onClick={() => setFilter(c)} aria-pressed={filter === c} data-magnetic>
              {filter === c && <motion.span layoutId="chip" className={styles.chipBg} transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className={styles.chipText}>
                {c} <sup>{count}</sup>
              </span>
            </button>
          );
        })}
      </div>
      <motion.ul layout className={styles.grid}>
        <AnimatePresence mode="popLayout">
          {shown.map((item, i) => (
            <motion.li
              layout
              key={item.slug}
              initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
              transition={{ duration: 0.8, delay: Math.min(i, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <WorkCard item={item} index={items.indexOf(item)} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </LayoutGroup>
  );
}
