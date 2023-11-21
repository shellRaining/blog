---
title: javascript string 方法
tag:
  - javascript
date: 2024-01-09
---

## 数组方法分类

红宝书中记录的字符串方法实在是很难评，确实不是很好记忆，这里使用网络上的一些方法进行记忆

### 操作方法

即增删改查

- `concat`
- `slice` `substr` `substring`
  其中 `substr` 是最特殊的，其接受一个起始位置参数，还有一个是截断长度的参数
  在没有负参数的时候， `slice` 等同于 `substring`，其中 `slice` 会视负参数为 `length - idx`，而 `substring` 会将负参数归零
- 改的方法都是返回一个新的字符串，因为字符串本身不可变
  - `trim` `trimLeft` `trimRight`
  - `repeat`
  - `padStart` `padEnd`
  - `toLowerCase` `toUpperCase`
- `charAt` `charCodeAt` `indexOf` `startWith` `includes`

## 转换方法

- `split` 将字符串转化为数组

## 模式匹配方法

- `match` `search` `replace`
  其中 `match` 接受一个正则表达式字符串，或者正则表达式对象，返回一个数组
  `search` 参数和 `match` 相同，但是返回的是一个索引，如果没找到返回 -1
  `replace` 接受一个查找的对象，还有一个用来替换的目标

## 参考

[javascript 面试](https://vue3js.cn/interview/JavaScript/string_api.html#%E4%B8%80%E3%80%81%E6%93%8D%E4%BD%9C%E6%96%B9%E6%B3%95)
