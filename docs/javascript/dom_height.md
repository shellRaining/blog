---
title: JavaScript 操作 DOM 元素的四种高度
tag:
  - javascript
date: 2024-03-07
---

## height

`height` = CSS设置的内容高度，不包括内边距(padding)、边框(border)和外边距(margin)

这个是一个 CSS 属性，无法通过 DOM 元素直接获取

## clientHeight

只读属性 Element.clientHeight 对于没有定义 CSS 或者内联布局盒子的元素为 0；否则，它是元素内部的高度（以像素为单位），包含内边距，但不包括边框、外边距和水平滚动条（如果存在）。

`clientHeight` 可以通过 `CSS height + CSS padding - 水平滚动条高度（如果存在）` 来计算。

<img width='' src='https://developer.mozilla.org/zh-CN/docs/Web/API/Element/clientHeight/dimensions-client.png'>

## offsetHeight

在 clientHeight 基础上增加了滚动条高度和 border 高度

<img width='' src='https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/offsetHeight/dimensions-offset.png'>

## scrollHeight

Element.scrollHeight 只读属性是一个元素内容高度的度量，包括由于溢出导致的视图中不可见内容。

<img width='' src='https://developer.mozilla.org/zh-CN/docs/Web/API/Element/scrollHeight/scrollheight.png'>

## innerHeight

浏览器窗口的视口（viewport）高度（以像素为单位）；如果有水平滚动条，也包括滚动条高度。

<img width='' src='https://developer.mozilla.org/zh-CN/docs/Web/API/Window/innerHeight/firefoxinnervsouterheight2.png'>
