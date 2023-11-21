---
title: mac 系统按键重复速率加快
tag:
  - essay
date: 2024-06-13
---

本文信息来源于 [https://zihengcat.github.io/2020/07/10/increase-keyboard-repeat-rate-on-macos/](https://zihengcat.github.io/2020/07/10/increase-keyboard-repeat-rate-on-macos/)，仅作收集参考用。

## 命令强写

使用 setting 中的 UI 来更改速率是有极限的。我们可以在终端输入如下命令

```bash
defaults write -g KeyRepeat -int 1
```

`KeyRepeat`：字符连续输入间隔，此处为 `1`（15ms），系统默认最低值 `2`（30ms）。

当然还可以减少等待时间，使用如下命令

```bash
defaults write -g InitialKeyRepeat -int 10
```

`InitialKeyRepeat`：响应连续输入的等待时间，此处为 `10`（150ms），系统默认最低值 `15`（225ms）。
