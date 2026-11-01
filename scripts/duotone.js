// Builds a consistent warm colour grade for every photo in src/_data/photos.json,
// so mixed-quality source photos read as one set. Output cached in .cache/graded.
// Set PHOTO_STYLE=duotone to use the green/cream duotone instead.
import sharp from "sharp";
import { mkdirSync, existsSync, readFileSync } from "node:fs";

const STYLE = process.env.PHOTO_STYLE === "duotone" ? "duotone" : "graded";
const OUT = `.cache/${STYLE}`;
export const photoCacheDir = OUT;

const SHADOW = [0x14, 0x28, 0x1f];
const LIGHT = [0xf6, 0xef, 0xe2];

async function duotone(src, out) {
  const { data, info } = await sharp(src).greyscale().normalise({ lower: 1, upper: 99 }).linear(1.08, -8).raw().toBuffer({ resolveWithObject: true });
  const rgb = Buffer.alloc(info.width * info.height * 3);
  for (let i = 0; i < data.length; i++) {
    const t = data[i] / 255;
    for (let c = 0; c < 3; c++) rgb[i * 3 + c] = SHADOW[c] + (LIGHT[c] - SHADOW[c]) * t;
  }
  await sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } }).jpeg({ quality: 90 }).toFile(out);
}

async function graded(src, out) {
  await sharp(src)
    .normalise({ lower: 1, upper: 99.5 })      // even out exposure between photos
    .modulate({ saturation: 0.78, brightness: 1.02 }) // calm loud colours (blue skies, cars)
    .recomb([                                   // warm the image, pull blue into green-grey
      [1.06, 0.02, -0.02],
      [0.0, 1.0, 0.02],
      [-0.02, 0.06, 0.88],
    ])
    .linear(0.94, 12)                            // lift blacks slightly for a softer, filmic look
    .jpeg({ quality: 90 })
    .toFile(out);
}

export async function buildDuotones() {
  const photos = JSON.parse(readFileSync("src/_data/photos.json", "utf8"));
  mkdirSync(OUT, { recursive: true });
  await Promise.all(Object.keys(photos).map(async (id) => {
    const out = `${OUT}/${id}.jpg`;
    if (existsSync(out)) return;
    await (STYLE === "duotone" ? duotone : graded)(photos[id].src, out);
  }));
}
