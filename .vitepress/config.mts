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
      provider: "local",
      // provider: "algolia",
      // options: {
      //   appId: "3UPZ027ZPM",
      //   apiKey: "60a4d994ae4c510bf9a953739b9fe13f",
      //   indexName: "shellRaining_blog",
      // },
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
  sitemap:{
    hostname: "https://blog-shell-raining.vercel.app"
  },
  markdown: {
    config: (md) => {
      md.use(markdownItSub);
      md.use(markdownItWikilinksFn());
    },
  },
});
