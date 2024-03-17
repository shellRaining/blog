---
title: 隐式类型转换
tag:
  - javascript
date: 2024-01-09
---

## 概述

请看下面的图,这张图总结了所有的隐式转换规则

<img src='https://raw.githubusercontent.com/shellRaining/img/main/2401/implicit_type_conversion.png'>

这里有一个没提到，就是使用 `+` 来处理字符串时，和使用 `Number` 构造函数处理效果一样，但是 `+` 和 `Number` 也有不同的地方，处理 bigInt 类型时，`+` 会报错，而 `Number` 会正常解析

## 练习

```javascript
1 + {} // 1[object Object], 因为右侧的 {} 被视为了一个对象,根据转换规则,调用了 toString 方法
{} + 1 // [object Object]1, 理由同上
{}; + 1 // 1 这个则是因为左侧后右侧均被视为一个语句,第一个语句返回了 undefined, 第二个语句返回的是 1,故只打印了第二个
// 此外上面的这个执行结果还和执行环境有关,如果是在打印语句中,自动推断为 object 而不是一个语句了,详情见参考链接
```

## 参考

[引用类型向基本类型转换规则](https://zhuanlan.zhihu.com/p/85731460)
