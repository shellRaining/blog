import fs from "fs";
import path from "path";
import toml from "@iarna/toml";
import axios from "axios";
import sharp from "sharp";
import { encode } from "blurhash";

async function loadImage(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return sharp(response.data);
}

async function encodeImageToBlurhash(image) {
  const { data, info } = await image
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: "inside" })
    .toBuffer({ resolveWithObject: true });

  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
}

async function updateEntryWithBlurhash(entry) {
  if (!entry.blurhash) {
    console.log(`Generating blurhash for ${entry.title}...`);
    const image = await loadImage(entry.image_url);
    entry.blurhash = await encodeImageToBlurhash(image);
    console.log(`Blurhash generated: ${entry.blurhash}`);
  }
  return entry;
}

async function processTomlFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const data = toml.parse(content);

  const updatedEntries = await Promise.all(
    data.entry.map(updateEntryWithBlurhash),
  );

  data.entry = updatedEntries;

  const updatedContent = toml.stringify(data);
  fs.writeFileSync(filePath, updatedContent);

  console.log("TOML file updated successfully!");
}

// Usage
const tomlFilePath = path.join(import.meta.dirname, "./diary.toml");
processTomlFile(tomlFilePath).catch(console.error);
