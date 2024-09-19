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

### Promise 类的实现

按照上面说的，我们需要创建一个类，这里使用 ES6 class 语法

```JavaScript
class Promise {
  constructor(fn) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCbs = []; // 暂时不用理会这两个数组，后面会用到
    this.onRejectedCbs = [];

    const resolve = (value) => {
      if (this.status !== PENDING) return;
      this.value = value;
      this.status = FULFILLED;
      this.onFulfilledCbs.forEach((cb) => void cb());
    };
    const reject = (reason) => {
      if (this.status !== PENDING) return;
      this.reason = reason;
      this.status = REJECTED;
      this.onRejectedCbs.forEach((cb) => void cb());
    };

    try {
      fn(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
}
```

这个类的构造函数主要分为了三部分

1. 初始化类的各种字段，这里有我们前面提到的 `status`，`value`，`reason`，还有两个陌生的家伙，后面会介绍
2. 创建两个内部函数 `resolve` 和 `reject`，用来改变当前 Promise 实例的状态，可以看到为了防止多次调用导致状态转变，有一个分支判断语句来阻拦
3. 在 `try catch` 语句中调用传入的函数，如果调用过程中报错就 `reject` 这个实例，否则决定权交给传入的这个函数

### then 函数的大致框架

```JavaScript
class Promise {
  then(onFulfilled, onRejected) {
    const resPromise = new Promise((resolve, reject) => {
      const fulfilledTask = () => {};
      const rejectedTask = () => {};
      if (this.status === FULFILLED) queueMicrotask(fulfilledTask);
      else if (this.status === REJECTED) queueMicrotask(rejectedTask);
      else {
        this.onFulfilledCbs.push(() => queueMicrotask(fulfilledTask));
        this.onRejectedCbs.push(() => queueMicrotask(rejectedTask));
      }
    });

    return resPromise;
  }
}
```

因为我们是对一个 Promise 实例调用 `then` 方法，所以直接在类中定义就可以，不用搞什么静态方法

通过前面讲解可以知道，`then` 函数可以链式调用，所以返回值必定是一个 Promise 实例或者他自身，这里我们选择的是创建一个新的 Promise 实例。我们这里管前面的 Promise 叫做 `promise1`，then 返回的 Promise 实例叫做 `promise2`。

由于 `promise1` 内部函数调用结束后会接着调用 `then` 方法，此时 `promise1` 的状态并没有敲定，既有可能已经解决了，也可能处于待定状态，因此我们需要进行分支判断。

比方说如果已经落定为 fulfilled，我们就将 `then` 方法传入的 `onFulfilled` 回调函数安排到微任务队列中，但是由于 `onFulfilled` 的类型可能有很多种，所以我们这里抽象出来一个 `fulfilledTask` 函数，专门处理一些杂活，这个后面我们会介绍。

同理如果处于已经拒绝的状态，我们也会推入到一个微任务队列。但是如果处于待定状态，我们需要将这个回调函数暂存起来，等到敲定后再去执行。这里很适合使用订阅发布模式，我们在每个 promise 中设置一个 `onFulfilledCbs` 和 `onRejectedCbs` 数组，专门存储敲定后需要执行的回调函数。等到敲定后我们就顺序遍历，将任务塞到微任务队列中。

### promise1 落定后的处理方案

上面我们提到了 `fulfilledTask` 和 `rejectedTask`，他们主要负责运行传入 `then` 方法的回调函数，并且稍加修饰，代码如下

```JavaScript
class Promise {
  then(onFulfilled, onRejected) {
    const resPromise = new Promise((resolve, reject) => {
      const fulfilledTask = () => {
        try {
          if (typeof onFulfilled !== "function") resolve(this.value);
          else resolveThen(onFulfilled(this.value));
        } catch (e) {
          reject(e);
        }
      };
      const rejectedTask = () => {
        try {
          if (typeof onRejected !== "function") reject(this.reason);
          else resolveThen(onRejected(this.reason));
        } catch (e) {
          reject(e);
        }
      };
      // then 中的主要逻辑，同上面讲的
    }
  }
}
```

可以看到我们在这些处理函数内的逻辑都是一样的

1. 放到 `try catch` 中尝试运行，如果报错都会拒付 promise2
2. 如果回调执行成功，那么就落定 promise2，但落定的 value 需要由传入 then 的两个回调函数的返回值来决定，如果返回值是非引用类型，或者是非 thenable 的对象，那么可以直接交付，而如果是 thenable 类型的对象，就需要一些额外的操作，这里抽象成一个新的函数
3. 如果传入 then 的回调参数不是函数类型，那么就直接落定 promise1 的 value 或者 reason

### 对 then 回调函数返回值的处理

上面我们提到，由于 then 回调函数返回值的多样性，我们需要额外的代码来处理这些逻辑，下面就是处理的整个函数

```JavaScript
class Promise {
  then(onFulfilled, onRejected) {
    const resPromise = new Promise((resolve, reject) => {
      const resolveThen = (cbRet) => {
        if (cbRet === resPromise) return reject(new TypeError());

        if (cbRet instanceof Promise) cbRet.then(resolveThen, reject);
        else if (
          typeof cbRet === "function" ||
          (typeof cbRet === "object" && cbRet !== null)
        ) {
          let then;
          try {
            then = cbRet.then;
            if (typeof then !== "function") resolve(cbRet);
          } catch (e) {
            reject(e);
          }

          let called = false;
          function callOnce(fn) {
            return function (...args) {
              if (called) return;
              called = true;
              fn(...args);
            };
          }
          try {
            then.call(cbRet, callOnce(resolveThen), callOnce(reject));
          } catch (e) {
            callOnce(reject)(e);
          }
        } else resolve(cbRet);
      };
      // 上面提到的代码
    }
  }
}
```

可以看到上来先进行了一个判断，看返回值是否和 resPromise 重合，如果重合就直接 reject 一个 TypeError

之后就是正事环节

1. 如果对象是 promise 实例，那么就等这个 promise 解决后我们再去尝试解决他的值，很有递归的味道……但由于这是异步操作，所以严格意义上来说不是递归
2. 如果是对象类型（不包含 null），那么
   1. 首先取返回值的 then 属性，如果过程中遇到了报错，就直接拒付（比如 proxy 对象就可能发生这种事）
   2. 取到了 then 属性后判断是否是函数，如果不是就直接兑现这个返回值
   3. 如果是函数，就运行这个函数，这里 thenable 对象的 then 函数也和我们自己实现的 then 方法一样，接受两个回调函数，所以这里也要传入 resolveThen 和 reject，但由于 then 函数执行过程中可能调用很多次，为了防止状态发生改变，我们设计了一个 callOnce 函数，保证只执行一次 then 的回调函数
3. 如果是基本类型，就直接兑付返回值即可

### 测试我们的 Promise

我们使用 Promise/A+ 官方的测试工具 [promises-aplus-tests](https://github.com/promises-aplus/promises-tests) 来对我们的 `Promise`进行测试，要使用这个工具我们必须实现一个静态方法 `deferred`，可以将下面代码粘贴进去。

```javascript
class Promise {
  static deferred() {
    var result = {};
    result.promise = new Promise(function (resolve, reject) {
      result.resolve = resolve;
      result.reject = reject;
    });

    return result;
  }
}
```

然后用 npm 将`promises-aplus-tests`下载下来，再配置下 package.json 就可以跑测试了：

```json
{
  "devDependencies": {
    "promises-aplus-tests": "^2.1.2"
  },
  "scripts": {
    "test": "promises-aplus-tests ./promise.js"
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
Promise.resolve = function (parameter) {
  if (parameter instanceof Promise) {
    return parameter;
  }

  return new Promise(function (resolve) {
    resolve(parameter);
  });
};
```

### Promise.reject

返回一个新的 Promise 实例，该实例的状态为 rejected。Promise.reject 方法的参数 reason，会被传递给实例的回调函数。

```javascript
Promise.reject = function (reason) {
  return new Promise(function (resolve, reject) {
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
Promise.prototype.catch = function (onRejected) {
  this.then(null, onRejected);
};
```

### Promise.prototype.finally

`finally`方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。该方法是 ES2018 引入标准的。

```javascript
Promise.prototype.finally = function (fn) {
  return this.then(
    function (value) {
      return Promise.resolve(fn()).then(function () {
        return value;
      });
    },
    function (error) {
      return Promise.resolve(fn()).then(function () {
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
