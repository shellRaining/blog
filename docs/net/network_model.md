---
title: 计算机网络模型
tag:
  - net
  - interview_question
date: 2024-03-26
---

## 模型分类

计算机网络模型分为两种：

- OSI 模型
- TCP/IP 模型

其中 OSI 模型是一个理论模型，而 TCP/IP 模型是一个实际应用模型。

OSI 模型分为 7 层，从上到下依次为：

1. 应用层
2. 表示层
3. 会话层
4. 传输层
5. 网络层
6. 数据链路层
7. 物理层

而 TCP/IP 模型分为 5 层，其中将 OSI 模型的前三层合并为了一个应用层，我们这里只讲一下 OSI 模型

## 应用层

这一层数据传输基本单位为报文（message）；

包含的主要协议：FTP（文件传送协议）、Telnet（远程登录协议）、DNS（域名解析协议）、SMTP（邮件传送协议），POP3 协议（邮局协议），HTTP 协议（Hyper Text Transfer Protocol）

## 表示层

这里最出名的协议是加密协议 SSL（Secure Sockets Layer）和 TLS（Transport Layer Security），HTTPS 就是基于这两个协议的，更多请看 [HTTPS](../net/HTTPS.md)

这里将应用处理的信息转换为适合网络传输的格式（可能是因为网络传送的数据格式和应用处理的数据格式不一样）

## 会话层

这一层主要负责建立、管理和终止会话连接，以及数据的同步

## 传输层

这里传送数据的基本单位是报文段（segment）；

主要是为了将应用层送来的报文进行分段，并且保证这些分段能够按照顺序到达目的地，指定一个目的地需要一些信息，比如 TCP 协议需要 IP 地址和端口号。

包含的主要协议：TCP 协议（Transmission Control Protocol，传输控制协议）、UDP 协议（User Datagram Protocol，用户数据报协议）；

## 网络层

这里传送数据的基本单位是数据包（packet）；

网络层将数据从发送端的主机发送到接收端的主机，两台主机间可能会存在很多数据链路，但网络层就是负责找出一条相对顺畅的通路将数据传递过去。传输的地址使用的是IP地址。IP地址和我们的住址有点相似，我们的住址可以从省到市再到街逐步缩小范围，直至我们住址。IP地址也有这样的能力，通过不断转发到更近的IP地址，最终可以到达目标地址

包含的协议有 IP 协议（Internet Protocol，网际协议）、ICMP 协议（Internet Control Message Protocol，网际控制报文协议）、ARP 协议（Address Resolution Protocol，地址解析协议）、RARP 协议（Reverse Address Resolution Protocol，逆地址解析协议）

这里经常出现的设备有路由器

## 数据链路层

这里传送数据的基本单位是帧（frame）；

数据链路层的主要作用是将网络层传下来的 IP 数据包封装成帧，然后通过物理层进行传输。这里的帧是数据链路层的传输单位，而帧中包含了数据和控制信息，比如 MAC 地址等。

注意这里通信双方是物理上相连的两个设备，并不是直接发送到目的地，这里常见的协议有以太网协议、PPP 协议（Point to Point Protocol，点对点协议）

这里封装的帧是头尾都会有一些控制信息，比如帧的开始和结束，以及校验信息等

## 参考

- [https://zhuanlan.zhihu.com/p/347995226](https://zhuanlan.zhihu.com/p/347995226)
- [https://juejin.cn/post/6844903505111547918#heading-1](https://juejin.cn/post/6844903505111547918#heading-1)
