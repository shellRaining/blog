<script lang="ts" setup>
// shortcut keys for the whole site
function isEditingContent(e: Event) {
  const elem = e.target as HTMLElement;
  const tagName = elem.tagName;

  return (
    elem.isContentEditable ||
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT"
  );
}
let keystrokes: string[] = [];
document.addEventListener("keydown", (e) => {
  if (isEditingContent(e)) return;
  if (e.key.charCodeAt(0) < 97 || e.key.charCodeAt(0) > 122) {
    keystrokes = [];
    return;
  }
  keystrokes.push(e.key);
  const keys: string = keystrokes.join("");
  if (keys === "cd") {
    history.back();
  } else if (keys === "ga") {
    location.href = "/archive";
  } else if (keys === "gt") {
    location.href = "/tags";
  } else if (keys === "gh") {
    location.href = "/";
  }

  if (keystrokes.length >= 2) {
    keystrokes = [];
  }
});
</script>

<template></template>
