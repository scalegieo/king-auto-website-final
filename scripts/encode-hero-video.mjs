import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const input = path.join(root, "public/hero/kling-fpv-scroll.mov");
const output = path.join(root, "public/hero/kling-fpv-scroll-scrub.mp4");

// System ffmpeg only (brew install ffmpeg). Not an npm dep — Vercel stays light.
const ffmpegPath = "ffmpeg";

if (!fs.existsSync(input)) {
  console.error(`Missing source video: ${input}`);
  process.exit(1);
}

console.log("Encoding scrub-friendly hero video (keyframes every ~10 frames)…");

const result = spawnSync(
  ffmpegPath,
  [
    "-y",
    "-i",
    input,
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-g",
    "1",
    "-keyint_min",
    "1",
    "-sc_threshold",
    "0",
    "-vf",
    "scale=1920:-2",
    output,
  ],
  { stdio: "inherit" }
);

if (result.status !== 0) {
  console.error(
    "ffmpeg failed. Install it locally (e.g. brew install ffmpeg) and retry."
  );
  process.exit(result.status ?? 1);
}

console.log(`Done → ${output}`);
