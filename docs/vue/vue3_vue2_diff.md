---
title: Vue3 和 Vue2 的区别
tag:
  - vue
date: 2024-01-07
---

## 官方文档介绍

1. 组合式 API，尽管 Vue `2.7` 目前也已经支持使用 Composition API
1. 单文件组件语法 (SFC)，还有其 setup 语法糖
1. `<Teleport>`， `Suspense` 组件等
1. `Fragment` 片段，主要是针对 `template` 标签只能够有一个根元素的问题，这个问题和透传有关系，当使用这个特性的时候，需要显式定义 attribute 应该分布在哪里
   ```vue
   <!-- Layout.vue -->
   <template>
       <header>...</header>
       <main v-bind="$attrs">...</main>
       <footer>...</footer>
   </template>

   ```
1. `emits` 组件选项，用来声明组件的事件
1. 使用 mono-repo 管理源码，这样可以在非 DOM 环境下也使用一些 Vue 的特性，比如响应式函数， `createRenderer` 等
1. 单文件组件中可以在 `style` 中使用 `v-bind`
1. 更好的 tree-shaking 支持，减少打包体积

::: warning
还有一些边边角角的不同，比如 `v-if` 和 `v-for` 的优先级等，Vue2 是先执行 `v-for` 再执行 `v-if`，而 Vue3 是先执行 `v-if` 再执行 `v-for`
:::

## 个人理解

针对响应式的设计有了非常大的变化，从原来的 `Object.defineProperty` 到现在的 `Proxy`，这样可以更好的去实现响应式，能够做到 Vue2 做不到的一些功能

1. 监听数组，map，set 等对象的变化
1. 监听对象属性的删除，新增等操作
1. 设置过程变得简洁，速度更快
