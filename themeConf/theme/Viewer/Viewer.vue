<script lang="ts" setup>
import Viewer from "viewerjs";
import { onMounted } from "vue";
import "viewerjs/dist/viewer.css";
onMounted(() => {
  const viewer = new Viewer(document.getElementById("viewer-img"));

});
</script>

<template>
  <img
    id="viewer-img"
    src="https://raw.githubusercontent.com/shellRaining/img/main/head/keqing.jpeg"
  />
</template>

<style scoped></style>
