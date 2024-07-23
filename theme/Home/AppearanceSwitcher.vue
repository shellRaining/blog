<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import { nextTick } from "vue";

const isDark = useDark({
  storageKey: "shellRaining-blog-theme",
  initialValue: "dark",
});
const toggleDark = useToggle(isDark);

async function toggleAppearance({ x, y }: MouseEvent) {
  if (!document.startViewTransition) {
    toggleDark();
    return;
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )}px at ${x}px ${y}px)`,
  ];

  await document.startViewTransition(async () => {
    toggleDark();
    await nextTick();
  }).ready;
  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 500,
      easing: "ease-in",
      pseudoElement: `::view-transition-${isDark.value ? "old" : "new"}(root)`,
    },
  );
}
</script>

<template>
  <div class="appearance-toggle" @click="toggleAppearance"></div>
</template>

<style scoped>
.appearance-toggle {
  position: fixed;
  left: 0;
  top: var(--vp-nav-height);

  margin: -10px;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  background-color: orange;
  box-shadow:
    0 0 35px 5px yellow,
    0 0 25px 10px yellow inset;

  @media (320px <= width <= 480px) {
    width: 30px;
    height: 30px;
  }

  .dark & {
    background-color: transparent;
    box-shadow:
      inset -10px 8px 25px rgba(255, 255, 255, 0.8),
      inset -10px 8px 6px -5px #000,
      inset 20px -20px 20px 30px rgba(0, 0, 0, 0.5),
      7px -6px 14px rgba(255, 255, 255, 0.3215686275);
  }
}
</style>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}
</style>
