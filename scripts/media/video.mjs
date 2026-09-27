import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { buildLadder } from "./ladder.mjs";
import { processImage } from "./photo.mjs";
import { log, probe, run } from "./util.mjs";

const SEGMENT_SECONDS = 6;
const COMMON = ["-hide_banner", "-y", "-loglevel", "error"];
// Never publish source metadata (GPS location, device, creation time).
const STRIP = ["-map_metadata", "-1", "-map_chapters", "-1"];
const H264 = ["-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p"];

/** HLS: every rung in one pass, aligned keyframes so the player can switch cleanly. */
async function encodeHls(src, outDir, info, rungs) {
  const n = rungs.length;
  const split = `[0:v]split=${n}${rungs.map((_, i) => `[v${i}]`).join("")}`;
  const scales = rungs.map((r, i) => `[v${i}]scale=${r.width}:${r.height}:flags=lanczos,setsar=1[v${i}o]`);
  const args = [...COMMON, "-i", src, "-filter_complex", [split, ...scales].join(";")];
  rungs.forEach((r, i) => {
    args.push("-map", `[v${i}o]`);
    args.push(`-c:v:${i}`, "libx264", `-b:v:${i}`, `${r.videoKbps}k`, `-maxrate:v:${i}`, `${Math.round(r.videoKbps * 1.25)}k`, `-bufsize:v:${i}`, `${r.videoKbps * 2}k`);
    if (info.hasAudio) args.push("-map", "0:a:0", `-c:a:${i}`, "aac", `-b:a:${i}`, `${r.audioKbps}k`, "-ac", "2");
  });
  const varMap = rungs.map((r, i) => (info.hasAudio ? `v:${i},a:${i},name:${r.label}` : `v:${i},name:${r.label}`)).join(" ");
  args.push(
    ...STRIP,
    "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p", "-sc_threshold", "0",
    "-force_key_frames", `expr:gte(t,n_forced*${SEGMENT_SECONDS / 3})`,
    "-f", "hls", "-hls_time", String(SEGMENT_SECONDS), "-hls_playlist_type", "vod",
    "-hls_segment_type", "fmp4", "-hls_flags", "independent_segments",
    "-hls_segment_filename", join(outDir, "hls/%v/seg-%04d.m4s"),
    "-master_pl_name", "master.m3u8", "-var_stream_map", varMap,
    join(outDir, "hls/%v/index.m3u8"),
  );
  await run("ffmpeg", args);
}

async function encodeMp4(src, out, rung, info, { seconds, from = 0, audio = true, crf = 21 } = {}) {
  const args = [...COMMON];
  if (from) args.push("-ss", String(from));
  args.push("-i", src);
  if (seconds) args.push("-t", String(seconds));
  args.push("-vf", `scale=${rung.width}:${rung.height}:flags=lanczos,setsar=1`, ...H264, "-crf", String(crf));
  // Cap the bitrate so the fallback is never bigger than the stream it backs up.
  args.push("-maxrate", `${Math.round(rung.videoKbps * 1.5)}k`, "-bufsize", `${rung.videoKbps * 3}k`, ...STRIP);
  if (audio && info.hasAudio) args.push("-c:a", "aac", "-b:a", "128k", "-ac", "2");
  else args.push("-an");
  args.push("-movflags", "+faststart", out);
  await run("ffmpeg", args);
}

export async function processVideo(src, outDir, id) {
  const info = await probe(src);
  if (info.hdr) log(`⚠ ${id}: HDR source — converted to SDR (colours may shift slightly)`);
  const rungs = buildLadder(info.width, info.height);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(join(outDir, "hls"), { recursive: true });

  log(`${id}: HLS ${rungs.map((r) => r.label).join(" / ")}`);
  await encodeHls(src, outDir, info, rungs);

  const fallback = rungs.find((r) => Math.min(r.width, r.height) <= 720) ?? rungs[rungs.length - 1];
  log(`${id}: MP4 fallback ${fallback.label}`);
  await encodeMp4(src, join(outDir, "fallback.mp4"), fallback, info);

  const previewRung = rungs.find((r) => Math.min(r.width, r.height) <= 480) ?? rungs[rungs.length - 1];
  const start = info.duration > 12 ? info.duration * 0.1 : 0;
  log(`${id}: hover preview`);
  await encodeMp4(src, join(outDir, "preview.mp4"), previewRung, info, {
    from: start, seconds: Math.min(6, info.duration || 6), audio: false, crf: 27,
  });

  const frame = join(outDir, "poster-src.png");
  await run("ffmpeg", [...COMMON, "-ss", String(start), "-i", src, "-frames:v", "1", ...STRIP, frame]);
  const poster = await processImage(frame, outDir, id, { name: "poster" });
  await rm(frame);

  return {
    type: "video",
    width: info.width,
    height: info.height,
    duration: Math.round(info.duration * 100) / 100,
    hasAudio: info.hasAudio,
    hls: `${id}/hls/master.m3u8`,
    mp4: `${id}/fallback.mp4`,
    preview: `${id}/preview.mp4`,
    levels: rungs.map(({ width, height, label, videoKbps }) => ({ width, height, label, videoKbps })),
    poster,
  };
}
