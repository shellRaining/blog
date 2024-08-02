<template>
  <div class="skeleton-loader" :style="{ width, height }">
    <div class="skeleton-shimmer"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  width?: string;
  height?: string;
}>();
</script>

<style scoped>
.skeleton-loader {
  background-color: var(--vp-c-bg-soft);
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--vp-c-bg-alt) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

.skeleton-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40%;
  height: 40%;
  color: var(--vp-c-bg-alt);
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
