import { createContentLoader } from "vitepress";
import type { ContentData } from "vitepress";

declare const data: ContentData[];

export type BlogPost = ContentData;
export { data };

export default createContentLoader("gallery/**/*.md");
