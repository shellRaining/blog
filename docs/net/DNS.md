---
title: DNS 记录类型
tag:
  - net
date: 2024-04-21
---

## A 记录

`A` 记录是最基本的 DNS 记录类型，它将域名映射到 IPv4 地址。A 记录的格式如下：

```plaintext
example.com. 3600 IN A xxx.xxx.xxx.xxx
```

## AAAA 记录

`AAAA` 记录是将域名映射到 IPv6 地址的记录类型。AAAA 记录的格式如下：

```plaintext
example.com. 3600 IN AAAA xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx
```

## CNAME 记录

`CNAME` 记录是将域名映射到另一个域名的记录类型。CNAME 记录的格式如下：

```plaintext
example.com. 3600 IN CNAME www.example.com.
```

域名可以取别名，以 `webserver.fasionchan.com` 为例，它可以取一个别名，比如：`network.fasionchan.com` 。如此一来，我们称前者是后者的 权威名称 ，`CNAME` 记录则保存权威名称。

更多典型场景可以看 [https://fasionchan.com/network/dns/record-types/](https://fasionchan.com/network/dns/record-types/)

## MX 记录

用来表示邮件服务器的地址，指向一个邮件服务器。MX 记录的格式如下：

```plaintext
example.com. 3600 IN MX 10 mail.example.com.
```

## NS 记录

`NS` 记录用来指定一个域名服务器，它指定了该域名由哪个域名服务器来解析。NS 记录的格式如下：

```plaintext
example.com. 3600 IN NS ns1.example.com.
```

## TXT 记录

`TXT` 记录是用来保存任意文本信息的记录类型。TXT 记录的格式如下：

```plaintext
example.com. 3600 IN TXT "v=spf1 a mx ~all"
```
