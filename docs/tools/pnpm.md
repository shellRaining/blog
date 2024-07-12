---
title: 包管理工具的目录结构
tag:
  - tools
date: 2024-09-05
---

## npm 的目录结构

如果我们使用 npm 下载一个 `express`，然后查看 node_modules，会发现下面不止 `express` 一个目录，还有很多其他的包

```plaintext
node_modules
├── debug
├── express
├── ...
└── vary
```

这是因为 npm 采用扁平化的 node_modules，这会导致很多问题

1. 进行扁平化的算法比较复杂

2. 如果某些包拥有不同版本，他们必须在同一个目录进行复制

3. 因为 node 的模块查找机制，我们可以直接引用没有写在 `package.json` 依赖中的包，这就是著名的幽灵依赖问题

   比如上面的工程中我们只引入了 `express`，但是可以在源代码中直接写 `require('debug')`，这暂时没有问题，但是如果 `express` 更新或者删除了他的 `debug` 依赖模块，引入了一些破坏性的变更，就会导致我们的代码出问题

### npm 依赖解析

首先介绍一下 node 获取模块的解析规则，它使用一个称为 "Node.js module resolution algorithm" 的算法来解析模块。这个算法的主要步骤包括：

- 首先检查是否是核心模块
- 如果模块名以 '/' 、 './' 或 '../' 开头，则尝试直接加载文件
- 否则，从当前目录的 node_modules 开始，逐级向上查找，直到找到对应的模块或到达文件系统根目录

因此我们在源文件中引入一个模块的时候，会经历上述步骤，并最终在 node_modules 中找到我们需要的模块

对于模块自身的依赖，由于采用扁平化的 node_modules，在自身目录不包含 node_modules 的情况下，他会向上寻找，并找到他所在的 node_modules，然后在其中找到自己的依赖

### npm 处理版本冲突

比如我们项目中同时需要 `express@4.19.2` 和 `debug@1.0.0` 两个模块，而 `express@4.19.2` 同时依赖 `debug@2.6.9`，这时候就会陷入版本冲突的困境，我们无法在 node_modules 目录下放置同名的依赖，这时候我们自身的依赖会优先放置在 node_modules 下，而 `express` 自身的依赖则会放置在 `/node_modules/express/node_modules/debug` 目录下，也就是说这里放弃了扁平化，给 express 内部放置了一个新的 node_modules 目录来解析

## pnpm 的目录结构

### 软硬链接

pnpm 综合使用操作系统的软连接和硬链接来进行管理依赖，所谓软硬链接

- 软链接：可以理解为 Windows 系统中的快捷方式，存储的实际上是一条路径，如果源文件删除这个快捷方式会报废
- 硬链接：实质上是对磁盘上文件的直接引用，这里会涉及到 inode 等知识，暂不赘述

软链接可以用在目录上，而硬链接不可以，他只能用在文件类型上

### pnpm 依赖解析

```plaintext
.
├── index.js
├── node_modules
│   ├── .pnpm
│   │   ├── debug@2.6.9
│   │   │   └── node_modules
│   │   │       └── debug
│   │   ├── debug@4.3.6
│   │   │   └── node_modules
│   │   │       └── debug
│   │   ├── express@4.19.2
│   │   │   └── node_modules
│   │   │       └── express
│   │   └── ...
│   ├── debug -> .pnpm/debug@4.3.6/node_modules/debug
│   ├── express -> .pnpm/express@4.19.2/node_modules/express
│   └── ...
├── src/
└── README.md
```

如果在我们的工程目录下运行 tree 命令，可以看到类似上面的树形结构

举个例子，从 node 解析模块引用的角度来说，我们 src 目录下对 `express` 的引用，会直接从 `node_modules/express` 这个位置来获取源代码，而 `node_modules/express` 实际上是一个软链接，链接到 `node_modules/.pnpm/express@4.19.2/node_modules/express/` 目录，从而获取里面的源代码，`node_modules/.pnpm/express@4.19.2/node_modules/express/` 目录示例如下

```plaintext
express
├── index.js
├── lib
│   ├── ...js
│   └── view.js
└── package.json
```

同时还有另一个问题，express 也是有自己的依赖的，他该如何找到自己的依赖呢？node 解析路径是从当前目录开始找起，如果没有 node_modules 就向上层接着找，重复这一过程直到找到

举个例子，`node_modules/.pnpm/express@4.19.2/node_modules/express/lib/express.js` 文件引用了 `body-parser` 作为自己的依赖，在 `lib` 目录下没有找到 node_modules，就继续向上查找，直到 `node_modules/.pnpm/express@4.19.2`，在这个目录下有一个 node_modules，然后查看里面的依赖，刚好有一个 `body-parser` 模块，注意这个模块也是软链接，直指 `.pnpm` 下的对应模块

```plaintext
node_modules/.pnpm/express@4.19.2/node_modules
├── body-parser -> ../../body-parser@1.20.2/node_modules/body-parser
└── ...
```

> [!tip]
>
> `/node_modules/.pnpm/express@4.19.2/node_modules/express/index.js` 等源代码文件为什么不直接放置在 `/node_modules/.pnpm/express@4.19.2` 目录下面，而是作为依赖放置在 `/node_modules/.pnpm/express@4.19.2/node_modules` 目录下面？
>
> 这正是为了兼容性，这种结构更接近于如果直接使用 npm 安装 express 时的目录结构。这样做能很好地处理兼容性问题

### pnpm 处理版本冲突

相比 npm 那样一层层的嵌套，pnpm 显得优雅很多

假设我们有两个包 A 和 B，它们依赖于 lodash 的不同版本：

```plaintext
.pnpm/
├── A@1.0.0/
│   └── node_modules/
│       ├── A/
│       └── lodash -> ../../lodash@4.0.0/node_modules/lodash
├── B@1.0.0/
│   └── node_modules/
│       ├── B/
│       └── lodash -> ../../lodash@3.0.0/node_modules/lodash
├── lodash@3.0.0/
│   └── node_modules/
│       └── lodash/
└── lodash@4.0.0/
    └── node_modules/
        └── lodash/
```

在 `.pnpm` 下的所有模块都是以 `包名@版本号` 的形式来命名的，这样可以比 npm 做到更彻底的扁平化，并且仰仗软链接，A 和 B 都能找到对应的 lodash 的依赖

### pnpm 的硬链接

我们在 `.pnpm` 下的所有文件类型（除了 `package.json`），都会被存储到 pnpm 的全局存储路径，这个全局存储路径可以通过 `echo $PNPM_HOME` 命令看到

对于 `pnpm 9.9.0`，全局存储目录结构通常如下：

```plaintext
pnpm-store/
└── v3/
    └── files/
```

这里的 v3 v4 表示不同版本的存储格式。files 目录是存储的核心，它包含了所有包的实际内容：

```plaintext
v3/files/
├── 00/
│   ├── e7d3bec65f71100e...
│   └── f8b794d19e2e1dd7...
├── 01/
│   └── ...
├── 02/
│   └── ...
...
└── ff/
    └── ...
```

- 每个文件都以其内容的哈希值命名。
- 文件被组织在 256 个子目录中（00 到 ff），基于哈希的前两个字符。
