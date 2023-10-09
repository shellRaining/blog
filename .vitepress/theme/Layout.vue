<script setup lang="ts">
import { useData } from "vitepress";

import NOTFOUND404 from "./NOTFOUND404.vue";

// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter, page } = useData();
</script>

<template>
  <NOTFOUND404 v-if="page.isNotFound"></NOTFOUND404>
  <div v-else-if="frontmatter.home">
    <h1>{{ site.title }}</h1>
    <p>{{ site.description }}</p>
    <ul>
      <li><a href="/markdown-examples.html">Markdown Examples</a></li>
      <li><a href="/api-examples.html">API Examples</a></li>
    </ul>
  </div>
  <div v-else>
    <a href="/">Home</a>
    <Content />
  </div>
</template>

<style scoped></style>
