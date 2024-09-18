---
title: vitepress 构建流程
tag:
  - vitepress
date: 2024-07-23
collection: vitepress
---

## 构建产出

我打算从构建产物开始入手，先从宏观的角度看一下构建流程。首先在 `docs` 目录下运行 `vitepress build`，然后看 `docs/.vitepress/dist` 目录，

假设我们只有两篇文章，位于项目根目录的 `algorithm` 目录下，可以看到如下的目录结构

```plaintext
.
├── 404.html
├── algorithm
│   ├── once.html
│   └── twice.html
├── assets
│   ├── algorithm_once.md.CbGg24OH.js
│   ├── algorithm_once.md.CbGg24OH.lean.js
│   ├── algorithm_twice.md.D4-k9jSa.js
│   ├── algorithm_twice.md.D4-k9jSa.lean.js
│   ├── app.DPcDdZGn.js
│   └── chunks
│       ├── VPAlgoliaSearchBox.6UWp0hz7.js
│       └── framework.DkXSMfEa.js
├── favicon.ico
├── hashmap.json
└── index.html
```

如果只看 HTML 文件，可以看到他和我们的 markdown 文件是一一对应的，这也是说为什么 Vitepress 是基于文件系统的路由，在用户给出 `https://www.shellraining.top/algorithm/once.html` 这样的链接后，托管我们博客的服务器就会返回 `/algorithm/once.html` 这个文档，同理，如果直接访问 `https://www.shellraining.top`，就会返回 `/index.html`。

但这并不意味着我们的博客是一个 MPA 应用。以直接访问首页并点击一篇文章这个过程为例，我们逐一分析：

### `/index.html`

首先看一下最先接收的 `/index.html` 的代码的 `<head>` 部分

```html
<!doctype html>
<html lang="zh-cn" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>shellRaining's blog</title>
    <meta name="description" content="A VitePress Site" />
    <meta name="generator" content="VitePress v1.3.0" />
    <link
      rel="preload stylesheet"
      href="/assets/style.CEtsbK3q.css"
      as="style"
    />
    <script type="module" src="/assets/app.DPcDdZGn.js"></script>
    <link rel="modulepreload" href="/assets/chunks/framework.DkXSMfEa.js" />
    <link rel="modulepreload" href="/assets/index.md.BgHyiSgX.lean.js" />
    <link rel="icon" href="/favicon.ico" />
    <script id="check-dark-mode">
      (() => {
        const e = localStorage.getItem("shellRaining-blog-theme"),
          a = window.matchMedia("(prefers-color-scheme: dark)").matches;
        (!e || e === "auto" ? a : e === "dark") &&
          document.documentElement.classList.add("dark");
      })();
    </script>
    <script id="check-mac-os">
      document.documentElement.classList.toggle(
        "mac",
        /Mac|iPhone|iPod|iPad/i.test(navigator.platform),
      );
    </script>
  </head>
</html>
```

我们能从中`<head>` 标签中发现很多有意思的细节

1. 首先是 `<meta>` 标签，他们都是我们在 `config.ts` 中自定义的配置，包括 `tilte`，`description`等。

2. 在他的下面是打包好的一个 css 文件，用来提供样式（一共有五千多行代码，真是挺大的）。

3. 再后面是两个 JS 文件 `app.js` 和 `framework.js`，我们随后介绍他们的作用，但需要注意他们的引入方式是不同的， `app.js` 是通过我们熟知的 `<script>` 标签来引入，而 `framework.js` 是通过 `<link rel="modulepreload" href="">` 标签引入的。

   这其实是一种前端优化手段，在 2023 年，所有的主流浏览器都已经支持了 `modulepreload` 这个新特性，它允许我们并行的加载编译（注意不是执行）脚本，而不是像之前那样先加载并执行一个主入口脚本，然后依次去请求其他的脚本。具体信息可以看 [MDN 文档](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/modulepreload#examples)

4. 后面也是一个预加载的模块 `/assets/index.md.BgHyiSgX.lean.js`，他有一个奇特的 `lean` 后缀，这表示用来优化初始页面加载和导航回初始页面的，具体是如何工作的，我们后面再说

5. 最后边就是我们的各种各种资产文件和导入的内联脚本了，包括 Google analysis，检查主题模式和平台的内联脚本等

```html
  <body>
    <div id="app">
      <!--[-->
      <div class="Layout" data-v-3a911bc4>
        <header class="VPNav" data-v-3a911bc4 data-v-511fa9ab>
          <!---->
        </header>
        <!----><!---->
        <div
          class="VPContent is-home"
          id="VPContent"
          data-v-3a911bc4
          data-v-f8fbc116
        >
          <div class="VPHome" data-v-f8fbc116 data-v-08c66739>
            <!--[--><!--]--><!----><!--[--><!--]--><!--[--><!--]--><!----><!--[--><!--[--><!--[-->
            <article class="doc" data-v-4ce9d480>
              <ul data-v-4ce9d480>
                <!--[-->
                <li class="grouped-posts" data-v-4ce9d480>
                  <section data-v-4ce9d480 style="--380ede16:" data-v-ae67e216>
                    <ul style="" data-v-ae67e216>
                      <!--[-->
                      <li data-index="0" data-v-ae67e216>
                        <a
                          class="post-title"
                          href="/docs/vitepress/dark.html"
                          data-v-ae67e216
                          data-v-a7ab59e6
                          >vitepress 主题切换</a
                        >
                      </li>
                      <li data-index="1" data-v-ae67e216>
                        <a
                          class="post-title"
                          href="/docs/vitepress/build.html"
                          data-v-ae67e216
                          data-v-a7ab59e6
                          >vitepress 构建流程</a
                        >
                      </li>
                      <!--]-->
                    </ul>
                  </section>
                </li>
                <!--]-->
              </ul>
            </article>
            <!--]--><!--]--><!--]-->
            <div
              class="vp-doc container"
              style=""
              data-v-08c66739
              data-v-c8708311
            >
              <!--[-->
              <div style="position: relative" data-v-08c66739><div></div></div>
              <!--]-->
            </div>
          </div>
        </div>
        <!----><!--[--><!--]-->
      </div>
      <!--]-->
    </div>
  </body>
</html>
```

然后再看一下 `<body>` 标签，里面有很多 HTML 注释，这些位置是预留给 JavaScript（vue）来进行动态插入 DOM 的。

同时页面还有我们写的文章列表组件，这个组件是一个服务端组件，因此刷新后是不会有动画效果的，同时由于 `IntersectionObserver`，当视口出现链接后，会进行预加载

## 执行构建命令

在我们文档根目录下执行 `pnpm run build` 的时候，会执行 `vitepress build` 命令，这个 `vitepress` 是一个可执行脚本（bin），其位置在 vitepress 包中的 `package.json` 有指出来，一般是 `bin/vitepress.js`，这个文件会间接调用 `cli.js`（被编译之前在 `/src/node/cli.ts`），然后执行其中真正的构建命令

> [!note]
>
> ```ts
> [
>   "~/.nvm/versions/node/v22.6.0/bin/node",
>   "~/Documents/blog/node_modules/vitepress/bin/vitepress.js",
>   "build",
> ];
> ```
>
> 这是启动构建进程的真正命令行参数（也即 argv）
