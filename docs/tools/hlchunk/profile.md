---
title: hlchunk 性能优化
tag:
  - tools
  - hlchunk
date: 2024-06-07
---

通过使用 `profile.nvim` 来获取插件的性能分析表，所有实验均是在 macOS 上的 alacritty 进行，并且 Neovim 窗口高度为 66 行，代码文件是 `typescript.js` 的首行开始，到五百行结束。使用 [该网站](https://ui.perfetto.dev/) 来进行性能分析。

| version      | `select avg(dur)/1000 from slice where name="hlchunk.mods.indent.render"` | `items` |
| ------------ | ------------------------------------------------------------------------- | ------- |
| `v1.0.0`     | 4513.574804395604                                                         | 455     |
| `v1.0.1`     | 5160.095202173913                                                         | 460     |
| `v1.1.0`     | 3362.5719383259916                                                        | 454     |
| `v1.2.0`     | 3794.7696911764706                                                        | 68      |
| `v1.2.1`     | 2255.649161764706                                                         | 68      |
| `v1.2.2`     | 2033.352515151515                                                         | 66      |
| `v1.3.0`     | 773.4288358208955                                                         | 67      |
| `ibl v3.7.1` | 18111.671533333334                                                        | 60      |

## chunk

### debounce 防抖

由于我们需要跟随光标来渲染 chunk，因此通过 `CursorMoved` 自动命令来触发，但是由于这个自动命令触发过于频繁，搭配大计算量的操作会导致卡顿的现象，同时考虑到用户不需要移动时候的 chunk，只需要最终停留处的范围，故采用 debounce 来进行节流。

```lua
function M.debounce(fn, delay, first)
    ---@type uv_timer_t | nil
    local timer = nil
    local scheduled = false
    first = first or false
    return function(...)
        local args = { ... }
        if first and not scheduled then
            scheduled = true
            fn(...)
        end
        if timer then
            timer:stop()
        end
        timer = M.setTimeout(function()
            scheduled = false
            fn(unpack(args))
        end, delay)
    end
end
```

这里的节流函数有些不一样，因为设置了一个 first 参数来决定是否立即触发，设置该参数的原因在后面。

### lazy 渲染

我们在渲染之前必须要有 chunk 的坐标以及高亮信息，因此可以考虑在这些信息相同的时候不清空高亮命名空间，保留之前的渲染结果。因此涉及到 shallow compare 的操作

```lua
function chunkHelper.shallowCmp(t1, t2)
    if #t1 ~= #t2 then
        return false
    end
    local flag = true
    for i, v in ipairs(t1) do
        if t2[i] ~= v then
            flag = false
            break
        end
    end
    return flag
end
```

但同时会遇到一个边缘情况 [https://github.com/shellRaining/hlchunk.nvim/issues/109](https://github.com/shellRaining/hlchunk.nvim/issues/109)，就是 `nvim_buf_set_lines` 函数会清空高亮标记。具体流程如下，用户首先注释代码，同时 chunk 没有变化，导致懒加载，但由于高亮标记已经被注释时候调用的 `nvim_buf_set_lines` 清除，出现空缺情况。

因此需要重新在 `TextChanged` 自动命令上绑定渲染回调，并且这个回调要避开懒加载，同时是一个同步的，无动画的渲染过程。这就有了上面的 debounce 函数。

## indent

### throttle 节流

渲染 indent 也是一个非常繁琐和耗时的步骤，对于测试文件，平均每次滑动要渲染 60+ 标记，而且不能批处理这一过程（在一个函数中调用），因此节流函数显得就有必要了，这里不使用防抖函数主要是出于用户体验考虑，因为快速翻页时候我们也会有查看缩进的需求。实现代码如下

```lua
function M.throttle(fn, interval)
    local timer = nil
    return function(...)
        local args = { ... }
        if timer then
            return
        end

        timer = M.setTimeout(function()
            fn(unpack(args))
            timer = nil
        end, interval)
    end
end
```

### Lua ffi 调用 c 函数

一开始我使用的是纯 Lua 编写获取 indent 的函数，如下

```lua
function M.get_indent(bufnr, row)
    return vim.api.nvim_buf_call(bufnr, function()
        return vim.fn.indent(row + 1)
    end)
end
```

后来转换为

```lua
ffi.cdef([[
    typedef struct {} Error;
    typedef struct file_buffer buf_T;
    typedef int32_t linenr_T;
    buf_T *find_buffer_by_handle(int buffer, Error *err);
    int get_indent_buf(buf_T *buf, linenr_T lnum);
    int get_sw_value(buf_T *buf);
]])
local C = ffi.C
function M.get_indent(bufnr, row)
    local line_cnt = vim.api.nvim_buf_line_count(bufnr)
    if row >= line_cnt then
        return -1
    end
    local handler = C.find_buffer_by_handle(bufnr, ffi.new("Error"))
    return C.get_indent_buf(handler, row + 1)
end
```

通过查看 Neovim 源码获取可用的 utils 函数，通过 ffi 库调用，甚至能够将速度提升十倍！

### cache 已有的 indents 和 extmark

比方说用户已经浏览了 `100-120` 行，然后向下翻动了三行，我们只需要计算新翻动的这三行 indent，并且更新这个 cache 为 `100-123`，这样做在特定情况（用户使用 j k 进行翻页）可以有效减少计算全屏 indent 的计算量。

同理我们也不需要每次都全屏渲染 extmark，只要渲染下面新加入的三行的 extmark 即可，这样可以从原来 60+ 的渲染次数变成少于 10 次的渲染次数，有效减少渲染时间。
