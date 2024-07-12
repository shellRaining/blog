---
title: JavaScript 中的 module
tag:
  - book
  - javascript
date: 2024-06-29
---

## 模块概述

很久之前没有模块系统，我们都是通过其他的一些库来实现模块，但是在 ES6 之后，我们可以使用原生的 `module` 来使用模块系统（这里指浏览器环境）。

在 ES6 模块系统中，我们可以使用相对路径来引用一个模块，同时要在文档的 `<script>` 标签中加入 `type="module"` 选项，否则会爆出错误。通过相对路径引入时候必须加入 `.js` 后缀，不可以以裸模块的形式导入，我们平时写代码时候裸模块可以工作是因为打包工具替我们解决了这个脏活。

```html
<!doctype html>
<script type="module">
  import { sayHi } from "./say.js";

  document.body.innerHTML = sayHi("John");
</script>
```

并且，模块必须是通过网络获取的，不可以是本地路径，所以对于包含了模块的文档，我们需要使用 `live-server` 工具来预览。

需要注意如下细节

1. `module` 始终使用 `use strict` 模式，这也意味着顶层的 `this` 值为 `undefined`
2. `module` 被多次引用后，只会执行一次，并且每个引用该模块的变量获取的相当于是一个引用, 也就是说一个地方更改了这个值，也会反映到其他的文件中。
3. `module` 模块在文档中是 `defer` 加载的（在不加 `async` 特性的情况下），也就是在文档加载后，`DOMContentLoaded` 之前加载。
4. 拥有 `import.meta` 作为各种元信息，比如 `import.meta.dirname` 就相当于 `node` 环境下的 `__dirname`

---

对于第二点，实际上还会引出 `import` 和 `require` 的区别，可以将 `import` 想象为获取的是模块内容的引用，因此其他文件对其的更改也可以反映在本文件中。而 `require` 实际上导入的是一个新构造的对象，我们获取到的值只是一层浅拷贝，例子如下

```JavaScript
// lib.js
let counter = 3;
function incCounter() {
    counter++;
}
module.exports = {
  counter: counter,
  incCounter: incCounter,
};

// main.js
const mod = require('./lib');

console.log(mod.counter);  // 3
mod.incCounter();
console.log(mod.counter); // 3
```

同时，`import` 是在编译期间找出导入关系的，因此必须放置到代码文件的最顶层。而 `require` 没有这个要求，它实际上就是一个函数，可以动态的调用。

## 动态导入

如上面所说，`import` 是有调用的限制的，但是 JavaScript 后面引入了动态导入的功能。可以通过下面的例子了解一下

```JavaScript
let modulePath = prompt("Which module to load?");

import(modulePath)
  .then(obj => <module object>)
  .catch(err => <loading error, e.g. if no such module>)
```

这里动态导入的返回值是一个 promise，我们之后可以使用解构语法来获取其中命名导出的值，或者直接使用一个变量盛放默认导出值。

注意，动态导入的 `import` 不是一个函数，因此不能赋值给另一个变量，他只是 JavaScript 特殊的语法，和 `super` 关键字一样
