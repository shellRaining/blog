---
title: flex 单值语法
tag:
  - book
  - css
date: 2024-09-05
---

## flex 单值语法规则

flex 实际上是由三个 css 属性组合而成的，分别是

- [`flex-grow`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex-grow)
- [`flex-shrink`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex-shrink)
- [`flex-basis`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex-basis)

前两者都是没有单位的，最后一个属性为了与他们区分必须加上单位，比如百分号之类的

他的单值语法规则如下：

1. 如果是特殊关键字，就使用关键字对应的规则，比如 `auto`，`none`，`initial`
2. 如果是无单位数字，那么可以拓展为 `flex: flex-grow 1 0`
3. 如果是有单位数字，那么可以拓展为 `flex: 1 1 flex-basis`

把这个规则记住，剩下的就很简单了

### `flex: inital`

表示如果仅仅设置了 `display: flex` 的初始值，设置后元素在空间多余时不会主动伸长，但是会在空间不够的时候收缩，并且初始的长度为 auto，这里面的 `flex-basis` 很有讲究，我们稍后再说

### `flex: none`

表示元素放弃了弹性的能力，既不能伸长，也不能缩短，初始长度为 auto，等价于 `flex: 0 0 auto`

### `flex: auto`

表示元素元素可以伸长和缩短，初始长度为 auto，等价于 `flex: 1 1 auto`

### `flex: 1`

根据上面的规则，可以扩写成 `flex: 1 1 0`，表示可以伸长和缩短，但是和 `flex: auto` 相比，在空间不足时有一些细微的差别，稍后再说

### `flex: 0`

根据上面规则扩写成 `flex: 0 1 0`，表示仅可以缩短

## flex-basis

可以看到上面的章节仅仅介绍了扩写后的样子，但是具体差别我们还不清楚，而这和 `flex-basis` 息息相关

如果这个值为 `auto`，在面临收缩的时候，元素会先尝试保持其内容大小或指定大小，然后再根据 flex-grow 和 flex-shrink 调整。这很类似于收税，税率一致，初始收入高的人税后还是收入高，收入低的最终也还是低

如果这个值为 0，面临收缩时，首先将元素的初始大小设置为 0，然后元素会尽可能地进行弹性的收缩和拉伸。这很类似于土改，先收回所有人的土地，然后均分下去，以保证绝对的公平

所以对于 `flex: auto` 和 `flex: 1` 来说，前者更适合元素充分利用剩余空间，但是各自的尺寸按照各自内容进行分配的时候，后者用来强调宽度完全一致

## 参考

- [https://www.zhangxinxu.com/wordpress/2020/10/css-flex-0-1-none/?shrink=1](https://www.zhangxinxu.com/wordpress/2020/10/css-flex-0-1-none/?shrink=1)
- [https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex](https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex)
- [https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex-basis](https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex-basis)
