<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { GalleryItem } from "../loader/gallery.data";
import { get, set } from "idb-keyval";

const props = defineProps<{
  albumName: string;
  collection: GalleryItem[];
}>();

const collections = props.collection.map((item) => {
  const id = item.link.split("/").pop() as string;
  return id;
});
const images = ref<{ [key: string]: string }>({});

// indexedDb operation
const reqBaseURL = "https://fragrant-queen-53fa.shellraining.workers.dev/";
async function loadImage(id: string) {
  const cachedImage = await get(id);
  if (cachedImage) {
    images.value[id] = URL.createObjectURL(cachedImage);
    return;
  }

  requestQueue.push(id);
  processQueue();
}

// request queue
const requestQueue: string[] = [];
const concurrentRequests = 6;
let activeRequests = 0;
async function processQueue() {
  if (requestQueue.length === 0 || activeRequests >= concurrentRequests) {
    return;
  }

  activeRequests++;
  const id = requestQueue.shift()!;

  try {
    const url = new URL(reqBaseURL);
    url.searchParams.append("id", id);
    const response = await fetch(url);
    const blob = await response.blob();
    await set(id, blob);
    images.value[id] = URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error loading image:", error);
  } finally {
    activeRequests--;
    processQueue();
  }
}

onMounted(() => {
  collections.forEach(loadImage);
});
</script>

<template>
  <div class="gallery">
    <div v-for="id in collections" :key="id" class="gallery-item">
      <img v-if="images[id]" :src="images[id]" :alt="'pixiv' + id" />
      <p v-else>Loading...</p>
    </div>
  </div>
  <ul v-for="item in props.collection">
    <a :href="item.link">{{ item.head }}</a>
  </ul>
</template>

<style scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.gallery-item {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
