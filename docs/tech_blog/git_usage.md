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

我想要将 `c935c9f` 这次合并的代码撤销，并且强制覆盖到远程分支，操作流程如下

1. 确保在 `main` 分支上，若没有使用 `git checkout main` 来切换
2. 将 HEAD 移动到 `1a0cc9d` 分支上，使用 `git reset --hard 1a0cc9d` 实现
3. 强行覆盖远程分支，使用 `git push -f origin main` 实现

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
