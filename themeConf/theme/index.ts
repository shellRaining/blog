import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";
import Layout from "./Layout.vue";
import Tags from "./Tags/Tags.vue";
import Archive from "./Archive/Archive.vue";
import Gallery from "./Viewer/Gallery.vue";
import CodeRunner from "./CodeRunner/CodeRunner.vue";

import "./fonts.css";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("Tags", Tags);
    app.component("Archive", Archive);
    app.component("Gallery", Gallery);
    app.component("CodeRunner", CodeRunner);
  },
} satisfies Theme;
