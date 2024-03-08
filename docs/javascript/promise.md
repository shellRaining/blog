---
title: 实现 promise
tag:
  - javascript
  - interview_question
date: 2024-03-07
---

## 思路

为了实现一个 promise，我们需要了解 promise 的工作细节和使用方法，首先了解到

1. promise 对象内部存在状态，`pending`，`fullfilled`，`rejected`，其中 `pending` 是最基础的状态，一旦滑落到 `fullfilled` 或者 `rejected` 就不可以转换成其他的状态
1. 传入 promise 的函数会接受两个参数 `resolve` 和 `reject`，用来转换 promise 对象的状态，如果内部函数调用了 `resolve`，就会进入 `fullfilled`，反之如果执行错误或者手动调用了 `reject`，进入 `rejected` 状态
1. 伴随着内部状态的转换，会生成不同的值。如果转换为 `fullfilled`，这个 promise 对象内部会生成一个 `value`，表示传入 promise 函数的返回值；如果转换成为 `rejected`，内部会生成一个 `reason`，来表示出错的原因
1. 我们还可以通过 promise 实例中的 then 方法来传入两个回调函数 `onFullfilled` 和 `onRejected`，等到 promise 实例的状态转变时再去调用这两个回调函数，并且再调用这两个回调函数的时候，他们都会被分别赋予上一个 promise 状态转变后生成的值
1. 我们期望 then 方法还会返回一个 promise 实例，因为这样就可以继续在 then 后面继续链接 then 方法，以等待前面的操作进行
1. 如果 then 方法传入的不是函数，我们会在内部生成一个恒等的函数，将上一个 promise 传入的值继续向后传递

## 代码

```javascript
function Promise(fn) {
  this.status = "pending";
  this.value = null;
  this.reason = null;
  this.fullfilledCbs = [];
  this.rejectedCbs = [];

  const resolve = (value) => {
    if (this.status === "pending") {
      this.status = "fullfilled";
      this.value = value;
      this.fullfilledCbs.forEach((cb) => {
        cb(this.value);
      });
    }
  };
  const reject = (reason) => {
    this.status = "rejected";
    this.reason = reason;
    this.rejectedCbs.forEach((cb) => {
      cb(this.reason);
    });
  };

  try {
    fn(resolve, reject);
  } catch (e) {
    reject(e);
  }
}

Promise.resolve = (params) => {
  if (params instanceof Promise) {
    return params;
  } else {
    return new Promise((resolve) => {
      resolve(params);
    });
  }
};
Promise.reject = (params) => {
  return new Promise((_resolve, reject) => {
    reject(params);
  });
};

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    reject(new Error("can't equal"));
  }

  if (x instanceof Promise) {
    x.then((value) => {
      resolvePromise(promise, value, resolve, reject);
    }, reject);
  }
  resolve(x);
}

Promise.prototype.then = function (onResolved, onRejected) {
  let realResolved = onResolved;
  let realRejected = onRejected;

  if (typeof onResolved !== "function") {
    realResolved = (value) => {
      return value;
    };
  }
  if (typeof onRejected !== "function") {
    realRejected = (reason) => {
      if (reason instanceof Error) {
        throw reason;
      } else {
        throw new Error(reason);
      }
    };
  }

  let newPromise;
  if (this.status === "fullfilled") {
    newPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (typeof onResolved === "function") {
            const x = realResolved(this.value);
            resolvePromise(newPromise, x, resolve, reject);
          } else {
            resolve(this.value);
          }
        } catch (e) {
          reject(e);
        }
      }, 0);
    });
  } else if (this.status === "rejected") {
    newPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (typeof onRejected === "function") {
            const x = realRejected(this.reason);
            resolvePromise(newPromise, x, resolve, reject);
          } else {
            reject(this.reason);
          }
        } catch (e) {
          reject(e);
        }
      }, 0);
    });
  } else {
    newPromise = new Promise((resolve, reject) => {
      this.fullfilledCbs.push(() => {
        setTimeout(() => {
          try {
            const x = realResolved(this.value);
            resolvePromise(newPromise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      });
      this.rejectedCbs.push(() => {
        setTimeout(() => {
          try {
            const x = realRejected(this.reason);
            resolvePromise(newPromise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      });
    });
  }
  return newPromise;
};

Promise.all = function (promiseList) {
  return new Promise((resolve, reject) => {
    const len = promiseList.length;
    const valueList = new Array(len);
    let cnt = 0;

    if (len === 0) {
      return resolve(valueList);
    }
    promiseList.forEach((promise, idx) => {
      Promise.resolve(promise).then(
        (value) => {
          cnt++;
          valueList[idx] = value;
          if (cnt === len) {
            resolve(valueList);
          }
        },
        (reason) => {
          reject(reason);
        },
      );
    });
  });
};

Promise.race = function (promiseList) {
  return new Promise((resolve, reject) => {
    if (promiseList.length === 0) {
      return resolve();
    }
    promiseList.forEach((promise) => {
      Promise.resolve(promise).then(
        (value) => {
          resolve(value);
        },
        (reason) => {
          reject(reason);
        },
      );
    });
  });
};

Promise.prototype.finally = function (fn) {
  return this.then(
    (value) => {
      return Promise.resolve(fn()).then(() => {
        return resolve(value);
      });
    },
    (reason) => {
      return Promise.resolve(fn()).then(() => {
        throw reason;
      });
    },
  );
};

module.exports = Promise;
```
