import { defineConfig } from "vitepress";
import markdownItSub from "markdown-it-sub";
import markdownItWikilinksFn from "markdown-it-wikilinks";

export default defineConfig({
  title: "blog",
  lang: "zh-cn",
  description: "A VitePress Site",
  themeConfig: {
    logo: "https://raw.githubusercontent.com/shellRaining/img/main/head/keqing.jpeg",
    search: {
      // provider: "local",
      provider: "algolia",
      options: {
        appId: "JG14PKMURZ",
        apiKey: "efb035578911aba5198729241bfaec0e",
        indexName: "shell-raining",
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
    postsPerPage: 7,
  },
  markdown: {
    config: (md) => {
      md.use(markdownItSub);
      md.use(markdownItWikilinksFn());
    },
  },
});
