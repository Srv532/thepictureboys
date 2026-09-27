"use client";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { Picture } from "@/components/Picture";
import { TLink } from "@/components/motion/TLink";
import { useMotionMode } from "@/components/motion/MotionMode";
import type { ImageAsset } from "@/lib/media";
import styles from "./FilmStrip.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Frame = { slug: string; title: string; image: ImageAsset };

/** Pinned film strip that travels sideways as you scroll down. */
export function FilmStrip({ frames }: { frames: Frame[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const { mode, ready } = useMotionMode();
  const pinned = ready && mode !== "reduced";

  useGSAP(
    () => {
      if (!pinned) return;
      const el = track.current!;
      const distance = () => el.scrollWidth - window.innerWidth;
      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      // Frames tilt with scroll speed, like film running through a gate.
      const frames = gsap.utils.toArray<HTMLElement>(`.${styles.frame}`);
      const skew = gsap.quickTo(frames, "skewX", { duration: 0.5, ease: "power3" });
      const st = ScrollTrigger.create({
        trigger: section.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => skew(gsap.utils.clamp(-8, 8, self.getVelocity() / -300)),
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        st.kill();
      };
    },
    { scope: section, dependencies: [pinned, frames.length] },
  );

  return (
    <section ref={section} className={`${styles.strip} ${pinned ? "" : styles.native}`} data-section-tone="ocean">
      <div className={styles.label}>
        <p className="eyebrow">Contact sheet</p>
        <h2 className="display">Roll 01</h2>
      </div>
      <div ref={track} className={styles.track}>
        {frames.map((f, i) => (
          <TLink key={`${f.slug}-${i}`} href={`/work/${f.slug}`} className={styles.frame} data-cursor="View">
            <div className={styles.holes} aria-hidden />
            <div className={styles.photo}>
              <Picture image={f.image} alt={f.title} fit="cover" sizes="(max-width: 760px) 70vw, 34vw" />
            </div>
            <div className={styles.holes} aria-hidden />
            <span className={styles.caption}>
              <b>{String(i + 1).padStart(2, "0")}A</b> {f.title}
            </span>
          </TLink>
        ))}
      </div>
    </section>
  );
}
