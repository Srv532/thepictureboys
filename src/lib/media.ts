import manifest from "@/content/media-manifest.json";

export type ImageSource = { w: number; src: string };
export type ImageAsset = {
  width: number;
  height: number;
  blurDataURL: string;
  sources: { avif: ImageSource[]; webp: ImageSource[]; jpeg: ImageSource[] };
  full: string;
};
export type VideoLevel = { width: number; height: number; label: string; videoKbps: number };
export type VideoAsset = {
  width: number;
  height: number;
  duration: number;
  hasAudio: boolean;
  hls: string;
  mp4: string;
  preview: string;
  levels: VideoLevel[];
  poster: ImageAsset;
};

type Entry = ({ type: "image" } & ImageAsset) | ({ type: "video" } & VideoAsset);
const entries = manifest as unknown as Record<string, Entry & { id: string; hash: string }>;

export const MEDIA_BASE_URL = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "/media").replace(/\/$/, "");
export const mediaUrl = (path: string) => `${MEDIA_BASE_URL}/${path}`;

function strip<T extends object>(e: T): T {
  // Never leak internal ids/hashes into rendered props.
  const { id: _id, hash: _hash, type: _type, ...rest } = e as T & { id?: string; hash?: string; type?: string };
  return rest as T;
}

export function getImage(id: string): ImageAsset {
  const e = entries[id];
  if (!e) throw new Error(`Missing media "${id}" — run \`npm run media\``);
  if (e.type === "video") return e.poster;
  return strip(e) as ImageAsset;
}

export function getVideo(id: string): VideoAsset {
  const e = entries[id];
  if (!e || e.type !== "video") throw new Error(`Missing video "${id}" — run \`npm run media\``);
  return strip(e) as VideoAsset;
}

export function hasMedia(id: string) {
  return Boolean(entries[id]);
}

/** Largest JPEG at or below `maxWidth` (for WebGL textures, OG images). */
export function jpegAtMost(img: ImageAsset, maxWidth: number) {
  const sorted = [...img.sources.jpeg].sort((a, b) => a.w - b.w);
  return mediaUrl((sorted.filter((s) => s.w <= maxWidth).pop() ?? sorted[0]).src);
}
