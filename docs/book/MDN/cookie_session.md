---
title: cookie 和 session
tag:
  - book
date: 2024-03-15
---

HTTP 协议是一种无状态协议，即每次服务端接收到客户端的请求时，都是一个全新的请求，服务器并不知道客户端的历史请求记录；Session 和 Cookie 的主要目的就是为了弥补 HTTP 的无状态特性。

## cookie

### 简要介绍

cookie 是存储在浏览器的一小块数据，是 HTTP 协议的一部分

1. 登录后，服务器在响应中使用 `Set-Cookie` HTTP-header 来设置具有唯一“会话标识符（session identifier）”的 cookie。
1. 下次当请求被发送到同一个域时，浏览器会使用 `Cookie` HTTP-header 通过网络发送 cookie。
1. 所以服务器知道是谁发起了请求。

### 浏览器 API

我们可以从 `document.cookie` 中读取一个网站所存储的 cookie，可以看到是由键值对形式存储的，中间有 `;` 分割

```javascript
alert(document.cookie); // cookie1=value1; cookie2=value2;...
```

我们可以写入 `document.cookie`。但这不是一个数据属性，它是一个 访问器（getter/setter）。对其的赋值操作会被特殊处理。

对 `document.cookie` 的写入操作只会更新其中提到的 cookie，而不会涉及其他 cookie。

从技术上讲，cookie 的名称和值可以是任何字符。为了保持有效的格式，它们应该使用内建的 `encodeURIComponent` 函数对其进行转义

```javascript
let name = "my name";
let value = "John Smith";

// 将 cookie 编码为 my%20name=John%20Smith
document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
```

> [!warning]
> cookie 存在一些限制
>
> 1. 每个 cookie 键值对大小不能超过 4kb
> 1. 每个页面 cookie 总数不能超过 20 个左右

### 常用的 cookie 键值对

| 属性            | 描述                                                         |
| --------------- | ------------------------------------------------------------ |
| Path            | 是一个绝对路径，使得该路径下的所有页面都可以访问 cookie。    |
| Domain          | 控制了可以访问 cookie 的域。如果我们想允许像 `forum.site.com` 这样的子域在 site.com 上设置 cookie，我们应该明确将 domain 选项设置为根域 `domain=site.com`。这样的技术可以让我实现 SSO（单点登录）。 |
| Expires/Max-age | 在关闭浏览器后仍然存在的 cookie 需要设置 expires 或 max-age 选项中的一个。如果这两个参数都没有设置，那么 cookie 在关闭浏览器后就会消失。这两个选项很类似于浏览器的强缓存策略。 |
| Secure          | 如果一个 cookie 是通过 `https://site.com` 设置的，使用此选项后，它将不会在相同域名的 HTTP 环境下出现，例如 `http://site.com`。它意味着 cookie 只能通过 HTTPS 传输。 |
| Samesite        | 设置为 strict 或 lax，旨在防止 `XSRF` 侵害。设置为 strict 表示严格禁止第三方 cookie，lax 稍微宽松，大多数情况也是不发送第三方 Cookie，但是导航到目标网址的 Get 请求除外。 |
| HttpOnly        | 这个选项禁止任何 JavaScript 访问 cookie。我们使用 `document.cookie` 看不到此类 cookie，也无法对此类 cookie 进行操作。同理，黑客注入的代码也无法获取，因此是一种比较强的保护措施。 |

### 第三方 cookie

如果 cookie 是由用户所访问的页面的域以外的域放置的，则称其为第三方 cookie。比如：

1. `site.com` 网站的一个页面加载了另外一个网站的 banner：`<img src="https://ads.com/banner.png">`。
1. 与 banner 一起，`ads.com` 的远程服务器可能会设置带有 `id=1234` 这样的 cookie 的 `Set-Cookie` header。此类 cookie 源自 `ads.com` 域，并且仅在 `ads.com` 中可见：
1. 下次访问 `ads.com` 网站时，远程服务器获取 cookie id 并识别用户：
1. 更为重要的是，当用户从 `site.com` 网站跳转至另一个也带有 banner 的网站 `other.com` 时，`ads.com` 会获得该 cookie，因为它属于 `ads.com`，从而识别用户并在他在网站之间切换时对其进行跟踪：

## session

Session 是另一种记录客户状态的机制，不同的是 Cookie 保存在客户端浏览器中，而 Session 保存在服务器上。客户端浏览器访问服务器的时候，服务器把客户端信息以某种形式记录在服务器上。

整个流程如下

1. 用户访问服务器，服务器开辟空间，生成响应 ID
1. 通过在响应报文设置一个 `Set-Cookie：JSESSIONID=XXXXXXX`，向用户端发送一个设置 cookie 的请求
1. 浏览器收到后，设置一个 `JSESSIONID=XXXXXXX` 的 cookie 信息，该 cookie 的过期时间为浏览器会话结束
1. 每次用户请求，都会携带这个 cookie，服务器根据该信息获取 session ID

## LocalStorage 和 SessionStorage

两个存储对象都提供相同的方法和属性：

- `setItem(key, value)` —— 存储键/值对。
- `getItem(key)` —— 按照键获取值。
- `removeItem(key)` —— 删除键及其对应的值。
- `clear()` —— 删除所有数据。
- `key(index)` —— 获取该索引下的键名。
- `length` —— 存储的内容的长度。

在所有同源的窗口之间，localStorage 数据可以共享。因此，如果我们在一个窗口中设置了数据，则在另一个窗口中也可以看到数据变化。

我们还可以像使用一个普通对象那样，读取/设置键，像这样：

```javascript
// 设置 key
localStorage.test = 2;

// 获取 key
alert(localStorage.test); // 2

// 删除 key
delete localStorage.test;
```

这是历史原因造成的，并且大多数情况下都可行，但通常不建议这样做，因为：

1. 有些键可能会与内建的属性冲突，比如 `setItem`/`getItem`/`removeItem`/`key`/`length`。
1. 有一个 `storage` 事件，在我们更改数据时会触发。但以类对象方式访问时，不会触发该事件。我们将在本章的后面看到。

> [!warning]
> 这很类似一个 map，但是请注意，键和值都必须是字符串。
>
> 如果是任何其他类型，例数字或对象，它会被自动转换为字符串。

### 遍历 localStorage

我们可以通过获取 `localStorage` 的 `length` 属性，然后使用 `index` 的方法来遍历 `localStorage`。

```javascript
for (let i = 0; i < localStorage.length; i++) {
  let key = localStorage.key(i);
  alert(`${key}: ${localStorage.getItem(key)}`);
}
```

也可以使用 `for...in` 循环，但是要注意，`for...in` 循环会遍历所有的属性，包括内建的属性，所以我们需要使用 `hasOwnProperty` 方法来判断是否是自身属性。

```javascript
for (let key in localStorage) {
  if (!localStorage.hasOwnProperty(key)) {
    continue; // 跳过像 "setItem"，"getItem" 等这样的键
  }
  alert(`${key}: ${localStorage.getItem(key)}`);
}
```

同时还可以使用 `Object.keys()` 来获取所有的键名，然后再遍历。因为 keys 默认只返回自身的属性（同理这里可以直接使用 `Object.entries()` 来获取键值对

### 和 `sessionStorage` 的区别

`sessionStorage` 对象的使用频率比 `localStorage` 对象低得多。

属性和方法是相同的，但是它有更多的限制：

- `sessionStorage` 的数据只存在于当前浏览器标签页。
- 具有相同页面的另一个标签页中将会有不同的存储。
- 但是，它在同一标签页下的 iframe 之间是共享的（假如它们来自相同的源）。
- 数据在页面刷新后仍然保留，但在关闭/重新打开浏览器标签页后不会被保留。

### 不同页面间通信

`localStorage` 和 `sessionStorage` 也可以用于不同页面间的通信。

比如，一个页面可以在 `localStorage` 中设置一个值，另一个页面可以在 `storage` 事件中获取该值。

```javascript
// 页面 1
localStorage.setItem("key", "value");

// 页面 2
window.addEventListener("storage", function (event) {
  alert(event.key); // key
  alert(event.newValue); // value
});
```

### 和 `cookie` 的区别

- `cookie` 是存储在客户端的，`localStorage` 和 `sessionStorage` 是存储在客户端的
- 大小限制：`cookie` 的大小限制是 4kb，每个页面 20+ 左右个，`localStorage` 和 `sessionStorage` 的大小限制是 5MB，但是不同浏览器可能有所不同

## 参考

- [https://www.ruanyifeng.com/blog/2019/09/cookie-samesite.html](https://www.ruanyifeng.com/blog/2019/09/cookie-samesite.html)
