<script setup lang="ts">
import { ContentData } from "vitepress";
import PostItem from "./PostItem.vue";
import { onMounted, ref } from "vue";
import gsap from "gsap";

const props = defineProps<{
  date: string;
  posts: ContentData[];
}>();
const showChunk = ref(false);
const showList = ref(true);
const foldEl = ref<HTMLUListElement | null>(null);
const foldHeight = ref("");

function toggleList() {
  showList.value = !showList.value;
}

function beforeEnter(element: Element) {
  const el = element as HTMLLIElement;
  el.style.opacity = "0";
  el.style.transform = "translateX(30px)";
}
function enter(element: Element, done: any) {
  const el = element as HTMLLIElement;
  gsap.to(el, {
    duration: 1,
    onComplete: done,
    opacity: 1,
    x: 0,
    delay: parseFloat(el.dataset.index!) * 0.1,
  });
}

onMounted(() => {
  if (foldEl.value) {
    const ulEl = foldEl.value;
    foldHeight.value = `${ulEl.getBoundingClientRect().height}px`;
  }
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

    <div
      class="chunk"
      :class="{ 'chunk-active': showChunk }"
      key="chunk-bar"
    ></div>

    <Transition name="fold">
      <ul ref="foldEl" v-show="showList">
        <TransitionGroup appear @before-enter="beforeEnter" @enter="enter">
          <li
            v-for="(post, index) in props.posts"
            :key="post.url"
            :data-index="index"
          >
            <PostItem :post="post" />
          </li>
        </TransitionGroup>
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
  background-color: #e5e5e5;
  .dark & {
    background-color: #262626;
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
