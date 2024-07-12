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

    <TransitionGroup name="list" tag="ul">
      <li p-2 v-for="(posts, date) in groupedPosts" :key="date">
        <GroupedPostsCard :date="date" :posts="posts"></GroupedPostsCard>
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-leave-active {
  position: absolute;
}
</style>
