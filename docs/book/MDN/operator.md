## JavaScript 操作符，表达式，语句拾遗

## await 操作符

await 操作符会等待后面的 Promise 表达式兑现后获取他的值，并且只能在顶层模块或者异步函数中使用。总结一下使用方式就是：

```javascript
await expression;
```

这里的 expression 就很有讲究

1. 若为 Promise 对象，那么就等待他的执行结果
2. 若是 thenable 对象，那么就将其包装成一个 Promise 对象，构造时会调用其中的 then 函数
3. 除此之外的其他类型会被隐式的包装进一个已兑现的 `Promise` 用于等待，其结果就是表达式的值。

## async function

该语句用来声明一个异步函数，如果调用这个函数，必定返回一个 promise（即使内部没有写 return 语句）

> [!tip]
>
> 即使异步函数的返回值看起来像是被包装在了一个 `Promise.resolve` 中，但它们不是等价的。
>
> 如果给定的值是一个 promise，异步函数会返回一个不同的*引用*，而 `Promise.resolve` 会返回相同的引用，具体原因可以看 Promise.resolve 的实现原理
>
> ```javascript
> const p = new Promise((res, rej) => { res(1) });
>   async function asyncReturn() { return p }
> function basicReturn() { return Promise.resolve(p) }
>
> console.log(p === basicReturn()); // true
>   console.log(p === asyncReturn()); // false
> ```

## import.meta

这是一个 JavaScript 表达式，他是一个宿主环境创建的可扩展的 [`null` 原型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object#null_原型对象)对象，他的所有属性均可写、可配置、可枚举。规范没有在对象上明确定义任何属性，但是宿主环境通常会定义以下属性：

1. url

   到此**模块**的完整 URL（不是模块不能调用），包括查询参数和片段标识符（在 `?` 和 `#` 之后）。在浏览器中，它是可获取此脚本的 URL（对外部脚本）或者是包含此脚本的文档的 URL（对内联脚本）。在 Node.js 中，它是文件路径（包括 `file://` 协议部分）。

2. resolve

   将一个模块的标识符解析为相对于当前模块的 URL。

## void

这个运算符允许在表达式执行完成时，产生（某些地方）期望获得的 undefined 值。

`void` 运算符通常只用于获取 `undefined` 的原始值，一般使用 `void(0)`（等同于 `void 0`）。在上述情况中，也可以使用全局变量 undefined 来代替。

当用户点击一个以 `javascript:` 开头的 URI 时，它会执行 URI 中的代码，然后用返回的值替换页面内容，除非返回的值是 undefined。`void` 运算符可用于返回 `undefined`。例如：

```HTML
<a href="javascript:void(0);"> 这个链接点击之后不会做任何事情 </a>

<a href="javascript:void(document.body.style.backgroundColor='green');">
  点击这个链接会让页面背景变成绿色。
</a>
```

但这种做法很不推荐了，只能在老式脚本看到，现在推荐使用事件监听器

除此之外，箭头函数标准中，允许在函数体不使用括号来直接返回值。如果右侧调用了一个原本没有返回值的函数，其返回值改变后，则会导致非预期的副作用。安全起见，当函数返回值不会被使用到的时候，应该使用 `void` 运算符，来确保 API 改变时，并不会改变箭头函数的行为。

```JavaScript
button.onclick = () => void doSomething();
```

这确保了当 `doSomething` 的返回值从 `undefined` 变为 `true` 的时候，不会改变代码的行为。

> [!tip]
>
> 对于一些特定的事件，比如某些表单事件(如 `onsubmit`)或锚点点击事件(如 `<a>` 标签的 `onclick`),返回 `false` 会阻止默认行为。
>
> - 返回 `true` (或任何真值): 不会阻止默认行为。
> - 返回 `false`: 会阻止默认行为(相当于调用 `event.preventDefault()`)。

## new

老生常谈的东西，new 操作符在调用时发生了什么？

1. 首先创建一个简单的 JavaScript 空对象
2. 根据 new 后面跟的变量类型分别决定逻辑
   1. 如果不是函数，直接 throw 一个 TypeError
   2. 如果是函数，且函数的 prototype 是对象，那么将前面创建的对象的 `[[Prototype]]` 指向构造函数的 `prototype` 属性
   3. 否则其 `[[Prototype]]` 为 `Object.prototype`
3. 将 this 绑定到前面创建的对象上，执行构造函数
4. 如果构造函数返回了对象，那么该返回的对象成为整个 `new` 表达式的结果。否则，如果构造函数未返回任何值或返回了一个原始值，则返回我们前面新建的对象

那么我们是否可以按照上述的规则来实现一个 new 函数？

```javascript
function myNew(ctor, ...args) {
  if (typeof ctor !== "function") throw new TypeError("");
  const obj = Object.create(ctor.prototype); // 第一步和第二步
  const res = ctor.apply(obj, args); // 第三步
  if (res !== null && (typeof res === "object" || typeof res === "function")) return res;
  else return obj;
}
```

