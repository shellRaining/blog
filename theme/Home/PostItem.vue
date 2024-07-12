<script lang="ts" setup>
import type { ContentData } from "vitepress";
import { useRouter, withBase } from "vitepress";
import { onMounted, ref } from "vue";

defineProps<{ post: ContentData }>();

const router = useRouter();

function changeRoute(to: string) {
  if (!document.startViewTransition) {
    router.go(to);
    return;
  }
  // to avoid animation confict with the global transition
  const VPContentEl = document.querySelector(".VPContent")! as HTMLElement;
  VPContentEl.style.setProperty("view-transition-name", "route");
  const transition = document.startViewTransition(async () => {
    await router.go(to);
  });
  transition.finished.then(() => {
    VPContentEl.style.removeProperty("view-transition-name");
  });
}

const viewTransitionsEnabled = ref(false);
onMounted(() => {
  viewTransitionsEnabled.value = "startViewTransition" in document;
});
</script>

<template>
  <a
    class="post-title"
    :class="viewTransitionsEnabled && 'vp-raw'"
    :href="withBase(post.url)"
    @click.prevent="changeRoute(post.url)"
  >
    {{ post.frontmatter.title }}
  </a>
</template>

<style scoped>
.post-title {
  overflow-x: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
  color: var(--sr-c-text);
  font-weight: normal;
  padding: 0 1rem;
  transition: all 0.5s ease;

  &:hover {
    color: var(--sr-c-text-hover);
    font-weight: bold;
  }
}
</style>

<style>
@keyframes shift-to-left {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  50% {
    opacity: 0;
    transform: translateX(-100px);
  }
  100% {
    opacity: 0;
    transform: translateX(-100px);
  }
}
@keyframes push-from-right {
  0% {
    opacity: 0;
    transform: translateX(100px);
  }
  50% {
    opacity: 0;
    transform: translateX(100px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
::view-transition-old(route) {
  animation: shift-to-left 0.6s linear;
}
::view-transition-new(route) {
  animation: push-from-right 0.6s linear;
}
</style>
