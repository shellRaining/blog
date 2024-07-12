---
title: live-server 是如何工作的
tag:
  - tools
date: 2024-06-28
---

在学习前端的时候或多或少会接触 `live-server` 这个开发者工具，可以方便的为我们提供一个开发服务器，监视工作目录下的文件变动，从而自动刷新浏览器更新。我们这里介绍一下其工作原理，并用很少的代码实现一个极简的 `live-server`。

## 使用方式

从顶层看，我们首先打开一个工作目录，其下有 `index.html`，`script.js` 两个文件。我们在命令行输入 `live-server`，会启动一个开发服务器，并自动打开默认浏览器，并打开 `127.0.0.1:8080` 页面，此时页面正是 `index.html` 的内容。我们在编辑器中对这两个文件进行改动并保存，开发服务器会侦测到该行为，从而发送命令（通过 WebSocket）到浏览器，执行刷新。

因此这里涉及到三个角色：

1. HTTP 服务器：用来接受客户端发送的各种请求，比如 `get` 来获取各种文件，`upgrade` 来升级连接为 `WebSocket`
2. WebSocket 服务器：每当新建一个 `WebSocket` 连接时，创建一个文件监视器，每当文件发生变动时，通过 `WebSocket` 发送刷新指令
3. 浏览器：接收到文档页面后，主动发送 `upgrade` 请求，升级为 `WebSocket` 监听服务器的指令。

我们分别来实现这三部分

## HTTP 服务器

这里的任务包括：

1. 创建监听指定端口的服务器，并打开浏览器

2. 监听 `get` 请求，从文件系统中找出客户端所需的文档，设置相应的请求头后发送

3. 在 `get` 请求处理时，对文档注入一个 `<script>` 标签及其代码，从而迫使客户端发送创建 `WebSocket` 连接的请求

4. 监听 `upgrade` 请求，升级连接

我们逐个完成

---

对于任务一，我们使用 `http` 和 `open` 模块，其中 `http` 由 `node` 提供，`open` 需要从 `npm` 下载。

```JavaScript
import http from "http";
import open from "open";

const server = http.createServer();
server
  .on("listening", () => {
    open('127.0.0.1:8080');
  })
```

注意，`listening` 事件并不是 `http.Server` 类自身拥有的事件，起初我在查阅[Node.js http 模块文档](https://nodejs.org/api/http.html#class-httpserver)的时候也没有找到相关信息，后来看到 `http.Server` 继承自 `net.Server` 以后才理解，这个事件是继承过来的。

该事件在调用 `server.listen()` 后会抛出，然后被捕获后处理，我们就在这个处理器中添加打开浏览器的代码。

---

对于任务二，我们监听 `request` 事件，并且使用 `fs` 模块来获取本地的文件

```JavaScript
const contentTypeDict = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
};
server
  .on("request", (req, res) => {
    const reqFilePath = req.url === "/" ? "./index.html" : `.${req.url}`;
    const extname = path.extname(reqFilePath).toLowerCase();
    const contentType = contentTypeDict[extname];
    const filePath = path.join(opts.root, reqFilePath);
    let file;
    try {
      file = fs.readFileSync(filePath, { encoding: "utf8" });
      file = inject(file); // 暂时不用管
      res.writeHead(200, { "Content-Type": contentType }).end(file, "utf-8");
    } catch (e) {
      res.writeHead(404).end();
    }
  })

```

如果我们请求的 `URL` 是 `http://127.0.0.1:8080/` 这样的话，实际上想要获取的就是 `index.html` 文件，因此需要特殊处理一下，至于 `http://127.0.0.1:8080/something/` 这种形式，为简便暂时不处理。

注意这里使用的是获取文件的同步函数版本，所以要在 `try catch` 包围下使用，避免因为文件不存在导致程序崩溃。

---

任务三实际上就是上面的 `file = inject(file);` 这段代码，我们会在该文件中注入一个 `script` 标签

```JavaScript
function inject(file) {
  const injectedScript = fs.readFileSync(path.join(import.meta.dirname, "injected.html"));
  return file.replace("</body>", injectedScript + "</body>");
}
```

因为这个注入的文件必定存在，所以我没有进行错误处理。还有注意，这个注入文件的路径是在 `live-server` 这个工具的目录下，而不是我们监视的目录下，因此需要使用 `import.meta.dirname` 而不是 `process.cwd()`，不使用 `__dirname` 是因为我们编写 `live-server` 的时候，在 `package.json` 中设置了 `"type": "module"`，不能直接使用 `node` 定义的 API，详情可见[这篇文章](https://sugarat.top/technology/learn/esm-require)

---

对于任务四，由于 `node` 自身没有提供便利的 API，我们会用到 `ws` 这个模块来创建 `WebSocket` 服务器

```JavaScript
const wss = new WebSocketServer({ noServer: true });
server
  .on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });
```

为了 `http server` 和 `WebSocket server` 的代码不嵌套在一起，这里接收到 `upgrade` 请求后，`wss` 会抛出一个 `connection` 事件，后续由相应的事件处理器来处理。

## WebSocket 服务器

WebSocket 做的事情相对简单很多，只需要在 `upgrade` 事件发生后，设置一个文件监视器，每当文件变动，发送一个指令（就是一个普通的字符串）给客户端。

我们使用 `chokidar` 这个模块来提供文件监视的功能，文档在[这里](https://github.com/paulmillr/chokidar)

```JavaScript
wss.on("connection", (ws) => {
  function handleChange(changePath) {
    const cssChange = path.extname(changePath) === ".css";
    ws.send(cssChange ? "refreshcss" : "reload");
  }
  chokidar
    .watch(opts.root, {
      ignored, // 这里省略
      ignoreInitial: true,
    })
    .on("change", handleChange)
    .on("add", handleChange)
    .on("unlink", handleChange)
    .on("addDir", handleChange)
    .on("unlinkDir", handleChange);
});
```

## 浏览器

现在可以看我们注入的 `script` 究竟是什么样子了

```HTML
<script>
  const protocol = location.protocol === "http:" ? "ws://" : "wss://";
  const address = protocol + location.host + location.pathname;
  const socket = new WebSocket(address);
  socket.onmessage = function (msg) {
    if (msg.data == "reload") {
      location.reload();
    } else if (msg.data == "refreshcss") {
      const sheets = document.querySelectorAll("link");
      const headEl = document.querySelector("head");
      for (const sheet of sheets) {
        sheet.remove()
        const rel = sheet.rel;
        if (
          sheet.href &&
          (typeof rel !== "string" ||
            rel.length === 0 ||
            rel.toLowerCase() === "stylesheet")
        ) {
          const url = sheet.href.replace(/(&|\?)_cacheOverride=\d+/, "");
          console.log(url);
          sheet.href =
            url +
            (url.indexOf("?") >= 0 ? "&" : "?") +
            "_cacheOverride=" +
            new Date().valueOf();
          headEl.append(sheet);
        }
      }
    }
  };
  console.log("Live reload enabled.");
</script>
```

这段代码创建了一个 `WebSocket` 连接在 `ws://127.0.0.1:8080/` 地址上，然后接受指令并执行对应的刷新动作。

如果是非 `css` 类型文件的变更，我们直接调用 `location.reload()` 即可，如果是 `css` 类型的文件，会做如下的动作：

1. 找出当前文档中所有的外部 `link` 标签，将其从 `DOM` 中移除
2. 对所有 `link` 标签进行遍历，如果是 CSS 类型的，我们重新设置他的 `href`，加上一个日期的 `query`，来使之缓存失效，重新发送 `get` 请求来获取 `CSS` 文件
3. 将 `link` 标签对应的 `DOM` 元素重新加入到文档中。

## 总结

<img width='500' src='https://raw.githubusercontent.com/shellRaining/img/main/2406/shellRaining-server.png'>

完整的代码实现可以看我的仓库 [https://github.com/shellRaining/raining-server](https://github.com/shellRaining/raining-server)
