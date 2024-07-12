---
title: BOM 对象
tag:
  - book
  - javascript
date: 2024-07-04
---

## navigator 对象

### location 对象

location 最独特的点就是，它既是 window 对象的字段，也是 document 对象的字段，我们在浏览器环境可以直接使用这个对象。

这个对象可以分为几个部分：

| 属性       | 说明                                                   |
| ---------- | ------------------------------------------------------ |
| `protocol` | 表示当前 URL 的协议名                                  |
| `username` | 登陆的用户名                                           |
| `password` | 登陆的密码                                             |
| `hostname` | 服务器名，类似 `www.wrox.com`                          |
| `origin`   | 源地址，类似 `http://www.wrox.com`，不包含用户名和密码 |
| `port`     | 端口号                                                 |
| `pathname` | URL 中的路径或者文件名，类似 `/willy/index.html`       |
| `search`   | 查询字符串，以 `?` 开头                                |
| `hash`     | 散列值，以 `#` 开头                                    |
| `href`     | 我们最常用的，表示整个合集                             |

---

处理查询字符串的方法

1. 通过手动 `slice` 和 `decodeURIComponent` 等方法来解析
2. 通过 `URLSearchParams` 这个构造函数来创建实例，调用实例的 `get`，`set`，`delete` 方法，同时，这个实例对象也是可以迭代的

---

我们可以通过修改 `location.href` 来修改当前页面，这会增加浏览记录，如果不希望增加，可以使用 `location.replace(href)` 来进行替换。后面我们看到 `history` API 的时候也会有类似的方法。

如果想要重新加载页面，可以使用 `location.reload` 方法，如果不想要从缓存中加载，可以加一个 `true` 作为参数，这在做 `live-server` 的时候看起来很有用

### platfrom 字段

这个字段已经废弃，不在推荐使用了，但是，在以下情况下，`navigator.platform` 可能是相对较好的选择：当需要向用户显示有关键盘快捷键的修饰键是 `⌘` command 键（在 Apple 系统上）还是 `⌃` 控制键（在非 Apple 系统上）的建议时。

在我向 `vitepress` 提交的一个 pr 中就有用到这个字段，[feat: add keybind(ctrl-p and ctrl-n) for mac platform by shellRaining · Pull Request #3997 · vuejs/vitepress (github.com)](https://github.com/vuejs/vitepress/pull/3997)

### history 对象

这个对象存储了页面自打开后的导航历史记录，因此每个 `window` 都有自己的 `history` 对象，并且出于隐私性考虑，我们作为开发者无法访问 `history` 对象中具体的 `URL`，只能进行导航的操作。

其下有三个导航用的方法 `go`，`forward`，`back`。其中 `go` 方法可以传入一个整数，表示跳转的相对方向和页数，剩下两个方法只是 `go` 的简写形式。除此之外，还有一个 `length` 属性用来表示当前 `history` 的条目数，我们可以通过判断该值是否为 `1` 来确定我们的页面是否是用户的开始页面。

`history` 除了用来导航，还可以用来状态管理，我们常用的前端路由就是通过这个 API 来实现的。包括

- `pushState(stateObject, title, url)`：该方法会推入一个新的历史记录（即改变 `location.href`，并且不向服务器发送请求），第三个参数是我们会实际使用的，代表推入的相对路径地址；第二个参数 `title` 并没有被使用，因此可以随便传入信息；第一个参数可以传入一个状态对象，以便使用 `back` 或者 `forward` 来恢复现场，比如在调用该函数时先存储当前的页面 `scrollY` 状态，后面恢复浏览的进度。
- `replaceState(stateObject, title)`：该方法会直接覆盖当前的状态，不会新建一个历史记录。

---

注意点如下：

1. 在使用这两个方法的时候， 一定要确保推入的历史记录（URL）对应着服务器上的一个真实物理 URL，否则刷新的时候会出现 404 错误。所有的 SPA 应用都应该注意这一点。
2. 我们还需要注意 `location.href` 和 `history.pushState()` 是有区别的，后者更适合同源页面的跳转，还有更改 `hash` 不会触发 `hashChange` 事件。
