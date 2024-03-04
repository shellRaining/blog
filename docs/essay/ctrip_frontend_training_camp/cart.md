---
title: 使用 react native 实现的购物车
tag:
  - essay
  - react native
  - trainingCamp
date: 2024-03-03
---

## 计划

1. 使用 `json-server` 构建后端，数据从 `localhost:3001/data` 获取
1. 实现商品界面，包含商品名称，价格，添加到购物车按钮
   - 设计稿来自 [https://dribbble.com/shots/16667217-E-Library-Shop-UI/attachments/11703744?mode=media](https://dribbble.com/shots/16667217-E-Library-Shop-UI/attachments/11703744?mode=media)
   - 首先实现商品列表，可能需要 grid 实现（是否有办法实现响应式效果）
   - 抽象出每个格子中商品组件，包含商品 icon，名称，价格，添加到购物车按钮
1. 实现购物车界面，包含购物车商品列表，总价，结算按钮
1. 使用 `react-redux` 来管理商品和购物车的状态，提供用来更改状态的 action
1. 将数据绑定到 2 和 3 中的组件上
1. 实现购物车的动画效果，包括商品添加到购物车时的动画，购物车商品列表的动画

## 使用到的技术

- `react-native` 来构建界面
- `react-redux` 来管理状态
- `json-server` 作为模拟后端来请求数据

## 启动项目

先启动服务器

```bash
npm run server
```

然后启动项目

```bash
npm install
npm run start
```

