---
title: 大文件上传
tag:
  - javascript
  - interview_question
date: 2024-03-26
---

## 文件上传

首先要知道文件应该如何上传，一般过程如下：

1. 首先在 HTML 中创建一个 `<input type="file">` 元素，用户可以通过点击这个元素来选择文件，比如下面的代码

   ```html
   <form name="upload" method="POST" enctype="multipart/form-data" action="/upload">
     <input type="file" name="myfile">
     <input type="submit" name="submit" value="Upload (Resumes automatically)">
   </form>
   ```

1. 当用户点击上传时，我们拦截这个事件，首先获取文件 `let file = this.elements.myfile.files[0];`，有关这里 `this` 的指向，可以看[事件处理](../html/event.md)

1. 然后我们可以使用 `XMLHttpRequest` 或者 `fetch` 来上传文件，这里我们使用 `XMLHttpRequest`，代码如下

   ```javascript
   let xhr = new XMLHttpRequest();
   xhr.open("POST", "/upload", true);
   xhr.setRequestHeader("Content-Type", "multipart/form-data");
   xhr.send(file);
   ```

   ```javascript
   fetch("/upload", {
     method: "POST",
     headers: {
       "Content-Type": "multipart/form-data",
     },
     body: new FormData().append("myfile", file),
   });
   ```

更多网络请求部分可以看[网络请求](./network_request.md#fetch)

## 大文件上传

由于文件较大，如果单次上传时候网络不好，可能会导致上传失败，因此我们可以将文件分块上传，这样可以保证上传成功率。同时减轻服务器的压力，因为服务器不需要一次性处理大文件。

这个部分和[断点续传](./network_request.md#%E6%96%AD%E7%82%B9%E7%BB%AD%E4%BC%A0)有点类似，只是断点续传是在上传失败后继续上传，而大文件上传是将文件分块上传。

我们预先定义好单个切片大小，将文件切分为一个个切片，然后借助 http 的可并发性，同时上传多个切片。这样从原本传一个大文件，变成了并发传多个小的文件切片，可以大大减少上传时间，另外由于是并发，传输到服务端的顺序可能会发生变化，因此我们还需要给每个切片记录顺序

### 服务端

服务端负责接受前端传输的切片，并在接收到所有切片后合并所有切片，这里又引伸出两个问题

- 何时合并切片，即切片什么时候传输完成
- 如何合并切片

第一个问题需要前端配合，前端在每个切片中都携带切片最大数量的信息，当服务端接受到这个数量的切片时自动合并。或者也可以额外发一个请求，主动通知服务端进行切片的合并

第二个问题，这里可以使用 Node 的 读写流（readStream/writeStream），将所有切片的流传输到最终文件的流里

### 客户端

首先将文件分片，返回一个分片文件列表

```javascript
createFileChunk(file, size = SIZE) {
 const fileChunkList = [];
  let cur = 0;
  while (cur < file.size) {
    fileChunkList.push({ file: file.slice(cur, cur + size) });
    cur += size;
  }
  return fileChunkList;
},
```

然后将文件列表做一个映射，标识他们的顺序和唯一性

```javascript
const data = fileChunkList.map(({ file }, index) => ({
  chunk: file,
  hash: hash(file),
  filename: file.name,
  chunkName: `${file.name}-${index}`,
  size: file.size,
  chunkIndex: index,
  chunkCount: fileChunkList.length,
}));
```

最后使用 `XMLHttpRequest` 或者 `fetch` 上传文件，这里我们搭配 `Promise.all` 来并发上传

```javascript
const requestList = data.map(({ chunk, hash, filename, chunkName, size, chunkIndex, chunkCount }) => {
  const formData = new FormData();
  formData.append("chunk", chunk);
  formData.append("hash", hash);
  formData.append("filename", filename);
  formData.append("chunkName", chunkName);
  formData.append("size", size);
  formData.append("chunkIndex", chunkIndex);
  formData.append("chunkCount", chunkCount);
  return fetch("/upload", {
    method: "POST",
    body: formData,
  });
});

Promise.all(requestList).then(() => {
  // 上传完成
});
```

这里还可以使用 `all` 的并发限制版本。
