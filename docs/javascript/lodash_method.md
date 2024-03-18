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
  console.log(newPath);
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
