---
title: flex 容器属性
tag:
  - css
  - flex
date: 2024-04-23
---

## flex 容器属性

### flex-direction

规定了 flex 容器的主轴方向，有以下四个值：

- `row`：默认值，主轴水平从左到右，交叉轴垂直从上到下
- `row-reverse`：和 `row` 相反
- `column`：主轴垂直从上到下，交叉轴水平从左到右
- `column-reverse`：和 `column` 相反

### flex-wrap

当 flex 子元素在一行内排不下时决定是否换行，有以下三个值：

- `nowrap`：默认值，不换行
- `wrap`：换行
- `wrap-reverse`：换行，但是第一行在最后

默认情况下，因为子项上会设置 `flex-shrink: 1`，因此不用担心会排列不下。

### flex-flow

是 `flex-direction` 和 `flex-wrap` 的简写形式，值为两个属性的值之间加上一个空格，比如 `row wrap`。可以理解为 flex 流动的方向和规则。

### justify-content

规定了 flex 容器内的子元素们在主轴上的对齐方式，有以下五个值：

- `flex-start`：默认值，从主轴起点开始排列
- `flex-end`：从主轴终点开始排列
- `center`：居中排列，也是我们比较常用的
- `space-between`：两端对齐，子元素之间的间距相等
  <img width='' src='https://raw.githubusercontent.com/shellRaining/img/main/2404/space-between.svg'>
- `space-around`：子元素两侧的间距相等
  <img width='' src='https://raw.githubusercontent.com/shellRaining/img/main/2404/space-around.svg'>

### align-items

规定了交叉轴上每行子元素的对齐方式

- `stretch`：默认值，子元素拉伸填满整个容器
- `flex-start`：交叉轴起点对齐
- `flex-end`：交叉轴终点对齐
- `center`：交叉轴居中对齐
- `baseline`：子元素的基线（文字的基线是 x 字母的下部）对齐

### align-content

和 `justify-content` 相似，是用来排布所有子元素在交叉轴上的方向的，但是只有在有多行子元素的情况下才会生效。这个操纵的感觉更类似于控制每行的线而不是元素。

- `stretch`：默认值，每行子元素拉伸填满当前行
- `flex-start`：所有元素在交叉轴起点对齐
- ...
