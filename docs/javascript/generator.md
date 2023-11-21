---
title: JavaScript 生成器
tag:
  - javascript
date: 2024-03-25
---

## 生成器函数

创建生成器函数有特殊的语法：

```javascript
function* generateSequence() {
  yield 1;
  yield 2;
  return 3;
}

// "generator function" 创建了一个 "generator object"
let generator = generateSequence();
alert(generator); // [object Generator]
```

调用生成器函数返回的是一个特殊的 object 对象，这个对象有 `next` 方法，当我们调用 `next` 方法之后，会依次返回 `yield` 的值，（注意，其返回值是一个对象，包含 `value` 和 `done` 两个属性）。

```javascript
function* generateSequence() {
  yield 1;
  yield 2;
  return 3;
}

let generator = generateSequence();
generator.next(); // {value: 1, done: false}
generator.next(); // {value: 2, done: false}
generator.next(); // {value: 3, done: true}
```

## 可迭代性

生成器对象是可迭代的，所以我们可以使用 `for..of` 循环来遍历生成器对象：

```javascript
function* generateSequence() {
  yield 1;
  yield 2;
  return 3;
}

let generator = generateSequence();
for(let value of generator) {
    console.log(value); // 1, 2
}
```

`return` 语句的返回值不会被 `for..of` 循环获取到。因为 `for..of` 循环只会获取 `done` 为 `false` 的值。

因为 generator 是可迭代的，我们可以使用 iterator 的所有相关功能，例如：拓展（spread）语法 `...`：

<!-- TODO: 增加迭代器的解释 -->

## 生成器的组合

`generator 组合`（composition）是 generator 的一个特殊功能，它允许透明地（transparently）将 generator 彼此“嵌入（embed）”到一起。

例如，我们有一个生成数字序列的函数：

```javascript
function* generateSequence(start, end) {
  for (let i = start; i <= end; i++) yield i;
}
```

现在，我们想重用它来生成一个更复杂的序列：

- 首先是数字 `0..9`（字符代码为 48…57），
- 接下来是大写字母 `A..Z`（字符代码为 65…90）
- 接下来是小写字母 `a...z`（字符代码为 97…122）

我们可以这样组合

```javascript
function* generateSequence(start, end) {
  for (let i = start; i <= end; i++) yield i;
}

function* generatePasswordCodes() {

  // 0..9
  yield* generateSequence(48, 57);

  // A..Z
  yield* generateSequence(65, 90);

  // a..z
  yield* generateSequence(97, 122);

}

let str = '';

for(let code of generatePasswordCodes()) {
  str += String.fromCharCode(code);
}
```

`yield*` 指令将执行委托给另一个 generator。这个术语意味着 `yield* gen` 在 generator `gen` 上进行迭代，并将其产出（yield）的值透明地（transparently）转发到外部。就好像这些值就是由外部的 generator yield 的一样。

## yield 双向流

`yield` 是一条双向路（two-way street）：它不仅可以向外返回结果，而且还可以将外部的值传递到 generator 内。

调用 `generator.next(arg)`，我们就能将参数 arg 传递到 generator 内部。这个 arg 参数会变成上一个 yield 的结果。多说无益，看例子

```javascript
function* gen() {
  let ask1 = yield "2 + 2 = ?";

  alert(ask1); // 4

  let ask2 = yield "3 * 3 = ?"

  alert(ask2); // 9
}

let generator = gen();

alert( generator.next().value ); // "2 + 2 = ?"

alert( generator.next(4).value ); // "3 * 3 = ?"

alert( generator.next(9).done ); // true
```

第一次调用 `generator.next()` 应该是不带参数的（如果带参数，那么该参数会被忽略）


