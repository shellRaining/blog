import { defineConfig } from "vitepress";

export default defineConfig({
  title: "blog",
  description: "A VitePress Site",
  themeConfig: {
    logo: "https://raw.githubusercontent.com/shellRaining/img/main/head/keqing.jpeg",
    search: {
      provider: "local",
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
      // TODO: need implement
      // {
      //   text: "📃Archives",
      //   link: "/archives",
      // },
    ],
  },
});
