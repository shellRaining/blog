---
title: Vitepress 路由实现
tag:
  - vitepress
date: 2024-07-02
collection: vitepress
---

## 前置流程

### `createApp`

在 vitepress 客户端运行的初始过程，脚本会加载 `src/client/app/index.ts` 文件，执行其中的初始化代码，如下：

```TypeScript
if (inBrowser) {
  createApp().then(({ app, router, data }) => {
    // wait until page component is fetched before mounting
    router.go().then(() => {
      // dynamically update head tags
      useUpdateHead(router.route, data.site)
      app.mount('#app')

      // scroll to hash on new tab during dev
      if (import.meta.env.DEV && location.hash) {
        const target = document.getElementById(
          decodeURIComponent(location.hash).slice(1)
        )
        if (target) {
          scrollTo(target, location.hash)
        }
      }
    })
  })
}
```

可以看到调用了 `createApp` 函数，并且这是一个异步函数，在其执行完成后会执行路由的跳转（跳转到项目根路径），并且执行挂载根节点等任务。并且我们注意到 `createApp` 异步函数返回的 promise 中包含一个 `router`，因此我们可以深入 `createApp` 这个函数，看看这个路由器是如何创建的。

```TypeScript
export async function createApp() {
  ;(globalThis as any).__VITEPRESS__ = true
  const router = newRouter()
  const app = newApp()
  app.provide(RouterSymbol, router)
  // 省略部分代码……
  return { app, router, data }
}
```

可以看到我们通过 `newRouter` 创建的 `router`，并且将其值作为依赖注入到了整个 Vue app 中，从此可以使用 Vue 的 `inject` 语法获取路由了（并且在 Vitepress 中可以通过 `useRouter` 来获取这个 router 实例）。

::: tip

还有一个有趣的点，通过 `newApp` 创建的 app 是根据环境不同而有所变化的，比如开发环境创建的是一个客户端应用，而生产环境创建的就是一个服务端渲染（SSR）应用。

:::

### `newRouter`

我们继续探索 `newRouter` 函数

```TypeScript
function newRouter(): Router {
  let isInitialPageLoad = inBrowser
  let initialPath: string

  return createRouter(createPageModule, Theme.NotFound)
}
```

在这里发现了最终的创建 `router` 的函数 `createRouter`，这个函数位于 `src/client/app/router.ts` 文件中，也是我们此次研究的重要目标。我们进行下一阶段

## router 实现

### `createRouter`

`createRouter` 的源代码如下：

```TypeScript
export function createRouter(
  loadPageModule: (path: string) => Awaitable<PageModule | null>,
  fallbackComponent?: Component
): Router {
  const route = reactive(getDefaultRoute())
  const router: Router = { route, go }

  async function go(href: string = inBrowser ? location.href : '/') {
    // ...
  }
  async function loadPage(href: string, scrollPosition = 0, isRetry = false) {
    // ...
  }

  window.addEventListener('click', (e) => {}, { capture: true })
  window.addEventListener('popstate', async (e) => {})
  window.addEventListener('hashchange', (e) => {})

  return router
}
```

这个 `createRouter` 一共有一百多行代码，但实际上只做了三件事，很多代码只是用来处理边缘情况的

1. 创建 `router` 实例，这个实例中只包含当前的 `route` 还有一个路由跳转的函数 `go`
2. 定义 `go` 和 `loadPage` 函数，在这个过程中还会用到传入的 `loadPageModule` 回调函数
3. 定义了三个事件监听器，来增强路由跳转的能力

我们分别看这三个部分

#### 创建 `router` 实例

首先看一下 `Router` 类的类型定义

```typescript
export interface Router {
  route: Route;
  go: (to?: string) => Promise<void>;
  onBeforeRouteChange?: (to: string) => Awaitable<void | boolean>;
  onBeforePageLoad?: (to: string) => Awaitable<void | boolean>;
  onAfterRouteChanged?: (to: string) => Awaitable<void>;
}
```

可以看到只有两个必选属性，剩下三个都是用来作为钩子函数，交由用户来定义使用的。

我们创建 `router` 实例的时候也是遵循最小原则，用 `fakehost` 定义了一个 `route`，并且将他和 `go` 这个闭包函数包裹在一个对象中返回。可以说第一部分非常简单明了。

#### 定义 `go` 和 `loadPage`

```typescript
async function go(href: string = inBrowser ? location.href : "/") {
  href = normalizeHref(href);
  if ((await router.onBeforeRouteChange?.(href)) === false) return;
  if (inBrowser && href !== normalizeHref(location.href)) {
    // save scroll position before changing url
    history.replaceState({ scrollPosition: window.scrollY }, "");
    history.pushState({}, "", href);
  }
  await loadPage(href);
  await router.onAfterRouteChanged?.(href);
}
```

`go` 函数首先规范化我们传入的 href，然后和当前的 href 进行比对，如果不同，就在当前的页面的状态对象中记录一下 `scrollY` 的值，以便后续恢复浏览进度，然后执行加载页面的任务（通过后面提到的 `loadPage` 函数）

同时这里还有刚才提到的三个钩子函数，`onBeforeRouteChange`，`onBeforePageLoad`，`onAfterRouteChanged`，他们就是在 `go` 函数和 `loadPage` 中调用的。

```typescript
  async function loadPage(href: string, scrollPosition = 0, isRetry = false) {
    if ((await router.onBeforePageLoad?.(href)) === false) return
    const targetLoc = new URL(href, fakeHost)
    try {
      let page = await loadPageModule(pendingPath)
        // ...
      })
    }
  }
```

`loadPage` 函数会用到 `createRouter` 传入的 `loadPageModule` 回调函数，用来加载页面，这个函数在 `app/index.ts` 中（我们前置流程中 `newRouter` 部分）定义

```typescript
cosnt loadPageModule = (path) => {
    let pageFilePath = pathToFile(path)
    let pageModule = null

    if (pageFilePath) {
      if (import.meta.env.DEV) {
        pageModule = import(/*@vite-ignore*/ pageFilePath).catch(() => {
          // 出错了就重新换一个路径进行加载
        })
      } else if (import.meta.env.SSR) {
        pageModule = import(/*@vite-ignore*/ `${pageFilePath}?t=${Date.now()}`)
      } else {
        pageModule = import(/*@vite-ignore*/ pageFilePath)
      }
    }

    return pageModule
  }
```

这个函数做的主要工作就是 import 一个博客文章……很简单

#### 事件监听器

最后就是三个事件监听器

```typescript
window.addEventListener(
  "click",
  (e) => {
    const button = (e.target as Element).closest("button");
    if (button) return;
    const link = (e.target as Element | SVGElement).closest<
      HTMLAnchorElement | SVGAElement
    >("a");

    if (
      link &&
      !link.closest(".vp-raw") &&
      (link instanceof SVGElement || !link.download)
    ) {
      const { target } = link;
      const { href, origin, pathname, hash, search } = new URL(
        link.href instanceof SVGAnimatedString ? link.href.animVal : link.href,
        link.baseURI,
      );
      const currentUrl = new URL(location.href); // copy to keep old data
      e.preventDefault();
      if (pathname === currentUrl.pathname && search === currentUrl.search) {
        // scroll between hash anchors in the same page
        // avoid duplicate history entries when the hash is same
        if (hash !== currentUrl.hash) {
          history.pushState({}, "", href);
          // still emit the event so we can listen to it in themes
          window.dispatchEvent(
            new HashChangeEvent("hashchange", {
              oldURL: currentUrl.href,
              newURL: href,
            }),
          );
        }
        if (hash) {
          // use smooth scroll when clicking on header anchor links
          scrollTo(link, hash, link.classList.contains("header-anchor"));
        } else {
          window.scrollTo(0, 0);
        }
      } else {
        go(href);
      }
    }
  },
  { capture: true },
);
window.addEventListener("popstate", async (e) => {});
window.addEventListener("hashchange", (e) => {});
```

首先讲一下鼠标事件监听器，这个事件监听器主要是针对链接类型节点处理的，如果用户是通过鼠标左键点击的该链接，并且该链接的 URL 和当前窗口的 href 的 `pathname` 和 `query` 参数相同，那么继续判断他们的 `hash` 是否相同，如果不同，就触发一个 `hashchange` 事件，并且滚动到指定位置。如果 `pathname` 或者 `query` 不同，那么直接触发 `go` 事件即可。

之后是 `popstate` 监听器，主要负责状态变化后加载新页面，还有触发用户可能设置的钩子函数

最后是 `hashchange` 事件监听器，只是简单做了一个 `preventDefault` 操作

### 存在的问题

这个监听器导致了我的静态博客分页系统除了问题，害得我排查了很久，具体表现是：

> 首先进入 [https://sugarat.top/?pageNum=2](https://sugarat.top/?pageNum=2) 这个网页，看到分页正常显示在第二页，然后按首页左上角的 logo，URL 变成了 [https://sugarat.top](https://sugarat.top)，但页面没有正常跳转到第一页
>
> 这是因为如果不传入钩子函数，会直接调用 go("/")，导致 URL 发生变化，但是我们静态分页器没有更新分页信息。通过向上面提到的用户钩子函数 `onAfterRouteChanged` 传入更新分页的回调函数即可。

同时还导致了我的博客过渡动画出现问题，我第一次点击一篇主页的博客文章链接后，过渡效果正常显示，但是如果第二次点击同一篇文章链接，就会出现 bug，详细报错信息可以看 [GitHub issue](https://github.com/vuejs/vitepress/issues/4075)。通过将 a 链接转换成 button 标签解决，但我感觉这不是一个好的解决方案。

后续更新，vitepress 开发者之一提到可以使用 `vp-raw` 类，我查看源码发现确实是一个可行的办法。不过这样就要自己处理 a 标签的默认行为了，比如 `prevent` 修饰符

### `useRouter`

```TypeScript
export function useRouter(): Router {
  const router = inject(RouterSymbol)
  if (!router) {
    throw new Error('useRouter() is called without provider.')
  }
  return router
}
```

我们在前置流程的 `createApp` 中看到了一个依赖注入的操作，这个伏笔在 `useRouter` 中得到了回收，可以看到它直接通过 `inject` 获取到我们前面注入的 router 实例，并且返回给用户，很简单的函数。

### `useRoute`

```TypeScript
export function useRoute(): Route {
  return useRouter().route
}
```

这个也是非常简单的一个函数，获取其中的字段就可以了。
