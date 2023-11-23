<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import Hero from "./Hero/Hero.vue";
import Page from "./Page/PostsLists.vue";
import Gallery from './Gallery/Gallery.vue'


const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #home-hero-before><Hero /></template>
    <template #home-hero-after><Gallery /></template>
    <template #home-features-after> <Page /></template>
  </Layout>
</template>

<style scoped></style>
