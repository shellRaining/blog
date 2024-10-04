<script lang="ts" setup>
import { ContentData } from "vitepress";
import { data } from "../loader/posts.data";
import GroupedPostsCard from "./GroupedPostsCard.vue";
import dayjs from "dayjs";

const posts = data.filter(({ frontmatter }) => {
  return Object.keys(frontmatter).length !== 0;
});
const groupedPosts = posts.reduce(
  (acc, post) => {
    const date = dayjs(post.frontmatter.date);
    const groupKey = date.format("YYYY-MM");

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }

    acc[groupKey].push(post);
    return acc;
  },
  {} as Record<string, ContentData[]>,
);
</script>

<template>
  <article class="doc">
    <h1 class="doc-head">shellRaining's blog</h1>

    <ul>
      <li
        class="grouped-posts"
        v-for="(posts, date) in groupedPosts"
        :key="date"
      >
        <GroupedPostsCard :date="date" :posts="posts"></GroupedPostsCard>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.doc {
  margin: 20px auto;
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

.box {
  position: absolute;
  left: 50%;
  height: 100px;
}
</style>
