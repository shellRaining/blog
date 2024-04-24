---
title: 节流和防抖
tag:
  - javascript
  - interview_question
date: 2024-01-08
outline: [2, 3]
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

### 首次执行，但最后一次尾调用不会执行

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
两个对象相减是不是很奇怪，但是这里是进行了一次隐式类型转换，调用了 Date 对象的 `toValue` 方法，转换成了时间戳，故可以进行数字操作

更多内容可见 [隐式类型转换](./implicit_type_conversion.md)

还有请注意这里的 apply 函数，如果没有他，我们类似这样的调用就是导致 this 指向错误

```javascript
obj.fn = throttle(fn)
obj.fn()
```

我们希望第二行代码执行的时候 fn 中的 this 指向 obj
:::

### 首次不执行，但最后一次尾调用会执行

这种方式对应着定时器方式

```javascript
function throttle(fn, delay) {
  let timer = null;

  return function (...args) {
    if (timer) return;

    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null; // [!code highlight] 注意这里是设置 timer 为 null，而不是 clearTimeout
    }, delay);
  };
}
```

如果发现有定时器存在，那么就直接返回，等到定时器结束以后，他会自动执行，并且销毁定时器，这样就可以接受下一次的调用了

::: warning

- `clearTimeout(timer)`：这个函数的作用是取消定时器，即取消由 `setTimeout` 函数设置的定时器。也就是说，如果你调用了 `clearTimeout`，那么 `setTimeout` 设置的回调函数不会被执行。请注意，这个函数只能取消尚未执行的定时器，对于已经执行的定时器，调用此函数没有效果。
- `timer = null`：这个操作并不会取消定时器，它只是把变量 timer 的值设置为 null。也就是说，`setTimeout` 设置的回调函数仍然会被执行。这个操作通常用于释放 timer 变量的引用，以便 JavaScript 的垃圾回收机制可以回收这个变量占用的内存。

同时 clearTimeout 不会将 timer 自动设置为 null
:::

### 首次和最后一次尾调用都不会执行

这种方式也可以改写成最后一次不执行，需要增加两个状态变量，分别是 waiting 和 scheduled，waiting 用来判断是否有定时器，scheduled 用来判断是否有调用，最后一次调用时如果有定时器，就会仅设置 scheduled，而不是重新计时定时器

```javascript
function throttle(func, limit) {
    let waiting = false;
    let scheduled = false;

    return function() {
        if (!waiting) {
            waiting = true;
            setTimeout(() => {
                waiting = false;
                if (scheduled) {
                    func.apply(this, arguments);
                    scheduled = false;
                }
            }, limit);
        } else {
            scheduled = true;
        }
    }
}
```

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

### 使用两个参数控制是否首次和尾次执行

```javascript
function throttle(func, limit, first, end) {
  let waiting = false;
  let scheduled = false;

  return function () {
    if (!waiting) {
      if (first) {
        func.apply(this, arguments);
        first = false
      }
      waiting = true;
      setTimeout(() => {
        waiting = false;
        if (scheduled && end) {
          func.apply(this, arguments);
          scheduled = false;
        }
      }, limit);
    } else {
      scheduled = true;
    }
  };
}
```

::: warning
这里其实可以出一个考题，是我无意中发现的

```javascript
for (let i = 0; i < 100000000; i++) {
  throttleFn.call({ a: 1 });
}
```

这段代码会输出怎样形式的结果

答案是，时间戳的输出是正常的，定时器的输出则只有最后一次，并且他们之间输出的间隔是非常均匀的

是不是和上面的推导不一样？但是其实这才是正常的，因为这个循环是一个同步代码，一直在占用一个线程，导致定时器的回调函数分不到一个事件循环用来执行代码。

更改的方式就是，将返回的函数用 promise 包裹起来，然后通过 await/async 来调用

```javascript
function throttle(fn, delay) {
  let timer = null;
  let lastTime = 0;

  return function (...args) {
    return new Promise((resolve) => {
      const curTime = Date.now();
      if (curTime - lastTime >= delay) {
        lastTime = curTime;
        resolve(fn.apply(this, args));
      } else {
        if (!timer) {
          timer = setTimeout(() => {
            timer = null;
            resolve(fn.apply(this, args));
          }, delay);
        }
      }
    });
  };
}
(async function () {
  for (let i = 0; i < 100000000; i++) {
    await throttleFn.call({ a: 1 });
  }
})();
```

同理，甚至可以在这里再拓展一点，因为使用了 promise 和 resolve，所以传入的函数可以返回一个值，这在之前的函数中是很难做到的

```javascript
const throttleFn = throttle(function () {
  return 1;
}, 1000);
```

:::

## 防抖

指一段时间内的多次调用，每次都会刷新计时器的时间，只会执行最后一次，故其代码也是非常简单的，这里只放出定时器版本

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

其特点是：规定时间内多次调用不执行，停止一段时间后执行一次

应用场景可以使搜索框的动态输入，只有在用户停止输入一段时间后才会进行搜索
