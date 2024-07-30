<script setup lang="ts">
import { data } from "../loader/gallery.data.ts";
import Album from "./Album.vue";
</script>

<template>
  <main>
    <section v-for="(collection, albumName) in data">
      <h2>{{albumName}}</h2>
      <Album :album-name="albumName" :collection="collection" />
    </section>
  </main>
</template>

<style scoped>
main {
  margin: 20px auto;
  max-width: 48rem;

  h2 {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  section {
    padding: 2rem;
    margin: 2rem;
    background-color: var(--vp-c-bg-soft);
  }
}
</style>
