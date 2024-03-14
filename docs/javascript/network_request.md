---
title: 网络请求
tag:
  - javascript
  - net
date: 2024-03-14
---

## Fetch

JavaScript 可以将网络请求发送到服务器，并在需要时加载新信息。所有这些都没有重新加载页面！

对于来自 JavaScript 的网络请求，有一个总称术语 “AJAX”（Asynchronous JavaScript And XML 的简称）

fetch() 方法是一种现代通用的方法，那么我们就从它开始吧。旧版本的浏览器不支持它（可以 polyfill），但是它在现代浏览器中的支持情况很好。

```javascript
let promise = fetch(url, [options])
```

### fetch 发起 get 请求

不指定 options 参数，这就是一个简单的 GET 请求，下载 url 的内容。

获取响应通常需要经过两个阶段。

第一阶段，当服务器发送了响应头（response header），fetch 返回的 promise 就使用内建的 Response class 对象来对响应头进行解析。在这个阶段，我们可以通过检查响应头，来检查 HTTP 状态以确定请求是否成功，当前还没有响应体（response body）。

如果 fetch 无法建立一个 HTTP 请求，例如网络问题，亦或是请求的网址不存在，那么 promise 就会 reject。异常的 HTTP 状态，例如 404 或 500，不会导致出现 error。

我们可以在 response 的属性中看到 HTTP 状态：

- status —— HTTP 状态码，例如 200。
- ok —— 布尔值，如果 HTTP 状态码为 200-299，则为 true。

第二阶段，为了获取 response body，我们需要使用一个其他的方法调用。

Response 提供了多种基于 promise 的方法，来以不同的格式访问 body：

- response.text() —— 读取 response，并以文本形式返回 response，
- response.json() —— 将 response 解析为 JSON 格式，
- response.formData() —— 以 FormData 对象的形式返回 response，
- response.blob() —— 以 Blob（具有类型的二进制数据）形式返回 response，
- response.arrayBuffer() —— 以 ArrayBuffer（低级别的二进制数据）形式返回 response，

另外，response.body 是 ReadableStream 对象，它允许你逐块读取 body，我们稍后会用一个例子解释它。

::: warning
我们只能选择一种读取 body 的方法。

如果我们已经使用了 response.text() 方法来获取 response，那么如果再用 response.json()，则不会生效，因为 body 内容已经被处理过了。

```javascript
let text = await response.text(); // response body 被处理了
let parsed = await response.json(); // 失败（已经被处理过了）
```

:::

#### Response header

Response header 位于 response.headers 中的一个类似于 Map 的 header 对象。

它不是真正的 Map，但是它具有类似的方法，我们可以按名称（name）获取各个 header，或迭代它们：

```javascript
let response = await fetch('https://api.github.com/repos/javascript-tutorial/en.javascript.info/commits');
alert(response.headers.get('Content-Type')); // application/json; charset=utf-8
for (let [key, value] of response.headers) {
  alert(`${key} = ${value}`);
}
```

#### Request header

要在 fetch 中设置 request header，我们可以使用 headers 选项。它有一个带有输出 header 的对象，如下所示：

```javascript
let response = fetch(protectedUrl, {
  headers: {
    Authentication: 'secret'
  }
});
```

……但是有一些我们无法设置的 header

- Accept-Charset, Accept-Encoding
- Access-Control-Request-Headers
- Access-Control-Request-Method
- Connection
- Content-Length
- Cookie, Cookie2
- ...

这些 header 保证了 HTTP 的正确性和安全性，所以它们仅由浏览器控制。

### fetch 发起 post 请求

要创建一个 POST 请求，或者其他方法的请求，我们需要使用 fetch 选项：

- method —— HTTP 方法，例如 POST，
- body —— request body，其中之一：
  - 字符串（例如 JSON 编码的），
  - FormData 对象，以 multipart/form-data 形式发送数据，
  - Blob/BufferSource 发送二进制数据，
  - URLSearchParams，以 `x-www-form-urlencoded` 编码形式发送数据，很少使用。

#### 发送 JSON

JSON 形式是最常用的。

```javascript
let user = {
  name: 'John',
  surname: 'Smith'
};

let response = await fetch('/article/fetch/post/user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  },
  body: JSON.stringify(user)
});

let result = await response.json();
```

请注意，如果请求的 body 是字符串，则 Content-Type 会默认设置为 text/plain;charset=UTF-8。

但是，当我们要发送 JSON 时，我们会使用 headers 选项来发送 application/json，这是 JSON 编码的数据的正确的 Content-Type。

#### 发送图片

我们同样可以使用 Blob 或 BufferSource 对象通过 fetch 提交二进制数据。

例如，这里有一个 `<canvas>`，我们可以通过在其上移动鼠标来进行绘制。点击 “submit” 按钮将图片发送到服务器：

```html
<body style="margin:0">
  <canvas id="canvasElem" width="100" height="80" style="border:1px solid"></canvas>
  <input type="button" value="Submit" onclick="submit()">

  <script>
    canvasElem.onmousemove = function(e) {
      let ctx = canvasElem.getContext('2d');
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
    };

    async function submit() {
      let blob = await new Promise(resolve => canvasElem.toBlob(resolve, 'image/png'));
      let response = await fetch('/article/fetch/post/image', {
        method: 'POST',
        body: blob
      });

      // 服务器给出确认信息和图片大小作为响应
      let result = await response.json();
      alert(result.message);
    }

  </script>
</body>
```

请注意，这里我们没有手动设置 Content-Type header，因为 Blob 对象具有内建的类型（这里是 image/png，通过 toBlob 生成的）。对于 Blob 对象，这个类型就变成了 Content-Type 的值。

### 总结 fetch 的使用形式

1. 使用两个 await 来获取 response 和 body，

   ```javascript
   let response = await fetch(url, options); // 解析 response header
   let result = await response.json(); // 将 body 读取为 json
   ```

1. 或者使用 promise 语法

   ```javascript
   fetch(url, options)
     .then(response => response.json())
     .then(result => /* process result */)
   ```

## FormData

FormData 是表示 HTML 表单数据的对象。

### FormData 方法

我们可以使用以下方法修改 FormData 中的字段：

- formData.append(name, value) —— 添加具有给定 name 和 value 的表单字段，
- formData.append(name, blob, fileName) —— 添加一个字段，就像它是 <input type="file">，第三个参数 fileName 设置文件名（而不是表单字段名），因为它是用户文件系统中文件的名称，
- formData.delete(name) —— 移除带有给定 name 的字段，
- formData.get(name) —— 获取带有给定 name 的字段值，
- formData.has(name) —— 如果存在带有给定 name 的字段，则返回 true，否则返回 false。

从技术上来讲，一个表单可以包含多个具有相同 name 的字段，因此，多次调用 append 将会添加多个具有相同名称的字段。

还有一个 set 方法，语法与 append 相同。不同之处在于 .set 移除所有具有给定 name 的字段，然后附加一个新字段。因此，它确保了只有一个具有这种 name 的字段，其他的和 append 一样：

- formData.set(name, value)，
- formData.set(name, blob, fileName)。

### formData 发送文件

表单始终以 Content-Type: multipart/form-data 来发送数据，这个编码允许发送文件。因此 <input type="file"> 字段也能被发送，类似于普通的表单提交。

```html
<form id="formElem">
  <input type="text" name="firstName" value="John">
  Picture: <input type="file" name="picture" accept="image/*">
  <input type="submit">
</form>

<script>
  formElem.onsubmit = async (e) => {
    e.preventDefault();

    let response = await fetch('/article/formdata/post/user-avatar', {
      method: 'POST',
      body: new FormData(formElem)
    });

    let result = await response.json();

    alert(result.message);
  };
</script>
```

::: tip 为什么这段代码不需要通过 JavaScript DOM API 就可以获取 form 元素
因为这段代码的行为是由 HTML 标准的一个特性支持的，这个特性就是"命名访问 on the Window 对象"。

根据 HTML 标准，当你在 HTML 文档中给元素（如`id`或`name`属性）设定一个名称，那么你就可以直接在全局`window`对象上通过这个名称来引用这个元素

这种方法很方便，但是也需要注意一些潜在的问题。比如，如果你声明一个与元素 id 或 name 属性相同名称的全局变量，那么这个变量会覆盖对应的 HTML 元素。同样，如果一个 HTML 元素和一个全局函数或者对象有相同的名称，那么这个 HTML 元素也可能会覆盖这个函数或者对象。
:::

### 发送具有 blob 的 FormData

正如我们在上面章节中所看到的，以 Blob 发送一个动态生成的二进制数据，例如图片，是很简单的。我们可以直接将其作为 fetch 参数的 body。

但在实际中，通常更方便的发送图片的方式不是单独发送，而是将其作为表单的一部分，并带有附加字段（例如 “name” 和其他 metadata）一起发送。

并且，服务器通常更适合接收多部分编码的表单（multipart-encoded form），而不是原始的二进制数据。

```html
<body style="margin:0">
  <canvas id="canvasElem" width="100" height="80" style="border:1px solid"></canvas>

  <input type="button" value="Submit" onclick="submit()">

  <script>
    canvasElem.onmousemove = function(e) {
      let ctx = canvasElem.getContext('2d');
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
    };

    async function submit() {
      let imageBlob = await new Promise(resolve => canvasElem.toBlob(resolve, 'image/png'));

      let formData = new FormData(); // [!code highlight]
      formData.append("firstName", "John"); // [!code highlight]
      formData.append("image", imageBlob, "image.png"); // [!code highlight]

      let response = await fetch('/article/formdata/post/image-form', {
        method: 'POST',
        body: formData
      });
      let result = await response.json();
    }

  </script>
</body>
```

## fetch 下载进度

::: warning
请注意：到目前为止，fetch 方法无法跟踪 上传 进度。对于这个目的，请使用 XMLHttpRequest，我们在后面章节会讲到。
:::

要跟踪下载进度，我们可以使用 response.body 属性。它是 ReadableStream —— 一个特殊的对象，它可以逐块（chunk）提供 body

```javascript
// 代替 response.json() 以及其他方法
const reader = response.body.getReader();

// 在 body 下载时，一直为无限循环
while(true) {
  // 当最后一块下载完成时，done 值为 true
  // value 是块字节的 Uint8Array
  const {done, value} = await reader.read();

  if (done) {
    break;
  }

  console.log(`Received ${value.length} bytes`)
}
```

更多案例可见[此文](https://zh.javascript.info/fetch-progress)

## fetch 终止

### AbortController

有一个特殊的内建对象：AbortController。它不仅可以中止 fetch，还可以中止其他异步任务。

首先先创建一个 AbortController 对象：

```javascript
let controller = new AbortController();
```

控制器是一个极其简单的对象。

- 它具有单个方法 abort()，
- 和单个属性 signal，我们可以在这个属性上设置事件监听器。

当 abort() 被调用时：

- signal 会触发一个 abort 事件
- signal.aborted 会变成 true。

```javascript
let controller = new AbortController();
let signal = controller.signal;

signal.addEventListener('abort', () => alert("abort!"));
controller.abort(); // 中止！
alert(signal.aborted); // true
```

### fetch 中止

fetch 方法接受一个可选的 signal 选项，它可以设置为一个 AbortController 的 signal 属性。

```javascript
let controller = new AbortController();
fetch(url, {
  signal: controller.signal
});
```

当一个 fetch 被中止，它的 promise 就会以一个 error AbortError reject，因此我们应该对其进行处理，例如在 try..catch 中。

::: warning
因为是使用 await 进行的处理，如果 promise reject 了，我们还需要一层 try catch 来进行错误处理，而使用 promise 语法则不会这么麻烦，直接指定 then 后面的错误处理器即可
:::

如果我们有自己的与 fetch 不同的异步任务，我们可以使用单个 AbortController 中止这些任务以及 fetch。

在我们的任务中，我们只需要监听其 abort 事件：

```javascript
let urls = [...];
let controller = new AbortController();

let ourJob = new Promise((resolve, reject) => { // 我们的任务
  controller.signal.addEventListener('abort', reject);
});

let fetchJobs = urls.map(url => fetch(url, { // fetches
  signal: controller.signal
}));

// 等待完成我们的任务和所有 fetch
let results = await Promise.all([...fetchJobs, ourJob]);

// controller.abort() 被从任何地方调用，
// 它都将中止所有 fetch 和 ourJob
```

## 跨域 fetch

首先了解一下[跨域相关知识](./cross_domain.md)

而本文大部分的 cors 内容都可以在 [这里](../net/cors.md) 找到

## URL 对象

内建的 URL 类提供了用于创建和解析 URL 的便捷接口。

没有任何一个网络方法一定需要使用 URL 对象，字符串就足够了。我们并不是必须使用 URL。但是有些时候 URL 对象真的很有用。

创建一个新 URL 对象的语法：

```javascript
let url = new URL(href, [base]);
```

下面的两个命令是等效的

```javascript
let url1 = new URL('https://javascript.info/profile/admin');
let url2 = new URL('/profile/admin', 'https://javascript.info');

alert(url1); // https://javascript.info/profile/admin
alert(url2); // https://javascript.info/profile/admin
```

我们还可以访问 URL 的组件

```javascript
let url = new URL('https://javascript.info/url');

alert(url.protocol); // https:
alert(url.host);     // javascript.info
alert(url.pathname); // /url
```

有时候参数部分还会遇到特殊字符，我们需要对其进行编码

```javascript
let url = new URL('https://ru.wikipedia.org/wiki/Тест');

url.searchParams.set('key', 'ъ');
alert(url); //https://ru.wikipedia.org/wiki/%D0%A2%D0%B5%D1%81%D1%82?key=%D1%8A
```

## XMLHttpRequest

XMLHttpRequest 是一个内建的浏览器对象，它允许使用 JavaScript 发送 HTTP 请求。虽然它的名字里面有 “XML” 一词，但它可以操作任何数据，而不仅仅是 XML 格式。我们可以用它来上传/下载文件，跟踪进度等。

现如今，我们有一个更为现代的方法叫做 fetch，它的出现使得 XMLHttpRequest 在某种程度上被弃用。在现代 Web 开发中，出于以下三种原因，我们还在使用 XMLHttpRequest：

- 历史原因：我们需要支持现有的使用了 XMLHttpRequest 的脚本。
- 我们需要兼容旧浏览器，并且不想用 polyfill（例如为了使脚本更小）。
- 我们需要做一些 fetch 目前无法做到的事情，例如跟踪上传进度。

### XMLHttpRequest 异步使用

#### 发送请求

1. 首先创建一个 XMLHttpRequest 对象

   ```javascript
   let xhr = new XMLHttpRequest();
   ```

1. 初始化这个对象的配置

   ```javascript
   xhr.open(method, URL, [async, user, password])
   ```

   - method —— HTTP 方法，例如 GET，POST 等，
   - URL —— 请求的 URL，可以是 URL 对象或者是一个字符串
   - async —— 如果为 false，则请求是同步的，否则是异步的（默认值），
   - user, password —— 用户名和密码，用于基本 HTTP 认证（如果需要）。

   open 调用与其名称相反，不会建立连接。它仅配置请求，而网络活动仅以 send 调用开启。

1. 发送请求

   ```javascript
   xhr.send([body])
   ```

1. 监听 xhr 事件

   - load —— 当请求完成（即使 HTTP 状态为 400 或 500 等），并且响应已完全下载。
   - error —— 当无法发出请求，例如网络中断或者无效的 URL。
   - progress ——  在下载响应期间定期触发，报告已经下载了多少。

   ```javascript
   xhr.onload = function() {
     alert(`Loaded: ${xhr.status} ${xhr.response}`);
   };

   xhr.onerror = function() {
     alert(`Network Error`);
   };

   xhr.onprogress = function(event) {
     alert(`Received ${event.loaded} of ${event.total}`);
   };
   ```

#### 响应请求

一旦服务器有了响应，我们可以在以下 xhr 属性中接收结果：

- status
  HTTP 状态码（一个数字）：200，404，403 等，如果出现非 HTTP 错误，则为 0。
- statusText
  HTTP 状态消息（一个字符串）：状态码为 200 对应于 OK，404 对应于 Not Found，403 对应于 Forbidden。
- response（旧脚本可能用的是 responseText）
  服务器 response body。

我们还可以使用相应的属性指定超时（timeout），如果超时会触发 timeout 事件。

我们可以使用 xhr.responseType 属性来设置响应格式：

- `""`（默认）—— 响应格式为字符串，
- `"text"` —— 响应格式为字符串，
- `"arraybuffer"` —— 响应格式为 ArrayBuffer（对于二进制数据，请参见 ArrayBuffer，二进制数组），
- `"blob"` —— 响应格式为 Blob（对于二进制数据，请参见 Blob），
- `"document"` —— 响应格式为 XML document（可以使用 XPath 和其他 XML 方法）或 HTML document（基于接收数据的 MIME 类型）
- `"json"` —— 响应格式为 JSON（自动解析）。

例子：

```javascript
let xhr = new XMLHttpRequest();

xhr.open('GET', '/article/xmlhttprequest/example/json');

xhr.responseType = 'json';

xhr.send();

// 响应为 {"message": "Hello, world!"}
xhr.onload = function() {
  let responseObj = xhr.response;
  alert(responseObj.message); // Hello, world!
};
```

#### 终止请求

使用 xhr.abort() 方法可以中止请求。该方法会触发 abort 事件。

### XMLHttpRequest 同步使用

如果在 open 方法中将第三个参数 async 设置为 false，那么请求就会以同步的方式进行。

用例如下：

```javascript
let xhr = new XMLHttpRequest();

xhr.open('GET', '/article/xmlhttprequest/hello.txt', false);

try {
  xhr.send();
  if (xhr.status != 200) {
    alert(`Error ${xhr.status}: ${xhr.statusText}`);
  } else {
    alert(xhr.response);
  }
} catch(err) { // 代替 onerror
  alert("Request failed");
}
```

这看起来好像不错，但是很少使用同步调用，因为它们会阻塞页面内的 JavaScript，直到加载完成。在某些浏览器中，滚动可能无法正常进行。如果一个同步调用执行时间过长，浏览器可能会建议关闭“挂起（hanging）”的网页。

#### 设置请求头，获取响应头

这些内容请看 [https://zh.javascript.info/xmlhttprequest#httpheader](https://zh.javascript.info/xmlhttprequest#httpheader)

### 上传进度

progress 事件仅在下载阶段触发。

如果我们要上传的东西很大，那么我们肯定会对跟踪上传进度感兴趣。但是 `xhr.onprogress` 在这里并不起作用。

这里有另一个对象，它没有方法，它专门用于跟踪上传事件：`xhr.upload`。

它会生成事件，类似于 xhr，但是 xhr.upload 仅在上传时触发它们：

- `loadstart` —— 上传开始。
- `progress` —— 上传期间定期触发。
- `abort` —— 上传中止。
- `error` —— 非 HTTP 错误。
- `load` —— 上传成功完成。
- `timeout` —— 上传超时（如果设置了 timeout 属性）。
- `loadend` —— 上传完成，无论成功还是 error。

## 断点续传

使用 fetch 方法来上传文件相当容易。但是对于大文件，如果出现了网络问题，是没有内建的方法来实现续传的。

对于大文件（如果我们可能需要恢复），可恢复的上传应该带有上传进度提示。由于 fetch 不允许跟踪上传进度，我们将会使用 XMLHttpRequest。

我们有 xhr.upload.onprogress 来跟踪上传进度。但不幸的是，它不会帮助我们在此处恢复上传，因为它会在数据 被发送 时触发，但是服务器是否接收到了？浏览器并不知道。要恢复上传，我们需要 确切地 知道服务器接收的字节数。而且只有服务器能告诉我们，因此，我们将发出一个额外的请求。

1. 首先创建一个文件 ID，唯一标识我们的文件，其可以有以下的组成部分：

   - 文件名，
   - 文件大小，
   - 文件最后修改时间。

   这是为了确保文件的唯一性，也许这里也可以用文件的 MD5 值。

1. 向服务器发送一个请求，询问它已经有了多少字节，像这样：

   ```javascript
   let response = await fetch('status', {
     headers: {
       'X-File-Id': fileId
     }
   });

   // 服务器已有的字节数
   let startByte = +await response.text();
   ```

   这假设服务器通过 `X-File-Id` header 跟踪文件上传。应该在服务端实现。如果服务器上尚不存在该文件，则服务器响应应为 0。

1. 然后我们使用 `Blob` 和 `slice` 来发送从 `startByte` 开始的部分

   ```javascript
   xhr.open("POST", "upload", true);

   // 文件 id，以便服务器知道我们要恢复的是哪个文件
   xhr.setRequestHeader('X-File-Id', fileId);

   // 发送我们要从哪个字节开始恢复，因此服务器知道我们正在恢复
   xhr.setRequestHeader('X-Start-Byte', startByte);

   xhr.upload.onprogress = (e) => {
     console.log(`Uploaded ${startByte + e.loaded} of ${startByte + e.total}`);
   };

   // 文件可以是来自 input.files[0]，或者另一个源
   xhr.send(file.slice(startByte));
   ```

   服务器应该检查其记录，如果有一个上传的该文件，并且当前已上传的文件大小恰好是 `X-Start-Byte`，那么就将数据附加到该文件。

## 长轮询

为了与服务器保持持久的连接，我们有很多方式，比如：

- 长轮询（long polling）
- WebSocket
- Server-Sent Events

之后两种我们马上讨论

长轮询是与服务器保持持久连接的最简单的方式，它不使用任何特定的协议

### 常规轮询

常规轮询就是每隔一段时间发送请求，查看是否有新的消息，这又很多缺点：

- 消息传递的延迟最多为 10 秒（两个请求之间）。
- 即使没有消息，服务器也会每隔 10 秒被请求轰炸一次，即使用户切换到其他地方或者处于休眠状态，也是如此。就性能而言，这是一个很大的负担。

### 长轮询

如果客户端发送一个请求，服务器不是立即响应，而是等待直到有消息到来，然后再响应，如果连接丢失，可能是因为网络错误，浏览器会立即发送一个新请求。这就是长轮询。示例代码如下

```javascript
async function subscribe() {
  let response = await fetch("/subscribe");

  if (response.status == 502) {
    // 状态 502 是连接超时错误，
    // 连接挂起时间过长时可能会发生，
    // 远程服务器或代理会关闭它
    // 让我们重新连接
    await subscribe();
  } else if (response.status != 200) {
    // 一个 error —— 让我们显示它
    showMessage(response.statusText);
    // 一秒后重新连接
    await new Promise(resolve => setTimeout(resolve, 1000));
    await subscribe();
  } else {
    // 获取并显示消息
    let message = await response.text();
    showMessage(message);
    // 再次调用 subscribe() 以获取下一条消息
    await subscribe();
  }
}

subscribe();
```

::: warning 这段代码有没有因为递归次数过多导致栈溢出
不会，因为这是一个异步函数，当await的Promise被解决时，函数会恢复执行，但这并不在原来的调用栈之内，而是在一个新的、干净的栈中。这就减小了栈溢出的风险
:::

::: warning
服务器架构必须能够处理许多挂起的连接。

某些服务器架构是每个连接对应一个进程，导致进程数和连接数一样多，而每个进程都会消耗相当多的内存。因此，过多的连接会消耗掉全部内存。
:::

## WebSocket

### WebSocket 基础

WebSocket 协议提供了一种在浏览器和服务器之间建立持久连接来交换数据的方法。数据可以作为“数据包”在两个方向上传递，而无需中断连接也无需额外的 HTTP 请求。

对于需要连续数据交换的服务，例如网络游戏，实时交易系统等，WebSocket 尤其有用。

要打开一个 WebSocket 连接，我们需要在 url 中使用特殊的协议 `ws` 创建 `new WebSocket`

::: warning 始终使用 `wss://`
`wss://` 协议不仅是被加密的，而且更可靠。

因为 `ws://` 数据不是加密的，对于任何中间人来说其数据都是可见的。并且，旧的代理服务器不了解 WebSocket，它们可能会因为看到“奇怪的” header 而中止连接。

另一方面，`wss://` 是基于 TLS 的 WebSocket，类似于 HTTPS 是基于 TLS 的 HTTP），传输安全层在发送方对数据进行了加密，在接收方进行解密。因此，数据包是通过代理加密传输的。它们看不到传输的里面的内容，且会让这些数据通过。
:::

一旦 socket 被建立，我们就应该监听 socket 上的事件。一共有 4 个事件：

- `open` —— 连接已建立，
- `message` —— 接收到数据，
- `error` —— WebSocket 错误，
- `close` —— 连接已关闭。

……如果我们想发送一些东西，那么可以使用 socket.send(data)。

### 建立过程

当 `new WebSocket(url)` 被创建后，它将立即开始连接。

在连接期间，浏览器（使用 header）问服务器：“你支持 WebSocket 吗？”如果服务器回复说“我支持”，那么通信就以 WebSocket 协议继续进行，该协议根本不是 HTTP。

这是由 `new WebSocket("wss://javascript.info/chat")` 发出的请求的浏览器 header 示例。

```http
GET /chat
Host: javascript.info
Origin: https://javascript.info
Connection: Upgrade
Upgrade: websocket
Sec-WebSocket-Key: Iv8io/9s+lYFgZWcXczP8Q==
Sec-WebSocket-Version: 13
```

- `Origin` —— 客户端页面的源，例如 `https://javascript.info`。WebSocket 对象是原生支持跨源的。没有特殊的 header 或其他限制。旧的服务器无法处理 WebSocket，因此不存在兼容性问题。但 Origin header 很重要，因为它允许服务器决定是否使用 WebSocket 与该网站通信。
- `Connection: Upgrade` —— 表示客户端想要更改协议。
- `Upgrade: websocket` —— 请求的协议是 “websocket”。
- `Sec-WebSocket-Key` —— 浏览器随机生成的安全密钥。
- `Sec-WebSocket-Version` —— WebSocket 协议版本，当前为 13。

::: tip
我们不能使用 XMLHttpRequest 或 fetch 来进行这种 HTTP 请求，因为不允许 JavaScript 设置这些 header。
:::

如果服务器同意切换为 WebSocket 协议，服务器应该返回响应码 101：

```http
101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: hsBlbuDTkk24srzEOTBUlZAlC2g=
```

### WebSocket 拓展

参见[这里](https://zh.javascript.info/websocket#kuo-zhan-he-zi-xie-yi)

### 原理（数据传输）

WebSocket 以 frame 为单位传输数据, frame 是客户端和服务端数据传输的最小单元。当一条消息过长时, 通信方可以将该消息拆分成多个 frame 发送, 接收方收到以后重新拼接、解码从而还原出完整的消息

在 WebSocket 中, frame 有多种类型, frame 的类型由 frame 头部的 Opcode 字段指示, WebSocket frame 的结构如下所示:

<img width='' src='https://camo.githubusercontent.com/e1f5fd50d58c8bd0db7fcca994f93f826cd49d3aeb2c2aa1f126451a51ed95a4/68747470733a2f2f706963312e7a68696d672e636f6d2f38302f76322d62316330343439376431333836383966366239653465363261323963303764305f373230772e77656270'>

frame 类型如下

- “text frames” —— 包含各方发送给彼此的文本数据。
- “binary data frames” —— 包含各方发送给彼此的二进制数据。
- “ping/pong frames” 被用于检查从服务器发送的连接，浏览器会自动响应它们。
- 还有 “connection close frame” 以及其他服务 frames。

在浏览器里，我们仅直接使用文本或二进制 frames。

WebSocket `.send()` 方法可以发送文本或二进制数据。当我们收到数据时，文本总是以字符串形式呈现。而对于二进制数据，我们可以在 Blob 和 ArrayBuffer 格式之间进行选择。它是由 `socket.binaryType` 属性设置的，默认为 `"blob"`，因此二进制数据通常以 Blob 对象呈现，但是对于二进制处理，要访问单个数据字节，我们可以将其改为 `"arraybuffer"`：

```javascript
socket.binaryType = "arraybuffer";
socket.onmessage = (event) => {
  // event.data 可以是文本（如果是文本），也可以是 arraybuffer（如果是二进制数据）
};
```

[GitHub 上关于 WebSocket 的文章](https://github.com/0voice/cpp_backend_awsome_blog/blob/main/%E3%80%90NO.23%E3%80%91%E4%B8%80%E7%AF%87%E6%96%87%E7%AB%A0%E5%BD%BB%E5%BA%95%E6%90%9E%E6%87%82websocket%E5%8D%8F%E8%AE%AE%E7%9A%84%E5%8E%9F%E7%90%86%E4%B8%8E%E5%BA%94%E7%94%A8%EF%BC%88%E4%B8%80%EF%BC%89.md)

### 高级应用（限速）

`socket.bufferedAmount` 属性储存了目前已缓冲的字节数，等待通过网络发送。

我们可以检查它以查看 socket 是否真的可用于传输。

```javascript
// 每 100ms 检查一次 socket
// 仅当所有现有的数据都已被发送出去时，再发送更多数据
setInterval(() => {
  if (socket.bufferedAmount == 0) {
    socket.send(moreData());
  }
}, 100);
```

### 和 HTTP/2 的比较

HTTP/2 可以在[这里](../net/HTTP_version.md#http-2-0)看到

- 模型：HTTP/2专注于优化多次单向请求，更强大的是Web性能优化；而WebSocket主要解决的问题是实时、双向的数据流，实现类似于Socket的通信方式。
- 用途：HTTP/2适用于提高网页性能，因为它减少了延迟，而且不需要多个TCP连接。WebSocket则对于需要实时双向通信的应用来说是理想选择，例如在线游戏、聊天应用程序和实时股票报价等。
- 性能：HTTP/2有可能在某些情况下更高效（比如在加载大量小文件时），因为它可以复用同一TCP连接。WebSocket可能在需要大量双向数据流的情况下更高效。

## Server Sent Events

这是一个内建的对象提供的 API，它能保持与服务器的连接，并允许从中接收事件。

和 WebSocket 区别是

| WebSocket       | Server Sent Events |
| --------------- | ------------------ |
| 双向通信            | 从服务器到客户端的单向通信      |
| 二进制和文本数据        | 仅支持文本数据            |
| 使用 WebSocket 协议 | 使用 HTTP/1.1 协议     |

更多信息可见[这里](https://zh.javascript.info/server-sent-events)
