import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";
import Layout from "./Layout.vue";
import Gallery from "./Gallery/Gallery.vue";

import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({app}) {
    app.component("Gallery", Gallery)
  },
} satisfies Theme;
