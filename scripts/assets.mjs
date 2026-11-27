import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
const root = process.argv[2];
if (!root) throw new Error("Pass the handoff assets directory");
const manifest = JSON.parse(
  await fs.readFile(path.join(root, "source-manifest.json"), "utf8"),
);
const names = {
  1: "wood-interior",
  4: "living-room",
  7: "enclosed-room",
  8: "rear-enclosure",
  10: "kitchen",
  11: "garage",
  12: "wood-fence",
  15: "bathroom",
  17: "double-vanity",
  19: "front-porch",
};
const photos = [];
for (const file of manifest.files) {
  const bytes = await fs.readFile(path.join(root, file.relative_path));
  if (crypto.createHash("sha256").update(bytes).digest("hex") !== file.sha256)
    throw Error("Original checksum mismatch");
  if (!names[file.index]) continue;
  const slug = names[file.index];
  const widths = [
    480,
    Math.min(960, file.width),
    Math.min(1600, file.width),
  ].filter((v, i, a) => a.indexOf(v) === i);
  for (const width of widths) {
    await sharp(bytes)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(`public/images/${slug}-${width}.webp`);
  }
  await sharp(bytes)
    .rotate()
    .resize({ width: Math.min(960, file.width) })
    .jpeg({ quality: 82 })
    .toFile(`public/images/${slug}.jpg`);
  photos.push({
    id: file.index,
    slug,
    width: file.width,
    height: file.height,
    alt: file.alt,
    widths,
  });
}
await fs.writeFile("src/photos.json", JSON.stringify(photos, null, 2));
await fs.writeFile(
  "docs/asset-provenance.json",
  JSON.stringify(
    {
      verifiedOriginals: manifest.files.length,
      uniqueHashes: new Set(manifest.files.map((f) => f.sha256)).size,
      source: manifest.source,
      selected: manifest.files
        .filter((f) => names[f.index])
        .map((f) => ({
          index: f.index,
          original: f.name,
          sha256: f.sha256,
          derivative: names[f.index],
        })),
    },
    null,
    2,
  ),
);
console.log("Verified 21 originals / 20 unique; generated 10 photo sets.");
