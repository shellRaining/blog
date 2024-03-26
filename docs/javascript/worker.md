---
title: 工作者线程
tag:
  - javascript
  - interview_question
date: 2024-03-15
---

## worker 简介

web worker 可以说是为 JavaScript 带来了多线程的能力，主线程创建一个工作者线程，将一些任务分配给工作者线程，后者在后台默默执行，二者互不干扰，等到任务结束后，工作者线程通过一些内置的 API 将结果返回。

我们一般将高延迟或者计算密集型的任务交给工作者线程，因为可能会阻塞主线程，导致页面卡顿（从这里也能看出这项能力是浏览器带给 JavaScript 的，而且实际上，这也是 HTML5 提供的能力）。

使用时候有几个注意点

1. 要执行的工作者线程脚本必须与页面同源
1. 工作者线程不能访问 DOM（document，window） 等 API，防止不一致性
1. 所加载的文件必须来自网络，不能是本地文件
1. 通信不能像操作系统中的线程那样直接共享内存，只能通过消息传递

工作者线程还有分类

1. Dedicated Worker：专用工作者线程，只能被创建它的脚本所使用
1. Shared Worker：共享工作者线程，可以被多个同源页面共享
1. Service Worker：服务工作者线程，用于创建离线应用，消息推送等，常用在 PWA 中

## 使用

### 创建线程

通过 Worker 对象创建一个工作者线程

```javascript
// main.js
const worker = new Worker("./worker.js");
console.log("this is main");
```

```javascript
// worker.js
console.log("this is worker");
```

我们这里会看到两个 log，分别是 `this is main` 和 `this is worker`，这就说明了工作者线程的创建成功。而且需要注意的是，先打印的是 `this is main`，再打印的是 `this is worker`，这说明了工作者线程是异步创建的

### 主线程和工作者线程之间通信

发送信息，主线程和工作者线程都是使用 `postMessage` 方法，但是主线程是通过 `worker.postMessage`，而工作者线程可以直接调用 `postMessage` 方法，因为工作者线程中的 `this`（或者是 `self`）被设置为 `DedicatedWorkerGlobalScope`

如果要监听事件，同理，主线程使用 `worker.onmessage`，而工作者线程使用 `onmessage`

示例代码如下：

```javascript
// main.js
const worker = new Worker("./worker.js");
worker.postMessage("hello");
worker.onmessage = function (e) {
  console.log("Main: Message received from worker", e.data);
};
```

```javascript
// worker.js
self.onmessage = function (e) {
  console.log("Worker: Message received from main", e.data);
  self.postMessage("world");
};
```

这里会看到两个 log，分别是 `Worker: Message received from main hello` 和 `Main: Message received from worker world`，这就说明了主线程和工作者线程之间的通信成功

### 更多内容

比如如何关闭工作者线程和引入脚本和错误处理等，可以参考[阮一峰的博客](https://www.ruanyifeng.com/blog/2018/07/web-worker.html)

同理发送信息的方法还有广播（适用于共享工作者线程）

## 使用场景

- 射线追踪：Ray tracing 使用 CPU 密集型数学计算来模仿光线的路径。所有的这些计算逻辑可以放在 Web Worker 中以避免阻塞 UI 线程。
- 预取数据：为了优化网站或者网络应用及提升数据加载时间，你可以使用 Workers 来提前加载部分数据以备不时之需。不像其它技术，Web Workers 在这种情况下是最棒哒，因为它不会影响程序的使用体验。
- 渐进式网络应用（PWA）：即使在网络不稳定的情况下，它们必须快速加载。这意味着数据必须本地存储于浏览器中。这时候 IndexDB 及其它类似的 API 就派上用场了。大体上说，一个客户端存储是必须的。为了不阻塞 UI 线程的渲染，这项工作必须由 Web Workers 来执行。
- 拼写检查：因为一个基本的拼写检测器是这样工作的－程序会读取一个包含拼写正确的单词列表的字典文件。字典会被解析成一个搜索树以加快实际的文本搜索。当检查器检查一个单词的时候，程序会在预构建搜索树中进行检索。如果在树中没有检索到，则会通过替换可选单词并测试单词是否可用。这个检索过程中的所有工作都可以交由 Web Worker 来完成，这样用户就只需输入单词和语句而不会阻塞 UI，与此同时 worker 会处理所有的搜索和供给建议。

## 参考

- [阮一峰](https://www.ruanyifeng.com/blog/2018/07/web-worker.html)
- [https://github.com/Troland/how-javascript-works/blob/master/worker.md](https://github.com/Troland/how-javascript-works/blob/master/worker.md)
