<script lang="ts" setup>
import { data } from "../posts.data.ts";
import PostCard from "./PostCard.vue";
import Pagination from "./Pagination.vue";
import { useRoute } from "vitepress";
import { ref } from "vue";

const route = useRoute();


const posts = data.filter(({frontmatter}) => {
  return Object.keys(frontmatter).length !== 0
})
const postsPerPage = route.data.frontmatter.postsPerPage || 5;
const totalPage = Math.ceil(posts.length / postsPerPage);

const curPage = ref(1);
const curPosts = ref(posts.slice(0, postsPerPage));

function updatePostList(pageIdx: number) {
  curPage.value = pageIdx;
  curPosts.value = posts.slice(
    (pageIdx - 1) * postsPerPage,
    pageIdx * postsPerPage,
  );
}
</script>

<template>
  <div>
    <ul class="posts-ul__list">
      <li>
        <PostCard
          class="posts-li__item"
          v-for="post in curPosts"
          :post="post"
          :key="post.url"
        />
      </li>
    </ul>
    <Pagination
      class="posts-pagination"
      :pageNum="totalPage"
      :curPage="curPage"
      @page-changed="updatePostList"
    />
  </div>
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
    margin: 10px 0;
  }
}

.posts-pagination {
  width: 80%;
  max-width: var(--custom-w-max-posts-list);
  margin: 0 auto;
}

@media (max-width: 768px) {
  .posts-li__list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 480px) {
  .posts-li__list {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media (max-width: 320px) {
  .posts-li__list {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
