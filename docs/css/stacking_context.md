---
title: 层叠上下文
tag:
  - css
date: 2024-04-24
---

## 定位带来的小问题

我们使用 `position` 属性来控制元素的定位，当使用了除了 `static` 以外的其他值时，元素就会脱离文档流，这时候可能会产生下面的小问题

这是没有使用定位的情况下的效果（我们使用 margin-left 为负值来实现元素的重叠）

<div class="box one" style="display: inline-block; width: 200px; line-height: 200px; vertical-align: top; background-color: #ea5; text-align: center; border: solid 1px black; margin-top: 0;">one</div>
<div class="box two" style="display: inline-block; width: 200px; line-height: 200px; margin-left: -60px; vertical-align: top; background-color: #ea5; text-align: center; border: solid 1px black; margin-top: 30px;">two</div>
<div class="box three" style="display: inline-block; width: 200px; line-height: 200px; margin-left: -60px; vertical-align: top; background-color: #ea5; text-align: center; border: solid 1px black; margin-top: 60px;">three</div>

此时如果给前两个元素设置 `position: relative`，效果会变成这样

<div class="box one" style="display: inline-block; width: 200px; line-height: 200px; vertical-align: top; background-color: #ea5; text-align: center; border: solid 1px black; margin-top: 0; position: relative;">one</div>
<div class="box two" style="display: inline-block; width: 200px; line-height: 200px; margin-left: -60px; vertical-align: top; background-color: #ea5; text-align: center; border: solid 1px black; margin-top: 30px; position: relative;">two</div>
<div class="box three" style="display: inline-block; width: 200px; line-height: 200px; margin-left: -60px; vertical-align: top; background-color: #ea5; text-align: center; border: solid 1px black; margin-top: 60px;">three</div>

就会发现前两个元素浮在了第三个元素的上面，这和 HTML 的渲染过程有关系

## 理解渲染过程

HTML 解析为 DOM 树并且 CSS 解析为 CSSOM 树后，合并成渲染树，最后进行布局和绘制。通常情况下，元素在 HTML 文档中的顺序就是绘制的顺序（这也是为什么模态窗口要放在 HTML 的最后面）。

但是如果出现了定位元素，浏览器会先绘制所有的非定位元素，然后再绘制定位元素，默认情况下，定位元素会在非定位元素的上面，这就是为什么前两个元素会浮在第三个元素的上面的原因。同时由于前面提到的绘制顺序规则，第二个元素也会覆盖第一个。

如果我们想要让第一个元素覆盖第二个，可以使用 `z-index` 属性来控制元素的层级，这个属性有两个注意点：

1. 只有设置了 `position` 属性的元素才能使用 `z-index` 属性
2. 会创建一个新的层叠上下文

## 层叠上下文

一个层叠上下文包含一个元素和他的子元素（这时候我们称作一组元素），给一个定位元素设置 `z-index` 后，这个元素就会成为层叠上下文的根，后代元素就是这个根的子元素。

一个层叠上下文中的元素如果处于另一个层叠上下文的后面，无论他内部的子元素 `z-index` 重新设置的有多高，也不会覆盖另一个层叠上下文的元素。这很类似于 CSS 选择器的思路，如果一个选择器中出现了 id 选择器，另一个选择器哪怕有再多的 class 组成也比不过他。例子如下：


<div class="box one" style="display: inline-block; width: 200px; line-height: 200px; vertical-align: top; background-color: #ea5; text-align: center; border: solid 1px black; margin-top: 0; position: relative; z-index: 1;">
  one
  <div class="absolute" style="position: absolute; top: 1em; right: 1em; height: 2em; background-color: #fff; border: solid 1px black; z-index: 1000; padding: 1em; line-height: initial;">nested</div>
</div>
<div class="box two" style="display: inline-block; width: 200px; line-height: 200px; margin-left: -60px; vertical-align: top; background-color: #ea5; text-align: center; border: solid 1px black; margin-top: 30px; position: relative; z-index: 1;">two</div>
<div class="box three" style="display: inline-block; width: 200px; line-height: 200px; margin-left: -60px; vertical-align: top; background-color: #ea5; text-align: center; border: solid 1px black; margin-top: 60px;">three</div>

```html
  <body>
    <div class="box one">
      one
      <div class="absolute">nested</div>
    </div>
    <div class="box two">two</div>
    <div class="box three">three</div>
  </body>
```

```css
.box {
  display: inline-block;
  width: 200px;
  line-height: 200px;
  margin-left: -60px;
  vertical-align: top;

  background-color: #ea5;
  text-align: center;
  border: solid 1px black;
}

.absolute {
  position: absolute;
  top: 1em;
  right: 1em;
  height: 2em;
  background-color: #fff;
  border: solid 1px black;
  z-index: 1000; /* 即使设置成了 1000，也因为根元素不争气，没法覆盖 */
  padding: 1em;
  line-height: initial;
}

.one {
  margin-top: 0;
  position: relative;
  z-index: 1;
}
.two {
  margin-top: 30px;
  position: relative;
  z-index: 1;
}
.three {
  margin-top: 60px;
}
```

同样可以设置层叠上下文的属性有：

- 小于 1 的 `opacity` 值
- `transform` 属性不为 `none`
- `filter` 属性

尽量不要使用太多的层叠上下文，因为这会增加浏览器的渲染负担，同时也会增加维护的难度。
