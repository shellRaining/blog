<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { get, set } from "idb-keyval";
import SkeletonLoader from "./SkeletonLoader.vue";

const props = defineProps<{
  id: string;
  shouldLoad: boolean;
}>();

const emit = defineEmits(["loaded"]);

const reqBaseURL = "https://fragrant-queen-53fa.shellraining.workers.dev/";
const imageUrl = ref<string | null>(null);

async function loadImage() {
  if (!props.shouldLoad) return;

  const cachedImage = await get(props.id);
  if (cachedImage) {
    imageUrl.value = URL.createObjectURL(cachedImage);
    emit("loaded");
    return;
  }

  try {
    const url = new URL(reqBaseURL);
    url.searchParams.append("id", props.id);
    const response = await fetch(url);
    const blob = await response.blob();
    await set(props.id, blob);
    imageUrl.value = URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error loading image:", error);
  } finally {
    emit("loaded");
  }
}

onMounted(() => {
  if (props.shouldLoad) {
    loadImage();
  }
});

watch(
  () => props.shouldLoad,
  (newVal) => {
    if (newVal && !imageUrl.value) {
      loadImage();
    }
  },
);
</script>

<template>
  <img v-if="imageUrl" :src="imageUrl" />
  <SkeletonLoader v-else></SkeletonLoader>
</template>
