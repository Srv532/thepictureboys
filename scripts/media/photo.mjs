import sharp from "sharp";
import { mkdir, rm } from "node:fs/promises";
import { extname, join } from "node:path";
import { photoWidths } from "./ladder.mjs";
import { run } from "./util.mjs";

const FORMATS = [
  { key: "avif", ext: "avif", apply: (s) => s.avif({ quality: 52, effort: 4 }) },
  { key: "webp", ext: "webp", apply: (s) => s.webp({ quality: 78 }) },
  { key: "jpeg", ext: "jpg", apply: (s) => s.jpeg({ quality: 82, mozjpeg: true }) },
];

/** Decode anything sharp can't (HEIC) to a temp JPEG via macOS `sips`. */
async function readable(src, tmpDir) {
  const ext = extname(src).toLowerCase();
  if (ext !== ".heic" && ext !== ".heif") return src;
  const out = join(tmpDir, "decoded.jpg");
  await run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "100", src, "--out", out]);
  return out;
}

/**
 * Converts one photo into responsive AVIF/WebP/JPEG sets + a full-quality JPEG.
 * `publicPath` is the URL prefix relative to MEDIA_BASE_URL (e.g. "id" or "id/poster").
 */
export async function processImage(src, outDir, publicPath, { name = "img" } = {}) {
  await mkdir(outDir, { recursive: true });
  const tmp = join(outDir, ".tmp");
  await mkdir(tmp, { recursive: true });
  try {
    const input = await readable(src, tmp);
    const base = sharp(input, { failOn: "none" }).rotate(); // honour EXIF orientation
    const meta = await base.metadata();
    const oriented = (meta.orientation ?? 1) >= 5;
    const width = oriented ? meta.height : meta.width;
    const height = oriented ? meta.width : meta.height;
    if (!width || !height) throw new Error("unreadable image");

    const sources = { avif: [], webp: [], jpeg: [] };
    for (const w of photoWidths(width)) {
      for (const f of FORMATS) {
        const file = `${name}-${w}.${f.ext}`;
        await f.apply(base.clone().resize({ width: w })).toFile(join(outDir, file));
        sources[f.key].push({ w, src: `${publicPath}/${file}` });
      }
    }
    const full = `${name}-full.jpg`;
    await base.clone().jpeg({ quality: 92, mozjpeg: true }).toFile(join(outDir, full));

    const blur = await base.clone().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
    return {
      width,
      height,
      blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
      sources,
      full: `${publicPath}/${full}`,
    };
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}
