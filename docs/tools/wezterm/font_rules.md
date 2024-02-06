---
title: wezterm 中字体规则
tag:
  - wezterm
  - tools
date: 2024-02-06
openCategory: false
---

当在终端中的文本输出被加粗、斜体或者其他属性修饰时，wezterm 使用 `font_rules` 来决定如何渲染这些文本。

默认情况下，未经样式修饰的文本将使用 [font](font.md) 配置中指定的字体，wezterm 将使用这个字体作为基础，然后自动生成适当的
`font_rules`，使用更重的字体来渲染加粗文本，使用更轻的字体来渲染淡色文本，使用斜体字体来渲染斜体文本。

大多数用户不需要为 `font_rules` 指定任何显式值，因为默认值应该足够使用。

如果你有一些不寻常的字体或者字体混合，例如使用你最喜欢的等宽字体作为基础，然后使用不同字体家族的斜体字体，那么 `font_rules` 将允许你这样做。

`font_rules` 由一系列的规则条目组成，这些规则条目包含了 *matcher* 字段和 *action* 字段。matcher
字段指定你想要匹配的文本属性，而 action 字段指定你想要如何渲染它们。

以下是 matcher 字段:

| Name          | Associated Attribute           | Possible Values                   |
| ------------- | ------------------------------ | --------------------------------- |
| italic        | italic                         | `true`  or `false`                |
| intensity     | bold/bright or dim/half-bright | `"Normal"` , `"Bold"`, `"Half"`   |
| underline     | underline                      | `"None"`, `"Single"` , `"Double"` |
| blink         | blinking                       | `"None"` , `"Rapid"` , `"Slow"`   |
| reverse       | reverse/inverse                | `true`  or `false`                |
| strikethrough | strikethrough                  | `true`  or `false`                |
| invisible     | invisible                      | `true`  or `false`                |

如果 matcher 字段被省略，那么关联的属性对匹配没有影响: 规则 *不关心* 这个属性，将根据列出的属性进行匹配。

以下是 action 字段:

| Name | Action                               |
| ---- | ------------------------------------ |
| font | Specify the font that should be used |

`font_rules` 的处理方式是:

1. 从你的配置中获取 `font_rules` 列表
1. 对于列表中的每个规则:
1. 显式指定的每个 *matcher* 字段都会被考虑。如果条目中指定的属性与文本的属性不匹配，就会继续下一个规则。
1. 如果条目中显式指定的 *matcher* 字段都与文本的属性匹配，那么:
   - 如果指定了 `font` *action* 字段，将覆盖基础 `font` 配置
   - 不会再考虑其他的 `font_rules`: 匹配完成
1. 如果你指定的规则都没有匹配，那么将使用基础 `font` 的默认规则。

这里有一个我的配置文件的例子，我使用的是 `Operator Mono` 的变种，它被添加了连字补丁。这个特定的字体有字体粗细，要么太粗，要么太细，所以默认规则不能产生很好的结果，因此这个规则集。


```lua
config.font = wezterm.font_with_fallback 'Operator Mono SSm Lig Medium'
config.font_rules = {
  -- For Bold-but-not-italic text, use this relatively bold font, and override
  -- its color to a tomato-red color to make bold text really stand out.
  {
    intensity = 'Bold',
    italic = false,
    font = wezterm.font_with_fallback(
      'Operator Mono SSm Lig',
      -- Override the color specified by the terminal output and force
      -- it to be tomato-red.
      -- The color value you set here can be any CSS color name or
      -- RGB color string.
      { foreground = 'tomato' }
    ),
    -- ...
  },
}
```

这里有另一个例子，它将 `FiraCode` 和 `Victor Mono` 结合起来，只使用 `Victor Mono` 的斜体:

```lua
config.font = wezterm.font { family = 'FiraCode' }

config.font_rules = {
  {
    italic = true,
    font = wezterm.font {
      family = 'VictorMono',
      weight = 'Bold',
      style = 'Italic',
    },
  },
}
```

## 调试字体规则

你可以运行 `wezterm ls-fonts` 来总结字体规则和匹配的字体:

```console
$ wezterm ls-fonts
Primary font:
wezterm.font_with_fallback({
  -- <built-in>, BuiltIn
  "JetBrains Mono",

  -- /home/wez/.fonts/NotoColorEmoji.ttf, FontConfig
  "Noto Color Emoji",
})

...
```
