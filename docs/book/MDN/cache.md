---
title: 强缓存和协商缓存
tag:
  - book
date: 2024-03-17
---

## 强缓存

强缓存通过 `Expires` 和 `Cache-Control` 两种响应头实现

其中 `Expires` 是服务器响应的过期时间（绝对时间，由于客户端可能更改事件，导致缓存失效），`Cache-Control` 是服务器响应的缓存策略（可以使用 `max-age` 相对时间，优先级高于 `Expires`）

其中 `Cache-Control` 还有一些控制策略

1. `Cache-Control: no-store` 真正的不缓存数据到本地
1. `Cache-Control: no-cache` 不使用强缓存，需要使用协商缓存
1. `Cache-Control: public` 可以被所有用户缓存（多用户共享），包括终端和 CDN 等中间代理服务器
1. `Cache-Control: private` 只能被终端浏览器缓存（而且是私有缓存），不允许中继缓存服务器进行缓存

> [!tip]
>
> vite 通过利用预构建的强缓存，提高了开发期间页面重新刷新的性能。预构建一旦被缓存，这些请求将永远不会再次访问开发服务器。如果安装了不同版本的依赖项（这反映在包管理器的 lockfile 中），则会自动失效
>
> 除此之外，在开发环境下 ，由于使用 esbuild 作为打包器和编译器，他的速度可以得到保证（esbuild 可以说是个多面手，以速度的优势换来了拓展性较差的问题）

## 协商缓存

如果强缓存没有命中，客户端会向服务器发送一个 `GET` 请求到服务器，验证协商缓存是否命中，如果协商缓存命中，请求响应返回的 http 状态为 304 并且会显示一个 Not Modified 的字符串

协商缓存通过 `If-Modified-Since`， `If-None-Match` 两个请求头和`Last-Modified` 和 `Etag` 两个响应头实现

其中 `Last-Modified` 是服务器响应的资源最后修改时间，`If-Modified-Since` 是客户端请求的资源最后修改时间，客户端会首先发送带有 `If-Modified-Since`（上次返回的 `Last-Modified` 的时间）的请求，询问服务器在该日期后资源是否有更新，有更新的话就会将新的资源发送回来。但是如果在本地打开缓存文件，就会造成 Last-Modified 被修改，所以在 HTTP / 1.1 出现了 ETag

`Etag` 是服务器响应的资源唯一标识（规则由服务器来制定，没有统一标准），`If-None-Match` 是客户端请求的资源唯一标识，相当于一个哈希值。如果一个请求中同时包含了 `If-Modified-Since`， `If-None-Match`，那么 Etag 优先级更高

## 状态码

- `200`：强缓存失效时，返回新的资源文件
- `200(from cache)`: 强缓 Expires/Cache-Control 两者都存在，未过期，Cache-Control 优先 Expires 时，浏览器从本地获取资源成功。

  还有一个，这里会分为 from disk cache 和 from memory cache 两种，表示从不同的位置进行获取，前者适合大小较小的一些数据（比如 base64），后者适合 css 这样的文件

- `304(Not Modified)`：协商缓存 Last-modified/Etag 没有过期时，服务端返回状态码 304
