---
title: 语义化标签
tag:
  - html
date: 2024-04-23
---

## 语义化标签介绍

语义化标签是拥有明显语义的标签，比如 `<header>`、`<footer>`、`<nav>`，他们英文原本的含意就能够很好的解释所做的事情。

在 HTML5 之前，大多数标签都是通用的，比如 `<div>`、`<span>` 等，开发者需要手动通过 `class` 或者 `id` 来表达标签的含义。而 HTML5 引入了一些新的语义化标签，能够帮助开发者更好的维护 HTML 文档。

## 优势

1. 结构清晰，易于维护
1. 有利于搜索引擎 SEO
1. 有利于屏幕阅读器等辅助技术

## 常见的语义化标签使用

### section

section 用来标识一个通用的独立章节，通常包含一个标题，比如：

```html
<div>
  <h1>Heading</h1>
  <p>Bunch of awesome content</p>
</div>
```

如果不包含标题，我们也可以在一些情况下使用，比如二级导航，第一级导航已经使用 nav 包裹了，第二级就可以考虑使用 section。

### main

main 标签用来标识文档的主要内容，一个文档中只能包含一个 main 标签。

比如侧边栏，版权信息，网站 logo 等都不应该出现在 main 标签中

```html
<!-- 其他内容 -->

<main>
  <h1>Apples</h1>
  <p>The apple is the pomaceous fruit of the apple tree.</p>

  <article>
    <h2>Red Delicious</h2>
    <p> These bright red apples are the most common found in many supermarkets. </p>
  </article>

  <article>
    <h2>Granny Smith</h2>
    <p>These juicy, green apples make a great filling for apple pies.</p>
  </article>
</main>
```

main 标签对于无障碍也是非常有用的，能够快速跳过重复内容。

### article

article 常用来标识可复用的结构，比如博客文章，论坛帖子等。这就是和 section 不一样的地方。

他通常也包含一个标题，同时可以搭配 `<time>` 和 `<address>` 标签来标识时间和作者信息。

### figure

figure 用来标识一个独立的内容块，通常包含一个图片和一个标题。通常搭配 figcaption 标签使用。

```html
<figure>
  <img src="/media/cc0-images/elephant-660-480.jpg" alt="Elephant at sunset" />
  <figcaption>An elephant at sunset</figcaption>
</figure>
```
