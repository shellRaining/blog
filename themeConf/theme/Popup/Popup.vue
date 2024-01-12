<script lang="ts" setup>
// TODO: not use vexip, just write a simple component
import "vexip-ui/es/css/Tooltip";
import { Tooltip } from "vexip-ui";
</script>

<template>
  <Tooltip trigger="focus" placement="bottom">
    <template #trigger>
      <button>
        <slot></slot>
      </button>
    </template>
    <slot name="popup"></slot>
  </Tooltip>
</template>

<style scoped></style>
