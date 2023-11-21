---
title: 腾讯文档软件开发-前端开发方向
tag:
  - interview_process
date: 2024-03-08
---

## 一面

1. 自我介绍还有项目介绍，我介绍了四个项目
    - 校内软工基项目
    - 基于 vitepress 的个人博客
    - 使用 Vue3 开发的 SPlayer
    - 使用 Lua 开发的 hlchunk.nvim，还有获得的 star 数量
2. 他接着问项目的难点，我的回复如下
    - blog 中 book 组件的实现，但是当时我的思路不是很清晰，可能回答没有用让面试官很好的理解。这个项目的主要难点是如何检测文本是否溢出 div，如果溢出了应该如何分割文本，我的实现过程是：先创造一个 style 相同的盒子，然后将文本全部装到盒子中，如果此时发生 scrollHeight > height（此时说 clientHeight 也可以），就将文本对折二分，继续重复如上过程

3. 跨域是什么，如何解决
4. Vue 和 react 实现的区别，Vue 的响应式原理是什么
5. cookie 和 session 的区别，还有 localstorage
