---
title: 什么是跨域
tag:
  - interview_question
date: 2024-02-22
---

## 同源

首先需要知道什么是同源才能够理解跨域，同源指的是

- 协议：即 `http` 或者 `https` 等
- 主机：即 `www.baidu.com` 或者 `www.google.com` 等
- 端口：即 `80` 或者 `443` 等

## 跨域

跨域是浏览器的一种安全策略，只有在同源的情况下才能进行一些操作，比如我们从服务器 A 获取了所有的 HTML CSS JavaScript 文件后，执行 JavaScript 过程中又遇到了向服务器 B （不同源）发送数据请求的任务，此时后端是跨域向用户返回数据的（即通过抓包工具可以获取），但是浏览器将数据屏蔽掉了

用实际开发来举例子，我们在一个使用 live-server 启动的项目中，将编写的 HTML 等资源文件放到了 `localhost:8080` 上，然后我们在这个项目的控制台中使用了一个 `fetch` 请求，请求的地址是 `www.baidu.com`，这时候就会发生跨域

<img width='' src='https://raw.githubusercontent.com/shellRaining/img/main/2402/cross-origin.png'>

或者更贴近实际一点，我们在一个项目中使用了 `axios` 发送了一个请求，请求的地址是 `www.baidu.com`（甚至可以是我们自己部署的后端服务器），这时候也会发生跨域，导致后端接收到了请求但是发送的内容我们无法使用，又或者是我们使用一些网络字体（CSS 中通过 @font-face 使用跨源字体资源），请求的时候可能是跨域的

这样做的目的是保护用户的信息，因为浏览器可能会假定我们的前端脚本是恶意的，如果没有跨域限制，我们可以访问到其他服务器的信息，甚至可以更改这些信息，这样会导致很多危险的事情。

::: info
以下是阮一峰老师关于跨域的一些观点

### 目的

同源政策的目的，是为了保证用户信息的安全，防止恶意的网站窃取数据。

设想这样一种情况：A网站是一家银行，用户登录以后，又去浏览其他网站。如果其他网站可以读取A网站的 Cookie，会发生什么？

很显然，如果 Cookie 包含隐私（比如存款总额），这些信息就会泄漏。更可怕的是，Cookie 往往用来保存用户的登录状态，如果用户没有退出登录，其他网站就可以冒充用户，为所欲为。因为浏览器同时还规定，提交表单不受同源政策的限制。

由此可见，"同源政策"是必需的，否则 Cookie 可以共享，互联网就毫无安全可言了。

### 限制范围

随着互联网的发展，"同源政策"越来越严格。目前，如果非同源，共有三种行为受到限制。

1. Cookie、LocalStorage 和 IndexDB 无法读取。
1. DOM 无法获得。
1. AJAX 请求不能发送。

:::

更具体的例子可以看我写（模仿写的）一个代码库 [https://github.com/shellRaining/JavaScript-experiment/tree/main/cross-domain](https://github.com/shellRaining/JavaScript-experiment/tree/main/cross-domain)

## 解决

### CORS

后端可以设置 `Access-Control-Allow-Origin` 来允许跨域请求，这样就可以解决跨域问题，这个随着不同的后端框架而有所不同，比如在 `express` 中可以这样设置

```javascript
app2.get("/", function (_req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.send("Hello World");
});
```

更多关于 CORS 的内容可以看 [CORS（跨域资源请求）](./cors.md)

### JSONP

script 标签中的 src 属性是不受跨域限制的，所以我们可以使用 script 标签来进行跨域请求，这就是 JSONP 的原理

```html
<script>
  function f(info) {
    console.log(info);
  }
</script>
<script src="http://localhost:5378?callback=f"></script>
```

同时后端处理的时候也要返回一个调用该回调的字符串，调用的参数就是我们需要的数据

```javascript
app2.get("/", function (_req, res) {
  const func = _req.query.callback;
  res.send(func + "({name: 'John', age: 30})");
});
app2.listen(5378);
```

### node 中间件

实现原理：同源策略是浏览器需要遵循的标准，而如果是服务器向服务器请求就没有跨域一说。其请求顺序如下

<img width='' src='https://raw.githubusercontent.com/shellRaining/img/main/2402/middleware.png'>

1. 首先浏览器发出黑色的请求，请求我们的页面，此时我们使用的是浏览器的 61257 端口和使用 5377 端口的代理服务器进行通信
1. 然后当用户点击按钮请求 `/api/request`，这时候的请求还是代理服务器
1. 代理服务器接收到后，创建一个新端口 61258 来和位于 5378 端口的数据所在服务器进行通信，并将数据返回给代理服务器
1. 代理服务器将数据转发给浏览器

这个过程中遇到的数据包如下所示

<img width='' src='https://raw.githubusercontent.com/shellRaining/img/main/2402/middleware_pack.png'>

1-4 都是用来建立 HTTP 连接所发的数据包（从浏览器到代理服务器），5-6 是浏览器请求数据的数据包，代理服务器收到后确认，7-10 也是用来建立 HTTP 连接的数据包（从代理服务器到数据所在服务器），11-13 经历了代理服务器请求并最终收到数据的过程，请求结束后关闭连接（四次挥手），但是此时图中的包乱序了，看不出是谁的结束包。大致过程如下

代码在 [https://github.com/shellRaining/JavaScript-experiment/tree/main/node_midware](https://github.com/shellRaining/JavaScript-experiment/tree/main/node_midware)

### Nginx 反向代理

实现原理类似于 Node 中间件代理，需要你搭建一个中转 nginx 服务器，用于转发请求。此处暂不详说

### websocket

::: info
摘自 [博客](https://github.com/Jacky-Summer/personal-blog/blob/master/%E6%97%A5%E5%B8%B8%E6%80%BB%E7%BB%93/%E5%89%8D%E7%AB%AF%E8%B7%A8%E5%9F%9F%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88%E5%BD%92%E7%BA%B3%E6%95%B4%E7%90%86.md#websocket)

WebSocket 是一种网络通信协议。它实现了浏览器与服务器全双工通信，同时允许跨域通讯，长连接方式不受跨域影响。由于原生 WebSocket API 使用起来不太方便，我们一般都会使用第三方库如 ws。

Web 浏览器和服务器都必须实现 WebSockets 协议来建立和维护连接。由于 WebSockets 连接长期存在，与典型的 HTTP 连接不同，对服务器有重要的影响。
:::

```html
<button onclick="send()">click and watch console</button>
<script>
  function send() {
    let socket = new WebSocket("ws://localhost:5377");
    socket.onopen = function () {
      socket.send("向服务端发送数据");
    };
    socket.onmessage = function (e) {
      console.log(e.data); // 服务端传给你的数据
    };
  }
</script>
```

```js
const WebSocket = require('ws')

let wsServer = new WebSocket.Server({ port: 5377 })
wsServer.on('connection', function (ws) {
  ws.on('message', function (data) {
    console.log(data) // 向服务端发送数据
    ws.send('服务端传给你的数据')
  })
})
```

### 其他待补充……

## 参考

[https://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html](https://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html)
