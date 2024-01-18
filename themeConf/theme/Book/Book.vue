<script lang="ts" setup>
import { onMounted, ref, useSlots } from "vue";
import { truncate } from "./truncate";
import { defaultPageStyle } from "./defaultPageStyle";

// control page style
const props = defineProps();
const userPageStyle = Object.assign({ ...props }, defaultPageStyle);
const pageStyle = ref({
  width: userPageStyle.width + "px",
  height: userPageStyle.height + "px",
  backgroundColor: userPageStyle.backgroundColor,
  color: userPageStyle.color,
  fontSize: userPageStyle.fontSize + "rem",
  padding: userPageStyle.padding,
});

// control page text truncate
const text = (useSlots().default?.()[0].children as string) || "";
console.log(text);

const texts = ref(truncate(text, userPageStyle));

// control page flip
interface PageHTMLElement extends HTMLElement {
  pageIdx: number;
}
let pages = ref<HTMLElement | null>(null);

onMounted(() => {
  const pageNum = pages.value?.children.length ?? 0;
  for (let i = 0; i < pageNum; i += 2) {
    const page = pages.value?.children[i] as HTMLElement;
    page.style.zIndex = `${pageNum - i}`;
  }

  for (let i = 0; i < pageNum; i++) {
    const page = pages.value?.children[i] as PageHTMLElement;
    page.pageIdx = i + 1;
    page.addEventListener("click", () => {
      if (page.pageIdx === pageNum && pageNum % 2 === 1) {
        return;
      }
      if (page.pageIdx % 2 === 0) {
        page.classList.remove("flipped");
        page.previousElementSibling?.classList.remove("flipped");
      } else {
        page.classList.add("flipped");
        page.nextElementSibling?.classList.add("flipped");
      }

      if (page.pageIdx === 1) {
        pages.value?.classList.remove("close");
      } else if (page.pageIdx === 2) {
        pages.value?.classList.add("close");
      }
    });
  }
});
</script>

<template>
  <div class="book">
    <div id="pages" class="pages close" ref="pages">
      <li
        class="page"
        :style="pageStyle"
        v-for="(text, index) in texts"
        :key="index"
      >
        {{ text }}
      </li>
    </div>
  </div>
</template>

<style scoped>
li {
  list-style: none;
}

.book {
  --page-width: 300px;
  --page-height: 400px;
  --page-bg-color: #f2eecb;
  --page-font-color: #000;
  --page-font-size: 1rem;

  perspective: 250vw;

  .pages {
    position: relative;
    width: calc(var(--page-width) * 2);
    height: var(--page-height);
    backface-visibility: hidden;
    transform-style: preserve-3d;
    left: 0;
    transition: left 1.4s ease-in-out;

    &.close {
      left: calc(-1 * var(--page-width));
    }

    .page {
      position: absolute;
      top: 0;
      transform-origin: 0 0;
      transition: transform 1.4s;
      backface-visibility: hidden;
      transform-style: preserve-3d;
      white-space: pre-wrap;

      &:nth-child(odd) {
        right: 0;

        &:hover {
          transform: rotateY(-15deg);
        }

        &.flipped {
          transform: rotateY(-180deg);
        }
      }

      &:nth-child(even) {
        transform: rotateY(180deg);
        transform-origin: 100% 0;

        &.flipped {
          transform: rotateY(0deg);

          &:hover {
            transform: rotateY(15deg);
          }
        }
      }
    }
  }
}
</style>
