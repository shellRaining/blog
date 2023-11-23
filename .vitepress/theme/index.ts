import DefaultTheme from 'vitepress/theme-without-fonts'
import Layout from "./Layout.vue";

import './fonts.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({}) {},
};
