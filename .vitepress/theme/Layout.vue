<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import Home from "./Home/Home.vue";
import Page from "./Page/Page.vue";
import Hero from "./Hero/Hero.vue";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #home-hero-before><Hero /></template>
    <template #home-features-after> <Page /></template>
  </Layout>
</template>

<style scoped></style>
