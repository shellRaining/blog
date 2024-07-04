---
title: 钉钉文档协同前端实习生
tag:
  - interview_process
date: 2024-04-25
---

## 一面（70 min）

1. 首先就是自我介绍，还是老四套，这里有一些伏笔，首先讲一下

   大二软工基：这里涉及了 jwt 鉴权，于是他问了

   1. 鉴权还有哪些方式，我说了 cookie、session、token，还有前两种的缺点，分别是 XSS 和 CSRF 攻击，还有时效性短。
   1. jwt 的原理，即头部、载荷、签名，然后说 jwt 是如何工作的
   1. 如果用户两台设备登录，一台设备更改密码，要重新登录，那么另一个设备的 jwt 怎么办，这里说可以使用 sessionID 来辅助，但是我没听懂为什么

   个人博客项目，这个也是拷打最严重的，首先提到了路由（history API 实现的路由）
   
   1. 这个前端的分页效果是如何做的，回答通过 history API（pushState 事件监听，还有 pushState 方法）
   2. 所以为什么不使用 replaceState，这里说了 replaceState 会替换当前的历史记录，而 pushState 是添加历史记录，所以会有前进后退的效果
   3. 点击首页 icon 回到首页，结果出 bug 了，问了可能会是哪里的问题，答的不好

   SPlayer 项目，这个没有拷打

   `hlchunk.nvim`，这个是最引以为傲的项目，做了一个演示，然后问：

   1. 这个 chunk 首行尾行是如何判断获取的，答：通过分析语法树，从低向上找到第一个符合要求的节点，然后获取其范围
   2. indent 做的时候有什么挑战性，答：针对大文件做的优化（类似于虚拟列表），还有内部业务实现

2. 拷打 Vue，手写 Vue 响应式原理，这里也是拷打的很严重

    1. 为什么使用 weakmap 来作为存储 effectFn 的结构，答：因为 weakmap 的 key 是弱引用，所以不会造成内存泄漏
    2. reactive 的实现，答：通过 Proxy 实现，然后说了一下 Proxy 的优势
    3. 如果是 a.b = 3，这个过程会发生什么，访问 a 触发 get，写入 b 触发 set。这个和深度代理有点关系

    ::: info
    回想的时候才感觉当时答错了，当时还有点信誓旦旦。
    :::

    4. Vue 修改列表后触发视图更新的过程，要注意 diff 算法。

3. 最长递增子序列，没做过