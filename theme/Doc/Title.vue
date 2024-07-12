<script lang="ts" setup>
import { onContentUpdated, useData } from "vitepress";
import { ref } from "vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import VersionDropdown from "./VersionDropdown.vue";

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
    <div class="meta-info">
      <time class="date">🕒 Published at: {{ publishDate }}</time>
      <VersionDropdown class="versions" />
    </div>
  </div>
</template>

<style scoped>
.title {
  font-weight: 600;
  font-size: 2.25em;
  margin-top: 0.3em;
  margin-bottom: 0.3em;
  line-height: 1.3;
}

.meta-info {
  display: flex;
  line-height: 1.25rem;
  font-size: 0.875rem;
  justify-content: space-between;
}
</style>
