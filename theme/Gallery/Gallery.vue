<script setup lang="ts">
import { ref, onMounted } from "vue";
import dayjs from "dayjs";
import { data, ImgDiaryItem } from "../loader/gallery.data.ts";
import Album from "./Album.vue";
import ImagePopup from "./ImagePopup.vue";

const visibleAlbums = ref<Set<string>>(new Set());
const mainEl = ref<HTMLElement | null>();
const isPopupOpen = ref(false);

const groupBy =
  Object.groupBy ??
  function groupBy(array: any, keyGetter: any) {
    return array.reduce((acc: any, item: any) => {
      const key = keyGetter(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  };

const albums = groupBy(data, (galleryItem) => {
  const date = dayjs(galleryItem.date);
  return date.format("YYYY-MM");
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
    if (target.tagName !== "IMG" || !target.alt.startsWith("image diary")) {
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
    <h1>Gallery</h1>
    <section class="card desc-box">
      <p>
        这是我从 pixiv
        收集到的画片，我从其中挑选出了我认为最优雅的一些放在这里，他们就像是一个笔记本的一页，每张都承载着我一段思绪和旧念。若你感兴趣，可以依次点开图片欣赏，再次点击可以打开更大的窗口。若心情不佳，你也可以在旁边的文本框记录自己的心绪……
      </p>
      <p>
        我把他们按照时间排列，用一种我感觉还算比较优雅的方式组织起来，陈列在这里。但还存在一些问题，如果一个月的画片过多或者过少，都会造成布局的不平衡，如果你有什么好主意，可以在
        <a href="https://github.com/shellRaining/blog/issues">issue</a>
        中反馈。
      </p>
    </section>
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
h1 {
  text-align: center;
  font-size: 2.5rem;
  font-weight: bold;
  margin: 3rem;
}

.desc-box {
  text-indent: 2em;

  & > p + p {
    margin-top: 1rem;
  }
}

.card {
  background-color: var(--sr-c-bg-section);
  padding: 1.5rem;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: var(--sr-card-shadow);
  }

  & + & {
    margin-top: 2rem;
  }
}

h2 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

main {
  margin: 20px auto;
  max-width: 64rem;
}
</style>
