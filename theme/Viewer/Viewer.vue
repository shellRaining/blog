<script lang="ts" setup>
import { onMounted, onUnmounted } from "vue";
import "viewerjs/dist/viewer.css";

let viewer: any = null;

async function previewImage(e: Event) {
  const target = e.target as HTMLElement; // maybe the img element
  const currentTarget = e.currentTarget as HTMLElement; // the event binded element
  if (target.tagName.toLowerCase() !== "img") return;

  if (!viewer) {
    const ViewerModule = await import("viewerjs");
    viewer = new ViewerModule.default(currentTarget, {
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
  viewer.show();
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
