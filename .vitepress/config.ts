import { defineConfig } from "vitepress";

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
    ],
    outline: "deep",
  },
  appearance: false,
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
      { id: "google-gtag" },
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-MRR1SRZVFY');`,
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
});
