---
title: MacOS 下的点文件管理
tag:
  - tech_blog
date: 2024-08-23
---

## Dotfiles 简单理解

顾名思义，点文件就是以点为文件名开头的文件，他们在 MacOS 中（同 Linux）表示隐藏的文件，一般是用来作为工具的配置文件

这类工具放置的位置大致有三种（我目前遇到的）

1. 放在项目的根目录下：比如前端常用的格式化工具 `prettier` 的配置文件就是 `.prettierrc.json`
2. 放在家目录下：比如 MacOS 的默认 shell，`zsh`，他的的配置文件是 `~/.zshrc`
3. 放在 `$XDG_CONFIG_HOME` 下：这个环境变量定义了应存储用户特定的配置文件的基准目录，默认值是 `$HOME/.config`（摘抄自 [https://winddoing.github.io/post/ef694e1f.html](https://winddoing.github.io/post/ef694e1f.html)）。比如编辑器 `neovim` 的配置文件就是放置在 `~/.config/nvim/init.lua` 下

我见过的点文件第三种居多。第一种一般是和代码工程有关（毕竟每个项目的需求不同），第二种也有，但一般情况下他们提供了多种放置位置的可能性，比如 `tmux` 既可以选择第二种，也可以选择第三种。第三种是我最喜欢的，点文件整整齐齐的放在 `.config` 目录下，是一件赏心悦目的事情，下面是我的部分 dotfiles

<img src="https://2f0f3db.webp.li/2024/08/my_dotfiles.png" alt="my dotfiles" style="zoom:50%;" />

除了放置整齐外，统一放在 `$XDG_CONFIG_HOME` 还使得管理这些配置文件变得简单，使得我们在迁移到一个新机器的时候可以快速重新配置环境，这也是我下面着重讲的内容。

## 如何进行 dotfiles 的管理

上述的点文件实质上是一些文本文件，因此使用 Git 来进行管理是合适的不得了，占用少（存疑），能查看历史记录，还能上传到 GitHub，为多台机器进行同步提供了方便，如果还是不太了解，可以看[我翻译的一篇文章](https://zhuanlan.zhihu.com/p/562310656)，不过仅供参考，现在我已经放弃使用 dotbot 进行管理了……

> [!warning]
>
> 上传到 GitHub 意味着你的配置文件会公之于众，请慎之又慎，即使你的仓库是私有的，对于重要的数据一定要保证不上传，上传前一定要注意脱敏，如果有不得不上传的理由，也一定要使用 `git-crypt` 等类似工具进行加密
>
> 之前还是小白的时候误上传了 clash 的信息，导致当月流量爆掉……

## 迁移时候的大致步骤

### 包管理器

MacOS 上可以通过 brew 来轻松地管理下载的软件，除了一些命令行工具之外，例如微信，钉钉都是可以通过 brew 来下载的（不过我不太清楚他们的安全性），因此拿到一台新电脑，你做的第一步是下载 brew（或许真正的第一步是下载 clash）

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

因为我主要搞前端开发，所以很多时候要用到多个 node 版本，因此还会下载 `nvm` 来管理这一套

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash # 下载 nvm
nvm install node # 使用刚才的 nvm 下载最新的稳定的 node 版本
nvm alias default node # 用来设置默认的 node 版本，截止到写文章时 node 大版本是 22
```

### 增强 shell 功能

因为使用的是 zsh，所以选用 `ohmyzsh` 来傻瓜式操作

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
git clone https://github.com/djui/alias-tips ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/alias-tips
```

第一条命令是下载 `ohmyzsh`，第二条是下载他的插件，我只用了 `zsh-autosuggestions` 和 `alias-tips` 这两个，前者用来记忆历史命令，后者是用来增强 alias 的使用体验（雾）

### 克隆 dotfiles

从 GitHub 克隆你的 dotfiles，然后运行一个脚本（后续会提到如何写这个脚本），一键设置各种 dotfiles 的软链接。除此之外，还需要安装其他必备的命令行工具，比如 `fzf` 等，后续会提到。

总而言之，做完这一步基本上就大功告成

### MacOS 自身设置

剩下的这个是比较个性化的操作，因为我个人感觉 MacOS 的按键重复速率太慢了，并且 dock 栏默认不隐藏，实在难受，所以会写一个脚本用来处理这些事情

```bash
#!/bin/bash

# 设置初始键重复延迟
# 这个值范围通常是 15 (最快) 到 120 (最慢)
# 你当前的设置是 15，这已经是最快的
defaults write -g InitialKeyRepeat -int 15

# 设置按键重复速率
# 这个值范围通常是 1 (最快) 到 120 (最慢)
# 你当前的设置是 1，这已经是最快的
defaults write -g KeyRepeat -int 1

# 设置滚动条只在滚动时显示
defaults write NSGlobalDomain AppleShowScrollBars -string "WhenScrolling"

# 自动隐藏 Dock
defaults write com.apple.dock autohide -bool true

echo "Keyboard repeat settings updated. You may need to log out and back in for changes to take effect."
```

我不担保这些命令都会成功，请谨慎操作

## dotfiles 书写

我们自己的 dotfiles 结构和上面的结构大致差不多，当然你也可以个性化一点，只要脚本能够保证软链接成功即可

<img src="https://2f0f3db.webp.li/2024/08/dotfiles_structure.png" style="zoom:50%;" />

各个工具的配置不赘述，可以看到多了几个飘红的脚本文件，这些就是用来管理的核心

### `install.sh`

这个脚本主要做配置目录的创建，软链接的设置和清理等，给一个 AI 写的例子：

```bash
#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 创建目录函数
create_dir() {
  if [ ! -d "$1" ]; then
    mkdir -p "$1"
    echo -e "${GREEN}Created directory: $1${NC}"
  fi
}

# 创建符号链接函数
create_symlink() {
  if [ -e "$2" ]; then
    if [ -L "$2" ]; then
      ln -sf "$1" "$2"
      echo -e "${GREEN}Relinked: $2 -> $1${NC}"
    else
      echo -e "${RED}Error: $2 already exists and is not a symlink${NC}"
    fi
  else
    ln -s "$1" "$2"
    echo -e "${GREEN}Linked: $2 -> $1${NC}"
  fi
}

# 清理函数
clean_symlinks() {
  for link in "$@"; do
    if [ -L "$link" ] && [ ! -e "$(readlink "$link")" ]; then
      rm "$link"
      echo -e "${GREEN}Removed broken symlink: $link${NC}"
    fi
  done
}

# 主目录
HOME_DIR="$HOME"

# 清理旧的符号链接
clean_symlinks "$HOME_DIR" "$HOME_DIR/.config"

# 创建必要的目录
create_dir "$HOME_DIR/.config"

# 创建符号链接
create_symlink "$(pwd)/tmux" "$HOME_DIR/.config/tmux"
create_symlink "$(pwd)/nvim" "$HOME_DIR/.config/nvim"
create_symlink "$(pwd)/zshrc" "$HOME_DIR/.zshrc"
create_symlink "$(pwd)/alacritty" "$HOME_DIR/.config/alacritty"
create_symlink "$(pwd)/git" "$HOME_DIR/.config/git"
create_symlink "$(pwd)/wezterm" "$HOME_DIR/.config/wezterm"
create_symlink "$(pwd)/lazygit" "$HOME_DIR/.config/lazygit"
create_symlink "$(pwd)/neovide" "$HOME_DIR/.config/neovide"

echo -e "${GREEN}Dotfiles setup complete!${NC}"
```

意思大差不差，如果有需要更改的，可以再去问 AI，这种杂活交给他们再合适不过了

### `brewInstall.sh`

brew 提供了内置的功能来导出所有已下载的包，输入 `brew dump` 即可生成一个 `Brewfile`，然后输入 `brew bundle` 即可按照这个导出的文件来安装所有的包。因此又可以让 AI 生成一个脚本

```bash
#!/bin/bash

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函数：安装 Brewfile 中的所有包
install_all() {
  echo -e "${GREEN}开始安装 Brewfile 中的所有包...${NC}"
  brew bundle
  echo -e "${GREEN}所有包安装完成${NC}"
}

# 函数：更新所有包
update_all() {
  echo -e "${GREEN}开始更新所有包...${NC}"
  brew update
  brew upgrade
  brew upgrade --cask
  echo -e "${GREEN}所有包更新完成${NC}"
}

# 函数：清理旧版本和缓存
cleanup() {
  echo -e "${GREEN}开始清理...${NC}"
  brew cleanup
  echo -e "${GREEN}清理完成${NC}"
}

# 函数：显示当前安装的包列表
show_installed() {
  echo -e "${YELLOW}当前安装的 Homebrew 包：${NC}"
  brew list
  echo -e "${YELLOW}当前安装的 Cask 包：${NC}"
  brew list --cask
}

# 函数：检查 Brewfile 是否最新
check_brewfile() {
  echo -e "${GREEN}检查 Brewfile 是否最新...${NC}"
  brew bundle check
  echo -e "${GREEN}检查完成${NC}"
}

# 函数：更新 Brewfile
update_brewfile() {
  echo -e "${GREEN}更新 Brewfile...${NC}"
  brew bundle dump --force
  echo -e "${GREEN}Brewfile 已更新${NC}"
}

# 主菜单
main_menu() {
  echo -e "${GREEN}Homebrew 包管理脚本${NC}"
  echo "1. 安装 Brewfile 中的所有包"
  echo "2. 更新所有包"
  echo "3. 清理旧版本和缓存"
  echo "4. 显示当前安装的包列表"
  echo "5. 检查 Brewfile 是否最新"
  echo "6. 更新 Brewfile"
  echo "7. 退出"
  read -p "请选择操作 (1-7): " choice

  case $choice in
  1) install_all ;;
  2) update_all ;;
  3) cleanup ;;
  4) show_installed ;;
  5) check_brewfile ;;
  6) update_brewfile ;;
  7) exit 0 ;;
  *) echo "无效选择，请重试" ;;
  esac
}

# 主循环
while true; do
  main_menu
  echo
done
```

我现在就在用这个脚本，暂时还没出什么岔子

### `macos_settings.sh`

这个内容实际上就是上一章节的几条命令，加上只是为了凑数……

## 总结

如果你喜欢让电脑内部井井有条，也许这个文章会有一些帮助，没有看懂也没有关系，可以多问问 AI，这方面资料也算比较齐全

附赠我感觉很好用的一些命令行工具（从 `Brewfile` 摘取）

```ruby
tap "homebrew/bundle"
tap "homebrew/services"
tap "oven-sh/bun"
brew "bat"
brew "cmus"
brew "coreutils"
brew "deno"
brew "fd"
brew "fzf"
brew "gnu-sed"
brew "lua"
brew "highlight"
brew "jq"
brew "lazygit"
brew "lsd"
brew "luarocks"
brew "markdownlint-cli"
brew "ncdu"
brew "neovim"
brew "neovide"
brew "pnpm"
brew "prettier"
brew "ripgrep"
brew "tmux"
brew "tree"
brew "unzip"
brew "wget"
brew "yarn"
brew "yazi"
brew "zoxide"
brew "oven-sh/bun/bun"
cask "alacritty"
cask "font-jetbrains-mono-nerd-font"
cask "font-victor-mono-nerd-font"
cask "wezterm"
```
