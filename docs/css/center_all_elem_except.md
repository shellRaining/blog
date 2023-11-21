---
title: 设置除第一个元素和第二个元素的所有元素水平居中
tag:
  - css
description: 当我们想要将一个 flexbox 中的所有元素水平居中时，我们可以使用 justify-content，但是第一个和最后一个也会居中，我们使用一些技巧来调整它
date: 2024-01-03
---

## 最小复现

```html
<div class="pagination">
    <button>Previous page</button>
    <span class="pagination-span-curpage">some text</span>
    <button>Next page</button>
</div>
```

## 解决方案

首先,遇到这种在一行对齐多个元素的情况,我们优先选择 `flexbox` 来解决

```css
.pagination {
    display: flex;
    justify-content: center;
    position: relative;
}
```

然后分别设置第一个和最后一个元素的样式

```html
<div class="pagination">
    <button>Previous page</button>
    <span class="pagination-span-curpage">some text</span>
    <button>Next page</button>
</div>
```

```css
.pagination {
    display: flex;
    justify-content: center;
    position: relative;
}

.pagination > *:first-child {
    position: absolute;
    left: 0;
}

.pagination > *:last-child {
    position: absolute;
    right: 0;
}
```

其中 `*:first-child` 和 `*:last-child` 分别表示第一个和最后一个元素


## 解决方案 2

在群里面问了一遍,有大佬给出来了另外一种解决方案,通过设置 `margin` 来实现

```css
.pagination {
    display: flex;
    justify-content: center;
}

.pagination > *:first-child {
    margin-right: auto;
}

.pagination > *:last-child {
    margin-left: auto;
}
.
```
