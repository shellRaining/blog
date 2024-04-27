---
title: 网格布局
tag:
  - css
  - grid
date: 2024-04-24
---

## 基本布局

网格布局是作用于二维平面的 DOM 结构，设置 `display: grid` 的元素成为*网格容器*，其子元素变成*网格元素*

使用上述的 display 后，网格容器会表现成为块级元素的样子，100% 填充可用的宽度，这种性质可以通过 `display: inline-grid` 改变（这个属性使用的不多）

grid 布局也和 flex 布局一样，控制其行为和表现的属性分为两部分，一部分是作用于容器的属性，一部分是作用于元素的属性

| 容器                      | 元素                  |
| ----------------------- | ------------------- |
| `grid-template-rows`    | `grid-row-start`    |
| `grid-template-columns` | `grid-row-end`      |
| `grid-template-areas`   | `grid-column-start` |
| `grid-template`         | `grid-column-end`   |
| `gap`                   | `grid-row`          |
| `row-gap`               | `grid-column`       |
| `column-gap`            | `grid-area`         |
| `justify-items`         | `justify-self`      |
| `align-items`           | `align-self`        |
| `place-items`           | `place-self`        |
| `justify-content`       |                     |
| `align-content`         |                     |
| `place-content`         |                     |

## 容器属性

详情见 [grid 容器属性](./grid_container.md)

## 元素属性

<!-- TODO: 详情见 [grid 元素属性](./grid_elements.md) -->

