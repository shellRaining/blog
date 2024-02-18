---
title: CSS 中的过渡效果
tag:
  - css
date: 2024-01-16
---

## 初探

### 控制过渡效果的 CSS 属性

过渡效果是由一系列的 `transition-*` 属性控制的，这些属性包括

- `transition-property`：指定过渡效果作用的 CSS 属性
- `transition-duration`：指定过渡效果的持续时间
- `transition-timing-function`：指定过渡效果的时间函数
- `transition-delay`：指定过渡效果的延迟时间

其中他们有一个简写属性 `transition`，其属性值为 `transition-property`，`transition-duration`，`transition-timing-function` 和 `transition-delay` 的值的组合

如果想要针对不同的 CSS 属性使用不同的过渡效果，可以使用逗号来分隔，如下所示

```css
transition: border-radius 0.3s linear, background-color 0.3s ease-in 0.1s;
```

其等价于

```css
transition-property: border-radius, background-color;
transition-duration: 0.3s, 0.3s;
transition-timing-function: linear, ease-in;
transition-delay: 0s, 0.1s;
```

注意上面 transition-delay 的值为 0s，而不是 0，如果写 0 会被认为错误，声明无效

### 过渡效果的触发

触发过渡效果需要在同一个元素上的不同状态，例如 `:hover` 和 `:active`，或者使用 JavaScript 来触发，比如移除或者添加了一个类

所以过渡属性应该设置在永远指向想要发生过渡的元素上

::: info question
所以我们应该使用 id 选择器吗
:::

## 定时函数 (亦称时间函数)

内置的定时函数有以下几种

- ease：默认值，慢速开始，然后变快，然后慢速结束
- ease-in：慢速开始
- ease-out：慢速结束
- ease-in-out：慢速开始和结束
- linear：匀速

::: tip
可以这样记忆，`ease-in` 表示的就是你加速冲进去的感觉，而 `ease-out` 就是快要撞上终点减速的感觉
:::

同样，我们也可以自定义定时函数，通过使用三阶贝塞尔曲线来定义，使用到的函数是 `cubic-bezier(x1, y1, x2, y2)`

通常我们并不是自己手动计算这些参数，而是通过一些在线工具或者开发者工具生成

除了连续的过渡效果,还可以使用 `steps()` 函数来实现阶跃的效果

这个函数接受两个参数，第一个参数表示阶跃的数量，第二个参数表示阶跃的位置，其值为 `start` 或者 `end`,表示是开始还是结束时发生阶跃

![阶跃效果](https://developer.mozilla.org/zh-CN/docs/Web/CSS/easing-function/jump.svg)
