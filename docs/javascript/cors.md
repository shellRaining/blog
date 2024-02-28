---
title: CORS（跨域资源请求）
tag:
  - internet
  - interview_question
date: 2024-02-26
---

## 分类

跨域资源请求分为简单请求和非简单请求，同时满足以下两个条件即是简单请求

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

浏览器先询问服务器（通过 HTTP 的 OPTIONS 方法），服务器收到预检请求以后，检查了 Origin、Access-Control-Request-Method 和 Access-Control-Request-Headers 字段以后，确认允许跨源请求，浏览器才会发出正式的 XMLHttpRequest 请求，否则就报错。

::: info OPTIONS 方法
HTTP OPTIONS 方法请求给定的 URL 或服务器的允许通信选项。客户端可以用这个方法指定一个 URL，或者用星号（*）来指代整个服务器。

返回值如下，响应包含 Allow 标头，其值表明了服务器支持的所有 HTTP 方法：

```
HTTP/1.1 204 No Content
Allow: OPTIONS, GET, HEAD, POST
Cache-Control: max-age=604800
Date: Thu, 13 Oct 2016 11:45:00 GMT
Server: EOS (lax004/2813)
```

更多信息见参考
:::

## 参考

[https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)
[https://github.com/Jacky-Summer/personal-blog](https://github.com/Jacky-Summer/personal-blog/blob/master/%E6%97%A5%E5%B8%B8%E6%80%BB%E7%BB%93/%E5%89%8D%E7%AB%AF%E8%B7%A8%E5%9F%9F%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88%E5%BD%92%E7%BA%B3%E6%95%B4%E7%90%86.md#cors)
[https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods/OPTIONS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods/OPTIONS)
