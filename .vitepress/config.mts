import { defineConfig } from "vitepress";

export default defineConfig({
  title: "blog",
  description: "A VitePress Site",
  themeConfig: {
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
