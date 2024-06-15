---
title: chunk 的动画效果原理及实现方式
tag:
  - tools
  - hlchunk
date: 2024-06-15
---

## hlchunk 中的 cache

由于有几条 issue 反映了性能问题，因此我针对火焰图上的性能瓶颈处进行了大量的优化，具体可以参考 [性能优化](./profile.md)，其中 cache 是很重要的一环，因此记录一下

## 需求

我们需要针对每一个 `bufnr`，`lnum`，`col` 或者 `bufnr`，`lnum` 来建立 cache，这意味着这个 `cache` 类构造函数需要预先传入字段名，比如这样调用：`local cache = Cache('bufnr', 'lnum')`，这样就指定了 `get` 函数的签名为 `get(bufnr, lnum)`，同理如果这样调用 `local cache = Cache('bufnr', 'lnum', 'col')`，这样就指定了 `get` 函数的签名为 `get(bufnr, lnum, col)`

## 实现

```lua
local Cache = class(function(self, ...)
    self.keys = { ... }
    self.cache = {}
end)

function Cache:get(...)
    local values = { ... }
    return navigateCache(self.cache, values, false)
end

function Cache:set(...)
    local values = { ... }
    local value = table.remove(values) -- 将最后一个参数作为要设置的值
    navigateCache(self.cache, values, true, value)
end

function Cache:has(...)
    local values = { ... }
    return navigateCache(self.cache, values, false) ~= nil
end

function Cache:clear(...)
    local values = { ... }
    if #values == 0 then
        self.cache = {}
    else
        navigateCache(self.cache, values, false, {})
    end
end
```

我们每次在 `get`，`set` 或者 `has` 的时候，都会传入指定 `level` 数目的 `key`，因此这是一个可以抽象出来的过程。

```lua
local function navigateCache(cache, values, createIfMissing, setValue)
    local tableRef = cache
    local searchSteps = #values
    for i = 1, searchSteps - 1 do
        local key = values[i]
        if tableRef[key] == nil then
            if createIfMissing then
                tableRef[key] = {}
            else
                return nil
            end
        end
        tableRef = tableRef[key]
    end

    if setValue then
        tableRef[values[searchSteps]] = setValue
        return setValue
    else
        return tableRef[values[searchSteps]]
    end
end
```

并且根据不同的需求（比如如果没有找到，是否应该创建一个新的表），或者即将设置的 `value`。
