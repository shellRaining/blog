---
title: 使用 kap 时候的问题记录
tag:
  - tech_blog
date: 2024-08-26
---

## 打开崩溃

在新的 MacBook m3 安装 kap 后，直接打开后会爆出 `Unhandled Promise Rejection` 这样的问题，经过查询后，找到这样一个 [issue](https://github.com/wulkano/Kap/issues/1193)

按照最下面的老哥的[说法](https://github.com/wulkano/Kap/issues/1193#issuecomment-2003009314)，终端运行 `softwareupdate --install-rosetta --agree-to-license` 就可以解决，亲测可用

从上面执行的命令看来，似乎是需要安装 `rosetta` 来进行转译操作，加上这是一个 electron 应用，说实话本体已经很大了，若不是功能确实全面，很适合轻度的录制，我可能会弃坑……

## 内录声音

我本来想给同学发一个电影片段，但是录制后发现没有声音，查找时发现一篇高质量的[博客](https://sspai.com/post/61420)，这里记录和总结一下

这个是 MacOS 的问题，我们需要安装一个应用（Background Music）来增强 MacOS 的声音功能。在录制屏幕之前，如果有内录的需求，可以在选项中选择 `background music` 作为背景声音，同时注意软件要打开，否则是没有用的，然后就可以调节各个应用的声音大小了

![background-music](https://2f0f3db.webp.li/2024/08/background-music.png)
