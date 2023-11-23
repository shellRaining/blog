<script lang="ts" setup>
import type { ContentData } from "vitepress";

defineProps<{ post: ContentData }>();
</script>

<template>
  <div class="container">
    <a :href="post.url">
      <h1 class="post-title">{{ post.frontmatter.title }}</h1>
      <p class="post-date">{{ post.frontmatter.date }}</p>
    </a>
  </div>
</template>

<style scoped>
.container {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }
  .post-title {
    margin: 0;
    font-size: 1.5rem;
  }
  .post-date {
    margin: 0;
    font-size: 1rem;
    color: #666;
  }

  @media (max-width: 768px) {
    .post-title {
      font-size: 1.25rem;
    }
    .post-date {
      font-size: 0.75rem;
    }
  }
  @media (max-width: 480px) {
    .post-title {
      font-size: 1rem;
    }
    .post-date {
      font-size: 0.6rem;
    }
  }
  @media (max-width: 320px) {
    .post-title {
      font-size: 1rem;
    }
    .post-date {
      font-size: 0.5rem;
    }
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0.5rem;
  }
}

@media (max-width: 320px) {
  .container {
    padding: 0.4rem;
  }
}
</style>
