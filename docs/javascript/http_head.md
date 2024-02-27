---
title: HTTP 标头
tag:
  - interview
  - internet
date: 2024-02-26
---

## HTTP 协议格式

因为 HTTP 标头是 HTTP 协议的一部分，所以我们需要先了解一下 HTTP 协议的格式

### URL 结构

`http://www.fishbay.cn:80/mix/76.html?name=kelvin&password=123456#first`

我们对这个 URL 进行拆解

- `http` 是协议，`://` 是协议和主机之间的分隔符
- `www.fishbay.cn` 是主机，发送请求时，需要向 DNS 服务器解析 IP。如果为了优化请求，可以直接用 IP 作为域名部分使用
- `80` 是端口，前面的 `:` 是主机和端口之间的分隔符，端口是可选的，如果省略了端口，那么默认使用 `80` 端口
- `/mix/` 是虚拟目录部分，从第一个 `/` 到最后一个 `/` 之间的部分是虚拟目录，如果省略了虚拟目录，那么默认使用 `/`
- `76.html` 是文件名部分，从域名的最后一个 `/` 到 `?` 之间的部分是文件名部分，如果省略了文件名，那么默认使用 `index.html`
- `?name=kelvin&password=123456` 是参数部分，从 `?` 到 `#` 之间的部分是参数部分，如果有多个参数，那么用 `&` 连接
- `#first` 是锚部分，从 `#` 开始到 URL 的最后都是锚部分，锚部分是用来定位页面的某个位置的

### 报文

报文分为请求报文和回复报文，每种报文分为四个部分

1. 请求行，包含请求类型，URL，还有 HTTP 版本
1. 请求头部，这里的就是标头了，后面会详细介绍
1. 空行，这个空行是必须的
1. 请求数据

<img src='https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages/httpmsgstructure2.png' style="background-color: white">

以下是我用 wireshark 抓取的一个 HTTP 报文

<img width='' src='https://raw.githubusercontent.com/shellRaining/img/main/2402/http_pack.png'>

可以从里面看到各种信息，比如请求头，响应头，请求体，响应体等

### 标头

标头就是报文中的请求头部，由很多的键值对组成，每个键值对之间用 `:` 分隔，键值对之间用 `\r\n` 分隔，最后用一个 `\r\n` 结束

根据不同的消息上下文，标头可以分为：

- 请求标头

  在 HTTP 请求中使用，提供有关请求的额外信息，例如，`Accept-*` 标头表示响应允许的条件和首选的格式，但是并非请求报文中的所有标头都是请求标头，比如 `Content-Type` 标头被称为表示标头

- 响应标头

  包含有关响应的额外信息，例如响应的位置或者提供响应的服务器。

- 表示标头

  相同的数据，其可能被格式化为例如 XML 或 JSON 等特定媒体类别的格式，客户端指定它们希望在[`内容协商`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Content_negotiation)期间发送的格式（使用 Accept-\* 标头），并且表示标头将实际收到的选定的表示形式传达给客户端。因此该标头在请求和响应报文中都可能看到

- 有效负荷标头

  包含有关有效载荷数据表示的单独信息，包括内容长度和用于传输的编码。
