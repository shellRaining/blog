---
title: 垂直居中
tag:
  - css
  - interview_question  
date: 2024-03-17
---

## 垂直居中

1. 通过设置行内元素行高实现
2. 通过使用 calc 和绝对定位实现（子元素需要知道自己的高度）
    - 设置子元素 abosulte 定位，top: 50%，left: 50%，然后使用 calc 计算出 margin-top 和 margin-left 的值
    - 使用 transform: translate(-50%, -50%) 实现
3. 通过使用 flex 实现，通过设置 align-items 和 justify-content 实现
4. 通过使用 grid 实现，通过设置父元素为 grid 容器，子元素为 grid 项，然后使用 align-items 和 justify-items 实现
