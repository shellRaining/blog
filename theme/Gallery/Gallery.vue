<script setup lang="ts">
import { data } from "../loader/gallery.data.ts";
import Album from "./Album.vue";
</script>

<template>
  <main>
    <section v-for="(collection, albumName) in data">
      <Album :album-name="albumName" :collection="collection" />
    </section>
  </main>
</template>

<style scoped></style>
