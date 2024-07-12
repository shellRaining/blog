<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { ImgDiaryItem } from "../loader/gallery.data";
import LazyImage from "./LazyImage.vue";

const props = defineProps<{
  shouldLoad: boolean;
  albumName: string;
  collection: ImgDiaryItem[];
}>();

// concurrent control and lazy load
const maxConcurrents = 5;
const loadingQueue = ref([...props.collection]);
const activeRequests = ref(0);
const loadingStatus = ref(
  props.collection.reduce((pre, cur) => {
    const id = cur.image_url;
    pre[id] = false;
    return pre;
  }, Object.create(null)),
);

function startNextLoad() {
  if (activeRequests.value < maxConcurrents && loadingQueue.value.length > 0) {
    const url = loadingQueue.value.shift()!.image_url;
    activeRequests.value++;
    loadingStatus.value[url] = true;
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
      v-for="item in collection"
      :imgDiaryItem="item"
      :shouldLoad="loadingStatus[item.image_url]"
      class="item"
      tabindex="0"
      @loaded="onImageLoaded(item.image_url)"
    />
  </div>
  <div v-else class="items"></div>
</template>

<style scoped>
.items {
  --index: calc(1vw + 1vh);
  --transition: cubic-bezier(0.1, 0.7, 0, 1);
  margin: 0 2rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  perspective: calc(var(--index) * 60);
  min-height: calc(var(--index) * 12);

  .item {
    width: calc(var(--index) * 3);
    height: calc(var(--index) * 12);
    object-fit: cover;
    cursor: pointer;
    object-fit: cover;
    transition:
      transform 1.25s var(--transition),
      filter 3s var(--transition),
      width 1.25s var(--transition);
    filter: grayscale(0.5) brightness(0.8);
    will-change: transform, rotateY, width, filter;
    border: 10px solid transparent;
    margin: -10px;

    .dark & {
      filter: grayscale(1) brightness(0.5);
    }

    &:hover {
      filter: inherit;
      transform: translateZ(calc(var(--index) * 10));
    }

    /*Right*/
    &:hover + * {
      filter: inherit;
      transform: translateZ(calc(var(--index) * 8.5)) rotateY(35deg);
      z-index: -1;
    }
    &:hover + * + * {
      filter: inherit;
      transform: translateZ(calc(var(--index) * 5.6)) rotateY(40deg);
      z-index: -2;
    }
    &:hover + * + * + * {
      filter: inherit;
      transform: translateZ(calc(var(--index) * 2.5)) rotateY(30deg);
      z-index: -3;
    }
    &:hover + * + * + * + * {
      filter: inherit;
      transform: translateZ(calc(var(--index) * 0.6)) rotateY(15deg);
      z-index: -4;
    }

    /*Left*/
    &:has(+ :hover) {
      filter: inherit;
      transform: translateZ(calc(var(--index) * 8.5)) rotateY(-35deg);
    }
    &:has(+ * + :hover) {
      filter: inherit;
      transform: translateZ(calc(var(--index) * 5.6)) rotateY(-40deg);
    }
    &:has(+ * + * + :hover) {
      filter: inherit;
      transform: translateZ(calc(var(--index) * 2.5)) rotateY(-30deg);
    }
    &:has(+ * + * + * + :hover) {
      filter: inherit;
      transform: translateZ(calc(var(--index) * 0.6)) rotateY(-15deg);
    }

    &:focus {
      filter: inherit;
      width: 10vw;
      z-index: 100;
      transform: translateZ(calc(var(--index) * 10));
      margin: 0 0.45vw;
    }
  }
}

@media (min-width: 1440px) {
  .items {
    --index: 1vw;
  }
}

@media (max-width: 480px) {
  .items {
    --index: calc(2vw + 2vh);
    flex-direction: column;

    .item {
      width: 80%;
      height: calc(var(--index) * 3);
      transition:
        transform 1.25s var(--transition),
        filter 3s var(--transition),
        height 1.25s var(--transition);
      will-change: transform, rotateX, height, filter;

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
