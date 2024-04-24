<script lang="ts" setup>
import { onMounted, ref, useSlots } from "vue";
import { truncate } from "./truncate";
import { defaultPageStyle } from "./defaultPageStyle";
import { deleteUndefinedFields } from "../../shared/general";

// control page style
const props = defineProps<{
  width?: number;
  height?: number;
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  padding?: string;
}>();
const userPageStyle = Object.assign(
  defaultPageStyle,
  deleteUndefinedFields({ ...props }),
);

// control page text truncate
const text = (useSlots().default?.()[0].children as string) || "";
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
      <li class="page" v-for="(text, index) in texts" :key="index">
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
  perspective: 250vw;

  .pages {
    position: relative;
    backface-visibility: hidden;
    transform-style: preserve-3d;
    left: 0;
    transition: left 1.4s ease-in-out;
    width: v-bind('userPageStyle.width * 2 + "px"');
    height: v-bind('userPageStyle.height + "px"');

    &.close {
      left: v-bind('userPageStyle.width * -1 + "px"');
    }

    .page {
      position: absolute;
      top: 0;
      transform-origin: 0 0;
      transition: transform 1.4s;
      backface-visibility: hidden;
      transform-style: preserve-3d;
      white-space: pre-wrap;
      width: v-bind('userPageStyle.width + "px"');
      height: v-bind('userPageStyle.height + "px"');
      background-color: v-bind("userPageStyle.backgroundColor");
      color: v-bind("userPageStyle.color");
      font-size: v-bind("userPageStyle.fontSize");
      padding: v-bind("userPageStyle.padding");

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
