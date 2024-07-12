<script setup lang="ts">
import { ref, onMounted } from "vue";
import { data, ImgDiaryItem } from "../loader/gallery.data.ts";
import Album from "./Album.vue";
import ImagePopup from "./ImagePopup.vue";
import GalleryHead from "./GalleryHead.vue";

const visibleAlbums = ref<Set<string>>(new Set());
const mainEl = ref<HTMLElement | null>();
const isPopupOpen = ref(false);

const albums = Object.groupBy(data, (galleryItem) => {
  const date = new Date(galleryItem.date);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}) as Record<string, ImgDiaryItem[]>;

onMounted(() => {
  if (!mainEl.value) return;

  // intersection observer lazy load
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

const selectedImgItem = ref<ImgDiaryItem>({} as ImgDiaryItem);
const selectedImgEl = ref<HTMLImageElement | null>();
onMounted(() => {
  if (!mainEl.value) return;
  let pre: HTMLImageElement | null = null;
  mainEl.value.addEventListener("click", (e) => {
    const target = e.target as HTMLImageElement;
    if (target.tagName !== "IMG" || !target.alt.startsWith("pixiv")) {
      pre = null;
      return;
    }
    if (pre === target) {
      selectedImgItem.value = data.find(
        (item) => item.image_url === target.dataset.originSrc,
      )!;
      isPopupOpen.value = true;
      selectedImgEl.value = target;
      pre = null;
    } else {
      pre = target as HTMLImageElement;
    }
  });
});
</script>

<template>
  <main ref="mainEl">
    <GalleryHead />
    <section
      v-for="(album, albumName) in albums"
      class="card"
      :key="albumName"
      :data-album="albumName"
    >
      <h2>{{ albumName }}</h2>
      <Album
        :should-load="visibleAlbums.has(albumName)"
        :album-name="albumName"
        :collection="album"
      />
    </section>
  </main>
  <ImagePopup
    :imgDiaryItem="selectedImgItem"
    :blob-url="selectedImgEl?.src"
    :open="isPopupOpen"
    @close="isPopupOpen = false"
  />
</template>

<style scoped>
.card {
  background-color: var(--sr-c-bg-section);
  padding: 1rem;
  margin: 1rem;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: var(--sr-card-shadow);
  }
}

h2 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

main {
  margin: 20px auto;
  max-width: 48rem;
}
</style>
