import { defineConfig } from "vitepress";
import { injectVersions } from "./injectPageData";
import { withPwa } from "@vite-pwa/vitepress";
import markdownItMark from "markdown-it-mark";
import markdownItSup from "markdown-it-sup";
import markdownItSub from "markdown-it-sub";

const APPEARANCE_KEY = "shellRaining-blog-theme";
const fontPath = "/font/LXGWWenKaiScreen.woff2";
export default withPwa(
  defineConfig({
    pwa: {
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "shellRaining blog",
        short_name: "blog",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
        ],
        theme_color: "#1b1b1f",
        background_color: "#1b1b1f",
        display: "standalone",
      },
      workbox: {
        globPatterns: ["**/*.{css,js,html,svg,png,ico,txt,woff2}"],
      },
    },
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
      // ["link", { rel: "manifest", href: "/site.webmanifest" }],
      [
        "link",
        { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" },
      ],
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
  }),
);
