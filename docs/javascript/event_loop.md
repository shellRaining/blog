---
title: JavaScript 事件循环
tag:
  - javascript
  - interview_question
date: 2024-03-14
---

事件循环是一种机制，为了协调事件、用户交互、脚本、UI 渲染、网络请求，用户代理必须使用事件循环

## 运行机制

1. 所有同步任务都在主线程上执行，形成一个执行栈（Execution Context Stack）
1. 主线程之外，还存在一个任务队列（Task Queue）。只要异步任务有了运行结果，就在任务队列之中放置一个事件
1. 一旦执行栈中的所有同步任务执行完毕，系统就会读取任务队列，看看里面有哪些待执行事件。那些对应的异步任务，于是结束等待状态，进入执行栈，开始执行
1. 主线程不断重复上面的第三步

## 宏任务，微任务

JavaScript 的异步任务根据事件分类分为两种：宏任务（MacroTask）和微任务（MicroTask）

- 宏任务：main script、setTimeout、setInterval、setImmediate（Node.js）、I/O（Mouse Events、Keyboard Events、Network Events）、UI Rendering（HTML Parsing）、MessageChannel
- 微任务：Promise.then（非 new Promise）、process.nextTick（Node.js）、MutationObserver

宏任务与微任务的区别在于队列中事件的执行优先级。进入整体代码（宏任务）后，开始首次事件循环，当执行上下文栈清空后，事件循环机制会优先检测微任务队列中的事件并推至主线程执行，当微任务队列清空后，才会去检测宏任务队列中的事件，再将事件推至主线程中执行，而当执行上下文栈再次清空后，事件循环机制又会检测微任务队列，如此反复循环。

示例如下：

```javascript
console.log(1);

setTimeout(() => {
  console.log(2);
}, 0);

let promise = new Promise((res) => {
  console.log(3);
  resolve();
})
  .then((res) => {
    console.log(4);
  })
  .then((res) => {
    console.log(5);
  });

console.log(6);

// 1 3 6 4 5 2
```

## requestAnimationFrame

这里和 `requestAnimationFrame` 还有点关系，这个函数告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行。

::: tip
若你想在浏览器下次重绘之前继续更新下一帧动画，那么回调函数自身必须再次调用 requestAnimationFrame()。requestAnimationFrame() 是一次性的。
:::

::: warning
警告： 请确保总是使用第一个参数（或其他一些获取当前时间的方法）来计算动画在一帧中的进度，否则动画在高刷新率的屏幕中会运行得更快。请参考下面示例的做法。
:::

```javascript
const element = document.getElementById("some-element-you-want-to-animate");
let start, previousTimeStamp;
let done = false;

function step(timestamp) {
  // 这里如果不适用 timestamp 而是直接固定移动一个距离，那么在不同的设备上动画速度会不一样
  if (start === undefined) {
    start = timestamp;
  }
  const elapsed = timestamp - start;

  if (previousTimeStamp !== timestamp) {
    // 这里使用 Math.min() 确保元素在恰好位于 200px 时停止运动
    const count = Math.min(0.1 * elapsed, 200);
    element.style.transform = `translateX(${count}px)`;
    if (count === 200) done = true;
  }

  if (elapsed < 2000) {
    // 2 秒之后停止动画
    previousTimeStamp = timestamp;
    if (!done) {
      window.requestAnimationFrame(step);
    }
  }
}

window.requestAnimationFrame(step);
```

如果一个宏任务或者微任务执行了超过一帧的事件（16.67ms），那么这个执行的频率会受到影响

和 setTimeout 动画相比，他的优势有

1. 优化的帧率：requestAnimationFrame 的设计目标是尽可能地精确地配合浏览器进行渲染，以实现最佳的画面效果。它会在每次重新绘制屏幕前运行一次，也就是所谓的一帧。大部分设备的刷新频率是 60Hz，意味着每秒钟刷新 60 次，所以理论上 requestAnimationFrame 一秒钟会运行大约 60 次。如果设置 setTimeout 的间隔为 16ms（大约相当于 60 帧/秒）来执行动画，因为 JavaScript 和浏览器的刷新并不完全同步，所以可能会出现掉帧或者动画卡顿的情况。
1. 智能暂停：当标签页不可见或隐藏时，requestAnimationFrame 将会自动暂停，不再进行渲染，这节省了 CPU 和 GPU 的运行时间，同时降低了设备的功耗。而 setTimeout 则会继续运行，即使用户并未在查看页面。
1. 浏览器优化：浏览器知道动画正在进行，所以它可以优化对此动画的处理，例如更智能地进行图层复合、跳过非必须的样式或布局计算等。
