<script lang="ts" setup>
import { data as posts } from "../posts.data.mts";
// TODO: add more feature
</script>

<template>
  <ul class="posts-ul__list">
    <li
      class="posts-li__item"
      v-for="post in posts"
      :post="post"
      :key="post.url"
    >
      <a :href="post.url">{{ post.frontmatter.title }}</a>
    </li>
  </ul>
</template>

<style scoped>
.posts-ul__list {
  padding: 30px 0;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 80%;
  max-width: var(--custom-w-max-posts-list);

  & .posts-li__item {
    margin: 5px 0;
  }
}
</style>
