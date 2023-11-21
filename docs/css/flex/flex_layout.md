---
title: flex 布局
tag:
  - css
  - flex
date: 2024-04-23
---

## flex 布局

flex 布局是一种现代布局方式，主要是用来在一维进行子元素的布局操作，比如操纵子元素对齐方式，排列方向顺序等。

和 flex 布局相关的属性有两类，一类是作用于 flex 容器上的，另一类是作用于 flex 子项上的。

如果要使用 flex 布局，首先要设置 flex 容器的属性，即 `display: flex` 或者 `display: inline-flex`。

## flex 基本原理

因为提到了是一维布局，所以主要概念包括主轴和交叉轴。默认情况下从左到右是主轴，从上到下是交叉轴。flex 子元素就是在主轴上进行排列的。这是最基本的概念。`writing-mode` 会改变主轴方向，但是涉及 `i18n` 就不讨论了。

下面的表格式 flex 容器属性和 flex 子项属性。

| 容器                 | 子项              |
| ------------------ | --------------- |
| `flex-direction`   | `order`         |
| `flex-wrap`        | `flex-grow`     |
| `flex-flow`        | `flex（包含三项子元素）` |
| `justifiy-content` | `align-self`    |
| `align-items`      |                 |
| `align-content`    |                 |

## flex 容器属性

详情见 [flex 容器属性](./flex_container.md)

## flex 子项属性

详情见 [flex 子项属性](./flex_elements.md)

