---
title: JavaScript 中的 async/await
tag:
  - javascript
date: 2024-03-25
---

## async/await

他们实际上是 Promise 的语法糖，让异步代码更加清晰和易于理解。

我们从异步使用的历史开始

最初使用的是回调函数，但是回调函数的缺点是：回调地狱，代码不易维护。

```javascript
function getRequestData(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(data);
    }, 2000);
  });
}
getRequestData("aaa").then((res) => {
  getRequestData(res + "bbb").then((res) => {
    getRequestData(res + "ccc").then((res) => {
        console.log("result", res);
    });
  });
});
```

然后使用 promise 的链式语法来解决该问题

```javascript
getRequestData("aaa")
  .then((res) => {
    return getRequestData(res + "bbb");
  })
  .then((res) => {
    return getRequestData(res + "ccc");
  })
  .then((res) => {
    console.log("res", res);
  });
```

然后使用 generator 来尝试解决

```javascript
function* showData() {
  const res1 = yield getRequestData("aaa");
  const res2 = yield getRequestData(res1 + "bbb");
  const res3 = yield getRequestData(res2 + "ccc");
  console.log("res", res3);
}

const generator = showData();
generator.next().value.then(res=>{
  generator.next(res).value.then(res=>{
    generator.next(res).value.then(res=>{
      console.log(res)
    })
  })
})
```

但是这样还是遇到了回调地狱，因此我们对 next 函数进行一点封装操作

```javascript
const generator = showData();
function execGenerator(generator){
  function exec(res){
    const gen = generator.next(res)
    if(gen.done){
      return gen.value
    }
    // 注意这里我们需要等待上一个 promise 执行完，所以要使用 then
    return gen.value.then(re=>{ // [!code highlight] 
      exec(re) // [!code highlight] 
    }) // [!code highlight]
  }
  exec()
}
execGenerator(generator)
```

这样就解决了回调地狱的问题，我们从这里就可以看到 async 函数和 await 的端倪了，我们一般用 async 声明的函数，其实就是一个生成器函数，代码里面使用的 await，其实就是 yield 返回的值，然后当我们调用 async 函数时，其实就是用 `execGenerator` 函数包裹起来执行。

最后给出 async/await 的写法

```javascript
async function showData(){
  const res1 = await getRequestData("aaa");
  const res2 = await getRequestData(res1 + "bbb");
  const res3 = await getRequestData(res2 + "ccc");
  console.log("res", res3);
}
showData()
```
