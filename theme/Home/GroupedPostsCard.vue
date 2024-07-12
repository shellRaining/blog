<script setup lang="ts">
import { ContentData } from "vitepress";
import PostItem from "./PostItem.vue";
import { ref } from "vue";

const props = defineProps<{
  date: string;
  posts: ContentData[];
}>();
const showChunk = ref(false);
const showList = ref(true);

function toggleList() {
  showList.value = !showList.value;
}
</script>

<template>
  <section p-2>
    <header
      font-bold
      text-2xl
      cursor-pointer
      select-none
      @mouseover="showChunk = true"
      @mouseleave="showChunk = false"
      @click="toggleList"
    >
      {{ props.date }}
    </header>

    <ul relative v-show="showList">
      <div
        class="chunk"
        :class="{ 'chunk-active': showChunk }"
        key="chunk-bar"
      ></div>
      <li my-2 v-for="post in props.posts" :key="post.url">
        <PostItem :post="post" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.chunk {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: transparent;
  transition: background-color 0.3s;
}
.chunk-active {
  background-color: black;
}
.dark .chunk-active {
  background-color: white;
}
</style>
