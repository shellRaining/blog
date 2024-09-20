<script setup lang="ts">
import { ContentData } from "vitepress";
import PostItem from "./PostItem.vue";
import { onMounted, ref } from "vue";

const props = defineProps<{
  date: string;
  posts: ContentData[];
}>();

// fold and chunk
const showChunk = ref(false);
const showList = ref(true);
const foldEl = ref<HTMLUListElement | null>(null);
const foldHeight = ref("");
function toggleList() {
  showList.value = !showList.value;
}
onMounted(() => {
  if (!foldEl.value) return;
  const ulEl = foldEl.value;
  foldHeight.value = `${ulEl.getBoundingClientRect().height}px`;
});

// posts transition
const isMounted = ref(false);
onMounted(() => {
  if (!foldEl.value) return;
  isMounted.value = true;
  const liEls = foldEl.value.querySelectorAll("li");
  liEls.forEach((el, idx) => {
    el.style.transition = "transform 1s ease-out, opacity 1s ease-out";
    el.style.transitionDelay = `${String(idx * 0.1)}s`;
  });
});
</script>

<template>
  <section>
    <header
      :class="{ 'header-hidden': !showList }"
      @mouseover="showChunk = true"
      @mouseleave="showChunk = false"
      @click="toggleList"
    >
      {{ props.date }}
    </header>

    <div class="chunk" :class="{ 'chunk-active': showChunk }"></div>

    <Transition name="fold">
      <ul ref="foldEl" v-show="showList">
        <li
          v-for="post in props.posts"
          :key="post.url"
          :class="{ mounted: isMounted }"
        >
          <PostItem :post="post" />
        </li>
      </ul>
    </Transition>
  </section>
</template>

<style scoped>
section {
  position: relative;
  padding: 0.5rem;

  & > header {
    padding: 0 0.5rem;
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 2rem;
    cursor: pointer;
    user-select: none;
    border-radius: 0.4rem;
  }

  & > ul {
    overflow: hidden;

    & > li {
      margin: 0.5rem;
      opacity: 0;
      transform: translateX(30px);

      &.mounted {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }
}

.fold-enter-from,
.fold-leave-to {
  height: 0;
}
.fold-enter-to,
.fold-leave-from {
  height: v-bind(foldHeight);
}
.fold-enter-active,
.fold-leave-active {
  transition: all 0.5s ease;
}

.header-hidden {
  background-color: #e5e5e5aa;
  .dark & {
    background-color: #262626aa;
  }
}

.chunk {
  position: absolute;
  left: 0.25rem;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: transparent;
  transition: background-color 0.3s;

  &.chunk-active {
    background-color: black;
    .dark & {
      background-color: white;
    }
  }
}
</style>
