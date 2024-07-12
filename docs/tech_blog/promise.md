---
title: Promise 及其静态方法的实现
tag:
  - tech_blog
date: 2024-03-07
---

## Promises/A+ 规范

你最起码要对 promise 如何使用有一个了解才能学习 promise 内部的实现……不明白请看红宝书

### Promise 状态

Promise 总共有三个状态：

> 1. `pending`: 一个 promise 在 resolve 或者 reject 前就处于这个状态。
> 1. `fulfilled`: 一个 promise 被 resolve 后就处于 `fulfilled` 状态，这个状态不能再改变，而且必须拥有一个**不可变**的值(`value`)。
> 1. `rejected`: 一个 promise 被 reject 后就处于`rejected`状态，这个状态也不能再改变，而且必须拥有一个**不可变**的拒绝原因(`reason`)。

注意这里的**不可变**指的是`===`，也就是说，如果`value`或者`reason`是对象，只要保证引用不变就行，规范没有强制要求里面的属性也不变。Promise 状态其实很简单，画张图就是：

![image-20200324173555225](https://2f0f3db.webp.li/2024/09/image-20200324173555225.png)

### then 方法

先看一下 promise.then 的使用方法

```javascript
promise.then(onFulfilled, onRejected).then(onFulfilled, onRejected);
```

可以看到输入两个参数 `onFulfilled` 和 `onRejected`，他们都是可选参数。输出为一个新的 promise 对象，这样才能实现链式调用。

正常情况下，我们 `onFulfilled` 和 `onRejected` 都要传入函数。当 promise 状态*落定时*（意味着在这之前永远不会调用），这两个回调*其中之一*会被调用（根据落定状态是 FULFILLED 还是 REJECTED 来选择），并且只会调用一次。当有多个 `onFulfilled` 注册，他们是按顺序执行的。

```javascript
promise2 = promise1.then(onFulfilled, onRejected);
```

- 如果 `onFulfilled` 或者 `onRejected` 返回一个值 x，则 `promise2` 的最终状态为 FULFILLED 且 value 为 x
- 如果 `onFulfilled` 或者 `onRejected` 抛出一个异常 e，则 `promise2` 的最终状态为 REJECTED 且 reason 为 e
- 如果 `onFulfilled` 不是函数且 `promise1` 成功执行，`promise2` 必须成功执行并返回 `promise1` 的 value。同理，如果 `onRejected` 不是函数且 `promise1` 拒绝执行，`promise2` 必须拒绝执行并返回 `promise1` 的 reason。这就是所谓的忽略。

## 自己写一个 Promise

我们自己要写一个 Promise，肯定需要知道有哪些工作需要做，我们先从 Promise 的使用来窥探下需要做啥：

> 1. 新建 Promise 需要使用 `new` 关键字，那他肯定是作为面向对象的方式调用的，Promise 是一个类。
> 1. 我们 `new Promise(fn)` 的时候需要传一个函数进去，说明 Promise 的参数是一个函数，这个函数会立即执行。
> 1. 构造函数传进去的 `fn` 会收到 `resolve` 和 `reject` 两个函数，用来表示 Promise 成功和失败，说明构造函数里面还需要 `resolve` 和 `reject` 这两个函数，这两个函数的作用是改变 Promise 的状态。
> 1. 根据规范，promise 有 `pending`，`fulfilled`，`rejected` 三个状态，初始状态为 `pending`，调用 `resolve` 会将其改为 `fulfilled`，调用 `reject` 会改为 `rejected`。并且一旦更改不能再改变
> 1. promise 实例对象建好后可以调用 `then` 方法，而且是可以链式调用`then`方法，说明`then`是一个实例方法。[链式调用的实现这篇有详细解释](https://juejin.im/post/5e64cf0ef265da5734024f84#heading-7)，我这里不再赘述。简单的说就是 `then` 方法也必须返回一个带 `then` 方法的对象，可以是 this 或者新的 promise 实例。

### 构造函数

为了更好的兼容性，本文就不用 ES6 了。

```javascript
// 先定义三个常量表示状态
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function Promise(fn) {
  this.status = PENDING;
  this.value = null;
  this.reason = null;
}
```

### 执行传入的函数

由于我们会立即执行传入函数特性，我们会继续加入如下代码：

```javascript
function Promise(fn) {
  // ...省略前面代码...
  try {
    fn(resolve, reject);
  } catch (e) {
    reject(e);
  }
}
```

注意加上 `try...catch`，如果捕获到错误就 `reject`。注意这里 `resolve` 和 `reject` 是构造函数里面的局部函数，我们马上会定义

### `resolve` 和 `reject` 方法

根据规范，`resolve` 方法是将状态改为 fulfilled，`reject` 是将状态改为 rejected。因此要加上条件判断，同时，因为要保证 this 值不被我们新定义的函数覆盖，这里使用箭头函数。

```javascript
function Promise(fn) {
  // ...省略前面代码...

  const resolve = (value) => {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;
    }
  };
  const reject = (reason) => {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;
    }
  };

  // ...省略后面代码...
}
```

### then 方法实现

首先我们知道 `then` 方法是一个实例方法，所以要定义在原型链上。其次，`then` 方法是可以链式调用的，所以要返回一个新的 promise 对象。

```javascript
Promise.prototype.then = function (onFulfilled, onRejected) {
  let resPromise;
  // 暂时省略赋值 resPromise 的代码
  return resPromise;
};
```

### 根据前面 promise 不同状态执行不同回调

我们知道 promise 有三种状态，所以我们要根据不同状态执行不同的回调。如果前面的状态已经是 fulfilled 或者 rejected，那么我们就直接执行回调，如果是 pending，我们就把回调函数推入 promise 实例内的一个数组，等到状态改变的时候再执行。这就有订阅发布模式的味道了。所以我们还需要回头修改 Promise 类里面的一些东西。

```javascript
function Promise(fn) {
  // 省略前面代码...
  this.onFulfilledCallbacks = [];
  this.onRejectedCallbacks = [];

  const resolve = (value) => {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;
      this.onFulfilledCallbacks.forEach((cb) => cb());
    }
  };
  const reject = (reason) => {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;
      this.onRejectedCallbacks.forEach((cb) => cb());
    }
  };
  // 省略后面代码...
}
```

首先先把三个分支的框架搭好，即 `if` `elif` `else`，然后赋值 `resPromise`，这里我们针对三种情况分别新建一个 promise 对象。以 fulfilled 为例：

如果前面状态已经是 fulfilled，那么在下一个事件循环中我们就应该执行 `onFulfilled` 回调函数了，所以我们要把这个回调函数包装在一个 `setTimeout` 里面来模拟这一行为（但注意不是完全模拟，因为 setTimeout 是一个宏任务，而 then 中的回调是微任务）

还有就是这里我没有直接调用 `onFulfilled`，而是调用了一个函数 `fulfilledTask`，这是因为 pending 分支中的代码和这里逻辑是一样的，所以将其抽离出来作为 `fulfilledTask`，同理 `rejectedTask`。至于这个函数本身的工作，马上就会讲到。

```javascript
Promise.prototype.then = function (onFulfilled, onRejected) {
  let resPromise;
  if (this.status === FULFILLED) {
    resPromise = new Promise((resolve, reject) => {
      setTimeout(fulfilledTask, 0, resolve, reject);
    });
  } else if (this.status === REJECTED) {
    resPromise = new Promise((resolve, reject) => {
      setTimeout(rejectedTask, 0, resolve, reject);
    });
  } else {
    resPromise = new Promise((resolve, reject) => {
      this.onFulfilledCallbacks.push(() => {
        setTimeout(fulfilledTask, 0, resolve, reject);
      });
      this.onRejectedCallbacks.push(() => {
        setTimeout(rejectedTask, 0, resolve, reject);
      });
    });
  }
  return resPromise;
};
```

### `fulfilledTask` 和 `rejectedTask` 方法

我们上面提到，如果前一个 promise 落定为 fulfilled， `onFulfilled` 执行成功并返回一个值 x，那么就把这个 x 就做为新 promise 的 value，如果执行失败就把失败的原因作为新 promise 的 reason。而如果 `onFulfilled` 不是函数，那么直接 resolve 前一个 promise 的 value，这个逻辑是通用的，所以我们将其抽离出来作为 `fulfilledTask`

同理 `rejectedTask` 也是这样分析，二者有一点差别就是，如果 `onRejected` 不是函数，那么直接 reject 前一个 promise 的 reason，而不是 resolve

```javascript
Promise.prototype.then = function (onFulfilled, onRejected) {
  const fulfilledTask = (resolve, reject) => {
    try {
      if (typeof onFulfilled === "function") {
        const res = onFulfilled(this.value);
        resolvePromise(resPromise, res, resolve, reject);
      } else {
        resolve(this.value);
      }
    } catch (e) {
      reject(e);
    }
  };
  const rejectedTask = (resolve, reject) => {
    try {
      if (typeof onRejected === "function") {
        const res = onRejected(this.reason);
        resolvePromise(resPromise, res, resolve, reject);
      } else {
        reject(this.reason);
      }
    } catch (e) {
      reject(e);
    }
  };

  // ...省略前面代码...
  return resPromise;
};
```

这里还有一个函数 `resolvePromise`，这个函数是用来处理 `onFulfilled` 或者 `onRejected` 返回的值，我们马上讲到。

### Promise 解决过程

这里分为以下几种情况

- 回调函数返回了一个基本类型，直接 `resolve` 掉
- 回调函数返回了一个 promise，需要等待这个 promise 执行完，再根据他的状态来决定`resolve`还是`reject`
- 回调函数返回了一个 thenable 对象，需要调用他的`then`方法，根据他的状态来决定`resolve`还是`reject`
- 其他直接 resolve 掉（比如返回了一个对象）

```javascript
function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) return reject(new TypeError("promise equal with res")); // 不能返回自己
  if (x === null) return resolve(null);
  else if (typeof x !== "function" && typeof x !== "object") return resolve(x);
  else if (x instanceof Promise) {
    return x.then(
      (value) => resolvePromise(promise, value, resolve, reject),
      reject,
    );
  }

  // 下面的代码是处理 thenable 对象
  let then;
  try {
    then = x.then;
    if (typeof then !== "function") return resolve(x);
  } catch (e) {
    reject(e);
  }
  var called = false;
  // 将 x 作为函数的作用域 this 调用之
  // 传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise
  // 名字重名了，我直接用匿名函数了
  try {
    then.call(
      x,
      // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
      function (y) {
        // 如果 resolvePromise 和 rejectPromise 均被调用，
        // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
        // 实现这条需要前面加一个变量called
        if (called) return;
        called = true;
        resolvePromise(promise, y, resolve, reject);
      },
      // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
      function (r) {
        if (called) return;
        called = true;
        reject(r);
      },
    );
  } catch (error) {
    // 如果调用 then 方法抛出了异常 e：
    // 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
    if (called) return;

    // 否则以 e 为据因拒绝 promise
    reject(error);
  }
}
```

### 测试我们的 Promise

我们使用 Promise/A+ 官方的测试工具 [promises-aplus-tests](https://github.com/promises-aplus/promises-tests) 来对我们的 `Promise`进行测试，要使用这个工具我们必须实现一个静态方法 `deferred`，可以将下面代码粘贴进去。

```javascript
Promise.deferred = function () {
  const result = {};
  result.promise = new MyPromise(function (resolve, reject) {
    result.resolve = resolve;
    result.reject = reject;
  });

  return result;
};
```

然后用 npm 将`promises-aplus-tests`下载下来，再配置下 package.json 就可以跑测试了：

```json
{
  "devDependencies": {
    "promises-aplus-tests": "^2.1.2"
  },
  "scripts": {
    "test": "promises-aplus-tests MyPromise"
  }
}
```

这个测试总共 872 用例，我们写的 Promise 完美通过了所有用例：

## 其他 Promise 方法

在 ES6 的官方 Promise 还有很多 API，比如：

> Promise.resolve
>
> Promise.reject
>
> Promise.all
>
> Promise.race
>
> Promise.prototype.catch
>
> Promise.prototype.finally
>
> Promise.allSettled

虽然这些都不在 Promise/A+里面，但是我们也来实现一下吧，加深理解。其实我们前面实现了 Promise/A+再来实现这些已经是小菜一碟了，因为这个 API 全部是前面的封装而已。

### Promise.resolve

将现有对象转为 Promise 对象，如果 Promise.resolve 方法的参数，不是具有 then 方法的对象（又称 thenable 对象），则返回一个新的 Promise 对象，且它的状态为 fulfilled。

```javascript
MyPromise.resolve = function (parameter) {
  if (parameter instanceof MyPromise) {
    return parameter;
  }

  return new MyPromise(function (resolve) {
    resolve(parameter);
  });
};
```

### Promise.reject

返回一个新的 Promise 实例，该实例的状态为 rejected。Promise.reject 方法的参数 reason，会被传递给实例的回调函数。

```javascript
MyPromise.reject = function (reason) {
  return new MyPromise(function (resolve, reject) {
    reject(reason);
  });
};
```

### Promise.all

该方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。

```javascript
const p = Promise.all([p1, p2, p3]);
```

`Promise.all()`方法接受一个数组作为参数，`p1`、`p2`、`p3`都是 Promise 实例，如果不是，就会先调用 `Promise.resolve`方法，将参数转为 Promise 实例，再进一步处理。当 p1, p2, p3 全部 resolve，大的 promise 才 resolve，有任何一个 reject，大的 promise 都 reject。

```javascript
Promise.all = function (tasks) {
  const taskCnt = tasks.length;
  let finished = 0;
  const results = new Array(taskCnt);

  if (taskCnt === 0) return Promise.resolve([]);

  const resPromise = new Promise((resolve, reject) => {
    tasks.forEach((task, idx) => {
      Promise.resolve(task).then(
        (value) => {
          results[idx] = value;
          finished++;
          if (finished === taskCnt) resolve(results);
        },
        (reason) => {
          reject(reason);
        },
      );
    });
  });
  return resPromise;
};
```

::: info 面试题
如果我们需要限制并发数，应该如何设计？

- 首先肯定是返回一个期约（决定了返回的是一个 promise 对象）
- 其次，每一个任务我们视为一个单独的过程，因此可以写一个 step 函数，用来表示执行一个任务
- 然后，我们需要获取即将执行的任务的下标，因此需要一个状态变量 idx
- 最后，我们在一个任务执行完成后，需要判断是否还有任务需要执行，如果有，就继续执行（递归调用），如果没有，就 resolve

```javascript
Promise.all = function (tasks, limit) {
  return new Promise((resolve, reject) => {
    const tasksCnt = tasks.length;
    const res = new Array(tasksCnt);
    let curIdx = 0;
    let finishedCnt = 0;

    function start(idx) {
      if (idx === tasksCnt) return;
      Promise.resolve(tasks[idx]()).then((value) => {
        res[idx] = value;
        finishedCnt++;
        if (finishedCnt === tasksCnt) resolve(res);
        start(curIdx);
      }, reject);
      curIdx++;
    }
    for (let i = 0; i < Math.min(limit, tasksCnt); i++) {
      start(i);
    }
  });
};
```

:::

### Promise.race

用法：

```javascript
const p = Promise.race([p1, p2, p3]);
```

该方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例。上面代码中，只要`p1`、`p2`、`p3`之中有一个实例率先改变状态，`p`的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给`p`的回调函数。如果传递一个空数组，规范规定需要永远保持 pending 状态

```javascript
Promise.race = function (tasks) {
  return new Promise((resolve, reject) => {
    if (tasks.length === 0) return;
    tasks.forEach((task) => {
      Promise.resolve(task).then(resolve, reject);
    });
  });
};
```

### Promise.prototype.catch

`Promise.prototype.catch`方法是`.then(null, rejection)`或`.then(undefined, rejection)`的别名，用于指定发生错误时的回调函数。

```javascript
MyPromise.prototype.catch = function (onRejected) {
  this.then(null, onRejected);
};
```

### Promise.prototype.finally

`finally`方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。该方法是 ES2018 引入标准的。

```javascript
MyPromise.prototype.finally = function (fn) {
  return this.then(
    function (value) {
      return MyPromise.resolve(fn()).then(function () {
        return value;
      });
    },
    function (error) {
      return MyPromise.resolve(fn()).then(function () {
        throw error;
      });
    },
  );
};
```

### Promise.any

这是 ES2021 引入的新方法，用于获取一组 Promise 实例中最先解决的实例的返回值。如果传入空数组或者所有的 Promise 都被拒绝，那么就返回一个 AggregateError 类型的对象，这是一个数组（存疑）

```javascript
Promise.any = function (tasks) {
  return new Promise((resolve, reject) => {
    if (tasks.length === 0)
      return reject(new AggregateError([], "All promises were rejected"));

    let rejectedCount = 0;
    const errors = new Array(tasks.length);

    tasks.forEach((task, index) => {
      Promise.resolve(task).then(resolve, (reason) => {
        errors[index] = reason;
        rejectedCount++;
        if (rejectedCount === tasks.length) {
          reject(new AggregateError(errors, "All promises were rejected"));
        }
      });
    });
  });
};
```

### Promise.allSettled

该方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例。只有等到所有这些参数实例都返回结果，不管是`fulfilled`还是`rejected`，包装实例才会结束。该方法由 [ES2020](https://github.com/tc39/proposal-promise-allSettled) 引入。该方法返回的新的 Promise 实例，一旦结束，状态总是`fulfilled`，不会变成`rejected`。状态变成`fulfilled`后，Promise 的监听函数接收到的参数是一个数组，每个成员对应一个传入`Promise.allSettled()`的 Promise 实例的执行结果。

```javascript
Promise.allSettled = function (tasks) {
  let finishedCnt = 0;
  const tasksCnt = tasks.length;
  const res = [];
  return new Promise((resolve, _reject) => {
    if (tasksCnt === 0) return resolve(res);
    tasks.forEach((task, idx) => {
      function handler(v, info) {
        finishedCnt++;
        res[idx] = {
          status: info,
          [info === "fulfilled" ? "value" : "reason"]: v,
        };
        if (finishedCnt === tasksCnt) resolve(res);
      }
      Promise.resolve(task).then(
        (value) => handler(value, "fulfilled"),
        (reason) => handler(reason, "rejected"),
      );
    });
  });
};
```

## 完整代码

见仓库 [https://github.com/shellRaining/JavaScript-experiment/blob/main/promise/mock.js](https://github.com/shellRaining/JavaScript-experiment/blob/main/promise/mock.js)

## 参考

- [https://dennisgo.cn/Articles/JavaScript/Promise.html](https://dennisgo.cn/Articles/JavaScript/Promise.html)
