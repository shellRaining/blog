---
title: 博客性能优化随笔
tag:
  - vitepress
date: 2024-09-20
collection: vitepress
---

在使用 vitepress 这个静态框架来编写博客的时候，很容易就能取得 lightinghouse 满分的效果，这是因为他在很多地方进行了优化的结果，我们这里挑出一些来重点讲解。

## 静态站点生成（SSG）

vitepress 是一个静态博客生成框架，而不是一个服务端渲染框架，因为所有的内容在构建时就已经确定了，而不是在请求时确定。比如我们的博客文章，他们都是提前编写好的，然后在构建时编译成了相应的 HTML 文档，但是在加载过程中，实际上还会导入一个 JavaScript bundle，将页面变成一个 SPA 应用。这一点可以从编译产物中看出来（编译产物见 [vitepress 构建流程](./build.md)）。

这个特性保证了 vitepress 的优异性能，同时还具有一定的可交互性，博客文章都是静态的，交互的特性都是打包后的 JavaScript bundle 提供的。不过这对我也有一点小小的影响，比如博客第一次打开的时候，是没有文章渐入的动画效果的，这是因为 vitepress 提供的是服务端渲染后的代码，vue 在初次打开时会有一个水合（或者叫做激活）的步骤，他直接将事件监听器附加到已有的 DOM 上，导致动画没有触发

```vue
<template>
  <TransitionGroup appear @before-enter="beforeEnter" @enter="enter">
    <li
      v-for="(post, index) in props.posts"
      :key="post.url"
      :data-index="index"
    >
      <PostItem :post="post" />
    </li>
  </TransitionGroup>
</template>
```

但！我们可以做一些小 trick，来狡猾的添加动画，基本思路如下

```vue
<template>
  <ul>
    <TransitionGroup
      v-if="mounted"
      @before-enter="beforeEnter"
      @enter="enter"
    >
      <li v-for="item in l1">
        <div>{{ item }}</div>
      </li>
    </TransitionGroup>
    <template v-else>
      <li v-for="item in l2">
        <div :style="{ visibility: 'hidden' }">{{ item }}</div>
      </li>
    </template>
  </ul>
</template>
```

可以看到我们提供了一个新的文章列表，但是这个列表里面所有的项都是不可见的，只是充当占位置的元素，等到水合后且 mounted 执行完成后，重新加载文章列表 DOM，这时候就可以做出动画效果了！

## 预加载视口文章

在进入到我们的博客首页时，会发现有很多的博客链接，再打开开发者工具，可以看到 head 标签内有很多设置为 prefetch 的 link 标签，他们指向对应的 chunk，同时开发者工具的网络一栏也能看到相应的 prefetch，但是里面具体的内容看不到，这是由 prefetch 自身的特性决定的，详情可以看谷歌的[这个库](https://github.com/GoogleChromeLabs/quicklink)。

```typescript
observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const link = entry.target as HTMLAnchorElement;
      observer!.unobserve(link);
      const { pathname } = link;
      if (!hasFetched.has(pathname)) {
        hasFetched.add(pathname);
        const pageChunkPath = pathToFile(pathname);
        if (pageChunkPath) doFetch(pageChunkPath);
      }
    }
  });
});

rIC(() => {
  document
    .querySelectorAll<HTMLAnchorElement | SVGAElement>("#app a")
    .forEach((link) => {
      const { hostname, pathname } = new URL(
        link.href instanceof SVGAnimatedString ? link.href.animVal : link.href,
        link.baseURI,
      );
      if (
        // 仅预取同标签页导航，因为新标签页将加载 lean.js 代码块。
        link.target !== "_blank" &&
        // 仅预取入站链接
        hostname === location.hostname
      ) {
        if (pathname !== location.pathname) {
          observer!.observe(link);
        }
      }
    });
});
```

## 代码分割

vitepress 的代码分割做的可以称作简洁有力啊，打包后的产物分为入口 HTML（包括首页入口和各博文入口），框架 JavaScript bundle（`framework.js`），应用 JavaScript bundle（`app.js`）。

其中框架代码包含了 vitepress 的核心内容，比如 vue3 的运行时核心，路由系统，markdown 渲染（存疑）。应用代码包含了我们自己编写的主题（除了 css 会被默认拆出去形成一个单独的文件），同时，由于我们的主题依附于默认主题，所以部分主题代码还会出现在框架代码中。博文的拆分在前面已经提到了，这里不再赘述。

同时对重要代码还进行了预取，比如 `framework.js` 的代码，以供 `app.js` 使用，而不是形成一个瀑布流的请求

除了 vitepress 框架自身的代码分割，我们还可以通过动态引入其他模块（比如 viewerjs），来触发代码分割。如果我们通过顶层静态引入 viewerjs，他就会附加到 `app.js` 中，包体积会大出 20kb 左右，分割后明显能看到总包体减小，并且可以并行请求。

## favicon 的设置

favicon 虽然只是一个简单的图标，但是由于他是必须加载的低优先级资源，所以对他的优化也是有必要的。

favicon 通常使用下面的格式文件，前者所有的桌面浏览器都支持，后者现代的浏览器支持，这些图标必须是正方形的，否则可能会面临兼容性问题

- `favicon.ico` 图标
- PNG 格式图标

同时，由于使用场景非常多变，我们可能需要提供一组 16×16、32×32 和 48×48 图像集合，比如 16×16 放在地址栏，32×32 放在快捷任务栏上。这么多的图标，如果不借助工具来生成会非常困难，可以通过这个网站来实现 [https://realfavicongenerator.net/](https://realfavicongenerator.net/)，使用方法可以参考[张鑫旭的博客](https://www.zhangxinxu.com/wordpress/2019/06/html-favicon-size-ico-generator/?shrink=1)

## 画廊懒加载和优化

这部分可以去看[画廊的实现](./features/gallery.md)，唯独有一些小变化，就是关于 LQIP 的实现。我们确实没有很好的办法去生成低质量的缩略图，并且在前端提前请求这些图片，但是可以尝试在构建时将 base64 编码的 blurhash 内联到 HTML 中，然后在客户端解码，用 canvas 绘制出模糊图

```toml
[[entry]]
title = "图片示例"
image_url = "https://xxx.jpg"
blurhash = "UxKwCFIURPs:~qaKRjV@%gayV@WBkWs:jFae"
```

上面 toml 列表中的 blurhash 就是在构建时生成的，并在下面的 vue 组件中解码使用

```vue
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
```

## 尽量避免引入外部包

这个其实很难说，因为为了实现一些功能，我们不可避免的要使用一些外部模块，他们相对会做更好的性能优化和边缘情况处理，但是对于简单的场景，我们自己编写的代码已经足够应付，比如首页文章列表逐个进入的动画效果，最开始我使用的是 gsap 实现的，可以通过下面的代码替换

```typescript
// posts transition
const isMounted = ref(false);
onMounted(() => {
  if (!foldEl.value) return;
  isMounted.value = true;
  const liEls = foldEl.value.querySelectorAll("li");
  liEls.forEach((el, idx) => {
    el.style.transition = "transform 1s ease-out, opacity 1s ease-out";
    el.style.transitionDelay = `${String(idx * 0.1)}s`;
  });
});
```

这段 vue 中的 script 通过操控每个列表元素的 `transition` 样式，使他们获得了过渡效果和不同的延迟时间。而且这个动画的流畅程度可以和 gsap 媲美，因为他是纯 css 动画，只是通过 JavaScript 控制动画的时机而已。

## 字体优化

由于我的博客使用了落霞孤鹜字体，如果要全量引入需要大概几十兆，这对于一个博客来说肯定是很难接受的，所以最开始选用的是 CDN。在网络请求字体 css 文件后，浏览器会检测页面出现了哪些字体，然后再根据 css 中 font-face 定义的规则去重新请求分块后的字体，从而实现字体的子集化和分块化，减小了网页加载时间。

但这并不能保证网页性能达到满分，因为根据上述的流程可以知道，我们是首先请求的 css 文件后采取请求实际的字体文件，这会有一个先后顺序，导致瀑布请求发生，并且只有当页面文字全部出现后我们才能知道要去请求哪些分块，这又会导致字体的闪烁问题（浏览器在没有接收到字体文件时先采用回退字体，请求后又重新采用落霞孤鹜字体）。并且字体的分块完全由 CDN 控制，并不能更精细的只选择所有用到的字体，从网络加载页面中可以看到，每个字体分块大概 60KB，共请求十几次，也就是 0.6MB，难免会降低性能。

于是思考有没有更激进的字体子集化策略呢？答案是有的，并且由于我们的静态博客的先天优势，用户几乎很难手动输入一些数据，所以我们可以精确地计算出博客中共出现了哪些字形，然后用字体子集化工具来减小体积，代码如下

```JavaScript
function getAllFiles(patterns) {
  return patterns.flatMap((pattern) =>
    glob.sync(pattern, { cwd: projectRoot, absolute: true }),
  );
}

function extractCharacters(files) {
  let characters = new Set();
  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    for (let char of content) {
      characters.add(char);
    }
  });
  return Array.from(characters).join("");
}

const filePatterns = ["**/*.md", "**/*.toml"];
const mdAndTomlFiles = getAllFiles(filePatterns);
const text = extractCharacters(mdAndTomlFiles);

const fontmin = new Fontmin()
  .src(srcPath)
  .use(Fontmin.glyph({ text }))
  .use(Fontmin.ttf2woff2())
  .dest(destPath);

fontmin.run(function(err, files) {});
```

精简后的字体文件只有 300KB 左右，并且可以丢弃掉原来的 css 文件，直接通过 preload 进行预加载，然后通过内联样式引用字体，达到充分并发的效果，代码如下：

```html
<link rel="preload" href="/font/LXGWWenKaiScreen.woff2" type="font/woff2"
as="font" crossorigin="anonymous">
<style>
@font-face {
  font-family: "LXGW WenKai Screen";
  src: url("/font/LXGWWenKaiScreen.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

:root {
  --vp-font-family-base: "LXGW WenKai Screen", sans-serif;
}
</style>
```

> [!tip]
>
> 字体在预加载的时候一定要记得加上 `as`，否则开发者工具会报错，剩下的两个属性似乎没有太大影响，但加上也不会有问题，没准还能更好的处理兼容性问题呢！

这样做也有坏处，没有被打包进去的字会回退到浏览器默认字体，比如你在搜索框输入“萍”这个字，就可以看到回退的效果。实际上我们只打包了一千四百多个汉字，而生活中常用的汉字有四千多个，可以说还是有很大几率出问题的。

## 文件压缩

如果查看开发者面板，你会看到如下的网络请求面板

![network_transfer](https://2f0f3db.webp.li/2024/09/network_transfer.png)

一共传输了 637kb 的资源，但是后面还跟了一个 869kb 资源，这表示我们的网络请求使用到了压缩技术，解压后一共是 869kb 的占用，压缩率大概是 73%，可以说相当可观了，你为地球减少碳排放做出了重大的努力！（bushi）

把网络面板的大请求行选项打开后，可以看到每个资源具体的压缩情况，比如我们的 HTML 资源，从 16.5kb 直接压到 4.6kb，点一下这个文件，查看可以接受的压缩方式为 `accept-encoding: gzip, deflate, br, zstd`，实际压缩方式为 `content-encoding: br`，这表示我们最终选用 `brotli` 格式来进行压缩

至于具体如何开启压缩，你无须担心，vercel 已经替我们做了这个事情，在他们的文档中也有说明

> Vercel's Edge Network regularly maintains a configuration file for the MIME types that will be compressed for both `gzip` and `brotli`:
>
> **Application MIME types**
>
> - `json`
> - `javascript`
> - `wasm`
> - `...`
>
> **Font file types**
>
> - `otf`
>
> **Image file types**
>
> - `svg+xml`
> - `bmp`
>
> **Text file types**
>
> - `css`
> - `javascript`
> - `markdown`
> - `...`

> [!tip]
>
> 虽然 `gzip` 已经存在了相当长的时间，但 `brotli` 是由 Google 开发的一种较新的压缩算法，尤其适用于文本压缩。如果你的客户端支持 [brotli](https://en.wikipedia.org/wiki/Brotli)，建议优先于 [gzip](https://en.wikipedia.org/wiki/LZ77_and_LZ78#LZ77)，因为：
>
> - `brotli` 压缩的 JavaScript 文件比 `gzip` 小 14%
>
> - HTML 文件比 `gzip` 小 21%
>
> - CSS 文件比 `gzip` 小 17%
>
> `brotli` 相对于 `gzip` 的优势在于它使用了客户端和服务器端共有的常见关键词字典，从而实现了更好的压缩比。

上面都说的是文件压缩，字体压缩也很重要，我们这里采用了先进的 woff2 格式来储存字体，他自身已经做了很好的压缩，无需采用其他压缩算法了！

## 网络协议

这算是一个小尾巴，前面我们对数据和代码做了很多的文章，也不能忽视信息传送的途径，打开开发者工具的网络面板，勾选协议栏，可以看到多种协议，比如 h2（http2 的缩写） 或者 http1.1，我见过的网站大多开启了 http2，这是因为提升真的很大，比对如下：

http1.1 的网络请求概览

![vite_http1](https://2f0f3db.webp.li/2024/09/vite_http1.png)

http2 的网络请求概览

![vite_http2](https://2f0f3db.webp.li/2024/09/vite_http2.png)

这里能看到 http1.1 的概览有六行请求的柱子，而 http2 只有一行，这就是他们的重要差别，详情可以看 [http 版本介绍](../../book/MDN/http_version.md)，在启用了 http2 后，不仅传输数据变少了，而且速度更快！

## 随笔尾声

从上面一系列的措施来看，我们进行性能优化主要通过以下几个方面

1. 文件大小，极力采用压缩比好的算法，并对源代码进行最小化，上传文件前也通过在线平台进行压缩
2. 加载时机，避免因网络请求阻塞网页，规定好高优先级的加载文件（如 HTML CSS 和框架 JavaScript chunk），低优先级（一些无关紧要的 icon 和需要预加载的博文信息）。还有利用 JavaScript 的视口交叉 api 进行懒加载
3. 文件拆分，有时候文件实在太大了，就通过动态引入的方式来引导 vite 进行代码拆分，通过网络的并发请求来降低大文件影响
4. 服务端渲染，这是提升最大的一个点，使用前 lightinghouse 只有六七十分，但是使用后直接能拉满！
