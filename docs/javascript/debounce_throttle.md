---
title: 节流和防抖
tag:
  - javascript
date: 2024-01-08
---

## 节流

节流是指，在一定时间内，对目标函数的多次调用，只会每隔一段时间执行一次，同时节流还分为三种情况，分别是

- 首次执行，但最后一次尾调用不会执行
- 首次不执行，但最后一次尾调用会执行
- 首次和最后一次尾调用都会执行

::: tip
同时还有一种首次和最后一次都不执行的方式，但是这种方式不经常使用，而且也是第一种的变种，到时候简单介绍
:::

在三种执行的方式分别对应着不同的实现方式，如下所述

### 首次执行,但最后一次尾调用不会执行

这种方式使用的是时间戳方式

```javascript
function throttle(fn, delay) {
  let lastTime = 0;

  return function (...args) {
    const curTime = Date.now();
    if (curTime - lastTime >= delay) {
      lastTime = curTime;
      fn.apply(this, args);
    }
  };
}
```

::: tip
两个对象相减是不是很奇怪,但是这里是进行了一次隐式类型转换,调用了 Date 对象的 `toValue` 方法,转换成了时间戳,故可以进行数字操作

更多内容可见 [隐式类型转换](./implicit_type_conversion.md)
:::

这种方式也可以改写成首次不执行，需要增加一个状态变量，如下所示

<!-- TODO: 以后再增加这份代码罢 -->

### 首次不执行,但最后一次尾调用会执行

这种方式对应着定时器方式

```javascript
function throttle(fn, delay) {
  let timer = null;

  return function (...args) {
    if (timer) return;

    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}
```

如果发现有定时器存在，那么就直接返回，等到定时器结束以后，他会自动执行，并且销毁定时器，这样就可以接受下一次的调用了

### 首次和最后一次尾调用都会执行

这种方式对应着时间戳和定时器的结合方式

```javascript
function throttle(fn, delay) {
  let timer = null;
  let lastTime = 0;

  return function (...args) {
    const curTime = Date.now();
    if (curTime - lastTime >= delay) {
      lastTime = curTime;
      fn.apply(this, args);
    } else {
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          fn.apply(this, args);
        }, delay);
      }
    }
  };
}
```

这种方式以时间戳方式为主要载体，如果发现时间戳超时，则会执行，和上面的方式相似，但是如果发现没有超时，那么就设置一个定时器

这种方式的弊端则是，它比上面的两种方式开销大概大一倍，而且第二次和第三次输出之间的间隔变得很小

::: warning
这里其实可以出一个考题，是我无意中发现的

```javascript
for (let i = 0; i < 100000000; i++) {
  throttleFn.call({ a: 1 });
}
```

这段代码会输出怎样形式的结果

答案是，时间戳的输出是正常的，定时器的输出则只有最后一次，并且他们之间输出的间隔是非常均匀的

是不是和上面的推导不一样?但是其实这才是正常的，因为这个循环是一个同步代码，一直在占用一个线程，导致定时器的回调函数分不到一个事件循环用来执行代码。

<!-- TODO: 添加一个图片 -->

更改的方式就是，将返回的函数用 promise 包裹起来，然后通过 await/async 来调用

```javascript
(async function () {
  for (let i = 0; i < 100000000; i++) {
    await throttleFn.call({ a: 1 });
  }
})();
```

同理，甚至可以在这里再拓展一点，因为使用了 promise 和 resolve，所以传入的函数可以返回一个值，这在之前的函数中是很难做到的

```javascript
const throttleFn = throttle3(function () {
  return 1;
}, 1000);
```

:::

## 防抖

指一段时间内的多次调用,每次都会刷新计时器的时间,只会执行最后一次,故其代码也是非常简单的,这里只放出定时器版本

```javascript
function debounce(fn, delay) {
  let timer = null;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```
