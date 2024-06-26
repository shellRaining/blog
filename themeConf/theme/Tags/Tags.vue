<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { withBase } from "vitepress";
import { data as posts, BlogPost } from "../posts.data.mts";
import dayjs from "dayjs";

function initTags(posts: BlogPost[]): Map<string, BlogPost[]> {
  const tagInfo: Map<string, BlogPost[]> = new Map();

  for (const post of posts) {
    const tags = post.frontmatter.tag ?? [];
    for (const tag of tags) {
      const tagData = tagInfo.get(tag);
      if (tagData) {
        tagData.push(post);
      } else {
        tagInfo.set(tag, [post]);
      }
    }
  }

  return tagInfo;
}

const tagsInfo = initTags(posts);
const tagNames = Array.from(tagsInfo.keys());
const selectedTag = ref(tagNames[0] ?? "");

// set init route
let urlParams = new URLSearchParams(window.location.search);
let tag = urlParams.get("tag") ?? tagNames[0];
selectedTag.value = tag;
window.history.replaceState({}, "", `${window.location.pathname}?tag=${tag}`);

function toggleTag(tagName: string) {
  selectedTag.value = tagName === selectedTag.value ? "" : tagName;

  let urlParams = new URLSearchParams(window.location.search);
  urlParams.set("tag", selectedTag.value);
  window.history.pushState({}, "", `${window.location.pathname}?${urlParams}`);
}

// Search tags
const searchInput = ref<HTMLInputElement | null>(null);
const searchText = ref("");
const filteredTagNames = computed(() => {
  return tagNames.filter((tagName) => tagName.includes(searchText.value));
});

const handlePopState = function () {
  urlParams = new URLSearchParams(window.location.search);
  tag = urlParams.get("tag") ?? tagNames[0];
  selectedTag.value = tag;
};

onMounted(() => {
  searchInput.value?.focus();
  // bind command+j (macOS) to search input
  window.addEventListener("keydown", (e) => {
    if (e.metaKey && e.key === "j") {
      searchInput.value?.focus();
      e.preventDefault();
    } else if (e.key === "Escape") {
      searchInput.value?.blur();
    }
  });
  window.addEventListener("popstate", handlePopState);
});

onUnmounted(() => {
  window.removeEventListener("popstate", handlePopState);
});
</script>

<template>
  <div class="tags-block__wrapper">
    <h1 class="tags-h1__title">Tags</h1>
    <input
      type="text"
      placeholder="search tags..."
      class="search__input"
      ref="searchInput"
      v-model="searchText"
    />
    <div class="tags">
      <span
        v-for="tagName in filteredTagNames"
        class="tag"
        :class="{ tag__active: tagName === selectedTag }"
        @click="toggleTag(tagName)"
      >
        {{ tagName }}
        <span class="tag__count">{{ tagsInfo.get(tagName)?.length }}</span>
      </span>
    </div>

    <h4 class="selected-tag__title" v-show="selectedTag">
      <img src="./tag.svg" alt="tag" width="20px" />
      <span class="selected-tag__text">{{ selectedTag }}</span>
    </h4>

    <a
      v-for="(article, index) in tagsInfo.get(selectedTag) ?? []"
      :href="withBase(article.url)"
      :key="index"
      class="post-a__link"
    >
      <div>{{ article.frontmatter.title }}</div>
      <div class="post__date">
        {{ dayjs(article.frontmatter.date).format("YYYY-MM-DD") }}
      </div>
    </a>
  </div>
</template>

<style scoped>
.tags-block__wrapper {
  margin: 0 auto;
  padding: 0.5rem 1.5rem 4rem;
  max-width: 48rem;
}

.tags-h1__title {
  font-weight: bold;
  padding-bottom: 14px;
  font-size: 2.25em;
  margin-top: 24px;
}

.search__input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #c7c7c7;
  font-size: 1rem;
}

.tags {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: left;

  border-bottom: 1px dashed #c7c7c7;
  margin-bottom: 10px;
  padding-bottom: 20px;
}

.tag {
  display: inline-block;
  margin: 6px 8px;
  font-size: 0.85em;
  line-height: 25px;
  transition: 0.4s;
  color: #a1a1a1;
  cursor: pointer;
}

.tag__active {
  color: var(--vp-c-hover);
}

.tag:hover {
  color: var(--vp-c-hover);
}

.tag__count {
  color: var(--vp-c-brand);
  font-size: 12px !important;
  position: relative;
  top: -8px;
}

.selected-tag__title {
  font-size: 1rem;
  font-weight: 600;
  margin: 1.5rem 0;
  display: flex;
  align-items: center;
  justify-content: left;
}

.selected-tag__text {
  padding-left: 10px;
}

.post-a__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 10px;
  color: var(--vp-c-text-2);
  transition:
    border 0.3s ease,
    color 0.3s ease;
}

.post-a__link:hover {
  text-decoration: none;
  color: var(--vp-c-brand);
}

.post__date {
  font-family: Georgia, sans-serif;
}
</style>
