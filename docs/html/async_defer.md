---
title: HTML script 标签的 async 和 defer 属性
tag:
  - html
  - interview_question
date: 2024-03-13
---

## async 标签

当解析到该标签后，浏览器会去下载该脚本，但是并不会阻塞 DOM 树的解析过程，当脚本下载完成后，会立即执行，此时会阻塞 DOM 树的解析过程。

多个 async 的标签执行顺序是不确定的

同时还有一个重要的点，就是这个脚本和 `DOMContentLoaded` 事件没有必然地关联，可能在这个事件之前发生，也可能是在之后发生，

当我们将独立的第三方脚本集成到页面时，此时采用异步加载方式是非常棒的：计数器，广告等，因为它们不依赖于我们的脚本，我们的脚本也不应该等待它们：

```html
<!-- Google Analytics 脚本通常是这样嵌入页面的 -->
<script async src="https://google-analytics.com/analytics.js"></script>
```

## defer 标签

当解析到该标签后，浏览器会去下载该脚本（因此行内脚本不可以使用），但是并不会阻塞 DOM 树的解析过程，当 DOM 树解析完成后，在 `DOMContentLoaded` 事件触发前，会按照顺序执行 defer 标签的脚本。

在 `DOMContentLoaded` 事件触发前，或者执行该脚本前，如果 DOM 树已经解析完成，那么页面也会绘制（部分）出来。所以说 defer 脚本不会阻塞页面的绘制。但是之后执行如果出现操作 DOM 的情况，那么就可能发生回流和重绘。

有关 `DOMContentLoaded` 事件，可以看[这里](../browser/page_life_cycle.md#domcontentloaded)

::: tip
defer 虽说会按照执行顺序执行（并且我自己的实验结果也是这样），但是有的博主说不是这样的，所以可能要根据不同浏览器差异来看
:::

## 实验

```html
<body>
  <script>
    console.log("head");
    const start = window.performance.now();
    addEventListener("DOMContentLoaded", () => {
      console.log("DOMContentLoaded", window.performance.now() - start);
      const p = document.getElementById("p");
      p.textContent = "b";
    });
  </script>
  <h1>defer</h1>
  <p id="p">a</p>
  <script src="script.js" defer></script>
  <script src="script2.js" defer></script>
</body>
```

使用浏览器打开上面的页面，会停顿两秒钟左右，然后依次输出：

```plaintext
head
script.js:2 script.js loaded
script.js:9 script.js finished
script2.js:1 script2.js loaded
（索引）:13 DOMContentLoaded 2120.7000000178814
```

我有点好奇为什么会停顿两秒钟，而不是先出现 `a`，两秒钟后再出现 `b`，这个是一个可以优化的地方，但应该如何做呢？又或者说，在扫描到 script 标签的时候，其实 DOM 还没有解析完成，导致了被阻塞的事情，我更倾向这种推测

同时我还测试了一下，如果将 defer 改为 async，那么会先输出 `a`，然后两秒后输出 `b`，这个是符合预期的，并且 script2.js 会在 script.js 之前输出，这个也是符合预期的
