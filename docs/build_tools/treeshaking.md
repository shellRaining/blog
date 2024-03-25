---
title: Tree Shaking 原理
tag:
  - build_tools
  - interview_question
date: 2024-03-25
---

## 什么是 Tree Shaking

Tree-Shaking 是一种基于 ES Module 规范的 Dead Code Elimination 技术，一般由打包工具提供该功能，它会在打包工具运行过程中静态分析模块之间的导入导出，确定 ESM 模块中哪些导出值未曾其它模块使用，并将其删除，以此实现打包产物的优化。最先在 rollup 中实现

在 webpack 中启动 Tree-Shaking 需要做以下的工作：

1. 使用 ES Module 语法
1. 生产模式下启用 `mode: 'production'`
1. 在 `webpack.config.js` 中配置 `optimization.usedExports: true`
1. 使用 ES Module 的第三方库（可选，比如 lodash-es）

## Tree Shaking 前提

在 CommonJs、AMD、CMD 等旧版本的 JavaScript 模块化方案中，导入导出行为是高度动态，难以预测的，例如：

```javascript
if(process.env.NODE_ENV === 'development'){
  require('./bar');
  exports.foo = 'foo';
}
```

而 ESM 方案则从规范层面规避这一行为，它要求所有的导入导出语句只能出现在模块顶层，且导入导出的模块名必须为字符串常量，这意味着下述代码在 ESM 方案下是非法的：

```javascript
if(process.env.NODE_ENV === 'development'){
  import bar from 'bar';
  export const foo = 'foo';
}
```

所以，ESM 下模块之间的依赖关系是高度确定的，与运行状态无关，编译工具只需要对 ESM 模块做静态分析，就可以从代码字面量中推断出哪些模块值未曾被其它模块使用，这是实现 Tree Shaking 技术的必要条件。

## Tree Shaking 原理

Webpack 中，Tree-shaking 的实现是：先标记出模块导出值中哪些没有被用过，再 Terser 删掉这些没被用到的导出语句。标记过程大致可划分为三个步骤：

- Make 阶段，收集模块导出变量并记录到模块依赖关系图 ModuleGraph 变量中
- Seal 阶段，遍历 ModuleGraph 标记模块导出变量有没有被使用
- 生成产物时，若变量没有被其它模块使用则删除对应的导出语句

## 最佳实践

1. 使用 ES Module 语法
2. 避免无意义的赋值操作，
3. 使用 `/* #__PURE__ */` 注释标记纯函数
4. 禁止 Babel 转译模块导入导出语句
5. 使用 ES Module 的第三方库（可选，比如 lodash-es）
