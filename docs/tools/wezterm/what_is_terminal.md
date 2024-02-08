---
title: 什么是终端
tag:
  - wezterm
  - tools
date: 2024-02-08
openCategory: false
---

Wezterm 是一个终端模拟器，但实际上它是什么，什么是 PTY，什么是 shell？本节的文档旨在总结这些概念之间的关系，以帮助澄清事物的工作原理。

这个部分试图将概念分组在一起，以帮助理解；它并不打算是终端发展的历史准确年表！

## 终端 (Terminal)

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/DEC_VT100_terminal.jpg/1200px-DEC_VT100_terminal.jpg">

终端是一个可以用于输入数据（输入）和从计算机系统中呈现数据（输出）的设备。

早期的终端是非常有限的设备，只能进行基本的键盘数据输入，并将输出打印到纸上。这些设备使用简单的串行数据连接与计算机系统通信。

这种早期的传统在现代操作系统中对终端的集成方式产生了很大影响。

在 Unix 操作系统中，内核有一个子系统用于管理 *终端 TeletYpes* (TTYs)，它本质上是一组输入数据流、一组输出数据流，以及一些流控和信号/中断管理。TTY 通常与安装在系统中的物理串行通信设备强相关。

内核不知道连接设备的任何细节，因为它没有定义的方式来做到这一点；它只知道如何在串行线上传输数据。

为了适应这一点，内核中的 TTY 接口允许进行一些基本的流操作，例如行缓冲和将 Unix 换行符规范化为回车换行，这是打印机样式输出所需的，以便正确地移动到第一列并换行。

## Shell

终端和 TTY 接口本质上是用于在计算机系统中移动字节的低级硬件规范。它们本身并不提供连接计算机系统的任何预定义功能。要使它们做一些事情，需要一个程序来解释输入并产生一些输出。

这个程序就是 shell，例如 [zsh](https://www.zsh.org/) 或者 [bash](https://www.gnu.org/software/bash/)。shell 给用户提供了一种交互式的方式来在计算机系统中进行导航并启动其他的程序。

shell 间接地通过 TTY 接口与终端通信，后者通过内核管理实际的终端通信。

<img width='600' src='https://raw.githubusercontent.com/shellRaining/img/main/2402/shell.png'>

## ANSI 和 ECMA-48

你可能已经听说过终端上的 *ANSI 转义序列*，它是什么？

终端设备通常使用 [ASCII](https://en.wikipedia.org/wiki/ASCII) 来表示英文文本，然后使用一系列特殊的字节序列来控制诸如粗体文本之类的东西。不同的供应商可能为相同的概念选择了不同的字节序列。

[ANSI](https://www.ansi.org/) 是美国国家标准协会，是一个致力于制定标准以使跨不同实现更容易的组织。

ANSI 的一个产品是 `X3.64`，旨在取代终端和相关计算机设备中的特定供应商代码。

你可以在 [ANSI 转义序列](https://en.wikipedia.org/wiki/ANSI_escape_code)中了解到更多

阅读 ANSI 规范本身并不是免费的，但是同样的规范也被 ECMA（欧洲计算机制造商协会）作为免费的 [ECMA-48](https://www.ecma-international.org/publications-and-standards/standards/ecma-48/) 发布。

## Terminfo 和 termcap

即使 ANSI/ECMA 提供了有关标准化通信的信息，仍然有一些设备要么早于标准，要么不完全符合标准，要么比标准预见的更灵活。

创建了一个终端功能数据库（termcap），它基本上是将某种功能（例如：“切换到粗体渲染”）映射到需要发送到终端的相关字节集，以触发该功能。

后来，随着功能集的扩展，terminfo作为termcap的继任者被开发出来，它更具可扩展性。

这些数据库被应用程序使用，这些应用程序使用诸如 [curses](https://en.wikipedia.org/wiki/Curses_%28programming_library%29) 之类的库。

它们的工作方式是系统管理员将 `TERM` 环境变量定义为终端数据库中适当条目的名称，作为配置终端和 shell 的一部分。

然后，shell 中链接的库将使用 `TERM` 环境变量的值来解析终端数据库中的数据，以便生成适当格式的输出。

## 运行其他程序

当 shell 生成一个子进程时，它将与 TTY 关联的输入/输出流传递给它，并允许它运行。shell 不参与传输子程序和 TTY 之间的数据；该程序直接将数据发送到 TTY 接口，然后内核将其发送到连接的硬件。

这意味着任何想要在关联的终端上生成格式良好的信息的程序都需要尊重 `TERM` 的设置，并使用适当的库来解析正确的转义序列。

<img width='300' src='https://raw.githubusercontent.com/shellRaining/img/main/2402/run_program.png'>

## 什么是 stdin, stdout 和 stderr？

Unix 环境定义了标准输入/输出流，并将它们映射到特定的文件描述符。

shell 程序启动时，`stdin` 被分配为与关联 TTY 的输入流，`stdout` 和 `stderr` 都被分配为输出流。`stderr` 是 `stdout` 流的副本，写入其中的数据将发送到终端输出。

终端只有一个输出数据流。就终端而言，`stdout` 和 `stderr` 不存在，只有“输出”。

## 前台进程

看到上面的图表，你可能会想知道当有多个程序在消费/产生数据时，输入/输出是如何保持清晰的。

没有严格的规定谁可以读/写 TTY 数据流，这在很大程度上是一个合作的过程。通常，一次只有一个程序在主动处理输出，但是通过在许多 shell 程序中使用 `&` 后台运算符同时运行多个程序，很容易产生混乱的消息。

一些 shell 有作业控制概念，允许通知内核哪个进程被认为是活动的；这有助于传递中断信号，但实际上并没有对输出做任何事情。

## 信号 (Signals)

我们经常使用 `CTRL-C` 生成一个中断信号，它是如何工作的？

内核中的 TTY 层通常通过 `stty` 实用程序配置，以解释与 `CTRL-C` 对应的字节序列（`0x03`）作为中断信号。当输入流匹配配置的值时，内核不会传播该字节，而是将其转换为 `SIGINT` 并将该信号传递给与 TTY 关联的前台进程。

shell 通常注册一个 `SIGINT` 处理程序，用于清除当前输入行，但保持运行。当 shell 生成一个子进程时，它会使用默认行为设置 `SIGINT` 处理程序，即终止程序，然后将该子进程设置为前台进程。然后它将进入睡眠状态，等待子进程终止。

随后，当你按下 `CTRL-C` 时，内核将 `SIGINT` 发送给该子前台进程，然后该进程将终止并导致 shell 唤醒并继续。

如果你的 shell 支持作业控制，通常与 `CTRL-Z` 关联的挂起信号将导致前台进程挂起，从而以类似于子进程终止的方式唤醒 shell，但它可以知道它是被挂起而不是被终止。

## 终端仿真器和 PTYs (Terminal Emulators and PTYs)

随着计算机系统变得更加复杂，并演变为具有多个窗口的桌面环境，将终端移动到桌面窗口中变得很有必要，因此需要扩展接口以允许不与物理通信设备强耦合的 TTY，并提供一种机制来通知窗口大小的变化。

*Pseudo Terminal teletYpe* (PTY) 就是 TTY 接口的这种演变；它允许用户空间应用程序根据需要定义额外的虚拟 TTY 接口。

PTY 有一个控制器端和一个客户端端（这些不幸的遗留术语分别是 *master* 和 *slave*），控制器端允许传递有关窗口大小的信息，客户端端本质上只是 I/O 流。

<img width='300' src='https://raw.githubusercontent.com/shellRaining/img/main/2402/pty.png'>

一个 *终端仿真器* 是一个程序，它创建一个 PTY，然后在该 PTY 中生成一个子程序（通常是一个 shell 程序），并将客户端端传递给它。

终端仿真器然后读取客户端端的输出并解释转义序列以产生显示，并从窗口环境中解码键盘/鼠标输入并将其编码为转义序列发送到正在运行的程序（[查看键盘编码](config/key-encoding.md)）。

## Windows 和 ConPTY

到目前为止，我们一直在讨论 UNIX 系统的架构，Windows 如何与此相比/相关？

Windows 一直有经典的 "dosbox" 作为 unix 终端仿真器的类比，但它的工作方式与 unix 方法有根本的不同，这给可移植软件带来了麻烦。

没有 PTY 等效物，终端仿真器被关闭并限制为系统提供的。一些有远见的开发人员能够构建终端仿真器，它们更像 unix 等效物，使用了一些巧妙的技巧，本质上是屏幕抓取，但有许多情况会妨碍完美的体验。

在相对近期的时期，[Windows 增加了对 ConPTY 的支持](https://devblogs.microsoft.com/commandline/windows-command-line-introducing-the-windows-pseudo-console-conpty/)，这极大地为终端仿真器打开了大门。链接的文章详细解释了 ConPTY 的工作原理，所以我只打算在这里总结一下主要的观点：

在 Windows 上运行 ConPTY 时，会生成一个额外的辅助程序（对于 wezterm，该辅助程序通常被命名为 `openconsole.exe`，但在某些情况下可能是 `conhost.exe`）来帮助管理 PTY。

这个辅助进程的目的是将转义序列转换为本机 Windows 等效请求，并将其发送到窗口控制台驱动程序。

因为 Windows 需要与使用传统 Windows 控制台 API 的本机 Windows 程序向后兼容，ConPTY PTY 实现比 unix PTY/TTY 内核层复杂得多，本质上是它自己的终端仿真器坐在用户感知的终端仿真器和内部生成的应用程序之间。

这样做的结果还不错，但仍然有一些边缘情况，ConPTY 层有一些令人惊讶的行为。我期望随着时间的推移，这种情况会有所改善，但对于 wezterm 用户来说，他们可能希望通过使用 `wezterm ssh` 直接与远程系统上的“真实” unix pty 通信，或者在本地运行的 WSL 或 VM 中绕过 ConPTY。
