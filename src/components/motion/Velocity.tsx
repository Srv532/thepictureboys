"use client";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef } from "react";
import styles from "./Velocity.module.css";

function useScrollVelocity() {
  const { scrollY } = useScroll();
  const v = useVelocity(scrollY);
  return useSpring(v, { damping: 50, stiffness: 400 });
}

/** Skews/stretches its children with scroll speed, then settles. */
export function VelocitySkew({ children, className, max = 5 }: { children: React.ReactNode; className?: string; max?: number }) {
  const v = useScrollVelocity();
  const skewY = useTransform(v, [-3000, 0, 3000], [max, 0, -max], { clamp: true });
  const scaleY = useTransform(v, [-3000, 0, 3000], [1.04, 1, 1.04], { clamp: true });
  return (
    <motion.div className={className} style={{ skewY, scaleY }}>
      {children}
    </motion.div>
  );
}

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/** Infinite marquee whose speed and direction follow the scroll. */
export function Marquee({ children, baseVelocity = -3, className }: { children: React.ReactNode; baseVelocity?: number; className?: string }) {
  const x = useMotionValue(0);
  const v = useScrollVelocity();
  const factor = useTransform(v, [0, 1000], [0, 4], { clamp: false });
  const dir = useRef(1);
  const xp = useTransform(x, (val) => `${wrap(-50, 0, val)}%`);

  useAnimationFrame((_, delta) => {
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * Math.abs(f);
    x.set(x.get() + move);
  });

  return (
    <div className={`${styles.marquee} ${className ?? ""}`}>
      <motion.div className={styles.track} style={{ x: xp }}>
        <div className={styles.group}>{children}</div>
        <div className={styles.group} aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
