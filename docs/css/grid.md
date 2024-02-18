---
title: CSS 中 grid 布局
tag:
  - css
date: 2024-02-18
---

## 基本布局

网格布局是作用于两级的 DOM 结构，设置 `display: grid` 的元素成为*网格容器*，其子元素变成*网格元素*

使用上述的 display 后，网格容器会表现成为块级元素的样子，100% 填充可用的宽度，这种性质可以通过 `display: inline-grid` 改变（这个属性使用的不多）

新属性 `grid-template-columns` 和 `grid-template-rows` 用来控制每行每列的大小，他们可以使用新的单位 `fr 分数单位 (fraction unit)`，类似 [`flex-grow`](./flex#flex-grow)，也可以不使用分数单位，可以混搭使用，先计算固定的长度，然后剩余空间使用分数规则平分

`gap`  定义了每个单元格之间的间距，这是一个单双值单位，如果指定两个值，分别表示每行之间的间距和每列之间的间距

::: warning
`gap` 属性是改过名的，原名 `grid-gap`，为了保持兼容性，现在还可以使用，见 [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/gap)
:::

## 网格原理
