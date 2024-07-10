import { defineConfig } from "vitepress";
import UnoCSS from 'unocss/vite'

export default defineConfig({
  title: "blog",
  lang: "zh-cn",
  description: "A VitePress Site",
  vite: {
    plugins: [UnoCSS()]
  },
  themeConfig: {
    logo: { src: "/favicon.ico", width: 24, height: 24 },
    search: {
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
      // {
      //   text: "🔖Tags",
      //   link: "/tags",
      // },
      // {
      //   text: "📃Archive",
      //   link: "/archive",
      // },
    ],
  },
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/npm/@callmebill/lxgw-wenkai-web@latest/style.css",
      },
    ],
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
});
