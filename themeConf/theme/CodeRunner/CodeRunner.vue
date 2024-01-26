<script lang="ts" setup>
import { useSlots } from "vue";

const props = defineProps<{
  height?: number;
  width?: number;
}>();

const text = useSlots().default?.()[0].children || "";
const baseUrl = "//unpkg.com/javascript-playgrounds@^1.0.0/public/index.html";
const parameters = {
  code: `${text}`,
  styles: { playerRoot: { backgroundColor: "red" } },
};
console.log(parameters);

const srcUrl =
  baseUrl + "#data=" + encodeURIComponent(JSON.stringify(parameters));
</script>

<template>
  <iframe
    :width="props.width ?? 500"
    :height="props.height ?? 300"
    :src="srcUrl"
  ></iframe>
</template>

<style scoped></style>
