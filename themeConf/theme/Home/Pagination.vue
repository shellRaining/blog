<script lang="ts" setup>
import { onMounted } from "vue";
import { useRouter } from "vitepress";

const props = defineProps<{
  pageNum: number;
  curPage: number;
}>();
const emit = defineEmits<{
  pageChanged: [pageIdx: number];
}>();
const router = useRouter();

router.onAfterRouteChanged = function (to) {
  const fakeHost = "http://a.com";
  const url = new URL(to, fakeHost);
  const params = new URLSearchParams(url.search);
  const pageIdx = Number(params.get("page")) || 1;
  emit("pageChanged", pageIdx);
};
onMounted(() => {
  const urlParams = new URLSearchParams(location.search);
  const pageIdx = Number(urlParams.get("page")) || 1;
  go(pageIdx);
});

function go(pageIdx: number) {
  if (pageIdx < 1 || pageIdx > props.pageNum) {
    return;
  }
  // update the page route, like ?page=1
  const urlParams = new URLSearchParams(location.search);
  urlParams.set("page", String(pageIdx));
  router.go(`${location.pathname}?${urlParams}`);
}
</script>

<template>
  <div class="pagination">
    <button
      class="pagination-btn-prev"
      @click="go(curPage - 1)"
      :style="{ visibility: curPage === 1 ? 'hidden' : 'visible' }"
    >
      Previous page
    </button>
    <span class="pagination-span-curpage">{{ curPage }} / {{ pageNum }}</span>
    <button
      class="pagination-btn-next"
      @click="go(curPage + 1)"
      :style="{ visibility: curPage === pageNum ? 'hidden' : 'visible' }"
    >
      Next page
    </button>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}

button {
  color: var(--custom-c-btn);
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  position: relative;
}

button::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: var(--custom-c-btn);
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.25s ease-out;
}

button:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

.pagination > *:first-child {
  margin-right: auto;
}

.pagination > *:last-child {
  margin-left: auto;
}
</style>
