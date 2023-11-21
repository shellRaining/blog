---
title: Vue 的生命周期钩子
tag:
  - vue
  - interview_question
date: 2024-01-08
---

## 生命周期钩子

Vue 中的组件实例在创建的时候会经历一系列的初始化步骤，比如设置好数据侦听器、编译模板、将实例挂载到 DOM 并在数据变化时更新 DOM 等等。同时在这个过程中也会运行一些叫做生命周期钩子的函数，这些钩子函数可以给我们提供一个机会在特定的生命周期阶段执行一些逻辑。

::: warning
生命周期钩子必须在同步函数中执行，不能够在异步代码 (比如定时器中) 执行
:::

<img src='https://raw.githubusercontent.com/shellRaining/img/main/2404/lifecycle.png'>


但是这个图包含了选项式 API 和 组合式 API 两种写法的生命周期钩子，我们需要区分一下

### 选项式 API

首先注意,选项式 API 的钩子函数都是不以 on 为开头的，反之 Vue3 不是

#### beforeCreate

首先在初始化一个组件以后，会调用 [`beforeCreate` 钩子](https://cn.vuejs.org/api/options-lifecycle.html#beforecreate)，这个钩子中实例已经初始化，并且 props 已经成功设置，但是响应式数据还没有设置好

#### created

在组件实例处理完所有与状态有关的选项后，会调用 [`created` 钩子](https://cn.vuejs.org/api/options-lifecycle.html#created)，此时已经完成了响应式数据的设置，计算属性，侦听器方法已经成功设置，故可以开始异步数据的请求。与此同时组件并没有挂载到 DOM 上，因此 `$el` 没有办法正常使用

<!-- TODO: 需要结合 `miniVue` 代码来理解 -->

#### beforeMount

当这个钩子被调用时，组件已经完成了其响应式状态的设置，但还没有创建 DOM 节点。它即将首次执行 DOM 渲染过程。

#### mounted

组件被挂载后调用,此时可以访问 `$el`

#### beforeUpdate

此时还可以更改和访问组件中的响应式数据,不会引发死循环

#### updated

不要在 updated 钩子中更改组件的状态，这可能会导致无限的更新循环

### 组合式 API

最开始调用的是 setup 函数,用来构建 data 和 method

