<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { getFt, getSrcMap } from "./helper";

const props = defineProps({
  project: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    default: "index.html",
  },
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: String,
    default: "300px",
  },
});

// iframe operations
const iframeSrc = `/playground/${props.project}/${props.file}`;
const activeTab = ref("preview");

// code src operations
let srcMap = ref<Record<string, string>>({});
const activeFile = ref(props.file);
const activeFileContent = computed(() => {
  return srcMap.value[activeFile.value];
});

const url = "https://esm.sh/shiki@1.0.0";
onMounted(async () => {
  srcMap.value = await getSrcMap(props.project);
  const shiki = await import(url);
  const codeToHtml = shiki.codeToHtml;

  for (const filename in srcMap.value) {
    const raw = srcMap.value[filename];
    srcMap.value[filename] = await codeToHtml(raw, {
      lang: getFt(filename),
      theme: "github-dark",
    });
  }
});
</script>

<template>
  <div class="playground-viewer">
    <div class="tabs">
      <button
        @click="activeTab = 'preview'"
        :class="{ active: activeTab === 'preview' }"
      >
        Preview
      </button>
      <button
        @click="activeTab = 'code'"
        :class="{ active: activeTab === 'code' }"
      >
        Code
      </button>
    </div>

    <div class="tab-content">
      <iframe
        v-if="activeTab === 'preview'"
        :src="iframeSrc"
        frameborder="0"
      ></iframe>
      <div v-else class="code-view">
        <div class="file-tabs">
          <button
            v-for="(_, filename) in srcMap"
            :key="filename"
            @click="activeFile = filename"
            :class="{ active: activeFile === filename }"
          >
            {{ filename }}
          </button>
        </div>
        <pre class="code-block"><code v-html="activeFileContent"></code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
button {
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
  border-right: var(--sr-border);
  width: max(50%, 100px);

  &.active {
    background-color: var(--sr-c-bg-active);
  }
}

.playground-viewer {
  border: var(--sr-border);
  border-radius: 4px;
  overflow: hidden;
}

.tabs,
.file-tabs {
  display: flex;
  background-color: var(--sr-c-bg-section);
  border-bottom: var(--sr-border);
}

.tab-content {
  width: v-bind("props.width");
  height: v-bind("props.height");
}

iframe,
.code-view {
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
  box-sizing: border-box;
}

.code-view {
  display: flex;
  flex-direction: column;
}

.code-block {
  flex-grow: 1;
  overflow: auto;
  background-color: var(--sr-c-bg-section);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  padding: 1rem;
}
</style>
