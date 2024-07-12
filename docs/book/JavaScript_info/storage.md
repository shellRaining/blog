---
title: JavaScript 中的持久化
tag:
  - book
  - javascript
date: 2024-07-29
---

## indexedDB

indexedDB 是浏览器内建的数据库，支持多种类型的 key，并且几乎支持所有的数据类型作为 value，除此之外支持索引和范围查询，支持事务，有更大的存储数据量。

### 创建一个数据库

通过 `indexedDB.open(name, version)` 可以打开一个数据库，第二个 version 参数是可选的，默认为 1。调用后返回一个 `openRequest` 对象类型，我们需要监听其上的事件。事件有三：

1. `success`

   表示数据库打开成功，我们可以通过 `openRequest` 对象的 `result` 字段获取数据库对象，如下

   ```JavaScript
   let openRequest = indexedDB.open("store", 1);
   openRequest.onsuccess = function() {
     let db = openRequest.result;
   };
   ```

2. `error`

   这里用来处理错误，不做详细讲解

3. `upgradeneeded`

   因为我们不能时刻访问客户端的 indexedDB 数据库，因此可能存在过期的风险，这里通过设置一个 version 来检查客户端已存在的数据库版本和脚本需要的数据库版本是否匹配，如果需求版本高于存在版本，就会触发该事件来进行升级操作

   > [!note]
   >
   > 如果客户端不存在 indexedDB 数据库，默认表示 version 为 0，新建一个数据库也会触发该事件，提醒我们进行初始化操作

   > [!caution]
   >
   > 如果需求低于存在版本，表示用户获取的脚本可能是过期的，这时候触发的就不是 upgradeneeded 事件，而是 error 事件。这种状况可能性很低，比如用户通过代理而不是源服务器来获取的脚本

### 对象库

和其他数据库类似，一个数据库中可能有多个`表`（或者`集合`），indexedDB 对应的概念就是`对象库`。一个对象库的 key 可以是数字、日期、字符串、二进制或数组类型，value 几乎可以是任意类型（除了自引用的对象，因为无法序列化）。

创建对象库的操作如下 `db.createObjectStore(name, opts)`，这个操作是同步的，不需要 `await`。

> [!caution]
>
> 只有在 `upgradeneeded` 事件中才可以创建对象存储库，这是技术原因上的限制。而对于增删改查对象库的内容，这些在任意时刻都是可以的。

删除对象库的操作如下 `db.deleteObjectStore(name)`

### 事务

事务是一组操作，要么全部成功，要么全部失败，所有的数据库操作都要在事务内进行。

事务有两种类型，`readonly` 和 `readwrite`，区分两种类型是为了性能优化。

使用事务分为四个步骤：

1. 创建一个事务，指定需要访问的对象库和事务类型
2. 通过 `transition.objectStore(name)` 来获取对象库
3. 使用 `add` 或者 `put` 方法来进行操作，前者仅用来添加，后者可以用来覆盖。并返回一个 request 对象
4. 通过监听第三步返回的对象事件来进行相应的处理

事务是自动提交的，当所有事务请求完成，并且微任务队列为空，那么先前创建的事务就会提交。因此下面的代码就是很有风险的，因为我们在两个请求之间隔了一个宏任务

```JavaScript
let request1 = books.add(book);

request1.onsuccess = function() {
  fetch('/').then(response => {
    let request2 = books.add(anotherBook); // (*)
    request2.onerror = function() {
      console.log(request2.error.name); // TransactionInactiveError
    };
  });
};
```

### 搜索

indexedDB 支持两种搜索，范围和索引

#### 范围搜索

这里的范围搜索其实是广义的范围，如果我们只给定一个 key 也可以理解为一个范围，indexedDB 有如下定义范围对象的方法

- `IDBKeyRange.lowerBound(lower, [open])` 表示：`≥lower`（如果 `open` 是 true，表示 `>lower`）
- `IDBKeyRange.upperBound(upper, [open])` 表示：`≤upper`（如果 `open` 是 true，表示 `<upper`）
- `IDBKeyRange.bound(lower, upper, [lowerOpen], [upperOpen])` 表示: 在 `lower` 和 `upper` 之间。如果 open 为 true，则相应的键不包括在范围中。

我们有了范围，就可以交给搜索的函数，搜索函数如下

- `store.get(query)` —— 按键或范围搜索第一个值。
- `store.getAll([query], [count])` —— 搜索所有值。如果 `count` 给定，则按 `count` 进行限制。
- `store.getKey(query)` —— 搜索满足查询的第一个键，通常是一个范围。
- `store.getAllKeys([query], [count])` —— 搜索满足查询的所有键，通常是一个范围。如果 `count` 给定，则最多为 count。
- `store.count([query])` —— 获取满足查询的键的总数，通常是一个范围。

```JavaScript
// 获取一本书
books.get('js')
// 获取 'css' <= id <= 'html' 的书
books.getAll(IDBKeyRange.bound('css', 'html'))
// 获取 id < 'html' 的书
books.getAll(IDBKeyRange.upperBound('html', true))
// 获取所有书
books.getAll()
// 获取所有 id > 'js' 的键
books.getAllKeys(IDBKeyRange.lowerBound('js', true))
```

#### 索引搜索

如果我们想要根据 value 对象的字段进行搜索，需要先创建一个索引。你可以将索引看做存储库的附加信息，创建一个索引的操作如下 `ObjectStore.createIndex(name, keypath, [opts])`，`name` 为索引名称，`keypath` 为我们要追踪的 value 对象的 key 名称，`opts` 可以用来指定追踪值的一些特性，比如是否唯一

> [!caution]
>
> 索引和对象库一样，只能在 `upgradeneeded` 事件中创建

```JavaScript
openRequest.onupgradeneeded = function() {
  // 在 versionchange 事务中，我们必须在这里创建索引
  let books = db.createObjectStore('books', {keyPath: 'id'});
  let index = books.createIndex('price_idx', 'price');

  let transaction = db.transaction("books"); // 只读
  let books = transaction.objectStore("books");
  let priceIndex = books.index("price_idx");

  let request = priceIndex.getAll(10);
  request.onsuccess = function() {
    if (request.result !== undefined) {
      console.log("Books", request.result); // 价格为 10 的书的数组
    } else {
      console.log("No such books");
    }
  };
};
```

索引中也可以使用范围来查询，详情请看 [JavaScript info](https://zh.javascript.info/indexeddb#tong-guo-shi-yong-suo-yin-de-zi-duan-sou-suo)

### 删除

删除可以全部删除和部分删除，前者使用 `ObjectStore.clear()`；后者可以先通过搜索找到对应键，然后删除，通过使用`delete(query)` —— 通过查询删除匹配的值。
