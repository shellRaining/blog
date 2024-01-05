<script lang="ts" setup>
import { onContentUpdated, useData } from "vitepress";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ref } from "vue";

dayjs.extend(relativeTime);

const pageData = useData().page;
const publishDate = ref("");

onContentUpdated(() => {
  const { frontmatter } = pageData.value;
  const curTime = dayjs();
  const publishTime = dayjs(frontmatter.date || Date.now());
  publishDate.value = curTime.to(publishTime);
});
</script>

<template>
  <div>
    <h1 class="title">{{ pageData.title }}</h1>
    <div class="date">🕒 Published at: {{ publishDate }}</div>
  </div>
</template>

<style scoped>
.title {
  color: var(--vp-c-text-1);
  font-weight: 600;
  font-size: 2.25em;
  margin-top: 0.3em;
  margin-bottom: 0.3em;
  line-height: 1.3;
  font-family: Dosis, "Noto Sans";
}

.date {
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-bottom: 1em;
  padding-bottom: 1em;
  border-bottom: 1px dashed #c7c7c7;
}
</style>
