---
title: JavaScript 中的 this、bind、call、apply
tag:
  - javascript
  - interview_question
date: 2024-03-16
---

## this

this 是在创建执行上下文的时候就确定了，非严格模式下，全局执行上下文中的 this 是指向 window 的，而在严格模式下，全局执行上下文中的 this 是 undefined。

如果是函数执行上下文，那么 this 是由调用函数的方式决定的，如果是作为对象的方法调用，那么 this 就是指向这个对象的，如果是作为普通函数调用，那么 this 就是指向 window 的。同时，如果使用了 `call`、`apply`、`bind` 方法，那么 this 就是指向这个方法的第一个参数。

::: tip
在创建执行上下文的同时，还会创建词法环境（用来存放词法分析中找到的变量和函数声明），进行 this 绑定，具体可见[执行上下文](./execute_context.md)
:::

## bind、call、apply

这三个方法都是用来改变函数执行时的 this 指向的。

bind 是返回一个新的函数，不会立即执行，而是返回一个新的函数，这个函数的 this 是绑定的第一个参数，同时可以传递参数。

call 和 apply 是立即执行函数，第一个参数是 this 的指向，后面的参数是传递的参数，区别在于 call 是一个一个传递参数，而 apply 是传递一个数组。

我们可以手写实现一下，以 call 方法为例：

```javascript
Function.prototype.call = function(context, ...args) {
    context = context || window;
    const key = Symbol();
    context[key] = this;
    const res = context[key](...args);
    delete context[key];
    return res;
}
```

同理 apply 和 bind

这里还有一个 new 的小知识，判断是否通过 new 调用，可以在函数内部使用 `new.target` 来判断，如果是通过 new 调用，那么 `new.target` 就是指向这个函数，否则就是 undefined。
