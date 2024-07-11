<script lang="ts" setup>
import Viewer from "viewerjs";
import { onMounted, onUnmounted } from "vue";
import "viewerjs/dist/viewer.css";

let viewer: Viewer | null = null;

function previewImage(e: Event) {
  const target = e.target as HTMLElement; // maybe the img element
  const currentTarget = e.currentTarget as HTMLElement; // the event binded element
  if (target.tagName.toLowerCase() !== "img") return;

  if (!viewer) {
    viewer = new Viewer(currentTarget, {
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
    viewer.show();
  }
}

onMounted(() => {
  const docDomContainer = document.querySelector("#VPContent");
  docDomContainer?.addEventListener("click", previewImage);
});

onUnmounted(() => {
  const docDomContainer = document.querySelector("#VPContent");
  docDomContainer?.removeEventListener("click", previewImage);
});
</script>

<template></template>
