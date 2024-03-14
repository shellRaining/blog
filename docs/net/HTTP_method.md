---
title: HTTP 中的方法
tag:
  - net
  - interview_question
date: 2024-03-07
---

## 什么是 HTTP 方法

一个 HTTP 报文可以分为起始行，头部（标头），空行，请求数据，详细内容可见 [HTTP 标头](./HTTP_head.md)

其中*请求报文*的起始行包含两项，一个是 HTTP 方法，另一个是 [HTTP 版本](./HTTP_version.md)

HTTP 方法有如下这些

### GET

HTTP GET 方法请求指定资源的表示。使用 GET 的请求应该只用于请求数据，而不应该包含数据。

### HEAD

HEAD 方法请求一个与 GET 请求的响应相同的响应，但没有响应体。

该方法的一个使用场景是在下载一个大文件前先通过 HEAD 请求读取其 `Content-Length` 标头的值获取文件的大小，而无需实际下载文件，以此可以节约带宽资源。

还有一个使用场景，就是通过 HEAD 方法检查缓存的文件是否过期

### POST

HTTP POST 方法发送数据给服务器。一个 POST 请求通常是通过 HTML 表单发送的，并导致服务器的相应修改。

### PUT

HTTP PUT 请求方法创建一个新的资源或用请求的有效载荷替换目标资源的表示。

如果服务器没有该资源，并且 PUT 方法成功创建了资源，那么源服务器必须返回 201（Created）来通知用户代理资源已创建。

如果目标资源已经存在，并且依照请求中封装的表现形式成功进行了更新，那么，源服务器必须返回 200（OK）或 204（No Content）来表示请求成功完成。

### DELETE

HTTP DELETE 请求方法用于删除指定的资源。

### OPTIONS

HTTP OPTIONS 方法请求给定的（URL 或服务器）的允许通信选项。客户端可以用这个方法指定一个 URL，或者用星号（\*）来指代整个服务器。

常用来检测服务器所支持的请求方法和 [CORS 中的预检请求](./cors.md)

## HTTP 的幂等性

HTTP 的幂等性是指一个 HTTP 方法被执行多次和仅被执行一次对服务器资源的影响是相同的。

除了 `POST` 和 `PATCH` 方法都是幂等的方法，因为 POST 通常用于创建新资源，多次执行可能会创建多个资源实例；PATCH 用于对资源进行部分更新，多次执行可能会基于不同的初始状态产生不同的结果。

## GET 方法与 POST 方法的主要区别

1. GET 方法是幂等的，所进行的请求操作不会改变服务器的状态
1. GET 方法的参数在 URL 中，而 POST 方法的在 HTTP 报文载荷（请求体）中
1. 传送大小的限制，GET 方法受限于服务器和浏览器 URL 长度接受大小，POST 一般没有限制（除非服务器有规定）
1. GET 方法的请求参数会被保存在浏览器历史记录中，而 POST 方法不会
1. GET 方法相对 POST 方法不安全，因为参数直接暴露在 URL 中，而 POST 方法的参数在请求体中，相对安全一些，详情可见 [HTTPS 细节](./HTTPS.md)

## 参考

[https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods/POST](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods/POST)
