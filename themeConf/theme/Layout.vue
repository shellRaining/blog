<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import Hero from "./Hero/Hero.vue";
import Page from "./Home/PostsLists.vue";
import Title from "./Doc/Title.vue";
import Category from "./Doc/Category.vue";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #doc-before>
      <Title />
      <Category />
    </template>
    <template #home-hero-before><Hero /></template>
    <template #home-features-after> <Page /></template>
  </Layout>
</template>

<style scoped></style>
