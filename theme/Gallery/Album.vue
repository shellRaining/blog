<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { GalleryItem } from "../loader/gallery.data";
import LazyImage from "./LazyImage.vue";

const props = defineProps<{
  shouldLoad: boolean;
  albumName: string;
  collection: GalleryItem[];
}>();

const IDs = props.collection.map((item) => {
  const id = item.link.split("/").pop() as string;
  return id;
});
const maxConcurrents = 3;

const loadingQueue = ref<string[]>([...IDs]);
const activeRequests = ref(0);
const loadingStatus = ref<{ [id: string]: boolean }>(
  IDs.reduce((acc, id) => {
    acc[id] = false;
    return acc;
  }, Object.create(null)),
);

function startNextLoad() {
  if (activeRequests.value < maxConcurrents && loadingQueue.value.length > 0) {
    const id = loadingQueue.value.shift()!;
    activeRequests.value++;
    loadingStatus.value[id] = true;
  }
}

function onImageLoaded(id: string) {
  activeRequests.value--;
  loadingStatus.value[id] = false;
  startNextLoad();
}

onMounted(() => {
  for (let i = 0; i < maxConcurrents; i++) startNextLoad();
});
</script>

<template>
  <div class="items" v-if="props.shouldLoad">
    <LazyImage
      :id="id"
      :shouldLoad="loadingStatus[id]"
      v-for="id in IDs"
      :key="id"
      class="item"
      tabindex="0"
      @loaded="onImageLoaded(id)"
    />
  </div>
  <div v-else class="items"></div>
</template>

<style scoped>
.items {
  --index: calc(1vw + 1vh);
  --transition: cubic-bezier(0.1, 0.7, 0, 1);
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.4rem;
  perspective: calc(var(--index) * 70);
  min-height: calc(var(--index) * 12);

  .item {
    width: calc(var(--index) * 3);
    height: calc(var(--index) * 12);
    object-fit: cover;
    cursor: pointer;
    object-fit: cover;
    transition:
      transform 1.25s var(--transition),
      width 1.25s var(--transition);
    will-change: transform, rotateY, width;
    border: 10px solid transparent;
    margin: -10px;

    &:hover {
      transform: translateZ(calc(var(--index) * 10));
    }

    /*Right*/
    &:hover + * {
      transform: translateZ(calc(var(--index) * 8.5)) rotateY(35deg);
      z-index: -1;
    }
    &:hover + * + * {
      transform: translateZ(calc(var(--index) * 5.6)) rotateY(40deg);
      z-index: -2;
    }
    &:hover + * + * + * {
      transform: translateZ(calc(var(--index) * 2.5)) rotateY(30deg);
      z-index: -3;
    }
    &:hover + * + * + * + * {
      transform: translateZ(calc(var(--index) * 0.6)) rotateY(15deg);
      z-index: -4;
    }

    /*Left*/
    &:has(+ :hover) {
      transform: translateZ(calc(var(--index) * 8.5)) rotateY(-35deg);
    }
    &:has(+ * + :hover) {
      transform: translateZ(calc(var(--index) * 5.6)) rotateY(-40deg);
    }
    &:has(+ * + * + :hover) {
      transform: translateZ(calc(var(--index) * 2.5)) rotateY(-30deg);
    }
    &:has(+ * + * + * + :hover) {
      transform: translateZ(calc(var(--index) * 0.6)) rotateY(-15deg);
    }

    &:active,
    &:focus {
      width: 20vw;
      z-index: 100;
      transform: translateZ(calc(var(--index) * 10));
      margin: 0 0.45vw;
    }
  }
}

@media (320px <= width <= 480px) {
  .items {
    --index: calc(2vw + 2vh);
    flex-direction: column;

    .item {
      width: 80%;
      height: calc(var(--index) * 3);
      transition:
        transform 1.25s var(--transition),
        height 1.25s var(--transition);
      will-change: transform, rotateX, height;

      /*Right*/
      &:hover + * {
        transform: translateZ(calc(var(--index) * 8.5)) rotateX(-35deg);
        z-index: -1;
      }
      &:hover + * + * {
        transform: translateZ(calc(var(--index) * 5.6)) rotateX(-40deg);
        z-index: -2;
      }
      &:hover + * + * + * {
        transform: translateZ(calc(var(--index) * 2.5)) rotateX(-30deg);
        z-index: -3;
      }
      &:hover + * + * + * + * {
        transform: translateZ(calc(var(--index) * 0.6)) rotateX(-15deg);
        z-index: -4;
      }

      /*Left*/
      &:has(+ :hover) {
        transform: translateZ(calc(var(--index) * 8.5)) rotateX(35deg);
      }
      &:has(+ * + :hover) {
        transform: translateZ(calc(var(--index) * 5.6)) rotateX(40deg);
      }
      &:has(+ * + * + :hover) {
        transform: translateZ(calc(var(--index) * 2.5)) rotateX(30deg);
      }
      &:has(+ * + * + * + :hover) {
        transform: translateZ(calc(var(--index) * 0.6)) rotateX(15deg);
      }

      &:active,
      &:focus {
        width: 80%;
        height: 40vh;
        z-index: 100;
        transform: translateZ(calc(var(--index) * 10));
        margin: 0 0.45vw;
      }
    }
  }
}
</style>
