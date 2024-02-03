import dayjs from "dayjs";
import { createContentLoader } from "vitepress";
import type { ContentData } from "vitepress";

declare const data: ContentData[];

export type BlogPost = ContentData;
export { data };

export default createContentLoader("docs/**/*.md", {
  transform(rawData) {
    return rawData.sort((a, b) => {
      // TODO: set default date for every post
      const timeA = dayjs(a.frontmatter.date);
      const timeB = dayjs(b.frontmatter.date);

      if (timeA.isBefore(timeB)) {
        return 1;
      } else if (timeA.isAfter(timeB)) {
        return -1;
      } else {
        return 0;
      }
    });
  },
});
