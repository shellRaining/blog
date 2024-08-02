---
title: vitepress 中实现画廊
tag:
  - vitepress
date: 2024-08-01
collection: vitepress
---

## 前言

作为一个肥宅，最喜欢的事情肯定也包括收集画片，在之前我是以 markdown 形式记录的，但是由于 pixiv 防盗链的限制，我们无法直接引用到他的图片，需要手动存储到图床上，有风险且不方便。因此我在思考能不能通过直接解析 pixiv 图片 id，然后请求反代理服务器（或者使用 worker 转发请求），获取到最终的图片，并最终展示为画廊的形式，这才有了最近的工作。

## 实现

这次的工作量不像上次的文章版本那么少，涉及到 markdown 语法解析，处理内联 link，图片持久化，图片请求，worker 设置，动画效果，响应式排版等各种方面，先尝试理清思路，给出核心代码

### markdown 解析

因为要兼容以前写下的 markdown 文件，因此需要手动解析其中的内容，虽说有 `markdown-it` 这样能够一步做到渲染的工具，但是我们需要获取其中的文本，这是更细粒度的需求，因此考虑 `treesitter`（也不枉我学 neovim，笑）来解析。选择的解析器是 [https://github.com/tree-sitter-grammars/tree-sitter-markdown](https://github.com/tree-sitter-grammars/tree-sitter-markdown)（另一个国人写的解析器已经废弃，不再维护），为此要额外引入两个模块，注意是开发依赖而不是运行依赖，因为我们是在构建时获取数据，不涉及客户端的工作。

```JSON
  "devDependencies": {
    "@tree-sitter-grammars/tree-sitter-markdown": "^0.2.3",
    "tree-sitter": "^0.21.1",
  }
```

我们希望每个 markdown 条目被解析成包括标题，描述，图片 link 这样的形式，尽可能的减少对特定语法的依赖。最终返回的构建时数据也是遵循这样的形式。

这里要注意 markdown 是两个解析器，一个总解析器，一个 inline 内容解析器，我们得创建两个 parser，分别设置他们的 language，并构造出他们的树

```TypeScript
  const content = readFileSync(path).toString();
  const markdownParser = new Parser();
  const inlineParser = new Parser();
  markdownParser.setLanguage(Markdown);
  inlineParser.setLanguage(Markdown.inline);
  const markdownTree = markdownParser.parse(content);
  const inlineTree = inlineParser.parse(content);
```

我们后面通过深度优先遍历找到所有的 section，将他们组成一个数组，然后对里面的节点进行 `descendantsOfType` 操作，获取所有的 `atx_heading` 类型节点，同理 link 标签。还有一些边缘情况，就不赘述了

### 图片请求

由于获取的数据不一定符合要求，我们可能还要再做一些映射，比如 link 到 id，id 到代理服务器等。前面一部分好说，后面还是有很多讲究的。我没有代理服务器，只能用 worker 转发凑数，参考 [pixiv 反代理](https://pixiv.cat/)。

本来我还想要在这里实现 LQIP （Low Quality Image Placeholders）的，但是 worker 支持的 npm package 有限，仅能访问部分 node module，故作罢。

> [!note]
>
> 其实也可以申请低分辨率图片，但反代理提供的接口有限，我还要再去找找其他的类似工具

实现 LQIP 还有一种可能，就是使用 base64 内联小图片，但我们是将内容上传到静态服务器的，然后远程还要重复构建一次，因此会导致开发流程割裂成三块，`开发`，`预构建`，`远程构建`，想了想还是放弃

下面是转发图片请求的 worker 代码，可以看到只是简单的进行了字符串处理操作

```JavaScript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id')
    if (!id) return new Response('Missing image ID', { status: 400 })
    if (!/^[a-zA-Z0-9]+$/.test(id)) return new Response('Invalid image ID', { status: 400 })
    const targetURL = `https://pixiv.cat/${id}.png`
    const response = await fetch(targetURL)
    return response
  },
};
```

客户端请求操作分为两部分，查看缓存，实际请求，分别包裹在一个 try catch 中。

代码第一行有 `shouldLoad` 变量，用来进行并发控制，这是父组件的要求，同时 `loaded` 事件也是同样为了配合这一行为。

在之后是使用 `idb-keyval` 进行缓存读取，这里有个库的 bug，[https://github.com/jakearchibald/idb-keyval/issues/165](https://github.com/jakearchibald/idb-keyval/issues/165)，现在来看只能打开一个新的数据库来解决，但实在是不优雅，故未做处理

最后就是网络请求，这里请求到的是一个 blob 对象，最后需要 `createObjectURL` 创建一个额外的链接

```TypeScript
async function loadImage() {
  if (!props.shouldLoad) return;

  try {
    const cachedImage = await get(props.id);
    if (cachedImage) {
      imageUrl.value = URL.createObjectURL(cachedImage);
      emit("loaded");
      return;
    }
  }

  try {
    const url = new URL(reqBaseURL);
    url.searchParams.append("id", props.id);
    const response = await fetch(url);
    const blob = await response.blob();
    await set(props.id, blob);
    imageUrl.value = URL.createObjectURL(blob);
  } finally {
    emit("loaded");
  }
}
```

### 画廊设计

果然还是设计最烦心，为了保证每个月的所有图片都能展示，就要给图片适当的缩放和裁切，在 codepen 上找来找去，最后还是 [https://codepen.io/shell-Raining/pen/QWXdrEb](https://codepen.io/shell-Raining/pen/QWXdrEb) 比较现实。既有优雅的动画，也有简单的交互，总体来说还是比较适合的。

但是如果一个页面有二十几张图片在同一个视口，性能（请求和展示）上来说肯定很爆炸，因此还要考虑数据的持久化，并发控制，图片懒加载等特性。

图片懒加载有两种方案：一种是通过图片自身的 `loading` 属性，将其设置为 `lazy` 即可；另一种就是通过 `interactionObserver` 来查看是否交叉，我这里两种都采用了，主要看一下 `interactionObserver`。注意这里我使用 vue 的模板引用语法，而不是直接使用 document，因为 Vitepress 是一个 SSR 框架，如果使用 document 就会在服务端爆出 not found 的错误，并可能导致水合失败，降低客户端性能

```TypeScript
onMounted(() => {
  if (!mainEl.value) return;

  const sectionElements = mainEl.value.querySelectorAll("section");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const albumName = entry.target.getAttribute("data-album");
        if (albumName) {
          visibleAlbums.value.add(albumName);
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  sectionElements.forEach((el) => observer.observe(el));
});
```

> [!warning]
>
> 我写完观察器以后，观察器似乎没有效果，排查一阵子以后发现是页面高度塌陷导致的，因为最开始相簿是懒加载的，里面不存在图片来填充高度，导致塌陷问题，设置一个 `min-height` 可以解决

动画效果没有什么好说的，可以看 codepen 的源码，那里已经写得很清晰了，主要工作就是设置 3D 视角，然后进行 transform 变换，分别在 Y 轴 和 width 上做手脚。

虽说简单，但还是遇到了闪烁的问题，为此请教张鑫旭老师，下面记录一下对话卡片

> [!note]
>
> 张老师好，我想请教您一下 div 使用 background-image 和 img 标签的区别（在结合 hover 的情况），具体问题如下：
> 我找到了一个波浪卡片效果例子 [codepen](https://codepen.io/HighFlyer/pen/GRLZYKw)，他的实现是通过给 div 标签设置 background-image，实现效果很正常，我尝试将 div 改成 img 标签，但是在光标经过两个图片之间时候，hover 的状态会消失，导致闪烁的效果，我很好奇是为什么。
> 我最开始以为是内联元素和块元素的区别，给 img 设置 display block 后还是没有结果，问了 GPT 感觉说的也不是很让人信服，想请教您一下，多谢！

> [!tip]
>
> 可能图片间隙让hover悬停丢失了，demo里面插入了::before, ::after填充的间隙。你可以试试间隙使用透明边框实现看看。图片比例放大的时候，图片和图片之间出现间隙导致的。加个透明边框，图片的透明边框互相重叠试试

> [!note]
>
> 多谢老师，是我之前透明边框宽度没有设置足够长 ，我把边框改为 10px，margin 改成 -10px 后就不会出现上面的问题了

## 源码

[https://github.com/shellRaining/blog/tree/main/theme/Gallery](https://github.com/shellRaining/blog/tree/main/theme/Gallery)
