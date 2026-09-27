// `npm run media` — converts everything dropped into media/ (any subfolder) into web-ready files.
//   videos → public/media/<id>/ (HLS ladder, MP4 fallback, hover preview, poster)
//   photos → public/media/<id>/ (AVIF/WebP/JPEG responsive set + full JPEG)
// The id is the file name without extension (slugified).
// Writes src/content/media-manifest.json. Unchanged files are skipped.
// Entries are never removed automatically; pass --prune to drop ones with no raw file.
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { PHOTO_EXT, VIDEO_EXT, slugify } from "./ladder.mjs";
import { processImage } from "./photo.mjs";
import { hashFile } from "./util.mjs";
import { processVideo } from "./video.mjs";

const ROOT = new URL("../../", import.meta.url).pathname;
const RAW = join(ROOT, "media");
const OUT = join(ROOT, "public/media");
const MANIFEST = join(ROOT, "src/content/media-manifest.json");
const prune = process.argv.includes("--prune");
const force = process.argv.includes("--force");

async function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else out.push({ file: entry.name, path, ext: extname(entry.name).toLowerCase() });
  }
  return out;
}

const manifest = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, "utf8")) : {};
const inputs = [];
for (const f of await walk(RAW)) {
  if (VIDEO_EXT.has(f.ext)) inputs.push({ ...f, kind: "video" });
  else if (PHOTO_EXT.has(f.ext)) inputs.push({ ...f, kind: "image" });
  else console.warn(`  ✗ skipped ${f.file}: unsupported file type`);
}
inputs.sort((a, b) => a.file.localeCompare(b.file));

const seen = new Map();
const failures = [];
for (const input of inputs) {
  const id = slugify(input.file);
  if (seen.has(id)) {
    failures.push(`${input.file}: id "${id}" already used by ${seen.get(id)} — rename one of them`);
    continue;
  }
  seen.set(id, input.file);
  const hash = await hashFile(input.path);
  if (!force && manifest[id]?.hash === hash && existsSync(join(OUT, id))) {
    console.log(`• ${id} unchanged`);
    continue;
  }
  console.log(`▶ ${id} (${input.kind})`);
  try {
    const outDir = join(OUT, id);
    let entry;
    if (input.kind === "video") {
      entry = await processVideo(input.path, outDir, id);
    } else {
      await rm(outDir, { recursive: true, force: true });
      entry = { type: "image", ...(await processImage(input.path, outDir, id)) };
    }
    manifest[id] = { id, hash, ...entry };
    console.log(`✓ ${id}`);
  } catch (err) {
    failures.push(`${input.file}: ${err.message.split("\n")[0]}`);
  }
}

if (prune) {
  for (const id of Object.keys(manifest)) {
    if (!seen.has(id)) {
      delete manifest[id];
      await rm(join(OUT, id), { recursive: true, force: true });
      console.log(`− pruned ${id}`);
    }
  }
}

await mkdir(join(ROOT, "src/content"), { recursive: true });
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");
console.log(`\nManifest: ${Object.keys(sorted).length} items → src/content/media-manifest.json`);
if (failures.length) {
  console.error(`\n${failures.length} file(s) could not be processed:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
