<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import Hero from "./Hero/Hero.vue";
import Page from "./Home/PostsLists.vue";
import Title from "./Doc/Title.vue";
import Gallery from "./Viewer/Gallery.vue";

const { Layout } = DefaultTheme;

let keystrokes: string[] = [];
document.addEventListener("keydown", (e) => {
  if (e.key.charCodeAt(0) < 97 || e.key.charCodeAt(0) > 122) {
    keystrokes = [];
    return;
  }
  keystrokes.push(e.key);
  const keys: string = keystrokes.join("");
  if (keys === "cd") {
    back();
  } else if (keys === "ga") {
    location.href = '/archive'
  } else if (keys === "gt") {
    location.href = '/tags'
  } else if (keys === 'gh') {
    location.href = '/'
  }

  if (keystrokes.length >= 2) {
    keystrokes = [];
  }
});

function back() {
  history.back();
}
</script>

<template>
  <Layout>
    <!-- doc list -->
    <template #doc-before>
      <Title />
      <!-- <Category /> -->
      <Gallery />
    </template>

    <!-- doc part -->
    <template #doc-after>
      <button @click="back" style="display: block">cd ··</button>
    </template>

    <!-- hero part -->
    <template #home-hero-before><Hero /> </template>
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
  position: absolute;
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
