import { defineConfig } from "vitepress";
import markdownItSub from "markdown-it-sub";
import markdownItWikilinksFn from "markdown-it-wikilinks";

export default defineConfig({
  title: "blog",
  lang: "zh-cn",
  description: "A VitePress Site",
  themeConfig: {
    logo: { src: "favicon.ico", width: 24, height: 24 },
    search: {
      // provider: "local",
      provider: "algolia",
      options: {
        appId: "HXS18HBH21",
        apiKey: "eb2bff1bf9a484c2528c39569c22dd27",
        indexName: "shellraining",
      },
    },
    nav: [
      {
        text: "🏡Blogs",
        link: "/",
      },
      {
        text: "🔖Tags",
        link: "/tags",
      },
      {
        text: "📃Archive",
        link: "/archive",
      },
    ],
    postsPerPage: 10,
  },
  markdown: {
    config: (md) => {
      md.use(markdownItSub);
      md.use(markdownItWikilinksFn());
    },
  },
});
