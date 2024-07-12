<template>
  <article>
    <h1 class="main-head">Gallery</h1>
    <div class="operation">
      <button @click="importDiary">
        <span>import</span><span class="icon import"></span>
      </button>
      <button @click="exportDiary">
        <span>export</span><span class="icon export"></span>
      </button>
    </div>

    <div class="card desc-box">
      <p>
        这是我从 pixiv
        收集到的画片，我从其中挑选出了我认为最优雅的一些放在这里，他们就像是一个笔记本的一页，每张都承载着我一段思绪和旧念。若你感兴趣，可以依次点开图片欣赏，再次点击可以打开更大的窗口。若心情不佳，你也可以在旁边的文本框记录自己的心绪……
      </p>
      <p>
        我把他们按照时间排列，用一种我感觉还算比较优雅的方式组织起来，陈列在这里。但还存在一些问题，如果一个月的画片过多或者过少，都会造成布局的不平衡，如果你有什么好主意，可以在
        <a href="https://github.com/shellRaining/blog/issues">issue</a>
        中反馈。
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
function importDiary() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = JSON.parse(e.target?.result as string);
      res.forEach((item: { link: string; content: string }) => {
        localStorage.setItem(item.link, item.content);
      });
      location.reload();
    };
    reader.readAsText(file);
  };
  input.click();
}

function exportDiary() {
  const res = [];
  for (const key in localStorage) {
    if (key.includes("pixiv")) {
      res.push({
        link: key,
        content: localStorage.getItem(key),
      });
    }
  }

  const a = document.createElement("a");
  const file = new Blob([JSON.stringify(res)], { type: "application/json" });
  a.href = URL.createObjectURL(file);
  a.download = "diary.json";
  a.click();
}
</script>

<style scoped>
.card {
  background-color: var(--sr-c-bg-section);
  padding: 1rem;
  margin: 1rem;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: var(--sr-card-shadow);
  }
}

h1 {
  text-align: center;
  font-size: 2.5rem;
  font-weight: bold;
}

.operation {
  text-align: center;
  padding: 1rem;

  button {
    margin: 0 1em;
  }

  .import {
    mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath d='M4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12' stroke='%231C274C' stroke-width='1.5' stroke-linecap='round'/%3E%3Cpath d='M12 14L12 4M12 4L15 7M12 4L9 7' stroke='%231C274C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3C/svg%3E")
      no-repeat;
  }
  .export {
    mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath d='M4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12' stroke='%231C274C' stroke-width='1.5' stroke-linecap='round'/%3E%3Cpath d='M12 4L12 14M12 14L15 11M12 14L9 11' stroke='%231C274C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3C/svg%3E")
      no-repeat;
  }
}

.desc-box {
  text-indent: 2em;

  & > p {
    margin: 1rem 0;
  }

  a {
    color: var(--sr-c-link);
    text-decoration: underline;
    transition: all 0.25s;

    &:hover {
      color: var(--sr-c-link-hover);
    }
  }
}
</style>
