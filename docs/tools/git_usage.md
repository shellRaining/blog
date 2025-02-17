---
title: git 特定场景使用实例
tag:
  - tech_blog
date: 2024-09-02
---

## 撤销某次合并提交

```plaintext
*   c935c9f (HEAD -> main, origin/main, origin/HEAD) Merge branch 'katspaugh:main' into main
|\
| * 4567c99 Optimized Method for Calculating Overlap Size in Spectrogram Resampling (#3848)
* | 1a0cc9d fix: #3707
|/
* 5f32d82 feature: [Minimap] more subscribable events (#3843)
* 4ffab8c 7.8.4
```

我想要将 `c935c9f` 这次合并的代码撤销，并且强制覆盖到远程分支，操作流程如下：

1. 确保在 `main` 分支上，若没有使用 `git checkout main` 来切换
2. 将 HEAD 移动到 `1a0cc9d` 分支上，使用 `git reset --hard 1a0cc9d` 实现
3. 强行覆盖远程分支，使用 `git push -f origin main` 实现

执行完这些命令后，最终结果为：

```plaintext
* 1a0cc9d (HEAD -> main) fix: #3707
* 5f32d82 feature: [Minimap] more subscribable events (#3843)
* 4ffab8c 7.8.4
```

> [!note]
>
> reset 共有三种选项，摘抄自[博客园](https://www.cnblogs.com/qdhxhz/p/18084982)
>
> 1. `git reset --mixed`：此为默认方式，将撤回的代码，存放到工作区。同时会保留本地未提交的内容。
> 2. `git reset --soft`：回退到某个版本 。将撤回的代码，存放到暂存区。同时会保留本地未提交的内容。
> 3. `git reset --hard`：彻底回退到某个版本，丢弃将撤回的代码，本地没有 commit 的修改会被全部擦掉。
>
> 这里使用的是 `reset --hard`，是因为我们不需要留存前面提交的内容，

## 分支重命名

本地重命名只需要执行 `git branch -m new-branch-name` 即可，其中 m 的意思表示 move，和系统的 mv 指令很类似

如果想要同时更改远程分支的名称，还需要额外的步骤

1. 先删除原来的分支 `git push origin --delete old-branch-name`
2. 推送新的分支 `git push origin -u new-branch-name`

这里的 `-u` 选项是 `--set-upstream`，用来设置设置本地分支跟踪的远程分支，相当于确定了一个对应关系

## 切换到远程分支

有时候想要切换到远程的分支，并且在本地创建同名分支来跟踪该远程分支，可以输入以下命令

- `git checkout --track origin/branch-name`：这个命令会自动创建一个与远程分支同名的本地分支，并设置好跟踪关系
- `git switch branch-name`：如果远程分支存在而本地不存在，Git 会自动创建并跟踪远程分支
- `git checkout -b branch-name origin/branch-name`：这个命令会创建一个新的本地分支，并让它跟踪远程分支

## 对比两个提交之间的差异

有时候为了完成一个大任务，会分很多次进行提交，比如：

```plaintext
* 39e955e (HEAD -> fast-spectrogram) feat: add fast spectrogram plugin
* 9360e00 deps: add glob as dev dpes
* 1a0cc9d (origin/main, main) fix: #3707
```

如果想要比对 `39e955e` 和 `1a0cc9d` 之间的变动，可以执行 `git diff 1a0cc9d 39e955e`

如果想要更详细的输出，可以添加一些选项：

1. 如果只想看文件名的变化，而不是具体内容：

   ```plaintext
   git diff --name-only 1a0cc9d 39e955e
   ```

2. 如果你想看统计信息（比如增加/删除了多少行）：

   ```plaintext
   git diff --stat 1a0cc9d 39e955e
   ```

3. 如果你想在图形界面中查看差异（如果你安装了图形化diff工具）：

   ```plaintext
   git difftool 1a0cc9d 39e955e
   ```

提交 ID 的顺序很重要。第一个 ID 是"从"，第二个是"到"。如果你交换它们的位置，会看到相反的变化

> [!tip]
>
> 如果想要使用 neovim 作为 difftool
>
> 1. 设置 Git 的默认 diff 工具为 nvimdiff：
>
>    ```plaintext
>    git config --global diff.tool nvimdiff
>    ```
>
> 2. 设置 Git 使用 nvimdiff 作为合并工具：
>
>    ```plaintext
>    git config --global merge.tool nvimdiff
>    ```
>
> 3. （可选）如果希望 Git 直接启动 diff 工具而不询问，可以设置：
>
>    ```plaintext
>    git config --global difftool.prompt false
>    ```
>
> 4. （可选）如果想要在使用 `git diff` 时自动调用 difftool，可以设置：
>
>    ```plaintext
>    git config --global alias.d difftool
>    ```
>
>    这样，你就可以使用 `git d` 来调用 nvimdiff 了。

## 提交记录压缩

有时候提交记录太多了（比如几千条提交记录），会导致 `.git` 目录过大，每次克隆都会花费比较长的时间，同时这些提交记录我们很多都用不上，因此希望可以进行压缩，可以通过下面的方法。

1. 确保工作区没有文件，为接下来的变基做准备
2. 假设我们希望将 `f7e70c8` 到 `HEAD` 的提交合并为一个提交，可以执行 `git rebase -i f7e70c8^` 命令，找到 `f7e70c8` 之前的一个提交，从这里开始变基操作，将除了 `f7e70c8` 的所有提交打上 squash 的命令，这可以很容易的通过 neovim 来实现
3. 关闭编辑器后会再次打开另一个编辑器，在这里为合并后的提交更新提交记录
4. 强行 push 到远程 `git push --force origin main`
5. 运行垃圾回收 `git gc --aggressive`
6. 删除不再需要的远程跟踪分支 `git remote prune origin`

## 将工作区内容补充到历史 commit 中

```bash
* 86103c1 (HEAD -> refactor) e
* 407bf74 refactor: d
* 27b40b4 style: c
* ...
```

目前工作区中有一些未提交的文件，它的工作内容与 `407bf74` 这个提交相同，我想将他们提交到 `407bf74` 这个提交中，可以通过以下流程解决

1. 暂存（add）当前工作区并存储（stash）其中的内容 `git add . && git stash`
2. 使用交互式变基到 `407bf74` 之前的一个提交，`git rebase -i 407bf74^`
3. 应用之前的储存并暂存 `git stash pop && git add .`
4. 提交到 `407bf74` 中，`git commit --amend --no-edit`
5. 结束变基过程 `git rebase --continue`

> [!tip]
>
> `git commit --amend --no-edit` 里面有一个 `--no-edit` 选项，可以让我们不必打开编辑器修改提交记录，直接使用原有的提交记录

## 工作区忽略特定文件

有时候我们想要更改一些文件，但不希望这些文件一直处于工作区，导致我们无法执行一些可能会清理工作区的指令，可以使用 Git 的 `assume-unchanged` 功能来解决

```bash
git update-index --assume-unchanged 文件名
```

现在，Git 会忽略这个文件的本地更改，它不会出现在 `git status` 中。也不会被意外提交。 如果将来需要提交这个文件的更改，可以使用以下命令取消这个设置：

```bash
git update-index --no-assume-unchanged 文件名
```

如果想查看哪些文件被设置为 `assume-unchanged`，可以使用：

```bash
git ls-files -v | grep '^h'
```

## 时间旅行

有时候很想要在一个分支的不同时间段进行时间旅行，来查看代码的工作状态，但是仅凭借 checkout 命令还是感觉力不从心，可以考虑使用 reflog 来进行从老分支到新分支的履行。

但这也许意味着我们必须先从最新的分支跳转到一个最近的可能的分支，然后慢慢的向老分支跳转，直到找到想要的分支后使用 reflog 重新跳回

## 大文件存储

我在给我的博客添加落霞孤鹜字体时，需要加入一个大小为 20MB 左右的 ttf 文件，但 git 对大文件管理并不是很友好，因此考虑引入 git lfs

1. 首先是下载 git-lfs 工具
2. 然后再我们的博客仓库根目录初始化 git lfs
3. 指定需要用 git lfs 管理的文件类型
4. 这时候可以看到多了一个 `.gitattributes` 文件，我们追踪并提交它和要上传的大文件即可

```bash
brew install git-lfs
git lfs install
git lfs track "*.ttf"
git add .
git commit -m "配置 Git LFS 追踪字体文件"
```

上面提到的是上传的步骤，如果要在其他设备克隆这个大文件，也需要一些额外的操作（初始化和单独拉取大文件）

```bash
git lfs install
git lfs pull
```

## 忽略目录下某些未跟踪的文件

比方说我写博客的时候，经常有一些比较隐私的文章不想上传，同时又不希望使用 `.gitignore` 来手动忽略，可以使用 `.git/info/exclude` 文件来实现，他的语法和 `.gitignore` 是一样的

如果这个文件已经跟踪，同时经常有一些不必要（或者不可避免触发）的文件更改，可以使用 `git update-index --skip-worktree filename` 来忽略这个文件的更改，他会完全忽略这个文件，并且其他人的改动也不会被合并或者更新。如果要取消这个设置，可以使用 `git update-index --no-skip-worktree filename`

如果希望自己本地的改动不被合并，但是其他人的改动可以被合并，可以使用 `git update-index --assume-unchanged filename` 来实现，如果要取消这个设置，可以使用 `git update-index --no-assume-unchanged filename`

