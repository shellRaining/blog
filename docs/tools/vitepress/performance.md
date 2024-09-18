# 博客性能优化随笔

在使用 vitepress 这个静态框架来编写博客的时候，很容易就能取得 lightinghouse 满分的效果，这是因为他在很多地方进行了优化的结果，我们这里挑出一些来重点讲解。

## 静态站点生成（SSG）

vitepress 是一个静态博客生成框架，而不是一个服务端渲染框架，因为所有的内容在构建时就已经确定了，而不是在请求时确定。比如我们的博客文章，他们都是提前编写好的，然后在构建时编译成了相应的 HTML 文档，但是在加载过程中，实际上还会导入一个 JavaScript bundle，将页面变成一个 SPA 应用。这一点可以从编译产物中看出来（编译产物见 [vitepress 构建流程](./build.md)）。

这个特性保证了 vitepress 的优异性能，同时还具有一定的可交互性，博客文章都是静态的，交互的特性都是打包后的 JavaScript bundle 提供的。不过这对我也有一点小小的影响，比如博客第一次打开的时候，是没有文章渐入的动画效果的，这是因为 vitepress 提供的是服务端渲染后的代码，vue 在初次打开时会有一个水合（或者叫做激活）的步骤，他直接将事件监听器附加到已有的 DOM 上，导致动画没有触发

```vue
<TransitionGroup appear @before-enter="beforeEnter" @enter="enter">
  <li
    v-for="(post, index) in props.posts"
    :key="post.url"
    :data-index="index"
  >
    <PostItem :post="post" />
  </li>
</TransitionGroup>
```

但！我们可以做一些小 trick，来狡猾的添加动画，基本思路如下

```vue
<ul>
  <TransitionGroup
    v-if="mounted"
    @before-enter="beforeEnter"
    @enter="enter"
  >
    <li v-for="item in l1">
      <div>{{ item }}</div>
    </li>
  </TransitionGroup>
  <template v-else>
    <li v-for="item in l2">
      <div :style="{ visibility: 'hidden' }">{{ item }}</div>
    </li>
  </template>
</ul>
```

可以看到我们提供了一个新的文章列表，但是这个列表里面所有的项都是不可见的，只是充当占位置的元素，等到水合后且 mounted 执行完成后，重新加载文章列表 DOM，这时候就可以做出动画效果了！

## 预加载视口文章

在进入到我们的博客首页时，会发现有很多的博客链接，再打开开发者工具，可以看到 head 标签内有很多设置为 prefetch 的 link 标签，他们指向对应的 chunk，同时开发者工具的网络一栏也能看到相应的 prefetch，但是里面具体的内容看不到，这是由 prefetch 自身的特性决定的，详情可以看谷歌的[这个库](https://github.com/GoogleChromeLabs/quicklink)。

```typescript
observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const link = entry.target as HTMLAnchorElement
      observer!.unobserve(link)
      const { pathname } = link
      if (!hasFetched.has(pathname)) {
        hasFetched.add(pathname)
        const pageChunkPath = pathToFile(pathname)
        if (pageChunkPath) doFetch(pageChunkPath)
      }
    }
  })
})

rIC(() => {
  document
    .querySelectorAll<HTMLAnchorElement | SVGAElement>('#app a')
    .forEach((link) => {
      const { hostname, pathname } = new URL(
        link.href instanceof SVGAnimatedString
          ? link.href.animVal
          : link.href,
        link.baseURI
      )
      if (
        // 仅预取同标签页导航，因为新标签页将加载 lean.js 代码块。
        link.target !== '_blank' &&
        // 仅预取入站链接
        hostname === location.hostname
      ) {
        if (pathname !== location.pathname) {
          observer!.observe(link)
        }
      }
    })
})

```

## 代码分割

vitepress 的代码分割做的可以称作简洁有力啊，打包后的产物分为入口 HTML（包括首页入口和各博文入口），框架 JavaScript bundle（`framework.js`），应用 JavaScript bundle（`app.js`）。

其中框架代码包含了 vitepress 的核心内容，比如 vue3 的运行时核心，路由系统，markdown 渲染（存疑）。应用代码包含了我们自己编写的主题（除了 css 会被默认拆出去形成一个单独的文件），同时，由于我们的主题依附于默认主题，所以部分主题代码还会出现在框架代码中。博文的拆分在前面已经提到了，这里不再赘述。

同时对重要代码还进行了预取，比如 `framework.js` 的代码，以供 `app.js` 使用，而不是形成一个瀑布流的请求
