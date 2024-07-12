---
title: chunk 的动画效果原理及实现方式
tag:
  - tools
  - hlchunk
date: 2024-06-15
---

## chunk 动画工作原理

chunk 的动画效果自从 2023 年 12 月就已经有想法了，但是当时对 Neovim 提供的异步 API 还不是很了解，而且校内的事情也急着处理，一直拖到了今年五月，现在业已实现，而且稳定运行了一个月没有爆出 issue，这里记录一下实现过程。

### TUI 动画怎样形成的

我们实际上看到的是一帧一帧的画面，只要每秒钟运行的频率够高，就可以形成动画的效果，而在 TUI 中实现动画有两种方式，我们首先假设一个 chunk 的距离为 `d` 格

1. 每秒钟固定运行 `x` 帧，因此每帧动画需要变化 `d/x` 格，这个计算出来的结果可能是一个分数，而 TUI 中是离散的格子数，不可能出现小数，而如果强行使用向上取整，向下取整，四舍五入等策略，会导致动画出现不连贯和速率不一致的情况，因此不做考虑。
2. 设定一个固定运行时长 `T`，每个格子渲染时刻之间间隔 `t` 秒，以匀速动画为例，这里的 `t` 就是 `T/d`，这里不使用 `d-1` 主要是为了方便程序计算。因为我们可以精确的控制每次渲染间隔的时长，因此选择这种方案。

### 异步动画？

用户在使用 chunk 的时候，首先需要移动光标到一个位置，然后经过一段时间（`delay` 选项，为了避免无谓计算），chunk 才会渲染，渲染的同时用户还可能进行其他的操作（比如移动光标），我们不希望动画阻塞用户（没有人愿意为了 `200ms` 的动画而放弃工作），因此需要考虑一种异步机制来运行动画，并且可以提供中断任务的 API。

### 动画任务的抽象实现

综上所述，我们希望实现一个类，我们初始化的时候告诉他

1. 动画中中的每一步需要做的事情
2. 动画运行总时长
3. 动画运行总步数
4. 动画运行策略（匀速动画或是变速动画）

因此伪代码如下

```Lua
class LoopTask(fn, strategy, duration, ...args)
```

我们分别介绍一下里面的参数

1. `fn` 表示的是每次循环需要被调用的函数，这个函数通常用来执行渲染的操作，比如在 `chunk` 模块中我们就会传入

   ```lua
   function(vt, row, vt_win_col)
       row_opts.virt_text = { { vt, text_hl } }
       row_opts.virt_text_win_col = vt_win_col
       if api.nvim_buf_is_valid(range.bufnr) and api.nvim_buf_line_count(range.bufnr) > row then
           api.nvim_buf_set_extmark(range.bufnr, self.meta.ns_id, row, 0, row_opts)
       end
   end
   ```

   在这里我们构造了传入 `nvim_buf_set_extmark` 的参数，并且判断了渲染的时机（如果某个字符下方有用户的代码，就不进行渲染，以避免覆盖）

2. `strategy` 代表动画的策略，比如线性动画，或者缓动动画等。这个是一个新的概念，但如果你学习过 CSS 中的 `transition` 属性，就不会感觉陌生。以线性动画为例，首先我们有一个固定的动画时长 `duration`，同时还有运行的步数 `x`，因此可以生成一个长度为 `x` 的时间序列数组 `time_intervals`，其中每个值都是 `duration/x`。同理，如果我们希望动画先慢后快，那么这个时间序列就是一个递减的序列，但他们的总和还是 `duration`。

3. `duration` 就是我们刚才提到的动画持续时间，在 `chunk` 中我将其默认设置为 `200ms`（因为 `chunk` 还承担了提示 `textobject` 的功能，太慢会让用户困惑）。

4. `args` 是一个变长参数，这些变长参数会经过处理后传入上面提到的 `fn`，我们用一个例子讲解一下

   ```lua
   self.meta.task = LoopTask(function(vt, row, vt_win_col) end,
       "linear", self.conf.duration, virt_text_list, row_list, virt_text_win_col_list)
   ```

   这里的 `virt_text_list, row_list, virt_text_win_col_list` 就是这次调用中的 `args`，他们的长度相同，`virt_text_list` 表示的是即将渲染的字符列表，同理 `row_list` 和 `virt_text_win_col_list`。我们会将这个变长参数转置处理，然后迭代的将参数喂给 `fn`。

   假设我们想渲染两个字符，那么 `args` 参数为 `[['a', 'b'], [1, 2], [0, 0]]`，表示 `a` 字符将会渲染在一行零列，`b` 字符渲染在二行零列，转置后变成 `[['a', 1, 0], ['b', 2, 0]]`，然后在 `fn` 被调用时分别传入 `['a', 1, 0]` 和 `['b', 2, 0]`。最终实现动画效果。

### 动画任务的具体实现

我们的类需要如下一些内部字段：

- `timer`：用于动画计时
- `progress`：用于记录动画的进度，这里使用运行的步数作为进度

```lua
local LoopTask = class(function(self, fn, strategy, duration, ...)
    self.data = transpose({ ... })
    self.timer = nil
    self.fn = fn
    self.strategy = strategy
    self.time_intervals = createStrategy(strategy, duration, #self.data)
    self.progress = 1
end)

function LoopTask:start()
    local f
    f = function()
        self.fn(unpack(self.data[self.progress]))
        self.progress = self.progress + 1
        if self.progress > #self.time_intervals then
            self.timer:stop()
            self.timer = nil
            return
        else
            self.timer = setTimeout(f, self.time_intervals[self.progress])
        end
    end
    self.timer = setTimeout(f, self.time_intervals[self.progress])
end

function LoopTask:stop()
    self.timer:stop()
end
```

这里构造函数在调用的时候有一个 `transpose` 函数，用来参数转置，实现方法如下：

```lua
local function transpose(matrix)
    local res = {}
    for i = 1, #matrix[1] do
        res[i] = {}
        for j = 1, #matrix do
            res[i][j] = matrix[j][i]
        end
    end
    return res
end
```
