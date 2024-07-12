<script lang="ts" setup>
import { ContentData } from "vitepress";
import { data } from "../posts.data.ts";
import GroupedPostsCard from "./GroupedPostsCard.vue";
import dayjs from "dayjs";

const posts = data.filter(({ frontmatter }) => {
  return Object.keys(frontmatter).length !== 0;
});
const groupedPosts = posts.reduce(
  (acc, post) => {
    const date = dayjs(post.frontmatter.date);
    const month = date.format("YYYY-MM");

    if (!acc[month]) {
      acc[month] = [];
    }

    acc[month].push(post);
    return acc;
  },
  {} as Record<string, ContentData[]>,
);
</script>

<template>
  <article class="doc">
    <h1 class="doc-head">shellRaining's blog</h1>

    <ul>
      <li class="grouped-posts" v-for="(posts, date) in groupedPosts" :key="date">
        <ClientOnly>
          <GroupedPostsCard :date="date" :posts="posts"></GroupedPostsCard>
        </ClientOnly>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.doc {
  margin: auto;
  max-width: 32rem;

  .doc-head {
    font-size: 1.5rem;
    line-height: 2rem;
    color: black;
    text-align: center;

    .dark & {
      color: white;
    }
  }

  .grouped-posts {
    padding: 0.5rem;
  }
}
</style>
