<script lang="ts" setup>
import { data as gallerys } from "./gallery.data.mjs";

const test = gallerys[0];
</script>

<template>
  <a :href="test.url">
    <h1 class="post-title">{{ test.frontmatter.title }}</h1>
    <p class="post-date">{{ test.frontmatter.date }}</p>
  </a>
  <a href="./Img">this is a test</a>
  <!-- <pre>{{ gallerys }}</pre> -->
</template>

<style scoped></style>
