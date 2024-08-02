<script setup lang="ts">
import { ref, onMounted } from "vue";
import { data } from "../loader/gallery.data.ts";
import Album from "./Album.vue";

const visibleAlbums = ref<Set<string>>(new Set());
const mainEl = ref<HTMLElement | null>();

onMounted(() => {
  if (!mainEl.value) return;

  const sectionElements = mainEl.value.querySelectorAll("section");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const albumName = entry.target.getAttribute("data-album");
          if (albumName) {
            visibleAlbums.value.add(albumName);
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0 },
  );
  sectionElements.forEach((el) => observer.observe(el));
});
</script>

<template>
  <main ref="mainEl">
    <section
      v-for="(collection, albumName) in data"
      :key="albumName"
      :data-album="albumName"
    >
      <h2>{{ albumName }}</h2>
      <Album
        :should-load="visibleAlbums.has(albumName)"
        :album-name="albumName"
        :collection="collection"
      />
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
