---
title: lodash 中一些方法的实现
tag:
  - javascript
date: 2024-03-17
---

## get 方法

交给这个函数一个对象和一个访问的字符串路径，获取其中的值，如果找到返回，没找到返回默认传入的值

```javascript
function get(obj, path, defaultValue) {
  const newPath = path.replace(/\[/g, ".").replace(/\]/g, "").split(".");
  return (
    newPath.reduce((a, b) => {
      return (a || {})[b];
    }, obj) ?? defaultValue
  );
}
```

::: tip ?? 和 || 的区别
使用 ?? 时，只有 A 为 null 或者 undefined 时才会返回 B;

使用 || 时，A 会先转化为布尔值判断，为 true 时返回 A , false 返回 B
:::

## flattenDeep 方法

```javascript
var flatten = function (arr, n) {
  if (n == 0) return arr;
  const res = [];
  for (const elem of arr) {
    if (elem instanceof Array) res.push(...flatten(elem, n - 1));
    else res.push(elem);
  }
  return res;
};
```

这里只需要指定 n 的值即可

1. n = 1 时，只展开一层，n = 2 时，展开两层，以此类推
1. 如果 n 为负数，那么展开所有层
1. 如果 n 为 0，那么不展开

## clone 方法

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

## cloneDeep 方法

1. 通过 `JSON.parse(JSON.stringify(obj))` 实现，但是有一些限制，比如会忽略 undefined、symbol、函数、正则等
1. 使用 `lodash` 库的 `_.cloneDeep(obj)` 方法
1. 使用浏览器的 `structuredClone` 方法，但是只能在 2022 年后的浏览器中使用。它是浏览器和任何其他实现了 window 这样全局对象的 JavaScript 运行时的一个特性，用于序列化和反序列化对象
1. 手动实现深拷贝

- 首先要判断这是不是一个对象，如果不是，直接返回原值，因此需要注意 `null` 和其他基本类型的情况
- 其次有一些特殊的对象类型，比如 `Date`，`RegExp`，他们要分别处理一下
- 还有就是循环引用的问题，我们需要一个 weakmap 来记录所有已经拷贝过的对象，如果拷贝过，直接返回拷贝后的引用

```javascript
function deepclone(obj, hash = new WeakMap()) {
  if (hash.has(obj)) return hash.get(obj);
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

## curry 方法

柯里化首先要传入一个能够接受多个参数的函数，然后返回一个函数，但是这个返回的函数接受的参数是小于等于原函数的参数个数的，当参数个数满足的时候，就执行原函数

通过柯里化可以实现函数参数的复用，同时还可以实现延迟执行，同时有助于函数的组合（函数式编程）

```javascript
function curry(fn) {
  return function curried(...args) { // [!code highlight] 注意这里返回的函数需要命名，因为递归调用的时候需要用到
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function (...args2) {
        return curried.apply(this, args.concat(args2)); // [!code highlight] 这里使用了递归调用，参数是两个数组的合并
      };
    }
  };
}
```

::: warning
注意 arguments 对象是一个类数组对象，它有一个 length 属性，表示的传入的参数个数

与此同时，获取一个函数的*第一个默认参数之前的*形参个数，可以通过 `fn.length` 来获取，比如：

```javascript
function foo(a, b = 1, c) {
  console.log(foo.length); // 1
}
```

同时，剩余参数也不会计算在内

```javascript
function foo(a, b, ...rest) {
  console.log(foo.length); // 2
}
```

:::

## sort 方法

这个其实不是 lodash 的方法，但是奈何排序经常用到，这里也写一下

```javascript
function sort(arr) {
  const len = arr.length;
  if (len <= 1) return arr;

  let left = [];
  let right = [];
  const pivotIdx = Math.floor(len / 2);
  const pivot = arr[pivotIdx];

  for (let i = 0; i < len; i++) {
    if (pivotIdx != i) {
      const val = arr[i];
      (val < pivot ? left : right).push(val);
    }
  }

  left = sort(left);
  right = sort(right);

  return left.concat([pivot], right);
}
```

::: warning
这里的实现将 splice 方法抹去了，但是之前写的时候在这边出现了 bug，所以警告一下

注意 `splice` 方法的参数，第一个参数是开始的索引，第二个参数是*删除的个数*（而不是删除的结束位置），如果不传第二个参数，那么就是删除到末尾，而且其返回值是一个*数组*，而不是删除的元素
:::

还有就是 left 数组和 right 数组要在递归调用的时候重新赋值，因为递归调用的时候，left 和 right 是新的数组，而不是原来的数组
