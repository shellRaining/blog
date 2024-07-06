import {
  DefaultTheme,
  UserConfig,
  defineConfig as defineDefaultConfig,
} from "vitepress";
import markdownItSub from "markdown-it-sub";
import markdownItWikilinksFn from "markdown-it-wikilinks";

function defineConfig<T extends UserConfig<DefaultTheme.Config>>(conf: T) {
  return defineDefaultConfig(conf);
}

export default defineConfig({
  title: "blog",
  lang: "zh-cn",
  description: "A VitePress Site",
  themeConfig: {
    logo: { src: "/favicon.ico", width: 24, height: 24 },
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
  head: [
    [
      "script",
      {
        async: "",
        src: "https://www.googletagmanager.com/gtag/js?id=G-MRR1SRZVFY",
      },
    ],
    [
      "script",
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-MRR1SRZVFY');`,
    ],
  ],
  sitemap: {
    hostname: "https://shellraining.top",
  },
  markdown: {
    config: (md) => {
      md.use(markdownItSub);
      md.use(markdownItWikilinksFn());
    },
  },
});
