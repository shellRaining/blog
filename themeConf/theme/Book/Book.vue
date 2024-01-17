<script lang="ts" setup>
import { onMounted, reactive, ref, useSlots } from "vue";

const { width, height, backgroundColor, color, fontSize } = defineProps<{
  width?: number;
  height?: number;
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
}>();

const pageStyle = reactive({
  width: width ?? "300px",
  height: height ?? "400px",
  backgroundColor: backgroundColor ?? "#f2eecb",
  color: color ?? "#000",
  fontSize: fontSize ?? "1rem",
});
console.log(pageStyle);

interface PageHTMLElement extends HTMLElement {
  pageIdx: number;
}

let pages = ref<HTMLElement | null>(null);
const text = (useSlots().default?.()[0].children as string) || "";

const div = document.createElement("div");
div.className = "test";
document.body.appendChild(div);
const texts = ref(truncate(text, div));
document.body.removeChild(div);

// TODO: 优化
function truncate(text: string, el: HTMLElement): string[] {
  const boxHeight = height ?? 400;
  const result = [];
  while (text.length > 0) {
    let low = 0;
    let high = text.length;
    while (low < high) {
      let mid = Math.floor((low + high + 1) / 2);
      el.innerText = text.substring(0, mid);
      if (el.scrollHeight > boxHeight) {
        high = mid - 1;
      } else {
        low = mid;
      }
    }
    result.push(text.substring(0, low));
    text = text.substring(low);
  }
  return result;
}

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

<style>
.test {
  width: 300px;
  height: 400px;
  white-space: pre-wrap;
  padding: 16px;
}
</style>

<style scoped>
li {
  list-style: none;
  padding: 1rem;
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
