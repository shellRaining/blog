---
title: TCP 三次握手，四次挥手
tag:
  - net
  - interview_question
date: 2024-03-06
---

## 三次握手过程

1. 首先客户端和服务器都处于 close 状态，然后服务器开始 listen 一个特定的端口，处于 `listen` 状态

1. 客户端生成一个随机的初始化信号（client_isn），将即将发送的第一个报文的序列号（SYN）设置为这个随机值，然后将 SYN 标志位设置为 1，将该包发送出去，此后客户端进入 `SYN-SENT` 状态

   <img width='' src='https://cdn.xiaolincoding.com//mysql/other/format,png-20230309230500953.png'>

1. 服务端收到包后，将自己的第一个报文的应答号（ACK）设置为 client_isn + 1，然后自己也生成一个随机的初始化信号（server_isn)，填入到第一个报文的序列号（SYN）中，同时将 ACK 和 SYN 标志位都设置为 1。发送后，服务器进入 `SYN-RCVD` 状态

   <img width='' src='https://cdn.xiaolincoding.com//mysql/other/format,png-20230309230504118.png'>

1. 客户端收到服务端的报文后，将自己的应答号设置为 server_isn + 1，然后设置 ACK 标志位为 1，发送后客户端进入 `ESTABLISHED` 状态，服务器收到后也进入此状态

   <img width='' src='https://cdn.xiaolincoding.com//mysql/other/format,png-20230309230508297.png'>

## 三次握手面试问题

### 为什么是三次握手？不是两次、四次？

三次握手才可以阻止二次握手重复历史连接的初始化（主要原因），这样做可以避免服务器资源的浪费

<img width='' src='https://cdn.xiaolincoding.com//mysql/other/format,png-20230309230525514.png'>

也可以合并四次握手中的第二次和第三次握手

<img width='' src='https://cdn.xiaolincoding.com//mysql/other/format,png-20230309230639121.png'>

### 为什么每次建立 TCP 连接时，初始化的序列号都要求不一样呢？

- 为了防止历史报文被下一个相同四元组的连接接收（主要方面）；
- 为了安全性，防止黑客伪造的相同序列号的 TCP 报文被对方接收；

<img width='' src='https://cdn.xiaolincoding.com/gh/xiaolincoder/network/tcp/isn%E7%9B%B8%E5%90%8C.png'>

### 第一次握手丢失了，会发生什么？

在这之后，如果客户端迟迟收不到服务端的 SYN-ACK 报文（第二次握手），就会触发「超时重传」机制，重传 SYN 报文，而且重传的 SYN 报文的*序列号都是一样的*。

在 Linux 里，客户端的 SYN 报文最大重传次数由 tcp_syn_retries 内核参数控制，这个参数是可以自定义的，默认值一般是 5。

通常，第一次超时重传是在 1 秒后，第二次超时重传是在 2 秒，第三次超时重传是在 4 秒后，第四次超时重传是在 8 秒后，第五次是在超时重传 16 秒后。没错，每次超时的时间是上一次的 2 倍。

### 第二次握手丢失了，会发生什么？

第二次握手的 SYN-ACK 报文其实有两个目的 ：

- 第二次握手里的 ACK， 是对第一次握手的确认报文；
- 第二次握手里的 SYN，是服务端发起建立 TCP 连接的报文；

因为第二次握手报文里是包含对客户端的第一次握手的 ACK 确认报文，所以，如果客户端没有收到第二次握手，那么客户端就觉得可能自己的 SYN 报文（第一次握手）丢失了，于是客户端就会触发超时重传机制，重传 SYN 报文。

如果第二次握手丢失了，服务端就收不到第三次握手，于是服务端这边会触发超时重传机制，重传 SYN-ACK 报文。

## 四次挥手过程

- 客户端打算关闭连接，此时会发送一个 TCP 首部 FIN 标志位被置为 1 的报文，之后客户端进入 `FIN_WAIT_1` 状态。
- 服务端收到该报文后，就向客户端发送 ACK 应答报文，接着服务端进入 `CLOSE_WAIT` 状态。
- 客户端收到服务端的 ACK 应答报文后，之后进入 `FIN_WAIT_2` 状态。
- 等待服务端处理完数据后，也向客户端发送 FIN 报文，之后服务端进入 `LAST_ACK` 状态。
- 客户端收到服务端的 FIN 报文后，回一个 ACK 应答报文，之后进入 `TIME_WAIT` 状态
- 服务端收到了 ACK 应答报文后，就进入了 `CLOSE` 状态，至此服务端已经完成连接的关闭。
- 客户端在经过 2MSL 一段时间后，自动进入 `CLOSE` 状态，至此客户端也完成连接的关闭。

## 四次挥手面试问题

### 为什么挥手需要四次？

- 关闭连接时，客户端向服务端发送 FIN 时，仅仅表示客户端不再发送数据了但是还能接收数据。
- 服务端收到客户端的 FIN 报文时，先回一个 ACK 应答报文，而服务端可能还有数据需要处理和发送，等服务端不再发送数据时，才发送 FIN 报文给客户端来表示同意现在关闭连接。

### 可不可以只挥手三次结束

可以，如果没有需要发的数据包，或者遇到了服务器设置了延迟确认机制

## 参考

[https://www.xiaolincoding.com/network/3_tcp/tcp_interview.html](https://www.xiaolincoding.com/network/3_tcp/tcp_interview.html)
