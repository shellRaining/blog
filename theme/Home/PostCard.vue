<script lang="ts" setup>
import type { ContentData } from "vitepress";
import { withBase } from "vitepress";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";

dayjs.extend(weekday);

defineProps<{ post: ContentData }>();
</script>

<template>
  <a class="container" :href="withBase(post.url)">
    <h1 class="post-h__title">{{ post.frontmatter.title }}</h1>
    <p class="post-p__date">
      {{ dayjs(post.frontmatter.date).format("YYYY-MM-DD dddd") }}
    </p>
  </a>
</template>

<style scoped>
.container {
  display: block;
  padding: 1rem;
  background: var(--vp-c-bg);
  border: 4px solid var(--custom-c-border);
  border-radius: 10px;
  box-shadow: 6px 6px var(--vp-c-brand);
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 10px 10px var(--vp-c-brand);
  }
  .post-h__title {
    margin: 0;
    font-size: 1.2rem;
  }
  .post-p__date {
    margin: 0;
    font-size: 1rem;
    color: #666;
  }
}
</style>
