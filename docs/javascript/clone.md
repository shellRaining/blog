---
title: JavaScript 拷贝
tag:
  - javascript
  - interview_question
date: 2024-03-16
---

## 浅拷贝实现

1. `Object.assign({}, obj)`
1. `Array.prototype.concat()` 仅针对数组
1. `Array.prototype.slice(0)` 仅针对数组
1. `...` 展开运算符，都适用，但是需要 ES6
1. `Object.create(obj)`，实际工作原理是，创建了一个新对象，其原型指向 obj，所以修改的时候只是在新对象上修改，不会影响原对象，访问的时候实际访问的是原对象的属性，和上面有点不同
1. 自己实现一个浅拷贝函数

- 首先要判断这是一个对象，然后再进行拷贝，因此要注意 `null` 和 `undefined` 的情况
- 同时要注意 `for...in` 循环的时候，要使用 `hasOwnProperty` 方法来判断是否是自身属性，而不是原型链上的属性

```javascript
function shallowClone(obj) {
  if (typeof obj !== "object") return obj;
  if (obj === null) return null;

  const res = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      res[key] = obj[key];
    }
  }
  return res;
}
```

## 深拷贝实现

1. 通过 `JSON.parse(JSON.stringify(obj))` 实现，但是有一些限制，比如会忽略 undefined、symbol、函数、正则等
1. 使用 `lodash` 库的 `_.cloneDeep(obj)` 方法
1. 使用浏览器的 `structuredClone` 方法，但是只能在 2022 年后的浏览器中使用。它是浏览器和任何其他实现了 window 这样全局对象的 JavaScript 运行时的一个特性，用于序列化和反序列化对象
1. 手动实现深拷贝

- 首先要判断这是不是一个对象，如果不是，直接返回原值，因此需要注意 `null` 和其他基本类型的情况
- 其次有一些特殊的对象类型，比如 `Date`，`RegExp`，他们要分别处理一下
- 还有就是循环引用的问题，我们需要一个 weakmap 来记录所有已经拷贝过的对象，如果拷贝过，直接返回拷贝后的引用

```javascript
function deepclone(obj, hash = new WeakMap()) {
  if (typeof obj !== "object") return obj;
  if (obj == null) return null;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);

  const cloned = new obj.constructor();
  hash.set(obj, cloned);
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepclone(obj[key], hash);
    }
  }
  return cloned;
}
```
