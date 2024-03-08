---
title: 文本溢出 （单行和多行）
tag:
  - css
  - interview_question
date: 2024-01-10
---

## 单行文本溢出

使用下面的代码可以解决，让溢出部分显示为省略号

```css
.text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

## 多行文本溢出

### 通过 CSS 实现

```css
.text {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}
```

- `-webkit-line-clamp: 2`（用来限制在一个块元素显示的文本的行数，2 表示最多显示 2 行。 为了实现该效果，它需要组合其他的 WebKit 属性）
- `display: -webkit-box`（和 1 结合使用，将对象作为弹性伸缩盒子模型显示 ）
- `-webkit-box-orient: vertical`（和 1 结合使用 ，设置或检索伸缩盒对象的子元素的排列方式 ）
- `overflow: hidden`（文本溢出限定的宽度就隐藏内容）
- `text-overflow: ellipsis`（多行文本的情况下，用省略号“…”隐藏溢出范围的文本）

::: warning
我在查看 MDN 文档的时候发现，这个属性是一个非标准属性，所以在使用的时候需要注意兼容性问题

其中 display: `-webkit-box` 似乎就是 `flex`，但是在 MDN 文档中并没有找到相关的解释，在参考中有相关链接，而且 box-orient 也是一个非标准属性，现在好像已经被 flexbox 取代，相关链接 [https://developer.mozilla.org/zh-CN/docs/web/css/box-orient](https://developer.mozilla.org/zh-CN/docs/web/css/box-orient)
:::

### 通过 JavaScript 实现

- 监听 DOM 尺寸变化
- 判断是否溢出 `scrollHeight` > `offsetHeight`
- 二分查找多行截取字符临界值（算法的解法：判断字符串是否溢出，二分查找字符串溢出临界子串，控制...显示）

::: tip
`scrollHeight` 是一个 JavaScript 元素的只读属性，是该元素展示出来所需要的最小高度

`offsetHeight` 亦是一个只读属性，通常，元素的 `offsetHeight` 是一种元素 CSS 高度的衡量标准，包括元素的边框、内边距和元素的水平滚动条（如果存在且渲染的话），不包含 `:before` 或 `:after` 等伪类元素的高度。

详情请看 [JavaScript 操作 DOM 元素的四种高度](../javascript/dom_height.md))
:::

## 参考

- [https://stackoverflow.com/questions/15662578/flexible-box-model-display-flex-box-flexbox](https://stackoverflow.com/questions/15662578/flexible-box-model-display-flex-box-flexbox)
- [https://www.zhangxinxu.com/study/201510/webkit-line-clamp-text-overflow-ellipsis.html](https://www.zhangxinxu.com/study/201510/webkit-line-clamp-text-overflow-ellipsis.html)
- [张鑫旭的文章](https://www.zhangxinxu.com/wordpress/2009/09/%e5%85%b3%e4%ba%8e%e6%96%87%e5%ad%97%e5%86%85%e5%ae%b9%e6%ba%a2%e5%87%ba%e7%94%a8%e7%82%b9%e7%82%b9%e7%82%b9-%e7%9c%81%e7%95%a5%e5%8f%b7%e8%a1%a8%e7%a4%ba/)
