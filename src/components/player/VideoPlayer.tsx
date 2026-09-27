"use client";
import type Hls from "hls.js";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { mediaUrl, type VideoAsset } from "@/lib/media";
import { SPEEDS, clamp, formatTime, keyToAction, stepSpeed } from "@/lib/player";
import { Icon } from "./Icons";
import styles from "./VideoPlayer.module.css";

type Level = { index: number; label: string; height: number };
type Menu = null | "speed" | "quality";

type Props = { video: VideoAsset; title: string; autoPlay?: boolean };

const shortSide = (w: number, h: number) => Math.min(w, h);

export function VideoPlayer({ video, title, autoPlay = false }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const el = useRef<HTMLVideoElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const hls = useRef<Hls | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastTap = useRef({ t: 0, x: 0 });
  const flashId = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(video.duration);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [loop, setLoop] = useState(false);
  const [levels, setLevels] = useState<Level[]>([]);
  const [level, setLevel] = useState(-1); // -1 = auto
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [canPip, setCanPip] = useState(false);
  const [showUi, setShowUi] = useState(true);
  const [menu, setMenu] = useState<Menu>(null);
  const [hover, setHover] = useState<{ x: number; t: number } | null>(null);
  const [flash, setFlash] = useState<{ key: number; text: string } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // PiP support is only knowable in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanPip("pictureInPictureEnabled" in document && document.pictureInPictureEnabled);
  }, []);

  // ---- engine: hls.js (MSE / ManagedMediaSource) → native HLS → progressive MP4
  useEffect(() => {
    const v = el.current!;
    const src = mediaUrl(video.hls);
    const mp4 = mediaUrl(video.mp4);
    let destroyed = false;

    (async () => {
      const { default: Hls } = await import("hls.js");
      if (destroyed) return;
      if (Hls.isSupported()) {
        const h = new Hls({ startLevel: -1, capLevelToPlayerSize: false, maxBufferLength: 30 });
        hls.current = h;
        h.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
          setLevels(
            data.levels
              .map((l, index) => ({ index, height: shortSide(l.width, l.height), label: `${shortSide(l.width, l.height)}p` }))
              .sort((a, b) => b.height - a.height),
          );
        });
        h.on(Hls.Events.LEVEL_SWITCHED, (_e, d) => setActiveLevel(d.level));
        h.on(Hls.Events.ERROR, (_e, d) => {
          if (!d.fatal) return;
          if (d.type === Hls.ErrorTypes.NETWORK_ERROR) h.startLoad();
          else if (d.type === Hls.ErrorTypes.MEDIA_ERROR) h.recoverMediaError();
          else {
            h.destroy();
            hls.current = null;
            setLevels([]);
            v.src = mp4;
          }
        });
        h.loadSource(src);
        h.attachMedia(v);
      } else if (v.canPlayType("application/vnd.apple.mpegurl")) {
        v.src = src; // Safari manages quality itself (Auto only)
      } else {
        v.src = mp4;
      }
      if (autoPlay) v.play().catch(() => {});
    })();

    return () => {
      destroyed = true;
      hls.current?.destroy();
      hls.current = null;
      v.removeAttribute("src");
      v.load();
    };
  }, [video, autoPlay, attempt]);

  // ---- controls visibility
  const poke = useCallback(() => {
    setShowUi(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!el.current?.paused) {
        setShowUi(false);
        setMenu(null);
      }
    }, 2600);
  }, []);
  // ---- media events
  useEffect(() => {
    const v = el.current!;
    let raf = 0;
    const tick = () => {
      setTime(v.currentTime);
      raf = requestAnimationFrame(tick);
    };
    const on: Record<string, () => void> = {
      play: () => {
        setPlaying(true);
        setStarted(true);
        poke();
        raf = requestAnimationFrame(tick);
      },
      pause: () => {
        setPlaying(false);
        cancelAnimationFrame(raf);
        setTime(v.currentTime);
      },
      ended: () => setPlaying(false),
      timeupdate: () => setTime(v.currentTime),
      durationchange: () => Number.isFinite(v.duration) && setDuration(v.duration),
      progress: () => {
        const b = v.buffered;
        for (let i = 0; i < b.length; i++) if (b.start(i) <= v.currentTime + 0.5) setBuffered(b.end(i));
      },
      waiting: () => setWaiting(true),
      playing: () => setWaiting(false),
      canplay: () => setWaiting(false),
      volumechange: () => {
        setVolume(v.volume);
        setMuted(v.muted);
      },
      ratechange: () => setRate(v.playbackRate),
      error: () => {
        if (!hls.current) setError(true);
      },
    };
    for (const [k, fn] of Object.entries(on)) v.addEventListener(k, fn);
    return () => {
      cancelAnimationFrame(raf);
      for (const [k, fn] of Object.entries(on)) v.removeEventListener(k, fn);
    };
  }, [poke]);

  // ---- theatre mode: dim the rest of the page while playing
  useEffect(() => {
    const root = document.documentElement;
    if (playing) root.dataset.theatre = "on";
    else delete root.dataset.theatre;
    return () => {
      delete root.dataset.theatre;
    };
  }, [playing]);

  useEffect(() => {
    const fs = () =>
      setFullscreen(
        Boolean(document.fullscreenElement ?? (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement),
      );
    document.addEventListener("fullscreenchange", fs);
    document.addEventListener("webkitfullscreenchange", fs);
    return () => {
      document.removeEventListener("fullscreenchange", fs);
      document.removeEventListener("webkitfullscreenchange", fs);
    };
  }, []);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  // ---- actions
  const say = (text: string) => setFlash({ key: ++flashId.current, text });
  const toggle = useCallback(() => {
    const v = el.current!;
    if (v.paused || v.ended) v.play().catch(() => {});
    else v.pause();
  }, []);
  const seekTo = (t: number) => {
    const v = el.current!;
    v.currentTime = clamp(t, 0, duration || v.duration || 0);
    setTime(v.currentTime);
  };
  const setVol = (x: number) => {
    const v = el.current!;
    v.volume = clamp(x, 0, 1);
    v.muted = v.volume === 0;
  };
  const setSpeed = (s: number) => {
    el.current!.playbackRate = s;
    say(`${s}×`);
  };
  const chooseLevel = (i: number) => {
    setLevel(i);
    if (hls.current) hls.current.currentLevel = i;
    setMenu(null);
  };
  const toggleFullscreen = () => {
    const w = wrap.current as HTMLDivElement & { webkitRequestFullscreen?: () => void };
    const v = el.current as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
    const d = document as Document & { webkitExitFullscreen?: () => void; webkitFullscreenElement?: Element };
    if (document.fullscreenElement || d.webkitFullscreenElement) {
      (document.exitFullscreen ?? d.webkitExitFullscreen)?.call(document);
    } else if (w.requestFullscreen) w.requestFullscreen().catch(() => {});
    else if (w.webkitRequestFullscreen) w.webkitRequestFullscreen();
    else v.webkitEnterFullscreen?.(); // iPhone: Apple's native player
  };
  const togglePip = async () => {
    const v = el.current!;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await v.requestPictureInPicture();
    } catch {}
  };

  const onKey = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[role=menu]")) return;
    if (target instanceof HTMLInputElement && e.key.startsWith("Arrow")) return;
    const a = keyToAction(e.key);
    if (!a) return;
    if (e.key === " " && target instanceof HTMLButtonElement) return; // let buttons handle space
    e.preventDefault();
    poke();
    const v = el.current!;
    switch (a.type) {
      case "toggle":
        toggle();
        break;
      case "seekBy":
        seekTo(v.currentTime + a.seconds);
        say(`${a.seconds > 0 ? "+" : "−"}${Math.abs(a.seconds)}s`);
        break;
      case "seekPercent":
        seekTo((duration * a.percent) / 100);
        break;
      case "volumeBy":
        setVol(v.volume + a.delta);
        say(`Volume ${Math.round(clamp(v.volume + a.delta, 0, 1) * 100)}%`);
        break;
      case "mute":
        v.muted = !v.muted;
        break;
      case "fullscreen":
        toggleFullscreen();
        break;
      case "speed":
        setSpeed(stepSpeed(v.playbackRate, a.dir));
        break;
    }
  };

  // ---- seek bar (mouse, touch, pen)
  const ratioAt = (clientX: number) => {
    const r = bar.current!.getBoundingClientRect();
    return clamp((clientX - r.left) / r.width, 0, 1);
  };
  const onBarDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    seekTo(ratioAt(e.clientX) * duration);
  };
  const onBarMove = (e: React.PointerEvent) => {
    const ratio = ratioAt(e.clientX);
    setHover({ x: ratio * 100, t: ratio * duration });
    if (e.currentTarget.hasPointerCapture(e.pointerId)) seekTo(ratio * duration);
  };

  // ---- taps on the picture: click toggles; touch double-tap seeks ±10s
  const onStageUp = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") {
      toggle();
      return;
    }
    const now = e.timeStamp;
    const r = wrap.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    if (now - lastTap.current.t < 300) {
      const dir = x < 0.5 ? -10 : 10;
      seekTo(el.current!.currentTime + dir);
      say(dir > 0 ? "+10s" : "−10s");
      lastTap.current.t = 0;
    } else {
      lastTap.current = { t: now, x };
      if (!started) toggle();
      else if (uiVisible) setShowUi(false);
      else poke();
    }
  };

  const uiVisible = !playing || showUi;
  const pct = duration ? (time / duration) * 100 : 0;
  const bufPct = duration ? (buffered / duration) * 100 : 0;
  const activeLabel = levels.find((l) => l.index === activeLevel)?.label;
  const aspect = `${video.width} / ${video.height}`;

  return (
    <div
      ref={wrap}
      className={`${styles.player} ${fullscreen ? styles.fs : ""} ${uiVisible ? "" : styles.idle}`}
      style={{ "--aspect": aspect } as React.CSSProperties}
      tabIndex={0}
      role="region"
      aria-label={`Video player: ${title}`}
      onKeyDown={onKey}
      onPointerMove={poke}
      data-testid="player"
    >
      <video
        ref={el}
        className={styles.video}
        poster={mediaUrl(video.poster.full)}
        playsInline
        preload="metadata"
        loop={loop}
        crossOrigin="anonymous"
        onPointerUp={onStageUp}
        data-cursor={playing ? undefined : "Play"}
      />

      <AnimatePresence>
        {!started && !error && (
          <motion.button
            className={styles.bigPlay}
            onClick={toggle}
            aria-label={`Play ${title}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            data-magnetic
          >
            <Icon name="play" />
          </motion.button>
        )}
      </AnimatePresence>

      {waiting && started && <div className={styles.spinner} role="status" aria-label="Loading" />}

      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash.key}
            className={styles.flash}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onAnimationComplete={() => setTimeout(() => setFlash((f) => (f?.key === flash.key ? null : f)), 500)}
          >
            {flash.text}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className={styles.error} role="alert">
          <p>This video couldn&apos;t load.</p>
          <button onClick={() => { setError(false); setAttempt((a) => a + 1); }}>Try again</button>
        </div>
      )}

      <div className={styles.controls} aria-hidden={!uiVisible}>
        <div
          ref={bar}
          className={styles.bar}
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
          onPointerDown={onBarDown}
          onPointerMove={onBarMove}
          onPointerLeave={() => setHover(null)}
          data-testid="seek"
        >
          <div className={styles.track}>
            <div className={styles.buffered} style={{ width: `${bufPct}%` }} />
            <div className={styles.progress} style={{ width: `${pct}%` }} />
          </div>
          <div className={styles.knob} style={{ left: `${pct}%` }} />
          {hover && (
            <div className={styles.tip} style={{ left: `${hover.x}%` }}>
              {formatTime(hover.t)}
            </div>
          )}
        </div>

        <div className={styles.row}>
          <button className={styles.btn} onClick={toggle} aria-label={playing ? "Pause" : "Play"} data-testid="toggle">
            <Icon name={playing ? "pause" : "play"} />
          </button>
          <div className={styles.volume}>
            <button className={styles.btn} onClick={() => (el.current!.muted = !el.current!.muted)} aria-label={muted ? "Unmute" : "Mute"} data-testid="mute">
              <Icon name={muted || volume === 0 ? "muted" : volume < 0.5 ? "volLow" : "vol"} />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => setVol(Number(e.target.value))}
              aria-label="Volume"
              className={styles.range}
              style={{ "--v": `${(muted ? 0 : volume) * 100}%` } as React.CSSProperties}
            />
          </div>
          <span className={styles.time} data-testid="time">
            {formatTime(time)} <span>/ {formatTime(duration)}</span>
          </span>
          <span className={styles.spacer} />

          <div className={styles.menuWrap}>
            <button className={`${styles.btn} ${styles.textBtn}`} onClick={() => setMenu(menu === "speed" ? null : "speed")} aria-haspopup="menu" aria-expanded={menu === "speed"} aria-label={`Playback speed ${rate}×`} data-testid="speed">
              {rate}×
            </button>
            {menu === "speed" && (
              <div className={styles.menu} role="menu" aria-label="Playback speed">
                {SPEEDS.map((s) => (
                  <button key={s} role="menuitemradio" aria-checked={rate === s} onClick={() => { setSpeed(s); setMenu(null); }}>
                    {s === 1 ? "Normal" : `${s}×`}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.menuWrap}>
            <button className={`${styles.btn} ${styles.textBtn}`} onClick={() => setMenu(menu === "quality" ? null : "quality")} aria-haspopup="menu" aria-expanded={menu === "quality"} aria-label="Quality" data-testid="quality">
              <Icon name="hd" />
              <span className={styles.qLabel}>{level === -1 ? `Auto${activeLabel ? ` · ${activeLabel}` : ""}` : levels.find((l) => l.index === level)?.label}</span>
            </button>
            {menu === "quality" && (
              <div className={styles.menu} role="menu" aria-label="Quality">
                {levels.length === 0 && <p className={styles.menuNote}>Auto (set by your browser)</p>}
                {levels.map((l, i) => (
                  <button key={l.index} role="menuitemradio" aria-checked={level === l.index} onClick={() => chooseLevel(l.index)}>
                    {l.label}
                    {i === 0 && <em>Original</em>}
                  </button>
                ))}
                {levels.length > 0 && (
                  <button role="menuitemradio" aria-checked={level === -1} onClick={() => chooseLevel(-1)}>
                    Auto
                  </button>
                )}
              </div>
            )}
          </div>

          <button className={`${styles.btn} ${loop ? styles.on : ""}`} onClick={() => setLoop((l) => !l)} aria-pressed={loop} aria-label="Loop">
            <Icon name="loop" />
          </button>
          {canPip && (
            <button className={styles.btn} onClick={togglePip} aria-label="Picture in picture">
              <Icon name="pip" />
            </button>
          )}
          <button className={styles.btn} onClick={toggleFullscreen} aria-label={fullscreen ? "Exit full screen" : "Full screen"} data-testid="fullscreen">
            <Icon name={fullscreen ? "shrink" : "expand"} />
          </button>
        </div>
      </div>
    </div>
  );
}
