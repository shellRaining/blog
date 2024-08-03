<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = defineProps<{
  open: boolean;
  image: { src: string; alt: string; title: string };
}>();

const emit = defineEmits(["close"]);

const key = computed(
  () => `https://www.pixiv.net/artworks/${props.image.alt.split(" ")[1]}`,
);
const comment = ref("");

const saveComment = () => {
  if (!key.value || !comment.value) return;
  localStorage.setItem(key.value, comment.value);
};

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      comment.value = localStorage.getItem(key.value) || "";
      return;
    }
    saveComment();
  },
);
</script>

<template>
  <section v-if="open" class="popup-overlay" @click="$emit('close')">
    <article class="popup-content" @click.stop>
      <header>
        <h2>{{ image.title }}</h2>
      </header>
      <main>
        <div class="left-side">
          <img :src="image.src" :alt="image.alt" />
        </div>
        <div class="vertical-line"></div>
        <div class="right-side">
          <textarea v-model="comment" placeholder="若你也有所感悟"></textarea>
          <button @click="saveComment">Save</button>
        </div>
      </main>
    </article>
  </section>
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
  background: var(--vp-c-bg-soft);
  padding: 20px;
  border-radius: 5px;
  max-height: 80%;
  max-width: 80%;
  display: flex;
  flex-direction: column;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

main {
  flex: 1;
  display: flex;

  .left-side {
    flex: 1;

    img {
      border-radius: 5px;
      max-height: 90vh;
    }
  }

  .vertical-line {
    width: 1px;
    background: var(--vp-c-border);
    margin: 0 1rem;
  }

  .right-side {
    flex: 1;
    display: flex;
    flex-direction: column;

    textarea {
      flex: 1;
      margin-bottom: 1rem;
      display: block;
      width: 100%;
      padding: 1rem;
      border: none;
      border-radius: 5px;
      resize: none;
    }

    button {
      display: block;
      width: 100%;
      padding: 0.5rem;
      background: var(--vp-c-brand-1);
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: var(--vp-c-brand-2);
      }

      &:active {
        background: var(--vp-c-brand-3);
      }
    }
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
      margin-bottom: 1rem;
    }

    .vertical-line {
      display: none;
    }

    .right-side {
      textarea {
        margin-bottom: 0;
      }
      button {
        display: none;
      }
    }
  }
}
</style>
