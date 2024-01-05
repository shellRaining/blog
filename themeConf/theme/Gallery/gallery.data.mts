import { createContentLoader } from "vitepress";
import type { ContentData } from "vitepress";

declare const data: ContentData[];
export { data };

export default createContentLoader("gallery/*.md", {
  includeSrc: true,
  render: true,
});
