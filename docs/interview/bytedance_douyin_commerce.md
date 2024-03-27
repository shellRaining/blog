---
title: 字节跳动抖音前端电商实习生
tag:
  - interview_process
date: 2024-03-19
---

## 一面

1. 自我介绍
   这里我说了四个项目
   1. 校内软工基项目
   1. 基于 vitepress 的个人博客
   1. 使用 Vue3 开发的 SPlayer
   1. 使用 Lua 开发的 hlchunk.nvim，还有获得的 star 数量
1. 他接着问项目的难点，我的回复如下
   1. vitepress 的画廊组件实现
   1. hlchunk.nvim 中的面向对象实现
1. let var 之间的区别，我回答的是作用域之间的区别，还有就是他们在执行上下文上获取的时机（var 是最开始查找的，let 在比较靠后的一次查找）
1. 闭包是什么，我回答了一个简单的例子，还有就是闭包的应用场景，我回答的是私有属性的实现，还有比如节流函数的实现
1. 浏览器 URL 输入到响应解析完成的过程，我回答的是两部分，包括了 DNS 解析，还有 HTTP 请求的过程
1. TCP 是如何保证可靠传输的，我回答的是超时重传，还有就是序列号的应用
1. 讲讲 promise 的实现，我回答了一个简单的例子，还有就是 promise 的链式调用，最后又问 promise 实现是基于什么的（实际上是基于浏览器事件循环机制）
1. 紧接着就是事件循环机制，我回答了一个简单的例子，还有就是宏任务和微任务的区别
1. 代码结果输出题，是有关 settimeout 和 var 结合的题目，之后又让我改成正确的
1. 手写 promise all 函数，但是并发控制