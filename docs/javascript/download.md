---
title: 前端实现文件下载
tag:
  - javascript
  - interview_question
date: 2024-03-26
---

## HTML 的 a 标签

使用 HTML 的 `<a>` 标签：这是最简单和最直接的方法。你可以创建一个 `<a>` 标签，然后设置它的 `href` 属性为你想要下载的文件的 `URL`，`download` 属性为下载文件的名称。当用户点击这个链接时，浏览器就会开始下载文件。

```html
   <a href="file_url" download="file_name">Download</a>
```

其有一些缺陷：

1. 兼容性问题：download 属性在一些旧的或者特定的浏览器上可能不受支持，例如  IE 和部分版本的 Safari。
1. 安全风险：如果源文件的 URL 不受你的控制，那么下载的文件可能具有潜在的安全风险。
1. 无法实现跨域下载，因为 download 会失效（这是浏览器的行为），`download` 只在同源 URL 或 `blob:`、`data:` 协议起作用。

## window.open()

这个函数会打开一个新的浏览器窗口或者标签页，并加载指定的 URL。如果这个 URL 指向的是一个文件，那么浏览器就会开始下载这个文件。

```javascript
   window.open('file_url');
```

缺陷有：

1. 弹出窗口被阻止：许多浏览器都有内置的弹出窗口阻止器，这可能会阻止 window.open() 打开新窗口或标签页，除非这个函数是在用户操作（如点击或键盘事件）的事件处理函数中被调用的。
1. 无法自定义文件名：使用 `window.open()` 下载文件，你不能自定义下载的文件名，文件名通常由服务器决定。
1. 不适合大文件下载：如果文件较大，那么在文件开始下载之前，浏览器会先打开一个新的空白窗口或标签页，这可能会让用户感到困惑。

## window.location.href

可以把这个属性设置为你想要下载的文件的 URL，这会导致浏览器导航到这个 URL。如果这个 URL 指向的是一个文件，那么浏览器就会开始下载这个文件。

```javascript
   window.location.href = 'file_url';
```

## createObjectURL

该函数接受一个 blob 或者 file 对象，调用后返回一段 URL，我们可以将这个 URL 附加在 HTML 中的 a 标签上，然后点击下载

```javascript
// html
<a href="blob:{url}" download="filename.txt">Download File</a>

//JavaScript代码
const blob = new Blob(['Hello, World!'], { type: 'text/plain' });
const url = URL.createObjectURL(blob);
```

注意这个 URL 只存在于这个网页会话中，使用完URL后，需要手动释放。否则可能会导致内存泄漏和性能问题。

这里还提到了一个 blob 协议的问题，可以看参考

## 参考

- [https://juejin.cn/post/7175737242877427768](https://juejin.cn/post/7175737242877427768)
