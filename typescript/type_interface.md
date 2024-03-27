---
title: type 和 interface 的区别和使用场景
tag:
  - typescript
  - interview_question  
date: 2024-03-26
---

1. type 可以描述任何类型组合，interface 只能描述对象结构
2. interface 可以继承自（extends）interface 或对象结构的 type。type 也可以通过 & 进行交叉类型
3. interface 可以进行声明合并（注意如果有重名的属性会报错），type 不可以合并


一般来说，如果不清楚什么时候用interface/type，能用 interface 实现，就用 interface , 如果不能就用 type 。

## 参考

- [https://github.com/SunshowerC/blog/issues/7](https://github.com/SunshowerC/blog/issues/7)
