---
title: grid 布局中的容器属性
tag:
  - css
  - grid
date: 2024-02-18
---

## grid-template-rows 和 grid-template-columns

语法格式如下

```plaintext
.container {
  grid-template-columns: <track-size> ... | <line-name> <track-size> ...;
  grid-template-rows: <track-size> ... | <line-name> <track-size> ...;
}
```

`grid-template-columns` 和 `grid-template-rows` 用来控制每行每列的大小，他们可以使用新的单位 `fr 分数单位 (fraction unit)`，类似 [`flex-grow`](../flex/flex_elements.md#flex-grow)，也可以不使用分数单位，可以混搭使用，先计算固定的长度，然后剩余空间使用分数规则平分。如果出现 `auto`，比如 `auto 1fr 1fr 1fr`，我们先计算 `auto` 所占的空间（一般来说为文字宽度），然后平分。

语法中还出现了 `<line-name>`，这个是用来给行或列命名的每两个格子之间会有一个隐式的线，可以通过这个线来命名，这个名字可以在 `grid-template-areas` 中使用。

这里还可以使用 `repeat()` 函数来重复某个值，比如 `grid-template-columns: repeat(3, 1fr 2fr)`，这个表示重复 3 次，每次分别是 `1fr 2fr`，同时这里命名的网格线也可以重复。

## grid-template-areas

语法格式比较复杂，通过一个实例来说明

```css
.container {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
    grid-template-areas:
        "葡萄 葡萄 葡萄"
        "龙虾 养鱼 养鱼"
        "龙虾 养鱼 养鱼"
        "西瓜 西瓜 西瓜";
}
```

使用的时候，可以通过 `grid-area` 来引用这个名字，比如

```css
.item {
    grid-area: 葡萄；
}
```

::: tip
如果我们给网格区域命了名，但是没有给网格线命名，则会自动根据网格区域名称生成网格线名称，规则是区域名称后面加 `-start` 和`-end`。例如，某网格区域名称是“葡萄”，则左侧 column 线名称就是 `葡萄-start`，左侧 column 线名称就是 `葡萄-end`。
:::

## gap

`gap`  定义了每个单元格之间的间距，这是一个单双值单位，如果指定两个值，分别表示每行之间的间距和每列之间的间距。他还有两个分别声明的属性 `row-gap` 和 `column-gap`，分别表示行间距和列间距。

::: warning
`gap` 属性是改过名的，原名 `grid-gap`，为了保持兼容性，现在还可以使用，见 [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/gap)
:::

## justify-items 和 align-items

他们都是操纵网格中所有子元素的属性，决定子元素在网格内部对齐的方式

## justify-content 和 align-content

只有网格整体小于承载他的盒子的时候才有用，这个是决定网格整体的表现行为，比如拉伸（stretch）、居中（center）、分散（space-around）等。

## place-items 和 place-content

这两个属性是 `align-items` 和 `justify-items` 以及 `align-content` 和 `justify-content` 的简写，据说支持性有待考证。

## 参考

- [https://www.zhangxinxu.com/wordpress/2018/11/display-grid-css-css3/](https://www.zhangxinxu.com/wordpress/2018/11/display-grid-css-css3/)
