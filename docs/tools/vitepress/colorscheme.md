---
title: 博客配色方案
tag:
  - vitepress
date: 2024-08-22
---

我想实现一个优雅的博客，配色是很重要的一环，这不仅关乎着用户体验，还关系到代码的可维护性，不断地手动添加 `.dark` 类，然而手写颜色的十六进制码对代码维护来说简直就是灾难，也可能会导致博客部分区域的配色和主色调不相合，所以定了如下的规则。该规则部分取自 `Vitepress` 的配色方案，同时也搭配一些自己的更改。

再介绍一下命名规则，以 `--sr` 为开头来限定作用域，避免命名冲突，然后追加属性分类，比如颜色就是 `-c`，然后追加实际作用的属性名称，比如背景颜色就是 `-bg`，最后添加修饰符，比如如果是 hover 状态，就添加 `-hover`。最终可以组成类似 `--sr-c-bg-active` 这样的命名。

## 字体配色

### 正常状态文本

```css
:root {
  --vp-c-text-1: rgba(60, 60, 67);
  --vp-c-text-2: rgba(60, 60, 67, 0.78);
  --vp-c-text-3: rgba(60, 60, 67, 0.56);
}

.dark {
  --vp-c-text-1: rgba(255, 255, 245, 0.86);
  --vp-c-text-2: rgba(235, 235, 245, 0.6);
  --vp-c-text-3: rgba(235, 235, 245, 0.38);
}
```

下面变量经常用来显示主要文本，同时他们不承担交互（如 hover，active）等行为

- `--vp-c-text-1`: 用于主要文本。包括标题，博客正文等
- `--vp-c-text-2`: 用于淡化文本，例如“非活动菜单”或“信息文本”。
- `--vp-c-text-3`: 用于细微文本，例如“占位符”或“插入符号图标”。

### 特定交互文本

```css
:root {
  --sr-c-text: #57534e;
  --sr-c-text-hover: #0c0a09;
}
.dark {
  --sr-c-text: #a8a29e;
  --sr-c-text-hover: #fafaf9;
}
```

下面变量经常用来显示各种用户可能会接触的条目类型文本，比如博客首页博文列表的标题

- `--sr-c-text`: 用于条目自身文本
- `--sr-c-text-hover`: 用于光标覆盖条目后显示的文本颜色

同时为了增加对比度，hover 的时候最好给文本加粗

使用上面的变量，可以将下面的代码简化，变得更加可维护

```css
/* before */
.post-title {
  color: #57534e; /* stone-600 */
  &:hover {
    color: #0c0a09; /* stone-950 */
    font-weight: bold;
  }
}
.dark .post-title {
  color: #a8a29e; /* stone-400 */
  &:hover {
    color: #fafaf9; /* stone-50 */
  }
}
```

```css
/* after */
.post-title {
  color: var(--sr-c-text);
  &:hover {
    color: var(--sr-c-text-hover);
    font-weight: bold;
  }
}
```

## 背景配色

```css
:root {
  --sr-c-bg: #ffffff;
  --sr-c-bg-section: #f6f6f7;
  --sr-c-bg-hover: #e9e9eb;
  --sr-c-bg-active: #e9e9eb;
}
.dark {
  --sr-c-bg: #1b1b1f;
  --sr-c-bg-section: #202127;
  --sr-c-bg-hover: #2b2b30;
  --sr-c-bg-active: #2b2b30;
}
```

- `--sr-c-bg` 适用于博客的主背景色，其他模块非常不建议使用该配色
- `--sr-c-bg-section` 适用于博客中的某一个特定的组件或者区域，比如卡片区域等
- `--sr-c-bg-hover` 当某个部分被覆盖（通常很小一块区域），可以用该颜色来显示
- `--sr-c-bg-active` 当某个区域处于被选中的状态，可以考虑使用，比如一个被选中的 tab 按钮

## 边框

```css
:root {
  --sr-c-border: var(--vp-c-border);
  --sr-border: 1px solid var(--vp-c-border);
}
```

这个就比较简单了，通过直接引用 Vitepress 的配色方案来实现，并且提供了统一的边框格式，取 1px 实线

## 阴影

```css
:root {
  --sr-float-shadow: 0 0 5px var(--sr-c-border);
  --sr-card-shadow: 0 0 10px var(--sr-c-border);
}
```

前者主要用于弹出的（popup）组件，后者用于更大范围的卡片（card）组件来实现阴影效果，而对于全屏模态窗，由于有背景的遮罩，可以不设置阴影

## 组件类

```css
/* link */
:root {
  --sr-c-link: var(--vp-c-brand-1);
  --sr-c-link-hover: var(--vp-c-brand-2);
}

/* button */
:root {
  --sr-c-btn: var(--vp-c-brand-3);
  --sr-c-btn-hover: var(--vp-c-brand-2);
  --sr-c-btn-active: var(--vp-c-brand-1);
}
```

顾名思义，针对单个组件进行优化的配色，他们是根据状态来选择的

## 动画

```css
/* flyout transition */
.flyout-enter-active {
  transition: all 0.2s ease-out;
}

.flyout-leave-active {
  transition: all 0.15s ease-in;
}

.flyout-enter-from,
.flyout-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
```

对于飞入效果，我们统一使用谷歌类似的样式，营造卡片的效果

## 图标

有时候会使用到 svg 图标，一个统一的样式很有必要

```css
.icon {
  display: inline-block;
  vertical-align: middle;
  margin-left: 2px;
  width: 1em;
  height: 1em;
  mask-size: 100% 100%;
  color: inherit;
  background-color: currentColor;
}
```
