---
title: 小红书前端开发工程师-社区技术
tag:
  - interview_process
date: 2024-04-23
---

## 一面

1. 自我介绍，还是老四样
2. 使用 Vue 写业务代码
    ```plaintext
    通过 input 的输入内容变更，输入内容作为 接口参数。接口返回的数据作为 Table 的数据源。
    input 只支持输入数字
    需要支持传入 id 进行筛选。没有 id 的时候，返回所有数据
    参考 API: https://jsonplaceholder.typicode.com/comments?postId=${id}
    Table 当作现成的组件，不考虑 Table 内的细节。
    不考虑 loading 和 error
    可以使用 React Vue Axios 和其他 js 原生方法
    ```
    其中夹杂了 Vue3 中 `computed` 和 `watch` 的使用差异
3. Vue 生命周期
4. 从 URL 输入到页面展示的过程
