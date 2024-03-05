---
title: TODO list 设计与实现
tag:
  - essay
  - trainingCamp
date: 2024-03-05
---

## 使用方式

### 构建

构建 h5 页面

```bash
npm run dev:h5
```

构建小程序

```bash
npm run dev:weapp
```

### 页面使用

TODO 使用方式

1. 首先加入一个 TODO，在顶部输入框输入内容后，按下 Enter 或者点击左侧的加号按钮，而最右侧的数字按钮点按可以选择优先级（一共从 0 到 5）
1. 点击 TODO 左侧的圆圈，可以标记为完成，再次点击可以标记为未完成，点击右侧的垃圾桶可以删除 TODO
1. 点击底部左下角按钮可以排序，点击右下角按钮可以筛选
1. 在微信小程序中，底部最右侧还可以转发

## 需求

1. 实现 TODO list 的基本功能
   - 添加 TODO
   - 删除 TODO
   - 标记 TODO 完成
   - 标记 TODO 未完成
1. 给 TODO 添加优先级，并可以根据优先级进行筛选
1. 针对不同的环境，给出不同的交互方式
1. 将样式美化

## 步骤

根据上述需求，可以将过程分为以下几个步骤

1. 首先搭建一个 taro 的环境，实现最初的 hello world
1. 实现 TODO list 的基本功能，设计稿来自 [https://dribbble.com/shots/22473626-ToDoApp-Arc-Browser-MixDesign](https://dribbble.com/shots/22473626-ToDoApp-Arc-Browser-MixDesign)
   1. 添加 TODO
   1. 删除 TODO
   1. 标记 TODO 完成
   1. 标记 TODO 未完成
1. 给 TODO 添加优先级，首先通过一个全局的下拉框或者 input 来直接输入优先级，后续会考虑使用其他方式美化（默认优先级为 0，最高优先级为 5）
1. 根据优先级进行筛选，同样先实现功能，然后考虑美化
1. 使用 taro 根据不同的环境，给出不同的交互方式，比如小程序要考虑转发的问题，而 h5 不需要

## 踩坑

在设置按钮的样式时候，最好使用行内样式，因为无法可能无法覆盖小程序的内置样式
