---
title: 如何水平对齐两个垂直组件元素
tag:
  - css
description: 使用 CSS 来对齐两个垂直放置的组件，同时两个组件还需要有确定的最大宽度，这里涉及了三方角色，我将会逐一阐释。
date: 2024-01-07
---

## 最小复现

```html
<div>
  <ul>
    <PostCard />
  </ul>
  <Pagination />
</div>
```

涉及到了三种角色 `div`、`ul`、`Pagination`。

- `div`：父容器，它的宽度是 100%。
- `ul`：子容器，它的宽度是 80%，同时有最大宽度限制 600px
- `Pagination`：子容器，它的宽度是 80%，同时有最大宽度限制 600px

于此同时 `ul` 和 `Pagination` 是垂直叠放的， 我需要二者水平居中对齐，保证宽度一致且不超过 600px。

我们逐步解决这个问题。

## 1. 父容器

首先让其宽度保证为 100%。

```css
div {
  width: 100%;
}
```

## 2. 子容器

首先确保他们是垂直叠放的。

```css
ul {
  display: flex;
  flex-direction: column;
}
```

然后让其宽度保证为 80%，同时有最大宽度限制 600px。

```css
ul {
  width: 80%;
  max-width: 600px;
}

Pagination {
  width: 80%;
  max-width: 600px;
}
```

注意这里不可以设置父元素的 `max-width`，因为会导致父元素的宽度失效。

最后是水平的居中显示，这里使用 `margin: 0 auto` 来实现。

```css
ul {
  margin: 0 auto;
}

Pagination {
  margin: 0 auto;
}
```
