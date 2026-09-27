"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useMotionMode } from "@/components/motion/MotionMode";
import styles from "./HeroFilm.module.css";

const FilmPlane = dynamic(() => import("./FilmPlane"), { ssr: false });

/** Muted looping showreel rendered through the film shader (falls back to plain video / poster). */
export function HeroFilm({ src, poster }: { src: string; poster: string }) {
  const { mode, webgl, ready } = useMotionMode();
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const fade = useRef(0);
  const useGL = ready && webgl && mode !== "reduced";

  useEffect(() => {
    if (!useGL) return;
    const v = document.createElement("video");
    Object.assign(v, { src, muted: true, loop: true, playsInline: true, autoplay: true, crossOrigin: "anonymous", preload: "auto" });
    v.setAttribute("playsinline", "");
    v.setAttribute("muted", "");
    v.play().catch(() => {});
    // The texture needs a real <video> element created outside React.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVideoEl(v);
    return () => {
      v.pause();
      v.removeAttribute("src");
      v.load();
      setVideoEl(null);
    };
  }, [useGL, src]);

  useEffect(() => {
    const onScroll = () => (fade.current = Math.min(1, window.scrollY / (window.innerHeight * 1.1)));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={styles.film} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" className={styles.layer} />
      {ready && !useGL && mode !== "reduced" && (
        <video className={styles.layer} src={src} poster={poster} muted loop playsInline autoPlay />
      )}
      {useGL && videoEl && (
        <FilmPlane
          className={styles.canvas}
          source={{ kind: "video", el: videoEl }}
          fade={fade}
          pointer={mode === "desktop"}
          dpr={mode === "desktop" ? [1, 2] : [1, 1.5]}
        />
      )}
    </div>
  );
}
