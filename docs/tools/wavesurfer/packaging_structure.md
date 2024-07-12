---
title: WaveSurfer 的打包结构
tag:
  - tools
date: 2024-09-02
---

## 项目整体结构

`wavesurfer` 是由本体的波形图还有一些插件组成，我们直接引入 `WaveSurfer` 类并实例化这个类，会生成一个波形图的 canvas，挂载到指定的 DOM 结构上显示出来。

但是这个波形图本身功能有限，不能够通过滚轮进行拉伸，或者进行区间播放等高级操作，为了增强本身的功能并保证拓展性和可维护性，`wavesurfer` 通过插件来实现这些目标。

想要使用这些插件，我们要看他在 npm 镜像中上传的项目结构还有 `package.json`

### 项目结构

```plaintext
.
├── LICENSE
├── README.md
├── dist
│   ├── plugins
│   │   ├── ...d.ts
│   │   ├── plugins
│   │   │   ├── ...d.ts
│   │   │   └── zoom.d.ts
│   │   ├── ...
│   │   ├── zoom.cjs
│   │   ├── zoom.d.ts
│   │   ├── zoom.esm.js
│   │   ├── zoom.js
│   │   └── zoom.min.js
│   ├── ...
│   ├── types.d.ts
│   ├── wavesurfer.cjs
│   ├── wavesurfer.d.ts
│   ├── wavesurfer.esm.js
│   ├── wavesurfer.js
│   └── wavesurfer.min.js
└── package.json
```

可以看到打包后的目录有一个最主要的 `dist` 目录，里面存放了所有编译后的代码（这个项目是 typescript 编写的），该目录下包含 `wavesurfer` 的主文件（还有一些引入的库文件，类型声明文件），还有一个 `plugins` 目录，里面存放的就是我们会引入的插件。

对于每个源 typescript 文件，都有对应的 `.d.ts` 类型声明文件，并且每个文件都有三种编译打包方式

1. `esm`：比较特殊，包含常规 `.js` 后缀和 `.esm.js` 后缀
2. `commonJS`：以 `.cjs` 为后缀
3. `umd`：以 `.min.js` 为后缀

同时除了条理清晰的部分，这个项目的打包还存在一些谜团（`v7.8.4`）

1. 在 `dist` 目录下有一个 `types.d.ts`，但我不知道这个是用来干啥的……
2. 为什么 `dist/plugins` 下面还存在着一个 `plugins` 目录，下面放着重复的类型声明文件，具体描述可以看我在 [GitHub 上提交的讨论](https://github.com/katspaugh/wavesurfer.js/discussions/3851)

### 入口文件

```JSON
{
  "name": "wavesurfer.js",
  "version": "7.8.4",
  "main": "./dist/wavesurfer.js",
  "module": "./dist/wavesurfer.js",
  "types": "./dist/wavesurfer.d.ts",
  "exports": {
    ".": {
      "import": "./dist/wavesurfer.esm.js",
      "types": "./dist/wavesurfer.d.ts",
      "require": "./dist/wavesurfer.cjs"
    },
    "./dist/plugins/*.js": {
      "import": "./dist/plugins/*.esm.js",
      "types": "./dist/plugins/*.d.ts",
      "require": "./dist/plugins/*.cjs"
    },
    "./plugins/*": {
      "import": "./dist/plugins/*.esm.js",
      "types": "./dist/plugins/*.d.ts",
      "require": "./dist/plugins/*.cjs"
    },
    "./dist/*": {
      "import": "./dist/*",
      "types": "./dist/*.d.ts",
      "require": "./dist/*.cjs"
    },
    "./dist/plugins/*.esm.js": {
      "import": "./dist/plugins/*.esm.js",
      "types": "./dist/plugins/*.d.ts",
      "require": "./dist/plugins/*.cjs"
    }
  },
}
```

可以看到 `main` 指定了入口文件，但是还有一个 `exports` 字段，这个字段优先级更高，详情可以看[阮一峰的教程](https://es6.ruanyifeng.com/#docs/module-loader%23package-json-%E7%9A%84-exports-%E5%AD%97%E6%AE%B5)，由于 `exports` 字段只有支持 ES6 的 Node.js 才认识，所以可以搭配 `main` 字段，来兼容旧版本的 Node.js。

所以我们可以像这样导入插件

```typescript
import FastSpectrogram from "wavesurfer.js/plugins/fast-spectrogram"; // 通过别名导入
import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram"; // 通过目录导入
```

如果想要通过别名导入，我们需要手动指定 `tsconfig.json` 中的 `moduleResolution` 为 `Node16` 及以上，因为前面也提到，不支持 ES6 的 node 版本是无法解析这种导入规则的，会让 typescript 的 LSP 语言服务器报错

## 打包过程

这个项目使用的是 rollup 进行打包，打包配置如下：

```JavaScript
const plugins = [typescript({ declaration: false }), terser({ format: { comments: false } })]

export default [
  {
    input: 'src/wavesurfer.ts',
    output: {
      file: 'dist/wavesurfer.esm.js',
      format: 'esm',
    },
    plugins,
  },
  ...glob
    .sync('src/plugins/*.ts')
    .map((plugin) => [
      {
        input: plugin,
        output: {
          file: plugin.replace('src/', 'dist/').replace('.ts', '.js'),
          format: 'esm',
        },
        plugins,
      },
    ])
    .flat(),
]

```

可以看到使用了两个插件，typescript 用来编译，terser 用来压缩文件，需要注意这个插件会默认使用 `tsconfig.json` 中的配置，我们可以在函数内传入用来覆盖的配置

在 `package.json` 中，用来构建的命令是 `"build": "npm run clean && tsc && rollup -c"`，可以看到在用 rollup 打包前先用 tsc 编译了一次，这时候已经生成了类型声明文件，如果在打包时候还生成类型声明文件，就会导致重复和文件结构混乱
