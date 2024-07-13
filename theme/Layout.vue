<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import Page from "./Home/Home.vue";
import Title from "./Doc/Title.vue";
import Gallery from "./Viewer/Gallery.vue";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #doc-before>
      <Title />
      <Gallery />
    </template>

    <template #home-features-after><Page /></template>
  </Layout>
</template>
