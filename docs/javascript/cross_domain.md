---
title: 什么是跨域
tag:
  - interview
date: 2024-02-22
---

## 同源

首先需要知道什么是同源才能狗理解跨域，同源指的是

- 协议：即 `http` 或者 `https` 等
- 主机：即 `www.baidu.com` 或者 `www.google.com` 等
- 端口：即 `80` 或者 `443` 等

## 跨域

跨域是浏览器的一种安全策略，只有在同源的情况下才能进行一些操作，如果发生了跨域，后端是跨域向用户返回数据的（即通过抓包工具可以获取），但是浏览器将数据屏蔽掉了

用实际开发来举例子，我们在一个使用 live-server 启动的项目中，将编写的 HTML 等资源文件放到了 `localhost:8080` 上，然后我们在这个项目的控制台中使用了一个 `fetch` 请求，请求的地址是 `www.baidu.com`，这时候就会发生跨域

<img width='' src='https://raw.githubusercontent.com/shellRaining/img/main/2402/cross-origin.png'>

或者更贴近实际一点，我们在一个项目中使用了 `axios` 发送了一个请求，请求的地址是 `www.baidu.com`（甚至可以是我们自己部署的后端服务器），这时候也会发生跨域，导致后端接收到了请求但是发送的内容我们无法使用

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

## 参考

[https://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html](https://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html)
