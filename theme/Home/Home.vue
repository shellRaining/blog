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
  <div mx-auto max-w-md>
    <h1 dark:text-color-white text="2xl color-black align-center">
      shellRaining's blog
    </h1>

    <ul>
      <li p-2 v-for="(posts, date) in groupedPosts" :key="date">
        <ClientOnly>
          <GroupedPostsCard :date="date" :posts="posts"></GroupedPostsCard>
        </ClientOnly>
      </li>
    </ul>
  </div>
</template>
