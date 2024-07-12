import dayjs from "dayjs";
import { createContentLoader } from "vitepress";
import type { ContentData } from "vitepress";

declare const data: ContentData[];

export type BlogPost = ContentData;
export { data };

export default createContentLoader("docs/**/*.md", {
  transform(rawData) {
    return rawData.sort((a, b) => {
      const timeA = dayjs(a.frontmatter.date);
      const timeB = dayjs(b.frontmatter.date);
      return timeA.isBefore(timeB) ? 1 : -1;
    });
  },
});
