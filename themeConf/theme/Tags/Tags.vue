<script lang="ts" setup>
import { onMounted, ref } from "vue";
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

function toggleTag(tagName: string) {
  selectedTag.value = tagName === selectedTag.value ? "" : tagName;
}
</script>

<template>
  <div class="tags-block__wrapper">
    <h1 class="tags-h1__title">Tags</h1>
    <div class="tags">
      <span
        v-for="tagName in tagNames"
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
