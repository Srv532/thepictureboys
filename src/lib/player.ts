export const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

export function stepSpeed(current: number, dir: 1 | -1) {
  const i = SPEEDS.findIndex((s) => s >= current);
  const idx = i === -1 ? SPEEDS.length - 1 : i;
  const next = SPEEDS[Math.min(SPEEDS.length - 1, Math.max(0, (SPEEDS[idx] === current ? idx : dir > 0 ? idx - 1 : idx) + dir))];
  return next;
}

export type PlayerAction =
  | { type: "toggle" }
  | { type: "seekBy"; seconds: number }
  | { type: "seekPercent"; percent: number }
  | { type: "volumeBy"; delta: number }
  | { type: "mute" }
  | { type: "fullscreen" }
  | { type: "speed"; dir: 1 | -1 };

export function keyToAction(key: string): PlayerAction | null {
  switch (key) {
    case " ":
    case "k":
    case "K":
      return { type: "toggle" };
    case "ArrowLeft":
      return { type: "seekBy", seconds: -5 };
    case "ArrowRight":
      return { type: "seekBy", seconds: 5 };
    case "j":
    case "J":
      return { type: "seekBy", seconds: -10 };
    case "l":
    case "L":
      return { type: "seekBy", seconds: 10 };
    case "ArrowUp":
      return { type: "volumeBy", delta: 0.1 };
    case "ArrowDown":
      return { type: "volumeBy", delta: -0.1 };
    case "m":
    case "M":
      return { type: "mute" };
    case "f":
    case "F":
      return { type: "fullscreen" };
    case "<":
    case ",":
      return { type: "speed", dir: -1 };
    case ">":
    case ".":
      return { type: "speed", dir: 1 };
    default:
      if (/^[0-9]$/.test(key)) return { type: "seekPercent", percent: Number(key) * 10 };
      return null;
  }
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
