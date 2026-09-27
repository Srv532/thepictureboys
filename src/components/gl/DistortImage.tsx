"use client";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef } from "react";
import styles from "./DistortImage.module.css";

const FilmPlane = dynamic(() => import("./FilmPlane"), { ssr: false });

/** Liquid / RGB-split shader over an image while `active` (one WebGL context at a time). */
export function DistortImage({ url, active }: { url: string; active: boolean }) {
  const hover = useRef(1);
  const source = useMemo(() => ({ kind: "image" as const, url }), [url]);
  return (
    <AnimatePresence>
      {active && (
        <motion.div className={styles.gl} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
          <FilmPlane source={source} hover={hover} intensity={0.35} dpr={[1, 1.5]} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
