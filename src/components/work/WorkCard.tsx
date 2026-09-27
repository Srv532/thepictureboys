"use client";
import { useRef, useState } from "react";
import { Picture } from "@/components/Picture";
import { DistortImage } from "@/components/gl/DistortImage";
import { TLink } from "@/components/motion/TLink";
import { useMotionMode } from "@/components/motion/MotionMode";
import type { ImageAsset } from "@/lib/media";
import styles from "./WorkCard.module.css";

export type WorkItem = {
  slug: string;
  title: string;
  category: string;
  year: string;
  cover: ImageAsset;
  coverTexture: string;
  preview?: string;
  duration?: string;
};

export function WorkCard({ item, index }: { item: WorkItem; index: number }) {
  const { mode, webgl } = useMotionMode();
  const [hover, setHover] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const fancy = mode === "desktop";

  const enter = () => {
    if (!fancy) return;
    setHover(true);
    video.current?.play().catch(() => {});
  };
  const leave = () => {
    setHover(false);
    if (video.current) {
      video.current.pause();
      video.current.currentTime = 0;
    }
  };

  return (
    <TLink
      href={`/work/${item.slug}`}
      className={styles.card}
      data-cursor={item.preview ? "Play" : "View"}
      onPointerEnter={enter}
      onPointerLeave={leave}
      data-testid="work-card"
    >
      <div className={styles.media} style={{ aspectRatio: `${item.cover.width} / ${item.cover.height}` }}>
        <Picture image={item.cover} alt={item.title} fit="cover" sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw" />
        {item.preview && (
          <video ref={video} className={`${styles.preview} ${hover ? styles.show : ""}`} src={item.preview} muted loop playsInline preload="none" aria-hidden />
        )}
        {!item.preview && webgl && fancy && <DistortImage url={item.coverTexture} active={hover} />}
        {item.duration && <span className={styles.badge}>▶ {item.duration}</span>}
      </div>
      <div className={styles.meta}>
        <span className={styles.idx}>{String(index + 1).padStart(2, "0")}</span>
        <h2 className={styles.title}>{item.title}</h2>
        <span className={styles.cat}>
          {item.category} · {item.year}
        </span>
      </div>
    </TLink>
  );
}
