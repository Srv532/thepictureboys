import { Picture } from "@/components/Picture";
import { Marquee, VelocitySkew } from "@/components/motion/Velocity";
import type { ImageAsset } from "@/lib/media";
import styles from "./FrameMarquee.module.css";

export function FrameMarquee({ images }: { images: { alt: string; image: ImageAsset }[] }) {
  const half = Math.ceil(images.length / 2);
  const rows = [images.slice(0, half), images.slice(half).concat(images.slice(0, Math.max(0, half - (images.length - half))))];
  return (
    <section className={styles.section} aria-label="More frames">
      <VelocitySkew>
        {rows.map((row, r) => (
          <Marquee key={r} baseVelocity={r ? 2 : -2} className={styles.row}>
            {row.map((img, i) => (
              <div className={styles.item} key={i}>
                <Picture image={img.image} alt={img.alt} fit="cover" sizes="300px" />
              </div>
            ))}
          </Marquee>
        ))}
      </VelocitySkew>
    </section>
  );
}
