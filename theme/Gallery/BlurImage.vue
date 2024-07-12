<template>
  <canvas ref="canvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { decode } from "blurhash";

const props = defineProps<{
  blurhash: string;
  width?: number;
  height?: number;
  punch?: number;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);

const drawBlurhash = () => {
  if (!canvas.value) return;

  const ctx = canvas.value.getContext("2d");
  if (!ctx) return;

  const width = props.width || 32;
  const height = props.height || 32;
  const punch = props.punch || 1;

  canvas.value.width = width;
  canvas.value.height = height;

  const pixels = decode(props.blurhash, width, height, punch);

  const imageData = ctx.createImageData(width, height);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);
};

onMounted(drawBlurhash);
</script>

<style scoped>
canvas {
  display: block;
  max-width: 100%;
}
</style>
