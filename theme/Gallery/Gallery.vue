<script setup lang="ts">
import { ref, onMounted } from "vue";
import { data } from "../loader/gallery.data.ts";
import Album from "./Album.vue";
import ImagePopup from "./ImagePopup.vue";

const visibleAlbums = ref<Set<string>>(new Set());
const mainEl = ref<HTMLElement | null>();
const isPopupOpen = ref(false);
const selectedImage = ref({ src: "", alt: "", title: "" });

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

  // viewerjs
  let pre: HTMLImageElement | null = null;
  mainEl.value.addEventListener("click", (e) => {
    const target = e.target as HTMLImageElement;
    if (target.tagName !== "IMG" || !target.alt.startsWith("pixiv")) return;
    if (pre === target) {
      selectedImage.value = {
        src: target.src,
        alt: target.alt,
        title: target.title,
      };
      isPopupOpen.value = true;
      pre = null;
    } else {
      pre = target as HTMLImageElement;
    }
  });
});

const closePopup = () => {
  isPopupOpen.value = false;
};
</script>

<template>
  <main ref="mainEl">
    <article>
      <h1 class="main-head">Gallery</h1>
      <div class="desc-box">
        <p>
          这是我从 pixiv
          收集到的画片，我从其中挑选出了我认为最优雅的一些放在这里，他们就像是一个笔记本的一页，每张都承载着我一段思绪和旧念。
        </p>
        <p>
          我把他们按照时间排列，用一种我感觉还算比较优雅的方式组织起来，陈列在这里。但还存在一些问题，如果一个月的画片过多或者过少，都会造成布局的不平衡，如果你有什么好主意，可以在
          <a href="https://github.com/shellRaining/blog/issues">issue</a> 中反馈
        </p>
      </div>
    </article>
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
  <ImagePopup :image="selectedImage" :open="isPopupOpen" @close="closePopup" />
</template>

<style scoped>
main {
  margin: 20px auto;
  max-width: 48rem;

  h1 {
    text-align: center;
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
  }

  .desc-box {
    text-indent: 2em;
    background-color: var(--vp-c-bg-soft);
    padding: 1rem;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: 0 0 10px var(--vp-c-border);
    }

    a {
      color: var(--vp-c-brand-1);
      text-decoration: underline;
      transition:
        color 0.25s,
        opacity 0.25s;
      &:hover {
        color: var(--vp-c-brand-2);
      }
    }
  }

  h2 {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  section {
    padding: 2rem;
    margin: 2rem 0;
    background-color: var(--vp-c-bg-soft);
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: 0 0 10px var(--vp-c-border);
    }
  }
}
</style>
