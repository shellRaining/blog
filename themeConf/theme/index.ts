import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";
import Layout from "./Layout.vue";
import Tags from "./Tags/Tags.vue";
import Gallery from "./Viewer/Gallery.vue";
// import Book from "./Book/Book.vue";
import CodeRunner from "./CodeRunner/CodeRunner.vue";

import "./fonts.css";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("Tags", Tags);
    app.component("Gallery", Gallery);
    // app.component("Book", Book);
    app.component("CodeRunner", CodeRunner);
  },
} satisfies Theme;
