---
title: wezterm 中字体设置
tag:
  - wezterm
  - tools
date: 2024-02-05
openCategory: false
---

设置字体使用 `wezterm.font_(families [, attributes])` 函数，这个函数构造一个 lua 表，该表对应了内部的 `FontAttributes` 结构，用于选择字体:

第一个参数是字体的名字; 这个名字可以是以下类型的名字:

* 字体家族名字，例如: `"JetBrains Mono"`。  这个家族名字不包括任何样式信息（例如粗细，伸展或者斜体），这些信息可以通过 *attributes* 参数指定。 
* 计算出的全名，这个全名是家族名字加上子家族名字(包含样式信息)的组合，例如: `"JetBrains Mono Regular"`。
* postscript 名字，这是一个由字体设计者编码到字体中的唯一名字。

当使用家族名字来指定一个字体时，第二个 *attributes* 参数是一个可选的 lua 表，用于指定样式属性; 可以使用以下的键:

* `weight` - 指定字体的粗细。 默认值是 `"Regular"`，可能的值有:
  * `"Thin"`
  * `"ExtraLight"`
  * `"Light"`
  * `"DemiLight"`
  * `"Book"`
  * `"Regular"`
  * `"Medium"`
  * `"DemiBold"`
  * `"Bold"`
  * `"ExtraBold"`
  * `"Black"`
  * `"ExtraBlack"`。

* `stretch` - 指定字体的伸展。 默认值是 `"Normal"`，可能的值有:
  * `"UltraCondensed"`
  * `"ExtraCondensed"`
  * `"Condensed"`
  * `"SemiCondensed"`
  * `"Normal"`
  * `"SemiExpanded"`
  * `"Expanded"`
  * `"ExtraExpanded"`
  * `"UltraExpanded"`。

* `style` - 指定字体的样式。 默认值是 `"Normal"`，可能的值有:
  * `"Normal"`
  * `"Italic"`
  * `"Oblique"`

  `"Oblique"` 和 `"Italic"` 字体在字体家族中通常有明显的设计差异，`"Oblique"` 通常看起来和 `"Normal"` 非常相似，但是倾斜了一些。

当指定了 *attributes* 时，字体必须同时匹配家族名字和样式属性才能被选择。

```lua
local wezterm = require 'wezterm'

return {
  font = wezterm.font('JetBrains Mono', { weight = 'Bold' }),
}
```
