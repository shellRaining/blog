---
title: vitepress 配置文件的工作流程
tag:
  - vitepress
date: 2024-07-07
---

vitepress 的配置文件是位于 `.vitepress/config.mts` 下的，我们需要在这个文件中默认导出一个 `UserConfig` 类型的对象，但是这个配置文件是如何反映到客户端上的呢？我们从零开始看一下。

在开发阶段，我们首先输入命令 `pnpm run docs:dev` 启动一个开发服务器，然后在浏览器打开首页，这个过程向服务器请求文件的顺序为：

1. `index.html`
1. `client/app/index.js`
1. `client/app/data.js`
1. `@siteData`

## 客户端初始化

我们这里介绍的初始化过程是从文档加载起，到向服务器请求配置文件结束，不包含其他诸如路由初始化等。下面是我们执行初始化过程的栈帧

```
initData (data.ts:74)
createApp (index.ts:75)
（匿名） (index.ts:169)
```

我们从匿名函数开始执行（实际上就是入口脚本的全局作用域代码），调用了 `createApp` 来创建一个 app，而在这个过程中我们会调用 `initData` 来初始化站点配置

## 向服务器请求配置

前三步都是正常的文档和脚本请求，只有最后一个是虚拟模块请求，我们通过配置 `vite` 开发服务器，使用了一个 `vitePressPlugin` 插件，这个插件包含 `resolveId` 和 `load` 钩子，前者用来解析客户端 `@siteData`，后者用来实际加载这个模块的内容，从而来最终返回需要的 `siteData`。

`resolveId` 没有什么好讲的，主要看 `load`，他的定义如下：

```typescript
// plugin.ts
load(id) {
  if (id === SITE_DATA_REQUEST_PATH) {
    let data = siteData
    data = serializeFunctions(data)
    return `${deserializeFunctions};export default deserializeFunctions(JSON.parse(${JSON.stringify(
      JSON.stringify(data)
    )}))`
  }
},
```

可以看到有一个 `siteData` 变量，我们先不管他，先看一下我们这个虚拟模块到底最终返回了什么，可以看到显示对 `siteData` 进行了序列化的操作，然后返回了一个字符串（最终需要浏览器执行的脚本），这个返回的字符串中还贴心地包含了一个反序列化的函数代码，等该文件传送到客户端的时候浏览器直接用该函数反序列化 `siteData` 对象，从而获取站点数据。

## 处理传送过来的配置

我们从服务端返回到客户端，看一下导入 `siteData` 后发生了什么。

导入后，我们调用的 `initData` 函数使用了这个 `siteData`，并且将其包裹在一个 `VitePressData` 类型的对象中返回

```TypeScript
export function initData(route: Route): VitePressData {
  const site = computed(() =>
    resolveSiteDataByRoute(siteDataRef.value, route.data.relativePath)
  )

  // ...

  return {
    site,
    theme: computed(() => site.value.themeConfig),
    page: computed(() => route.data),
		// ...
  }
}
```

并最终将这个返回的对象作为一个 symbol 注入到创建的 app 中。
