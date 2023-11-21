---
title: wezterm 中字体回退设置
tag:
  - wezterm
  - tools
date: 2024-02-06
openCategory: false
---

设置字体回退使用 `wezterm.font_with_fallback(families [, attributes])` 函数，这个函数构造一个 lua 表，用于配置一个带有回退处理的字体。 字体会按照列表中的顺序进行查找，如果在第一个字体中找不到字形，就会在下一个字体中查找，以此类推。

第一个参数是一个表，用于列出字体的首选顺序:

```lua
local wezterm = require 'wezterm'

return {
  font = wezterm.font_with_fallback { 'JetBrains Mono', 'Noto Color Emoji' },
}
```

WezTerm 隐式的添加了默认的回退字体到你指定的列表中。

*attributes* 参数的行为和 [wezterm.font](font.md) 中的行为一样，允许你指定字体的粗细和样式属性。

对于每个回退字体，你可以使用一个更加复杂的形式来指定字体的属性，这个形式是一个 lua 表，用于指定家族名字和样式属性:

```lua
local wezterm = require 'wezterm'

return {
  font = wezterm.font_with_fallback {
    { family = 'JetBrains Mono', weight = 'Medium' },
    { family = 'Terminus', weight = 'Bold' },
    'Noto Color Emoji',
  },
}
```

你可以使用上面提到的扩展形式来覆盖 freetype 和 harfbuzz 的设置，这个例子展示了如何在 JetBrains Mono 中禁用默认的连字特性，但是在回退字体中保留:

```lua
local wezterm = require 'wezterm'

return {
  font = wezterm.font_with_fallback {
    {
      family = 'JetBrains Mono',
      harfbuzz_features = { 'calt=0', 'clig=0', 'liga=0' },
    },
    { family = 'Terminus', weight = 'Bold' },
    'Noto Color Emoji',
  },
}
```
### 处理不同回退字体的高度

当混合不同的字体家族时，有可能一个字体的字形看起来和另一个字体的字形不一样高。

对于 `Roman` 字体，有一个字体度量叫做 *cap-height*，它表示了一个大写字母的大小，你可以使用这个度量来计算一个缩放因子，用于让回退字体看起来和原始字体一样大。

### 手动回退字体缩放

CJK 字体通常不会有有用的 *cap-height* 度量，所以可能需要手动配置回退字体的缩放因子，以便提高 CJK 字体的大小，使得字形更加可读。

下面的例子展示了如何将 `"Microsoft YaHei"` 回退字体的有效大小提高到正常大小的 `1.5` 倍。 缩放因子不能影响字体度量，所以可能需要同时指定 line_height 来产生更加令人愉悦的显示效果。

```lua
local wezterm = require 'wezterm'

return {
  line_height = 1.2,
  font = wezterm.font_with_fallback {
    'JetBrains Mono',
    { family = 'Microsoft YaHei', scale = 1.5 },
  },
}
```
