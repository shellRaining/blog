<script setup lang="ts">
import { ImgDiaryItem } from "../loader/gallery.data";

const { open, blobUrl, imgDiaryItem } = defineProps<{
  open: boolean;
  blobUrl?: string;
  imgDiaryItem: ImgDiaryItem;
}>();

const emit = defineEmits(["close"]);
</script>

<template>
  <Transition name="flyout">
    <section v-if="open" class="popup-overlay" @click="$emit('close')">
      <article class="popup-content" @click.stop>
        <header>
          <h2>{{ imgDiaryItem.title }}</h2>
        </header>
        <main>
          <img
            :src="blobUrl ?? imgDiaryItem.image_url"
            :alt="imgDiaryItem.title"
            class="left-side"
          />
          <p class="right-side">{{ imgDiaryItem.note }}</p>
        </main>
      </article>
    </section>
  </Transition>
</template>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  position: relative;
  background: var(--sr-c-bg-section);
  padding: 20px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  width: 80%;
  height: 60%;
}

h2 {
  flex-shrink: 0;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

main {
  overflow: hidden;
  flex: 1;
  display: flex;

  img {
    max-width: 100%;
    max-height: 100%;
    display: block; /* 移除图片下方的空白 */
  }

  .left-side {
    flex: 1;
    max-width: 50%; /* 限制图片最大宽度 */
    object-fit: contain; /* 保持图片比例 */
    align-self: flex-start; /* 图片顶部对齐 */
    border-radius: 5px;
  }

  .right-side {
    flex: 1;
    overflow-y: auto; /* 如果文本过长，添加滚动条 */
    padding: 0 10px; /* 添加一些内边距 */
  }
}

@media (max-width: 480px) {
  .popup-content {
    max-height: 90%;
    padding: 1rem;
  }

  h2 {
    font-size: 1.25rem;
  }

  main {
    flex-direction: column;

    .left-side {
      flex: 2;
      margin: 0 auto;
    }

    .right-side {
      flex: 1;
      padding: 10px 0;
    }
  }
}
</style>
