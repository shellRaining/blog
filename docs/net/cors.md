---
title: CORS（跨域资源请求）
tag:
  - internet
  - interview_question
date: 2024-02-26
---

## 分类

跨域资源请求分为简单请求和非简单请求，同时满足以下两个条件即是简单请求

### 简单请求

只要同时满足以下两大条件，就属于简单请求。

1. 请求方法是以下是三种方法之一：
   - HEAD
   - GET
   - POST
1. HTTP 的头信息不超出以下几种字段：
   - Accept
   - Accept-Language
   - Content-Language
   - Last-Event-ID
   - Content-Type：只限于三个值 application/x-www-form-urlencoded、multipart/form-data、text/plain

如果一个请求是跨源的，浏览器始终会向其添加 Origin header。

```http
GET /request
Host: anywhere.com
Origin: https://javascript.info
```

服务器可以检查 Origin，如果同意接受这样的请求，就会在响应中添加一个特殊的 header `Access-Control-Allow-Origin`。该 header 包含了允许的源（在我们的示例中是 https://javascript.info），或者一个星号 \*。然后响应成功，否则报错。

浏览器在这里扮演受被信任的中间人的角色：

- 它确保发送的跨源请求带有正确的 Origin。
- 它检查响应中的许可 Access-Control-Allow-Origin，如果存在，则允许 JavaScript 访问响应，否则将失败并报错。

<img width='' src='https://raw.githubusercontent.com/shellRaining/img/main/2403/cors_simple_request.png'>

对于跨源请求，默认情况下，JavaScript 只能访问“安全的” response header：

- Cache-Control
- Content-Language
- Content-Type
- Expires
- Last-Modified
- Pragma

访问任何其他 response header 都将导致 error。

::: warning
请注意：列表中没有 Content-Length header！

该 header 包含完整的响应长度。因此，如果我们正在下载某些内容，并希望跟踪进度百分比，则需要额外的权限才能访问该 header（请见下文）。
:::

要授予 JavaScript 对任何其他 response header 的访问权限，服务器必须发送 `Access-Control-Expose-Headers` header。它包含一个以逗号分隔的应该被设置为可访问的非安全 header 名称列表。

### 非简单请求

对于非简单请求，浏览器先询问服务器该请求是否可以被接受（通过 HTTP 的 OPTIONS 方法），在预检请求中发送的 `Access-Control-Request-Method` 标头告知服务器实际请求所使用的 HTTP 方法， `Access-Control-Request-Headers` 标头告知服务器实际请求所携带的自定义标头

服务器收到预检请求以后，检查了 Origin、Access-Control-Request-Method 和 Access-Control-Request-Headers 字段以后，确认允许跨源请求，浏览器才会发出正式的 XMLHttpRequest 请求，否则就报错。

::: info OPTIONS 方法
HTTP OPTIONS 方法请求给定的 URL 或服务器的允许通信选项。客户端可以用这个方法指定一个 URL，或者用星号（\*）来指代整个服务器。这里有一个实例

```http
OPTIONS /resources/post-here/ HTTP/1.1
Host: bar.example
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Connection: keep-alive
Origin: https://foo.example
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-PINGOTHER, Content-Type
```

返回值如下，响应包含 Allow 标头，其值表明了服务器支持的所有 HTTP 方法：

```http
HTTP/1.1 204 No Content
Allow: OPTIONS, GET, HEAD, POST
Cache-Control: max-age=604800
Date: Thu, 13 Oct 2016 11:45:00 GMT
Server: EOS (lax004/2813)
```

更多信息见参考和 [HTTP 方法 OPTIONS](./HTTP_method.md#options)
:::

### 凭据

默认情况下，由 JavaScript 代码发起的跨源请求不会带来任何凭据（cookies 或者 HTTP 认证（HTTP authentication））。

这是因为具有凭据的请求比没有凭据的请求要强大得多。如果被允许，它会使用它们的凭据授予 JavaScript 代表用户行为和访问敏感信息的全部权力。

服务器真的这么信任这种脚本吗？是的，它必须显式地带有允许请求的凭据和附加 header。

要在 fetch 中发送凭据，我们需要添加 credentials: "include" 选项，像这样：

```javascript
fetch('http://another.com', {
  credentials: "include"
});
```

现在，fetch 将把源自 another.com 的 cookie 和我们的请求发送到该网站。

如果服务器同意接受 带有凭据 的请求，则除了 Access-Control-Allow-Origin 外，服务器还应该在响应中添加 header `Access-Control-Allow-Credentials: true`

例如：

```http
200 OK
Access-Control-Allow-Origin: https://javascript.info
Access-Control-Allow-Credentials: true
```

请注意：对于具有凭据的请求，禁止 `Access-Control-Allow-Origin` 使用星号 \*。如上所示，它必须有一个确切的源。这是另一项安全措施，以确保服务器真的知道它信任的发出此请求的是谁。

## 参考

- [https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)
- [https://github.com/Jacky-Summer/personal-blog](https://github.com/Jacky-Summer/personal-blog/blob/master/%E6%97%A5%E5%B8%B8%E6%80%BB%E7%BB%93/%E5%89%8D%E7%AB%AF%E8%B7%A8%E5%9F%9F%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88%E5%BD%92%E7%BA%B3%E6%95%B4%E7%90%86.md#cors)
- [https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods/OPTIONS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods/OPTIONS)
- [https://zh.javascript.info/fetch-crossorigin#an-quan-qing-qiu](https://zh.javascript.info/fetch-crossorigin#an-quan-qing-qiu)
