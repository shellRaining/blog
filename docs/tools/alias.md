---
title: rollup alias 插件
tag:
  - tools
date: 2024-07-01
---

## 简单介绍

首先我们需要知道 `alias` 是做什么的，我们在写代码的时候，经常会使用相对路径来进行引用，但是有时候会有 `../../../sth/mod` 这样的写法，前面跟着长长的相对路径符号，如果可以简化为 `@/sth/mod` 这样就好了，这种事情当然可以，通过在打包时处理引入路径，我们可以实现这种替换。

我们这次使用的是 `rollup` 工具，他本身是用来 JavaScript 代码打包的，比如我们写了一个入口文件，还有一堆依赖的函数或者类文件，可以通过 rollup 可以将其统一打包到一个文件中。这就是他本身的功能。对于一些更复杂的需求，可以指定 `rollup.config.js` 进行配置，比如 `input`，`output` 等，更多可以看官方文档 [https://cn.rollupjs.org/tutorial/#using-config-files](https://cn.rollupjs.org/tutorial/#using-config-files)

在打包过程中有一些特殊的过程，比如解析配置（options），分析导入路径（resolveId），转换源代码（transform）等，这些过程会调用同名的钩子函数，函数参数会提供一些上下文信息供我们使用。比如这次的 `alias` 任务，只需要使用 `resolveId` 钩子即可。

## rollup 插件

rollup 插件实际上就是一个对象，必须包含的字段为 `name`，表示插件的名称，同时，插件命名也是有规则的，对于 rollup 插件，必须以 `rollup-plugin-` 作为前缀，同时 `package.json` 中也要以此名为准。

同时，这个对象中还可以按照约定定义相应的钩子函数，每当到匹配的执行时机，这些钩子函数都会被调用。一个插件的样子如下：

```typescript
export default function resolveFirst() {
  return {
    name: "resolve-first",
    resolveId: {
      order: "pre",
      handler(source) {
        if (source === "external") {
          return { id: source, external: true };
        }
        return null;
      },
    },
  };
}
```

我们在 `rollup.config.js` 里面定义 `plugins` 字段的时候，只需要将导出的函数调用一下就好了。

```JavaScript
import myExample from './rollup-plugin-my-example.js';
export default ({
  plugins: [myExample()],
});
```

## alias 实现

因此只需要在解析路径时对传入的参数进行前缀匹配即可，代码如下：

```TypeScript
import { Plugin } from "rollup";

interface AliasOpts {
  entries: {
    [key: string]: string;
  };
}

export default function alias(opts: AliasOpts): Plugin {
  const { entries } = opts;
  return {
    name: "alias",
    resolveId(source, importer, options) {
      const aliasWords = Object.keys(opts.entries);
      const matchAlias = aliasWords.find((alias) => source.startsWith(alias));
      if (matchAlias) return source.replace(matchAlias, entries[matchAlias]);
      else return source;
    },
  };
}
```

这里代码倒不是最难的，而是整个工作流程。我们写的是 TypeScript 代码，用户肯定无法直接使用，因此也需要通过 rollup 进行打包，使用到的插件为 `@rollup/plugin-typescript`，这个插件还依赖 `typescript` 和 `tslib`。配置后还需要对 TypeScript 的编译进行配置，即编辑 `tsconfig.json`，包括 `declaration`，`module`，`moduleResolution` 等。最后需要调整 `package.json`，配置我们这个包的入口文件，入口声明文件，包类型等。最终就可以打包调试发布了。

本次实验的代码托管在了 [https://github.com/shellRaining/rollup-plugin-alias](https://github.com/shellRaining/rollup-plugin-alias)
