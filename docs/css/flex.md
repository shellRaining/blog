---
title: flex 及其包含的相关属性
tag:
  - css
date: 2024-01-07
---

::: tip
这里提到的 flex 和其相关属性都是作用于 flex 子项上的，而不是 flex 容器
:::

## flex

`flex` 是三个属性的缩写，按照顺序依次是 `flex-grow`， `flex-shrink`， `flex-basis`

### 单值语法

<!-- TODO: vim 模式匹配 -->

单值语法：值必须是以下之一：

- 一个 flex-grow 的有效值 (无单位数字)：此时简写会扩展为 `flex: <flex-grow> 1 0`
- 一个 flex-basis 的有效值 (有单位数字)：此时简写会扩展为 `flex: 1 1 <flex-basis>`。
- 关键字 `none` 或者全局关键字之一。

::: info
如果使用的是全局关键字 `auto`，相当于 `flex: 1 1 auto`，会根据自身的宽高来确定尺寸，但是还会在此基础上吸收额外空间，或者收缩自身
:::

### 双值语法

- 第一个值必须是一个 flex-grow 的有效值。
- 第二个值必须是以下之一：
  - 一个 flex-shrink 的有效值：此时简写会扩展为 `flex: <flex-grow> <flex-shrink> 0`
  - 一个 flex-basis 的有效值：此时简写会扩展为 `flex: <flex-grow> 1 <flex-basis>`

### 三值语法

三值语法：值必须按照以下顺序指定：

- 一个 flex-grow 的有效值。
- 一个 flex-shrink 的有效值。
- 一个 flex-basis 的有效值。

## flex-grow

这个属性规定了 flex-grow 项在 flex 容器中分配剩余空间的相对比例，默认值为 0

剩余空间是 flex 容器的大小减去所有 flex 项的大小加起来的大小。如果所有的兄弟项目都有相同的 flex-grow 系数，那么所有的项目将剩余空间按相同比例分配，否则将根据不同的 flex-grow 定义的比例进行分配。

## flex-shrink

这个属性规定了 flex 元素的收缩规则。flex 元素仅在默认宽度之和大于容器的时候才会发生收缩，默认值为 1

## flex-basis

这个属性规定了 flex 元素在**主轴**方向上的初始大小。如果不使用 box-sizing 改变盒模型的话，那么这个属性就决定了 flex 元素的内容盒（content-box）的尺寸。默认值为 auto

::: warning
当一个元素同时被设置了 flex-basis (除值为 auto 外) 和 width (或者在 flex-direction: column 情况下设置了height) ， flex-basis 具有更高的优先级。
:::

其取值可以是：

- 一个长度值，比如 20%， 5rem， 500px
- 关键字 auto，表示其大小参照 width 或者 height 属性的值
- 关键字 content，表示其大小参照内容的大小
  - max-content，表示其大小参照内容的最大值，即使这个子元素超过了父容器的宽度，会导致溢出
  - min-content，表示内容的文字会尽量换行，充分利用垂直空间
  - fit-content，表示其尽量让文字延展，但是超过父容器会收缩

## flex 单值特例

| 单值语法            | 等同于              | 备注    |
| --------------- | ---------------- | ----- |
| `flex: initial` | `flex: 0 1 auto` | 常用    |
| `flex: 0`       | `flex: 0 1 0%`   | 使用场景少 |
| `flex: none`    | `flex: 0 0 auto` | 推荐    |
| `flex: 1`       | `flex: 1 1 0%`   | 推荐    |
| `flex: auto`    | `flex: 1 1 auto` | 使用场景少 |



## 参考

- [https://www.zhangxinxu.com/wordpress/2019/12/css-flex-deep](https://www.zhangxinxu.com/wordpress/2019/12/css-flex-deep/)
- [https://www.zhangxinxu.com/wordpress/2020/10/css-flex-0-1-none/?shrink=1](https://www.zhangxinxu.com/wordpress/2020/10/css-flex-0-1-none/?shrink=1)
