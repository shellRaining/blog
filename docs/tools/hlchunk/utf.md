---
title: hlchunk 开发时遇到的 UTF-8 字符处理问题
tag:
  - tools
  - hlchunk
date: 2024-05-30
---

## UTF-8 编码

UTF-8 编码的字符是有一定规律的，首先一个 UTF-8 字符可能有 `1-4` 字节的长度。对于其中的一个字节 b

- 如果 b 首位为 0，则其为单字节字符，即 `0 <= charCodeAt(b) <= 127`，可以用来兼容 ASCII 码
- 如果 b 首位为 1，第二位为 0，则其为多字节字符中的其中一个字节（不包含首字节）。而对于其首字节，有下面细分的规则
  - 如果 b 符合 `110X XXXXX`，表示这是一个两字节字符的第一个字节
  - 如果 b 符合 `1110 XXXXX`，表示这是一个三字节字符的第一个字节
  - 如果 b 符合 `1111 0XXXX`，表示这是一个四字节字符的第一个字节

因此如果拿到一个字符，只看首位可以确定是否是 ASCII 字符，看前两位可以确定是否是多字节字符的第一个字节，看前四位可以确定该多字节字符具体由几个字节组成。

## UTF-8 字符串的 split

因此可以通过遍历所有的字节来分割出每个 UTF-8 字符，Lua 示例如下：

```lua
function utf8Split(inputstr)
    local list = {}
    local len = #inputstr
    local point = 1

    while point <= len do
        local c = inputstr:sub(point, point)
        local byte = c:byte()
        if byte <= 127 and byte >= 0 then -- 0x00 to 0x7f
            table.insert(list, c)
            point = point + 1
        elseif byte >= 192 and byte <= 223 then -- 0xc0 to 0xdf
            table.insert(list, string.sub(inputstr, point, point + 1))
            point = point + 2
        elseif byte >= 224 and byte <= 239 then -- 0xe0 to 0xef
            table.insert(list, string.sub(inputstr, point, point + 2))
            point = point + 3
        elseif byte >= 240 and byte <= 247 then -- 0xf0 to 0xf7
            table.insert(list, string.sub(inputstr, point, point + 3))
            point = point + 4
        end
    end
    return list
end
```

首先遍历所有字符，找到每个 UTF-8 字符的开始位置，然后根据上述规则找出该字符具体是有多少个字节组成，然后移动浮标。

其实还可以通过正则表达式来分割：

```lua
function utf8Split(inputstr)
    local list = {}
    for uchar in string.gmatch(inputstr, "[^\128-\191][\128-\191]*") do
        table.insert(list, uchar)
    end
    return list
end
```

我们可以通过规则知道，`128` 到 `191` 号字符（即 `0x80 to 0xbf`）不可能出现在首位，只可能出现在多字节字符的后边，因此写下该正则表达式，匹配首位不是该字符，其后缀可能是该字符的所有规则。
