---
title: 携程前端训练营随笔
tag:
  - essay
date: 2024-02-15
---

## 标题栏设置图标

编写页面时候为了美化 UI，需要为页面设置一个 icon，而这涉及到 [[ ../html/link | link 使用方法 ]]

## woff 格式字体的引入

## 可访问性，可聚焦……

## 实现自适应宽度

## css 变量具有作用域吗

## label 标签使用

在处理这样的布局的时候，需要

## grid 布局的使用

在进行如下图的布局的时候

<img src='https://raw.githubusercontent.com/shellRaining/img/main/2402/grid_layout.png'>

可以看到需要对每个单元格都进行精细的操作，比如控制他们的 background-color，但这里就不是 grid 应该做的事情了，应该交给 CSS 选择器来进行这些操作，grid 仅负责布局，关于 grid 详细信息见 [CSS grid](../css/grid)

## nth-child 使用方式

选择器叠加的问题

```css
  &:nth-child(5n + 2) {
    background-color: #eff9ff;

    &:first-child {
      background-image: linear-gradient(180deg, #3c83fa 0%, #50b2fa 100%);
    }
  }
```

## border-radius 作用的范围，background color 会溢出的情况

## a figure 等标签的原生样式

## fixed stick absolute 等布局

最下面有一个每日签到的悬浮按钮，我们需要他固定在一个位置，这涉及到了 CSS 中的 [布局操作](../css/layout#position-%E5%AE%9A%E4%BD%8D%E5%B8%83%E5%B1%80)

## 使用 background 来做分隔符

rel 属性是用来做什么的

## 图标和文本进行居中

## 雪碧图使用

::: warning
`Intervention` Slow network is detected. See https://www.chromestatus.com/feature/5636954674692096 for more details. Fallback font will be used while loading:
:::
