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

::: tip
defer 虽说会按照执行顺序执行，但是测试并不是这样的
:::
