import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";
import Layout from "./Layout.vue";
import Tags from "./Tags/Tags.vue";
import Gallery from "./Viewer/Gallery.vue";
import Popup from "./Popup/Popup.vue";

import "./fonts.css";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("Tags", Tags);
    app.component("Gallery", Gallery);
    app.component("Popup", Popup);
  },
} satisfies Theme;
