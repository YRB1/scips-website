// Builds brand duotone versions of every photo in src/_data/photos.json.
// Shadows map to deep green, highlights to warm cream. Output is cached in .cache/duotone.
import sharp from "sharp";
import { mkdirSync, existsSync, readFileSync } from "node:fs";

const SHADOW = [0x14, 0x28, 0x1f];
const LIGHT = [0xf6, 0xef, 0xe2];
const OUT = ".cache/duotone";

export async function buildDuotones() {
  const photos = JSON.parse(readFileSync("src/_data/photos.json", "utf8"));
  mkdirSync(OUT, { recursive: true });
  await Promise.all(Object.keys(photos).map(async (id) => {
    const out = `${OUT}/${id}.jpg`;
    if (existsSync(out)) return;
    const { data, info } = await sharp(photos[id].src)
      .greyscale()
      .normalise({ lower: 1, upper: 99 })
      .linear(1.08, -8)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const rgb = Buffer.alloc(info.width * info.height * 3);
    for (let i = 0; i < data.length; i++) {
      const t = data[i] / 255;
      rgb[i * 3] = SHADOW[0] + (LIGHT[0] - SHADOW[0]) * t;
      rgb[i * 3 + 1] = SHADOW[1] + (LIGHT[1] - SHADOW[1]) * t;
      rgb[i * 3 + 2] = SHADOW[2] + (LIGHT[2] - SHADOW[2]) * t;
    }
    await sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } })
      .jpeg({ quality: 90 })
      .toFile(out);
  }));
}
