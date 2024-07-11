<script lang="ts" setup>
import { onContentUpdated, useData } from "vitepress";
import { shallowRef, ref } from "vue";
import { getHeaders } from "./utils";
import type { HeaderInfo } from "./utils";

const headers = shallowRef<HeaderInfo[]>([]);
const showIndent = ref(false);
const pageData = useData().page;
const { frontmatter } = pageData.value;

onContentUpdated(() => {
  headers.value = getHeaders();
  showIndent.value = headers.value.some((header) => {
    return header.level === 2;
  });
});
</script>

<template>
  <div
    class="category__wrapper"
    v-if="headers.length > 0 && (frontmatter.openCategory ?? true)"
  >
    <ul class="category-ul__level2">
      <li class="header" v-for="item in headers">
        <a :href="item.link" class="header__level2" v-if="item.level === 2">{{
          item.title
        }}</a>
        <ul v-if="item.level === 3">
          <li class="header">
            <a
              :href="item.link"
              :class="['header__level3', { showIndent: showIndent }]"
              >{{ item.title }}</a
            >
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.category__wrapper {
  width: 20rem;
  background: var(--vp-c-bg);
  box-shadow: 6px 6px var(--vp-c-brand);
  border: 4px solid #3f4e4f;
  color: var(--vp-c-brand-light);
  overflow-y: auto;
  max-height: 300px;
  margin: 1rem 0;
}

.category-ul__level2 {
  padding-left: 1.25em;
  margin: 1rem 0;
  line-height: 1.7;
  list-style-type: none;
  box-sizing: border-box;
}

.showIndent {
  padding-left: 1rem;
}

ul {
  list-style-type: none;
}

.header {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .category__wrapper {
    max-height: 400px;
  }
}

@media (min-width: 1024px) {
  .category {
    max-height: 450px;
  }
}

@media (min-width: 1400px) {
  .category {
    position: fixed;
    right: 20px;
    max-height: 490px;
  }
}
</style>
