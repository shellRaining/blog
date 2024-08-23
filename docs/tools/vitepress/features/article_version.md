---
title: vitepress 中获取文件历史版本
tag:
  - vitepress
date: 2024-07-27
collection: vitepress
---

## 前言

代码需要版本管理，文章也需要……我还记得去年有一封和导师沟通的信件，因为很有价值所以我写到了博客里，但是由于博客更新，这篇文章带着 Git 记录一起丢失掉了，实属可惜，遂在新博客添加了一个查看文件历史版本的按钮。

首先确定一下需求，我们需要再每篇博客的标题处显示一个 versions 按钮，点击后出现一个弹窗，弹窗内的文本呈列表样式，每行包含提交时间和提交的哈希值，点击该行可以跳转到 GitHub 相应的链接。

然后想一下大致的实现过程，因为每篇文章都有自己的 versions，所以不能使用构建时数据加载这个功能（它一般用于生成合集或者组件的数据），我们可以考虑使用 `transformPageData` 这个钩子函数，在生成 pageData 时增加自定义字段 versions。然后我们在 `Title.vue` 组件中添加一个 `VersionDropdown.vue` 组件，用这个组件来构建相关功能。

## 实现

### 注入 pageData

我们在 `transformPageData` 钩子中调用我们自己写的函数

```TypeScript
async transformPageData(pageData, ctx) {
  await injectVersions(pageData, ctx);
},

export async function injectVersions(
  pageData: PageData,
  ctx: TransformPageContext,
) {
  const pagePath = join(ctx.siteConfig.root, pageData.filePath);
  const gitTimestamp = await getGitPageVersions(pagePath);
  const versions = gitTimestamp
    .trim()
    .split("\n")
    .map((line) => {
      line = line.slice(1, -1);
      const regex = /^(\S+)\s+(.*)$/;
      const match = line.match(regex);
      if (match) {
        const [_, hash, timestamp] = match;
        return {
          hash,
          timestamp,
        };
      }
    })
    .filter((item) => !!item);
  pageData.versions = versions;
}
```

这里有一个需要注意的点，`pageData` 中获取的 `filePath` 是相对于项目根目录的，所以我们还需要 `ctx` 中的 `root` 路径，用来拼接成最终的绝对路径。

然后通过一个 `getGitPageVersions` 函数来获取指定文件的 Git 版本信息，我们是通过 `git log --pretty="%H %ai" filepath` 这个命令实现的。但是获取到的原数据只是字符串，还不能直接使用，我们要通过 `split`，`map` 等手段处理成如下的类型

```TypeScript
const versions: {
    hash: string;
    timestamp: string;
}[]
```

获取 Git 数据的函数定义为

```TypeScript
function getGitPageVersions(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", ["log", "--pretty='%H %ai'", file]);
    let output = "";
    child.stdout.on("data", (data) => {
      output += data;
    });
    child.on("close", () => {
      resolve(output);
    });
    child.on("error", reject);
  });
}
```

这里必须要用一个 Promise 作为返回值，因为他是流式传输的数据……，只有在子进程 close 的时候才能得到完整数据。

> [!note]
>
> 我们注入的 versions 字段在 PageData 中并不存在，因此需要手动声明这个注入的类型，相关的信息可以看 [GitHub issue](https://github.com/vuejs/vitepress/issues/1937)
>
> 实现手段就是新建一个 `vitepress.d.ts`，然后声明模块
>
> ```TypeScript
> import 'vitepress';
>
> declare module 'vitepress' {
>   interface PageData {
>     versions?: {
>       hash: string;
>       timestamp: string;
>     }[];
>   }
> }
> ```
>
> 同时不要忘记在 `tsconfig.json` 中 include 这个类型声明文件

### 组件具体实现

我们这里想要的是一个 popup 的效果，并且这个功能不是很常用，故使用 `v-if Transition` 的搭配，popup 实现其实比较简单，主要是一个绝对定位的面板（注意 `z-index`），我们还需要给 `document` 设置一个点击事件监听器，如果点击位置不在 popup 面板中，我们将 open 状态设置为 false，具体代码可以看 [GitHub 仓库](https://github.com/shellRaining/blog/blob/main/theme/Doc/VersionDropdown.vue)
