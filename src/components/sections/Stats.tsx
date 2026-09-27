import { Counter } from "@/components/motion/Counter";
import { Letterbox } from "@/components/motion/Letterbox";
import styles from "./Stats.module.css";

export function Stats({ items }: { items: { value: number; suffix: string; label: string }[] }) {
  return (
    <Letterbox className={styles.stats} data-section-tone="ink">
      <div className={`${styles.grid} container`}>
        {items.map((s) => (
          <div className={styles.item} key={s.label}>
            <span className={`${styles.num} display`}>
              <Counter value={s.value} suffix={s.suffix} />
            </span>
            <span className="eyebrow">{s.label}</span>
          </div>
        ))}
      </div>
    </Letterbox>
  );
}
