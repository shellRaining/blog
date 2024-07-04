---
title: Vitepress 路由实现
tag:
  - vitepress
date: 2024-07-02
---

## 前置流程

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

可以看到我们通过 `newRouter` 创建的 `router`，并且将其值作为依赖注入到了整个 Vue app 中，从此可以使用 Vue 的 `inject` 语法获取路由了。还有一个有趣的点，通过 `newApp` 创建的 app 是根据环境不同而有所变化的，比如开发环境创建的是一个客户端应用，而生产环境创建的就是一个服务端渲染（SSR）应用。

我们继续探索 `newRouter` 函数

```TypeScript
function newRouter(): Router {
  let isInitialPageLoad = inBrowser
  let initialPath: string

  return createRouter((path) => {
    let pageFilePath = pathToFile(path)
    let pageModule = null

    if (pageFilePath) {
      if (isInitialPageLoad) {
        initialPath = pageFilePath
      }
      if (isInitialPageLoad || initialPath === pageFilePath) {
        pageFilePath = pageFilePath.replace(/\.js$/, '.lean.js')
      }
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
    if (inBrowser) {
      isInitialPageLoad = false
    }

    return pageModule
  }, Theme.NotFound)
}
```

在这里发现了最终的创建 `router` 的函数，这个函数位于 `src/client/app/router.ts` 文件中，也是我们此次研究的重要目标。我们进行下一阶段

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
    href = normalizeHref(href)
    if ((await router.onBeforeRouteChange?.(href)) === false) return
    if (inBrowser && href !== normalizeHref(location.href)) {
      // save scroll position before changing url
      history.replaceState({ scrollPosition: window.scrollY }, '')
      history.pushState({}, '', href)
    }
    await loadPage(href)
    await router.onAfterRouteChanged?.(href)
  }

  let latestPendingPath: string | null = null
  async function loadPage(href: string, scrollPosition = 0, isRetry = false) {
    if ((await router.onBeforePageLoad?.(href)) === false) return
    const targetLoc = new URL(href, fakeHost)
    const pendingPath = (latestPendingPath = targetLoc.pathname)
    try {
      let page = await loadPageModule(pendingPath)
			// 省略部分代码……
    } catch (err: any) {
      // 省略部分代码……
    }
  }

  if (inBrowser) {
    if (history.state === null) {
      history.replaceState({}, '')
    }
    window.addEventListener('click', (e) => {
        const link = (e.target as Element | SVGElement).closest<HTMLAnchorElement | SVGAElement>('a')
        if (link && !link.closest('.vp-raw') && (link instanceof SVGElement || !link.download)) {
          const { target } = link
          const { href, origin, pathname, hash, search } = new URL(
            link.href instanceof SVGAnimatedString
              ? link.href.animVal
              : link.href,
            link.baseURI
          )
          const currentUrl = new URL(location.href) // copy to keep old data
          // only intercept inbound html links
          if (
            !e.ctrlKey &&
            !e.shiftKey &&
            !e.altKey &&
            !e.metaKey &&
            !target &&
            origin === currentUrl.origin &&
            treatAsHtml(pathname)
          ) {
            e.preventDefault()
            if (
              pathname === currentUrl.pathname &&
              search === currentUrl.search
            ) {
              // scroll between hash anchors in the same page
              // avoid duplicate history entries when the hash is same
              if (hash !== currentUrl.hash) {
                history.pushState({}, '', href)
                // still emit the event so we can listen to it in themes
                window.dispatchEvent(
                  new HashChangeEvent('hashchange', {
                    oldURL: currentUrl.href,
                    newURL: href
                  })
                )
              }
              if (hash) {
                // use smooth scroll when clicking on header anchor links
                scrollTo(link, hash, link.classList.contains('header-anchor'))
              } else {
                window.scrollTo(0, 0)
              }
            } else {
              go(href)
            }
          }
        }
      },
      { capture: true }
    )

    window.addEventListener('popstate', async (e) => {
      if (e.state === null) {
        return
      }
      await loadPage(
        normalizeHref(location.href),
        (e.state && e.state.scrollPosition) || 0
      )
      router.onAfterRouteChanged?.(location.href)
    })

    window.addEventListener('hashchange', (e) => {
      e.preventDefault()
    })
  }

  handleHMR(route)
  return router
}
```

这二百行代码看起来很多，但实际上只做了三件事，很多代码只是用来处理边缘情况的

1. 定义 `go` 函数，以便能够作为 `router` 的方法
2. 定义 `loadPage`，以便在 `go` 函数调用或者其他情况下能够加载页面
3. 主函数中设置了三个监听器，分别处理 `click`，`popstate`，`hashchange` 事件

我们分别看这三个部分

---

`go` 函数首先规范化我们传入的 href，然后和当前的 href 进行比对，如果不同，就在当前的页面的状态对象中记录一下 `scrollY` 的值，以便后续恢复浏览进度，然后执行加载页面的任务（通过后面提到的 `loadPage` 函数）

同时 [https://vitepress.dev/zh/reference/runtime-api#userouter](https://vitepress.dev/zh/reference/runtime-api#userouter) 中还提到了三个钩子，`onBeforeRouteChange`，`onBeforePageLoad`，`onAfterRouteChanged`，他们就是在 `go` 函数和 `loadPage` 中调用的。

---

`loadPage` 函数会用到 `createRouter` 传入的 `loadPageModule` 回调函数，用来渲染页面，我们后面会结合实际传入的函数来进行分析。

---

最后就是三个事件监听器

首先讲一下鼠标事件监听器，这个事件监听器主要是针对链接类型节点处理的，如果用户是通过鼠标左键点击的该链接，并且该链接的 URL 和当前窗口的 href 的 `pathname` 和 `query` 参数相同，那么继续判断他们的 `hash` 是否相同，如果不同，就触发一个 `hashchange` 事件，并且滚动到指定位置。如果 `pathname` 或者 `query` 不同，那么直接触发 `go` 事件即可。

这个监听器导致了我的静态博客分页系统除了问题，害得我排查了很久，具体表现是：

> 首先进入 https://sugarat.top/?pageNum=2 这个网页，看到分页正常显示在第二页，然后按首页左上角的 logo，URL 变成了 https://sugarat.top，但页面没有正常跳转到第一页

这是因为如果不传入钩子函数，会直接调用 go("/")，导致 URL 发生变化，但是页面没有刷新

之后是 `popstate` 监听器，主要负责状态变化后加载新页面，还有触发用户可能设置的钩子函数

最后是 `hashchange` 事件监听器，只是简单做了一个 `preventDefault` 操作

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

从这里可以看到这个组合式函数实际上就是从我们前面创建的 app 中获取 `provide` 后的值，进行一波注入的操作，同时为了避免命名冲突，使用了 `symbol` 类型变量。

### `useRoute`

```TypeScript
export function useRoute(): Route {
  return useRouter().route
}
```

这个也是非常简单的一个函数，获取其中的字段就可以了。

