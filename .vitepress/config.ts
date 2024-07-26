import { defineConfig } from "vitepress";
import { spawn } from "child_process";
import { join } from "path";

function getGitTimestamp(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", ["log", "--pretty='%H %ai'", file]);
    let output = "";
    child.stdout.on("data", (data) => {
      output += data;
    });
    child.on("close", () => {
      resolve(output);
    });
    child.on("error", reject);
  });
}

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
  async transformPageData(pageData, ctx) {
    const pagePath = join(ctx.siteConfig.root, pageData.filePath);
    const gitTimestamp = await getGitTimestamp(pagePath);
    const versions = gitTimestamp
      .trim()
      .split("\n")
      .map((line) => {
        line = line.slice(1, -1);
        const regex = /^(\S+)\s+(.*)$/;
        const match = line.match(regex);
        if (match) {
          const [_, hash, timestamp] = match;
          return {
            hash,
            timestamp,
          };
        }
      })
      .filter((item) => !!item);
    pageData.versions = versions;
  },
});
