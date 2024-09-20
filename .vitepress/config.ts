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
        apiKey: "819b70a09dc27f1cece22a43c2845038",
        indexName: "shellraining",
      },
    },
    outline: "deep",
    nav: [
      { text: "🎨 gallery", link: "/gallery.html" },
      // {
      //   text: "🛝 playground",
      //   link: "/playground",
      // },
    ],
  },
  appearance: false,
  head: [
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
    ],
    ["link", { rel: "manifest", href: "/site.webmanifest" }],
    [
      "link",
      { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" },
    ],
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
    hostname: "https://shellraining.xyz",
  },
  async transformPageData(pageData, ctx) {
    await injectVersions(pageData, ctx);
  },
});
