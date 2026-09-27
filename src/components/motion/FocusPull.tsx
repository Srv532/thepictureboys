"use client";
import { motion } from "motion/react";

/** Blurred → sharp, like a lens pulling focus, as the element enters the frame. */
export function FocusPull({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: "blur(18px)", scale: 1.08 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
