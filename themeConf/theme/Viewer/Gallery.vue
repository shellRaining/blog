<script lang="ts" setup>
import Viewer from "viewerjs";
import { onMounted } from "vue";
import "viewerjs/dist/viewer.css";

onMounted(() => {
  // TODO: refactor this
  const el = document.getElementById("images");
  if (el) {
    new Viewer(el, {
      toolbar: {
        prev: {
          show: 1,
          size: "large",
        },
        next: {
          show: 1,
          size: "large",
        },
      },
    });
  }
});
</script>

<template>
  <ul id="images">
    <div class="image-wrapper">
      <slot></slot>
    </div>
  </ul>
</template>

<style scoped>
:slotted(img) {
  height: 300px;
  margin: auto 40px;
}
</style>
