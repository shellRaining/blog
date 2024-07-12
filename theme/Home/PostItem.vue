<script lang="ts" setup>
import type { ContentData } from "vitepress";
import { withBase } from "vitepress";

defineProps<{ post: ContentData }>();
</script>

<template>
  <a px-4 transition-all class="post-title" :href="withBase(post.url)">{{
    post.frontmatter.title
  }}</a>
</template>

<style scoped>
.post-title {
  overflow-x: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
  color: #57534e; /* stone-600 */
  font-weight: normal;

  &:hover {
    color: #0c0a09; /* stone-950 */
    font-weight: bold;
  }
}
.dark .post-title {
  color: #a8a29e; /* stone-400 */

  &:hover {
    color: #fafaf9; /* stone-50 */
  }
}
</style>
