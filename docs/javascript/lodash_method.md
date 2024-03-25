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
2. 如果 n 为负数，那么展开所有层
3. 如果 n 为 0，那么不展开
