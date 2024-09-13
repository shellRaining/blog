<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { get, set } from "idb-keyval";
import SkeletonLoader from "./SkeletonLoader.vue";
import BlurImage from "./BlurImage.vue";
import { ImgDiaryItem } from "../loader/gallery.data";

const { shouldLoad, imgDiaryItem } = defineProps<{
  imgDiaryItem: ImgDiaryItem;
  shouldLoad: boolean;
}>();
const emit = defineEmits(["loaded"]);
const { title, image_url: fetchUrl, blurhash } = imgDiaryItem;

// the passed src is note able to use directly, should fetch data from indexedDB or network
// and then createObjectURL to display
const imageUrl = ref<string | null>(null);

async function loadImage() {
  if (!shouldLoad) return;

  try {
    const cachedImage = await get(fetchUrl);
    if (cachedImage) {
      imageUrl.value = URL.createObjectURL(cachedImage);
      emit("loaded");
      return;
    }
  } catch (e) {
    console.log("Error loading cache:", e);
  }

  try {
    const response = await fetch(fetchUrl);
    const blob = await response.blob();
    await set(fetchUrl, blob);
    imageUrl.value = URL.createObjectURL(blob);
  } catch (error) {
    imageUrl.value = "/load_error.png";
  } finally {
    emit("loaded");
  }
}

onMounted(() => {
  if (shouldLoad) {
    loadImage();
  }
});

watch(
  () => shouldLoad,
  (newVal) => {
    if (newVal && !imageUrl.value) {
      loadImage();
    }
  },
);
</script>

<template>
  <img
    v-if="imageUrl"
    :src="imageUrl"
    :data-origin-src="fetchUrl"
    :alt="`image diary ${title}`"
    :title="title"
    loading="lazy"
  />
  <BlurImage v-else-if="blurhash" :blurhash="blurhash" />
  <SkeletonLoader v-else></SkeletonLoader>
</template>
