---
title: 常见的 web 攻击方式
tag:
  - net
  - interview_question
date: 2024-03-15
---

我们常见的 web 攻击方式包括

- XSS 攻击
- CSRF 攻击
- SQL 注入攻击

## XSS（跨站脚本攻击）

XSS 定义为：攻击者将恶意代码植入到提供给其它用户使用的页面中的攻击行为，这样做可以获取获取用户敏感信息（比如 cookie，session ID 等），从而冒充合法用户来与网站交互，比如下面的代码

```vue
<template>
  <div>
    <input v-model="userInput" type="text">
    <div v-html="userInput"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInput: ''
    }
  }
}
</script>
```

如果用户输入了 `<script>alert('XSS Attack!')</script>` 这样的内容，那么页面就会弹出 `XSS Attack!` 的提示框

## XSS 攻击的分类

根据攻击的来源，XSS攻击可以分成：

- 存储型
- 反射型
- DOM 型

### 存储型

- 攻击者将恶意代码提交到目标网站的数据库中
- 用户打开目标网站时，网站服务端将恶意代码从数据库取出，拼接在 HTML 中返回给浏览器
- 用户浏览器接收到响应后解析执行，混在其中的恶意代码也被执行
- 恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作

这种攻击常见于带有用户保存数据的网站功能，如论坛发帖、商品评论、用户私信等

### 反射型

- 攻击者构造出特殊的 URL，其中包含恶意代码
- 用户打开带有恶意代码的 URL 时，网站服务端将恶意代码从 URL 中取出，拼接在 HTML 中返回给浏览器
- 用户浏览器接收到响应后解析执行，混在其中的恶意代码也被执行
- 恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作

反射型 XSS 跟存储型 XSS 的区别是：存储型 XSS 的恶意代码存在数据库里，反射型 XSS 的恶意代码存在 URL 里。由于需要用户主动打开恶意的 URL 才能生效，攻击者往往会结合多种手段诱导用户点击。而且此类链接一般是 get 类型的请求

### DOM 型

- 攻击者构造出特殊的 URL，其中包含恶意代码
- 用户打开带有恶意代码的 URL
- 用户浏览器接收到响应后解析执行，前端 JavaScript 取出 URL 中的恶意代码并执行
- 恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作

DOM 型 XSS 跟前两种 XSS 的区别：DOM 型 XSS 攻击中，取出和执行恶意代码由浏览器端完成，属于前端 JavaScript 自身的安全漏洞，而其他两种 XSS 都属于服务端的安全漏洞

我们上面的例子就是一个 DOM 型的 XSS 攻击

### 预防

对于前两种形式的攻击，有两种做法

- 改成纯前端渲染，把代码和数据分隔开。
- 对 HTML 做充分转义。使用一些专门转义的库

::: info
纯前端渲染的过程：

- 浏览器先加载一个静态 HTML，此 HTML 中不包含任何跟业务相关的数据。
- 然后浏览器执行 HTML 中的 JavaScript。
- JavaScript 通过 Ajax 加载业务数据，调用 DOM API 更新到页面上。

我们经常使用的 Vue、React 等框架就是这种模式，因此这种模式下，基于服务端攻击的 XSS 攻击的可能性会大大降低，但是同时也会让 SEO 降低
:::

对于 DOM 型攻击，我们应该尽量避免使用 `.innerHTML`、`.outerHTML`、`document.write()` 时要特别小心，不要把不可信的数据作为 HTML 插到页面上，而应尽量使用 `.textContent`、.`setAttribute()` 等。

还有一些其他的通用的预防方式，比如更严格的 `Content Security Policy`

- 禁止内联脚本执行（规则较严格，目前发现 GitHub 使用）。
- 禁止加载外域代码，防止复杂的攻击逻辑。

::: tip Content Security Policy
CSP 是浏览器提供的一种安全策略，当从服务器获取 HTTP 报文的时候，浏览器会根据 HTTP 头部（或者 HTML 中的 meta 标签）中的 CSP 配置来决定是否执行 JavaScript、CSS、图片等资源。CSP 可以有效减少 XSS 攻击。
:::

输入内容长度控制，对于不受信任的输入，都应该限定一个合理的长度。虽然无法完全防止 XSS 发生，但可以增加 XSS 攻击的难度。

HTTP-only Cookie: 禁止 JavaScript 读取某些敏感 Cookie，攻击者完成 XSS 注入后也无法窃取此 Cookie。

## CSRF 攻击

当我们访问一个正常网站 A 后，如果存储了 A 的 cookie（比如一些登录信息后），又同时访问了 B 站点，B 可能会通过一些手段获取了我们的 A 站点 cookie，然后伪造身份给 A 发送请求。

流程如下：

1. 受害者登录 `a.com`，并保留了登录凭证 Cookie
1. 攻击者*引诱*受害者访问了 `b.com`
1. `b.com` 向 `a.com` 发送了一个请求
1. `a.com` 接收到请求后，对请求进行验证，并确认是受害者的凭证，误以为是受害者自己发送的请求
1. `a.com` 以受害者的名义执行了 `act=xxx`
1. 攻击完成，攻击者在受害者不知情的情况下，冒充受害者，让 `a.com` 执行了自己定义的操作

与 XSS 相比，XSS 利用的是用户对指定网站的信任，CSRF 利用的是网站对用户网页浏览器的信任。

### 预防

1. 确保请求由用户发起，即通过一些验证手段，比如验证码、Token 等
2. 验证发起请求的来源是否是外域，通过检查 `Origin` 和 `Referer` 头部来判断
3. 使用 `SameSite` Cookie 属性，可以防止 CSRF 攻击，关于 cookie 的更多信息请见 [cookie](./cookie_session.md#cookie)
4. 同样 jwt 也可以缓解 CSRF 攻击，因为 jwt 并不是随着浏览器的请求自动发送的，而是需要手动设置在请求头中

::: tip cookie 字段对于攻击的防御
`SameSite` 是用来防御 CSRF 攻击的，而 `HttpOnly` 是用来防御 XSS 攻击的。
:::

## 参考

- [https://tech.meituan.com/2018/10/11/fe-security-csrf.html](https://tech.meituan.com/2018/10/11/fe-security-csrf.html)
