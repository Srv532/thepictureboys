import { TLink } from "@/components/motion/TLink";
import { RevealText } from "@/components/motion/RevealText";
import styles from "./WorkCTA.module.css";

export function WorkCTA({ count }: { count: number }) {
  return (
    <section className={`${styles.cta} container`} data-section-tone="ink">
      <RevealText as="h2" className={`${styles.title} display`} text="Every frame has a story" />
      <TLink href="/work" className={styles.btn} data-magnetic>
        <span>See all {count} projects</span>
        <span aria-hidden>→</span>
      </TLink>
    </section>
  );
}
