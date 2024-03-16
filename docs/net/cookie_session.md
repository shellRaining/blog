---
title: cookie 和 session
tag:
  - browser
  - interview_question
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
alert( document.cookie ); // cookie1=value1; cookie2=value2;...
```

我们可以写入 `document.cookie`。但这不是一个数据属性，它是一个 访问器（getter/setter）。对其的赋值操作会被特殊处理。

对 `document.cookie` 的写入操作只会更新其中提到的 cookie，而不会涉及其他 cookie。

从技术上讲，cookie 的名称和值可以是任何字符。为了保持有效的格式，它们应该使用内建的 `encodeURIComponent` 函数对其进行转义（这个函数在[网络请求](../javascript/network_request.md#url-%E5%AF%B9%E8%B1%A1)部分也有涉及）：

```javascript
let name = "my name";
let value = "John Smith"

// 将 cookie 编码为 my%20name=John%20Smith
document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
```

::: warning
cookie 存在一些限制

1. 每个 cookie 键值对大小不能超过 4kb
1. 每个页面 cookie 总数不能超过 20 个左右

:::

### 常用的 cookie 键值对

1. `path`：是一个绝对路径，使得该路径下的页面都可以访问 cookie，比如设置 `path=/`，那么整个页面都可以访问 cookie

1. `domain`：控制了可以访问 cookie 的域，但是实际应用中，我们能做的操作是极其有限的

   无法从另一个二级域访问 cookie，因此 `other.com` 永远不会收到在 `site.com` 设置的 cookie。默认情况下，cookie 也不会共享给子域……但这是可以设置的。如果我们想允许像 `forum.site.com` 这样的子域在 `site.com` 上设置 cookie，

   为此，当在 `site.com` 设置 cookie 时，我们应该明确地将 domain 选项设置为根域：`domain=site.com`。那么，所有子域都可以访问到这样的 cookie。

1. `expires max-age`

   默认情况下，如果一个 cookie 没有设置这两个参数中的任何一个，那么在关闭浏览器之后，它就会消失。此类 cookie 被称为 "session cookie”。（也就是说，我们之后讲的 session  其实是一种特殊的 cookie）。为了让 cookie 在浏览器关闭后仍然存在，我们可以设置 `expires` 或 `max-age` 选项中的一个。

   - `expires=Tue, 19 Jan 2038 03:14:07 GMT`
   - `max-age=3600`

   这两种设置如果是设置成了过去的事件，则表示删除 cookie

1. `secure`：Cookie 应只能被通过 HTTPS 传输。

   默认情况下，如果我们在 `http://site.com` 上设置了 cookie，那么该 cookie 也会出现在 `https://site.com` 上，反之亦然。也就是说，cookie 是基于域的，它们不区分协议。

   使用此选项，如果一个 cookie 是通过 `https://site.com` 设置的，那么它不会在相同域的 HTTP 环境下出现，例如 `http://site.com`。所以，如果一个 cookie 包含绝不应该通过未加密的 HTTP 协议发送的敏感内容，那么就应该设置 secure 标识。

   这个是一个属性，而非键值对表示

1. `samesite`：该选项有两种取值 `strict` 和 `lax`。旨在防止 XSRF（跨网站请求伪造）攻击，更多请见 [https://zh.javascript.info/cookie#samesite](https://zh.javascript.info/cookie#samesite)

1. `httponly`：这个选项是一个给浏览器看的东西，Web 服务器使用 `Set-Cookie` header 来设置 cookie。并且，它可以设置 `httpOnly` 选项。这个选项禁止任何 JavaScript 访问 cookie。我们使用 `document.cookie` 看不到此类 cookie，也无法对此类 cookie 进行操作。同理，黑客注入的代码也无法获取，因此是一种比较强的保护措施

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
