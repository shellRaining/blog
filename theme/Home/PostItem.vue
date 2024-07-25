<script lang="ts" setup>
import type { ContentData } from "vitepress";
import { useRouter, withBase } from "vitepress";

defineProps<{ post: ContentData }>();

const router = useRouter();

function changeRoute(e: MouseEvent, to: string) {
  if (document.startViewTransition) {
    e.stopPropagation();
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
}
</script>

<template>
  <a
    class="post-title"
    :href="withBase(post.url)"
    @click="(e) => changeRoute(e, post.url)"
    >{{ post.frontmatter.title }}</a
  >
</template>

<style scoped>
.post-title {
  overflow-x: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
  color: #57534e; /* stone-600 */
  font-weight: normal;
  padding: 0 1rem;
  transition: all 0.5s ease;

  &:hover {
    color: #0c0a09; /* stone-950 */
    font-weight: bold;
  }
}
.dark .post-title {
  color: #a8a29e; /* stone-400 */

  &:hover {
    color: #fafaf9; /* stone-50 */
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
