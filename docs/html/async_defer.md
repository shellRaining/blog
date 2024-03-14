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

## defer 标签

当解析到该标签后，浏览器会去下载该脚本，但是并不会阻塞 DOM 树的解析过程，当 DOM 树解析完成后，在 DOMContentLoaded 事件触发前，会按照顺序执行 defer 标签的脚本。

在 `DOMContentLoaded` 事件触发前，或者执行该脚本前，如果 DOM 树已经解析完成，那么页面也会绘制（部分）出来。所以说 defer 脚本不会阻塞页面的绘制。但是之后执行如果出现操作 DOM 的情况，那么就可能发生回流和重绘。

::: tip
defer 虽说会按照执行顺序执行，但是测试并不是这样的
:::
