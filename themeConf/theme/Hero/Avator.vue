<script lang="ts" setup>
import { useData } from "vitepress";
const { theme } = useData();
</script>

<template>
  <div class="content">
    <img :src="theme.logo" width="135" height="135" class="avator" />
  </div>
</template>

<style scoped>
.content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
}
.avator {
  border-radius: 50%;
  border: 5px solid var(--vp-avator-border);
}

@keyframes avator-transform {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
.avator:hover {
  animation: 5s linear 0s infinite avator-transform;
}
</style>
