---
title: 文本溢出 (单行和多行)
tag:
  - css
  - interview
date: 2024-01-10
---

## 单行文本溢出

使用下面的代码可以解决,让溢出部分显示为省略号

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

- `-webkit-line-clamp: 2`（用来限制在一个块元素显示的文本的行数, 2 表示最多显示 2 行。 为了实现该效果，它需要组合其他的WebKit属性）
- `display: -webkit-box`（和 1 结合使用，将对象作为弹性伸缩盒子模型显示 ）
- `-webkit-box-orient: vertical`（和 1 结合使用 ，设置或检索伸缩盒对象的子元素的排列方式 ）
- `overflow: hidden`（文本溢出限定的宽度就隐藏内容）
- `text-overflow: ellipsis`（多行文本的情况下，用省略号“…”隐藏溢出范围的文本)

### 通过 JavaScript 实现

- 监听DOM尺寸变化
- 判断是否溢出 `scrollHeight` > `offsetHeight`
- 二分查找多行截取字符临界值（算法的解法：判断字符串是否溢出，二分查找字符串溢出临界子串，控制...显示）

::: tip
`scrollHeight` 是一个 JavaScript 元素的只读属性,是该元素展示出来所需要的最小高度

`offsetHeight` 亦是一个只读属性,通常，元素的 `offsetHeight` 是一种元素 CSS 高度的衡量标准，包括元素的边框、内边距和元素的水平滚动条（如果存在且渲染的话），不包含:before 或:after 等伪类元素的高度。
:::
