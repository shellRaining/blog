---
title: 事件机制
tag:
  - html
  - interview_question
date: 2024-03-16
---

## 冒泡机制

当一个事件发生在一个元素上，它会首先运行在该元素上的处理程序，然后运行其父元素上的处理程序，然后一直向上到其他祖先上的处理程序。这就是冒泡机制。

```html
<style>
  body * {
    margin: 10px;
    border: 1px solid blue;
  }
</style>

<form onclick="alert('form')">FORM
  <div onclick="alert('div')">DIV
    <p onclick="alert('p')">P</p>
  </div>
</form>
```

这里点击 `P` 时，会依次弹出 `p`、`div`、`form`。

大多数事件都会冒泡，但是有一些事件不会冒泡，比如 `focus`。

我们可以通过一些 JavaScript API 来获得事件的信息，比如下面的代码例子

```javascript
document.body.addEventListener('click', function (e) {
  console.log(e.target.tagName)
  console.log(e.currentTarget.tagName)
})
```

通过 `target` 可以获取事件发生的精确位置，通过 `currentTarget` 可以获取事件处理程序所在的位置。同时，事件处理程序中的 `this` 也是指向 `currentTarget`。

::: tip
其实所有事件处理器的 `this` 参数都是绑定到放置监听器的 DOM 元素，我们可以通过 `this` 来访问元素的属性（或者是子节点）
:::

我们也可以通过 `stopPropagation` 来阻止事件冒泡。在事件处理程序中调用 `e.stopPropagation()` 即可

## 捕获机制

DOM 事件标准描述了事件传播的 3 个阶段：

- 捕获阶段（Capturing phase）—— 事件（从 Window）向下走近元素。
- 目标阶段（Target phase）—— 事件到达目标元素。
- 冒泡阶段（Bubbling phase）—— 事件从元素上开始冒泡。

如图所示：

<img width='' src='https://raw.githubusercontent.com/shellRaining/img/main/2403/event_handle.png'>

使用 `on<event>` 属性或使用 HTML 特性（attribute）或使用两个参数的 `addEventListener(event, handler)` 添加的处理程序，对捕获一无所知，它们仅在第二阶段和第三阶段运行。

为了在捕获阶段捕获事件，我们需要将处理程序的 capture 选项设置为 true：

```javascript
elem.addEventListener(..., {capture: true})
// 或者，用 {capture: true} 的别名 "true"
elem.addEventListener(..., true)
```

同理，要移除处理程序，`removeEventListener` 需要同一阶段

