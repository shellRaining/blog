---
title: neovim devtools 插件开发记录
tag:
  - neovim
  - devtools
date: 2025-01-30
---

## 动机

在开发 neovim 插件的时候，不可避免的要调试 Lua 代码，我们通常通过 `vim.notify` 或者 `vim.print` 打印关键信息，这样可以解决问题，但有些情况下并不是很好用，比如

1. 在打印 Lua 表时会显得比较局促，查看也很麻烦，经常要使用 `:messages` 命令查看所有的输出
2. 如果使用 `nvim-notify` 或者 `noice.nvim` 来解决第一个问题，在对窗口相关的 bug 进行修复时，经常会因为他们的悬浮窗口导致输出大量的不必要的信息；除此之外，这些展示信息的悬浮窗口一般停留时间有限，有时候还没看完 log 信息就消失了

最开始我的解决方案是通过常驻一个侧边窗口，就像是浏览器的开发者工具一样，将上述的函数劫持，把内容重定向到这个侧边窗口中，最初确实满足了我的需求，但是在学习 `vim.api.nvim_set_decoration_provider` 这个 API 时，我发现了大麻烦，neovim 内所有的有关渲染的东西全部会触发里面的回调函数，导致上面提到的第二个问题再次出现了！

因此，我希望能够有一个更好的解决方案，能够在开发插件时更加方便的调试代码。

## 设计

### log 部分

既然 neovim 内部渲染不可避免的会触发 `vim.api.nvim_set_decoration_provider` 的回调函数，那么我们就不能在 neovim 内部进行渲染，可以考虑通过写入 log 文件来解决这个问题

这个插件功能很简单，实现也不复杂，核心功能可能五六十行就能解决，大致思路如下

1. 设置一个全局的 log 文件 handler
2. 初始化插件时，设置好用户的配置选项，劫持上述函数，替换为可以重定向的函数
3. 收到开始 log 指令时，检测是否初始化 file handler，如果没有则初始化
4. 当用户设置的 `vim.notify` 等函数被调用时，调用替换后的函数，将信息写入到 log 文件中

完整的代码可以在 [这里](https://github.com/shellRaining/devtools.nvim) 查看

### CI 部分

这个项目还使用了 Github Actions 来进行 CI，主要是为了检测代码风格，以及编译 README 为 vimdoc，还有进行代码测试

在编译 vimdoc 时，使用到了一个编写好的 action: `stefanzweifel/git-auto-commit-action@v4`，但是在 push 后报错

```bash
remote: Permission to shellRaining/devtools.nvim.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/shellRaining/devtools.nvim/': The requested URL returned error: 403
Error: Invalid status code: 128
    at ChildProcess.<anonymous> (/home/runner/work/_actions/stefanzweifel/git-auto-commit-action/v4/index.js:17:19)
    at ChildProcess.emit (node:events:519:28)
    at maybeClose (node:internal/child_process:1105:16)
    at ChildProcess._handle.onexit (node:internal/child_process:305:5) {
  code: 128
}
```

这是因为仓库并没有将 GitHub action Workflow permissions 的权限设置为 `read and write`，解决方法是在仓库的 `Settings` -> `Actions` -> `General` -> `Workflow permissions` 中设置权限为 `read and write`

使用到的 action 的链接如下：

1. [stefanzweifel/git-auto-commit-action](https://github.com/stefanzweifel/git-auto-commit-action)
2. [kdheepak/panvimdoc](https://github.com/kdheepak/panvimdoc)

更多配置信息可以看里面的 README

## 工作流

1. 在插件中调用 `vim.notify` 或者 `vim.print` 函数
2. 通过 `devtools.nvim` 插件监听到这些输出，将其写入到 log 文件中
3. 通过 `lnav` 或者 `tail -f` 命令查看 log 文件
