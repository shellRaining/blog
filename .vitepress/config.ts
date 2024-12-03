import { defineConfig } from "vitepress";
import { injectVersions } from "./injectPageData";
import markdownItMark from "markdown-it-mark";
import markdownItSup from "markdown-it-sup";
import markdownItSub from "markdown-it-sub";

const APPEARANCE_KEY = "shellRaining-blog-theme";
const fontPath = "/font/LXGWWenKaiScreen.woff2";
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
    nav: [{ text: "🎨 gallery", link: "/gallery.html" }],
  },
  appearance: false,
  head: [
    [
      "link",
      { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" },
    ],
    [
      "link",
      {
        rel: "sitemap",
        type: "application/xml",
        title: "Sitemap",
        href: "/sitemap.xml",
      },
    ],
    ["link", { rel: "icon", href: "/favicon.ico" }],
    [
      "link",
      {
        rel: "preload",
        href: fontPath,
        type: "font/woff2",
        as: "font",
        crossorigin: "anonymous",
      },
    ],
    [
      "style",
      {},
      `@font-face{font-family:"LXGW WenKai Screen";src:url('${fontPath}') format("woff2");font-weight:normal;font-style:normal;font-display:swap}:root{--vp-font-family-base:"LXGW WenKai Screen",sans-serif`,
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
  cleanUrls: true,
  async transformPageData(pageData, ctx) {
    await injectVersions(pageData, ctx);
  },
  markdown: {
    config(md) {
      md.use(markdownItMark);
      md.use(markdownItSub);
      md.use(markdownItSup);
    },
  },
});
