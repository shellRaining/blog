<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import Title from "./Doc/Title.vue";
import Gallery from "./Viewer/Gallery.vue";
import Home from "./Home/Home.vue";
import AppearanceSwitcher from "./Home/AppearanceSwitcher.vue";

const { Layout } = DefaultTheme;
</script>

<template>
  <ClientOnly> <AppearanceSwitcher /> </ClientOnly>
  <Layout>
    <template #doc-before>
      <Title />
      <Gallery />
    </template>

    <template #home-features-after>
      <Home />
    </template>
  </Layout>
</template>
