import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";
import Layout from "./Layout.vue";
import Gallery from "./Gallery/Gallery.vue";
import PlaygroundViewer from "./components/PlaygroundViewer.vue";

import "./styles/custom.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("Gallery", Gallery);
    app.component("PlaygroundViewer", PlaygroundViewer);
  },
} satisfies Theme;
