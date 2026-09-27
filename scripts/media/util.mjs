import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

export function run(cmd, args, { quiet = true } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => {
      err += d;
      if (!quiet) process.stderr.write(d);
    });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve(out) : reject(new Error(`${cmd} exited ${code}\n${err.slice(-2000)}`)),
    );
  });
}

export function hashFile(path) {
  return new Promise((resolve, reject) => {
    const h = createHash("sha1");
    createReadStream(path)
      .on("data", (d) => h.update(d))
      .on("end", () => resolve(h.digest("hex")))
      .on("error", reject);
  });
}

export async function probe(path) {
  const json = JSON.parse(
    await run("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", path]),
  );
  const video = json.streams.find((s) => s.codec_type === "video" && s.disposition?.attached_pic !== 1);
  if (!video) throw new Error("no video stream");
  const audio = json.streams.find((s) => s.codec_type === "audio");
  // Phone footage stores rotation as metadata; ffmpeg auto-rotates, so swap dims to match output.
  const rotation = Math.abs(
    Number(video.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ?? video.tags?.rotate ?? 0),
  );
  const swap = rotation === 90 || rotation === 270;
  const [num, den] = String(video.avg_frame_rate || video.r_frame_rate || "30/1").split("/").map(Number);
  return {
    width: swap ? video.height : video.width,
    height: swap ? video.width : video.height,
    duration: Number(json.format.duration ?? video.duration ?? 0),
    fps: den ? num / den : 30,
    hasAudio: Boolean(audio),
    hdr: ["smpte2084", "arib-std-b67"].includes(video.color_transfer),
  };
}

export const log = (...a) => console.log("  ", ...a);
