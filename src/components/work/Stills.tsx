"use client";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Picture } from "@/components/Picture";
import { FocusPull } from "@/components/motion/FocusPull";
import { useScrollApi } from "@/components/motion/SmoothScroll";
import { mediaUrl, type ImageAsset } from "@/lib/media";
import styles from "./Stills.module.css";

/** Stills grid with a full-screen lightbox (keyboard, swipe, click). */
export function Stills({ images, title }: { images: ImageAsset[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [dir, setDir] = useState(0);
  const { lock, unlock } = useScrollApi();

  const go = useCallback(
    (d: number) => {
      setDir(d);
      setOpen((o) => (o === null ? o : (o + d + images.length) % images.length));
    },
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    lock();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", key);
    return () => {
      unlock();
      window.removeEventListener("keydown", key);
    };
  }, [open, go, lock, unlock]);

  return (
    <>
      <div className={`${styles.grid} ${images.length === 1 ? styles.single : ""}`}>
        {images.map((img, i) => (
          <FocusPull key={i} delay={i * 0.08}>
            <button className={styles.thumb} onClick={() => setOpen(i)} data-cursor="View" aria-label={`Open image ${i + 1} of ${images.length}`} data-testid="still">
              <Picture image={img} alt={`${title} — frame ${i + 1}`} sizes="(max-width: 760px) 100vw, 50vw" />
            </button>
          </FocusPull>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className={styles.box}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} — image ${open + 1} of ${images.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            data-testid="lightbox"
          >
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.img
                key={open}
                src={mediaUrl(images[open].full)}
                alt={`${title} — frame ${open + 1}`}
                className={styles.full}
                custom={dir}
                initial={{ opacity: 0, x: dir * 120, scale: 0.96, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: dir * -120, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                drag={images.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) go(1);
                  else if (info.offset.x > 80) go(-1);
                }}
                onClick={(e) => e.stopPropagation()}
                draggable={false}
              />
            </AnimatePresence>
            <div className={styles.bar} onClick={(e) => e.stopPropagation()}>
              <span>
                {String(open + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </span>
              {images.length > 1 && (
                <>
                  <button onClick={() => go(-1)} aria-label="Previous image">←</button>
                  <button onClick={() => go(1)} aria-label="Next image">→</button>
                </>
              )}
              <button onClick={() => setOpen(null)} aria-label="Close" data-testid="lightbox-close">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
