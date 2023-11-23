<script lang="ts" setup>
import { data as posts } from "./posts.data.mts";
import PostCard from "./PostCard.vue";
</script>

<template>
  <div class="posts-lists">
      <div class="posts-lists__grid">
        <PostCard v-for="post in posts" :post="post" />
      </div>
  </div>
</template>

<style scoped>
.posts-lists {
  padding: 0 1rem;
  margin: 0 auto;
  max-width: 1200px;

  .posts-lists__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 1rem;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .posts-lists__grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 480px) {
  .posts-lists__grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media (max-width: 320px) {
  .posts-lists__grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
