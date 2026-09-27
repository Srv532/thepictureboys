// Pure helpers for the media pipeline (no I/O, unit-tested).

/** Standard HLS rungs, keyed by the short side of the frame. */
export const RUNGS = [
  { p: 2160, videoKbps: 16000, audioKbps: 192 },
  { p: 1440, videoKbps: 10000, audioKbps: 192 },
  { p: 1080, videoKbps: 6000, audioKbps: 160 },
  { p: 720, videoKbps: 3000, audioKbps: 128 },
  { p: 480, videoKbps: 1400, audioKbps: 96 },
  { p: 360, videoKbps: 800, audioKbps: 96 },
];

export const even = (n) => Math.max(2, Math.floor(n / 2) * 2);

function scaled(width, height, shortTarget) {
  const landscape = width >= height;
  const short = landscape ? height : width;
  const ratio = shortTarget / short;
  return { width: even(width * ratio), height: even(height * ratio) };
}

/**
 * Quality ladder for a source video. The top rung is always the native
 * resolution; lower standard rungs are added below it. Never upscales.
 */
export function buildLadder(width, height) {
  const short = Math.min(width, height);
  // Bitrate for an off-ladder native size scales from the nearest rung at or below it.
  const base = RUNGS.find((r) => r.p <= short) ?? RUNGS[RUNGS.length - 1];
  const native = {
    width: even(width),
    height: even(height),
    label: `${even(short)}p`,
    videoKbps: Math.round(base.videoKbps * (short / base.p)),
    audioKbps: base.audioKbps,
  };
  const lower = RUNGS.filter((r) => r.p < even(short)).map((r) => ({
    ...scaled(width, height, r.p),
    label: `${r.p}p`,
    videoKbps: r.videoKbps,
    audioKbps: r.audioKbps,
  }));
  return [native, ...lower];
}

export const PHOTO_WIDTHS = [640, 1280, 1920, 2560];

export function photoWidths(sourceWidth) {
  const widths = PHOTO_WIDTHS.filter((w) => w < sourceWidth);
  if (sourceWidth <= PHOTO_WIDTHS[PHOTO_WIDTHS.length - 1] && !PHOTO_WIDTHS.includes(sourceWidth)) {
    widths.push(sourceWidth);
  } else if (PHOTO_WIDTHS.includes(sourceWidth)) {
    widths.push(sourceWidth);
  }
  return widths.length ? widths : [sourceWidth];
}

export function slugify(filename) {
  return filename
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const VIDEO_EXT = new Set([
  ".mp4", ".mov", ".m4v", ".mkv", ".avi", ".webm", ".mts", ".m2ts", ".mxf", ".wmv", ".flv", ".3gp", ".mpg", ".mpeg", ".ts",
]);
export const PHOTO_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".avif", ".heic", ".heif", ".gif"]);
