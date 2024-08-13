import { defineConfig } from "vitepress";
import { injectVersions } from "./injectPageData.ts";

const APPEARANCE_KEY = "shellRaining-blog-theme";
export default defineConfig({
  lang: "zh-cn",
  title: "shellRaining's blog",
  description: "A VitePress Site",
  vite: {
    build: {
      target: "es2020",
    },
  },
  srcExclude: ["algorithm/**/*.md", "gallery/**/*.md"],
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
    outline: "deep",
    nav: [
      { text: "🎨 gallery", link: "/gallery" },
      // {
      //   text: "🛝 playground",
      //   link: "/playground",
      // },
    ],
  },
  appearance: false,
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://cdn.bootcdn.net/ajax/libs/lxgw-wenkai-screen-webfont/1.7.0/style.min.css",
      },
    ],
    [
      "script",
      { id: "check-dark-mode" },
      `;(() => {
            const preference = localStorage.getItem('${APPEARANCE_KEY}')
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            if (!preference || preference === 'auto' ? prefersDark : preference === 'dark')
              document.documentElement.classList.add('dark')
          })()`,
    ],
  ],
  sitemap: {
    hostname: "https://shellraining.top",
  },
  async transformPageData(pageData, ctx) {
    await injectVersions(pageData, ctx);
  },
});
