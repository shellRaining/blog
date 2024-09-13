import { readFileSync } from "fs";
import { join } from "path";
import { defineLoader } from "vitepress";
import type { SiteConfig } from "vitepress";
import { load } from "js-toml";

const config: SiteConfig = (globalThis as any).VITEPRESS_CONFIG;

export interface ImgDiaryItem {
  title: string;
  date: Date;
  image_url: string;
  original_url: string;
  note: string;
  tags: string[];
  blurhash: string;
}

declare const data: ImgDiaryItem[]
export { data };

export default defineLoader({
  watch: ["gallery/*.toml"],
  async load(watchedFiles) {
    watchedFiles = watchedFiles.map((relativePath) =>
      join(config.root, relativePath),
    );

    const content = readFileSync(watchedFiles[0], "utf-8");
    const data = load(content) as { entry: ImgDiaryItem[] };
    return data.entry;
  },
});
