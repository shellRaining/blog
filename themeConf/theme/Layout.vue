<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import Hero from "./Hero/Hero.vue";
import Avator from './Hero/Avator.vue'
import Page from "./Home/PostsLists.vue";
import Title from "./Doc/Title.vue";
import Category from "./Doc/Category.vue";

const { Layout } = DefaultTheme;

function back() {
  history.back();
}
</script>

<template>
  <Layout>
    <template #doc-before>
      <Title />
      <Category />
    </template>
    <template #doc-after>
      <div>
        <button @click="back">cd ··</button>
      </div>
    </template>
    <template #home-hero-before><Avator /> </template>
    <template #home-hero-info><Hero /></template>
    <template #home-features-after> <Page /></template>
  </Layout>
</template>

<style scoped>
button {
  color: var(--custom-c-btn);
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  position: relative;
}

button::after {
  content: "";
  position: absolute; /* TODO: how it works? */
  width: 100%;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: var(--custom-c-btn);
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.25s ease-out;
}

button:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}
</style>
