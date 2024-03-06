---
title: 边距折叠
tag:
  - css
  - interview_question
date: 2024-03-06
---

## 通过 AI 提问和 MDN 文档整理的问题与解答

1. 什么是边距折叠（margin collapse）？它在什么情况下会发生？

   > 区块的上下外边距有时会合并（折叠）为单个边距，其大小为两个边距中的最大值（或如果它们相等，则仅为其中一个），这种行为称为外边距折叠。注意：有设定浮动和绝对定位的元素不会发生外边距折叠。
   > 发生情况有三：
   >
   > 1. 相邻兄弟元素之间
   > 1. 父子元素之间没有边距，padding 等阻挡，子元素的 margin 会溢出到父元素外边
   > 1. 空元素自己的上下边距会折叠，比方说一个 div 里面没有内容，那么这个 div 的上下边距会折叠

1. 水平边距是否会发生折叠现象？

   > 不会，外边距折叠仅与垂直方向有关。

1. 边距折叠会在哪些类型的 CSS 布局中不发生？

   > flex 和 grid 布局中

1. 请解释父子元素之间的边距折叠。当子元素的 margin-top 大于父元素的 margin-top 时，会发生什么？

   > 1. 如果父元素没有设置 border、padding、inline 内容、高度或最小高度，子元素的 margin-top 会与父元素的 margin-top 发生折叠，最终形成一个较大的 margin-top 值。
   > 1. 如果父元素设置了 border、padding、inline 内容、高度或最小高度，那么子元素的 margin-top 不会与父元素的 margin-top 发生折叠，而是会保留各自的 margin 值。

1. 如何避免边距折叠？

   > 1. 尽量使用 padding 代替 margin，或者使用 border 代替 margin
   > 1. 使用 overflow: hidden auto 或者 float（破坏性太强）来阻止折叠
   > 1. 使用 display: flex 或者 display: grid 来阻止折叠
   > 1. 通过触发 BFC 来阻止第二种情况的折叠，触发 BFC 方式有很多，比如设置 display: flow-root（最好的方式）

1. 当使用负边距时，边距折叠会如何表现？

   > 如果负边距是一正一负，那么会相互抵销，如果都是负的，则会取绝对值最大的那个

   这个可以参考文章 [https://www.joshwcomeau.com/css/rules-of-margin-collapse/#negative-margins-10](https://www.joshwcomeau.com/css/rules-of-margin-collapse/#negative-margins-10)

## 参考

[https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_box_model/Mastering_margin_collapsing](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_box_model/Mastering_margin_collapsing)
