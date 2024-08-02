---
title: vitepress 主题切换
tag:
  - vitepress
date: 2024-07-24
collection: vitepress
---

## 配置文件

设置主题策略的方式只有一种，即通过修改站点配置文件（`.vitepress/config.ts`）的 `appearance` 属性来实现。可选的策略如下：

> Type: `boolean | 'dark' | 'force-dark' | 'force-auto' | import('@vueuse/core').UseDarkOptions`
> Default: `true`

- 如果设置值为 true，会通过用户偏好设置来决定站点主题

- 如果是 false，会禁用站点主题切换功能（通过 `v-if` 禁用切换主题组件来实现）

- 如果是 dark，则默认选择为黑暗模式，用户可以切换

- 如果是 force-dark，那么默认是黑暗模式，但用户不可以切换，同理 force-auto

- 如果传入的是一个对象，那么这个对象要满足其中 `UseDarkOptions`，类型具体的声明可以看 [vueuse 的文档](https://vueuse.org/core/useDark/#type-declarations)

## 工作原理

### 设置 `isDark` 站点信息

这部分可以结合 [Vitepress 配置文件工作原理](./config.md)来看，在运行到 `initData` 函数后，它内部有这样一段代码：

```typescript
const isDark =
  appearance === "force-dark"
    ? ref(true)
    : appearance
      ? useDark({
          storageKey: APPEARANCE_KEY,
          initialValue: () =>
            typeof appearance === "string" ? appearance : "auto",
          ...(typeof appearance === "object" ? appearance : {}),
        })
      : ref(false);
return {
  isDark, // 还有其他很多属性没有列出来
};
```

分为三种情况，

1. 如果 `appearance` 设置为 force-dark，那么直接将这个响应式变量设置为 true
2. 如果设置为 false，将这个响应式变量设置为 false
3. 其余情况都使用 `useDark` 这个组合式函数来管理，具体可以看他的文档。

随后这个响应式变量被作为 `VitepressData` 类型对象的一部分被塞进去，然后作为 `data` 被注入到整个应用中，后续可以通过 `useData()` 组合式函数来调用。

### useDark 组合函数

它会从 localStorage/sessionStorage（可以通过参数来更改）读取值，检查是否存在用户配置的颜色方案，如果没有，则使用用户的系统偏好，并且在 storage 中设置一个相应的 key 来存储当前的主题策略，如果存在，直接读取当做配置。

如果当前的主题和 storage 中不同，useDark 会自动在配置项中指定的元素（默认是 `<html>`）中添加或删除 `dark` 类，以实现切换主题的效果。当更改 `isDark` 引用时，它也会更新相应元素的属性，然后将偏好存储到 storage 中（默认键： `vueuse-color-scheme` ）以实现持久化。

### 防闪烁内联脚本

如果我们 storage 中默认使用暗色主题，在加载应用的过程中，会先出现亮色，然后转变成暗色，出现了闪烁的 bug。

这是因为 vue 是一个客户端应用，我们在执行 `useDark` 之前，浏览器已经渲染了预设的白色背景，而执行 `useDark` 后，又突然给指定元素添加了 `dark` 类，这导致了闪烁。

而解决方案也很简单，在加载 DOM 前给指定元素设置好 `dark` 类即可，这需要我们在 `<head>` 标签内添加一个内联 script，读取 storage 并查看是否有指定的 key，相关代码如下：

```typescript
head.push([
  "script",
  { id: "check-dark-mode" },
  fallbackPreference === "force-dark"
    ? `document.documentElement.classList.add('dark')`
    : `;(() => {
        const preference = localStorage.getItem('${APPEARANCE_KEY}') || '${fallbackPreference}'
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (!preference || preference === 'auto' ? prefersDark : preference === 'dark')
          document.documentElement.classList.add('dark')
      })()`,
]);
```

这段代码是服务端的，它在构建的时候，通过查看 `appearance` 配置项决定是否注入代码或者注入什么样的代码。

## 一个小应用

我个人博客不喜欢他的切换主题样式，于是通过设置 `appearance` 为 false 禁用了相关组件，并且写了一个 vue 组件来接替他的功能，具体的实现可以看[我的博客仓库](https://github.com/shellRaining/blog/blob/main/theme/Home/AppearanceSwitcher.vue)。由于设置为 false 后，没有自动注入防闪烁内联脚本，我也遇到了闪烁的问题，通过在 `config.ts` 中指定 `head` 数组，手动加入该脚本即可。

> [!warning]
>
> 上面这个内联脚本千万不要写成 module 的形式，因为 module 执行时机是在文档加载后，`DOMContentLoaded` 之前加载。会导致闪烁问题重新发生
