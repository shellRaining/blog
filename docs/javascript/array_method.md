---
title: javascript Array 方法
tag:
  - javascript
date: 2024-01-09
---

## 数组方法分类

按照红宝书的分类方法,分为了十二种

- 构造方法 `Array`, `Array.from` 和 `Array.of`
  其中 from 是针对可迭代对象进行转换, of 是针对 Array 构造函数无法处理多个单值而产生的,其接受多个元素,然后返回组合起来的数组
- 检测方法 `isArray` 这是一个 ES6 的方法
- 迭代器方法 `keys`, `values` 和 `entries`
- 填充方法 `fill`, `copywithin`
- 转换方法 `toString` 和 `toValue`
- 栈方法 `pop` 和 `push`
- 队列方法 `shift` 和 `unshift`
- 排序方法 `sort` 和 `reverse`
- 操作方法 `concat` `slice` 和 `splice`
- 搜索与位置方法 `indexof` `lastIndexOf` 和 `find` `findIndexOf`
- 迭代方法 `every`  `some` `map` `foreach` 和 `filter`
- 归并方法 `reduce` 和 `reduceRight`
