<script setup lang="ts">
import { useData } from "vitepress";
import { computed, ref, watch } from "vue";

const main = ref<HTMLDivElement | null>(null);
const { page } = useData();
const open = ref(false);
const fmtedDate = computed(() => {
  return page.value.versions?.map((item) => {
    return {
      timestamp: item.timestamp.slice(0, -6),
      hash: item.hash.slice(0, 6),
    };
  });
});

function closeOnClickOutside(e: Event) {
  if (!main.value?.contains(e.target as Node)) {
    open.value = false;
  }
}

watch(open, (value) => {
  if (value) {
    document.addEventListener("click", closeOnClickOutside);
    return;
  }
  document.removeEventListener("click", closeOnClickOutside);
});

function toggle() {
  open.value = !open.value;
}
</script>

<template>
  <div
    class="blog-page-version-dropdown"
    ref="main"
    v-if="page.versions?.length"
  >
    <button @click="toggle" class="version-btn">
      <span>versions </span><span class="icon git"></span>
    </button>
    <Transition name="flyout">
      <ul v-if="open" class="items">
        <li v-for="item in fmtedDate">
          <a
            :href="'https://github.com/shellRaining/blog/commit/' + item.hash"
            class="item"
          >
            <time :datetime="item.timestamp"> {{ item.timestamp }}</time>
            <code>{{ item.hash }}</code>
          </a>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.blog-page-version-dropdown {
  position: relative;

  .version-btn {
    transition: all 0.3s ease;
    color: var(--sr-c-text);

    &:hover {
      color: var(--sr-c-text-hover);
      font-weight: bold;
    }
  }

  .git {
    mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 5C6 4.44772 6.44772 4 7 4C7.55228 4 8 4.44772 8 5C8 5.55228 7.55228 6 7 6C6.44772 6 6 5.55228 6 5ZM8 7.82929C9.16519 7.41746 10 6.30622 10 5C10 3.34315 8.65685 2 7 2C5.34315 2 4 3.34315 4 5C4 6.30622 4.83481 7.41746 6 7.82929V16.1707C4.83481 16.5825 4 17.6938 4 19C4 20.6569 5.34315 22 7 22C8.65685 22 10 20.6569 10 19C10 17.7334 9.21506 16.6501 8.10508 16.2101C8.45179 14.9365 9.61653 14 11 14H13C16.3137 14 19 11.3137 19 8V7.82929C20.1652 7.41746 21 6.30622 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.30622 15.8348 7.41746 17 7.82929V8C17 10.2091 15.2091 12 13 12H11C9.87439 12 8.83566 12.3719 8 12.9996V7.82929ZM18 6C18.5523 6 19 5.55228 19 5C19 4.44772 18.5523 4 18 4C17.4477 4 17 4.44772 17 5C17 5.55228 17.4477 6 18 6ZM6 19C6 18.4477 6.44772 18 7 18C7.55228 18 8 18.4477 8 19C8 19.5523 7.55228 20 7 20C6.44772 20 6 19.5523 6 19Z' fill='currentColor'%3E%3C/path%3E%3C/g%3E%3C/svg%3E")
      no-repeat;
  }

  @media (min-width: 960px) {
    .icon {
      font-size: 16px;
    }
  }

  .items {
    position: absolute;
    z-index: 1;
    top: 32px;
    right: 0;
    width: 300px;
    padding: 0.5rem;
    border: var(--sr-border);
    border-radius: 4px;
    background-color: var(--sr-c-bg-section);
    box-shadow: var(--sr-float-shadow);

    .item {
      display: flex;
      justify-content: space-between;
      padding: 0.2rem;
      transition: all 0.3s ease;
      color: var(--sr-c-text);

      &:hover {
        color: var(--sr-c-text-hover);
        font-weight: bold;
      }
    }
  }
}
</style>
