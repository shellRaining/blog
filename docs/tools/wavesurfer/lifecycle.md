---
title: WaveSurfer 的生命周期
tag:
  - tools
date: 2024-08-20
---

## 生命周期中的各种事件

作为用户，可以使用到的 wavesurfer 实例上的事件包括：

1. `init`：初始化渲染器，初始化事件后发射该事件
2. `load`：开始加载音频 blob 前发射，同时在加载音频的过程中还会发射 `loading` 事件
3. `decode`：blob 加载后并解析成 ArrayBuffer 后发射
4. `render`：渲染之前发射
5. `rendered`：渲染之后发射
6. `ready`：首次渲染之后发射

后面我们会详细介绍生命周期中具体都做了什么

## 构造函数

一个 wavesurfer 的实例生命周期从调用下面的方法开始，这是一个工厂函数，是构造函数的一个包装

```typescript
wavesurfer = WaveSurfer.create({
  container: "#wavesurfer",
});
```

### 初始化播放后端

首先初始化播放器，有三种可能

1. 如果传入 `media` 属性，那么就用用户传入的 HTMLAudioElement
2. 否则查看 `backend` 属性，若为 `WebAudio` 则使用 wavesurfer 内置的播放后端
3. 否则就自建一个 HTMLAudioElement 节点来作为播放后端

### 初始化用户配置

和 neovim 插件的配置差不多，顾名思义，就是进行一个对象的合并

```typescript
this.options = Object.assign({}, defaultOptions, options)
```

这个配置对象还会同时被传给 `renderer`

### 初始化渲染器对象

`renderer`（渲染器）是 wavesurfer 的私有字段，用来管理渲染部分相关的内容（包括 DOM 挂载，代理用户触发事件并转发）

#### DOM 结构

renderer 实例会在用户传入的 `container` 下面新建一个 `div` 标签，并且在其下构建一个影子 DOM（open 类型），整体结构如下：

```HTML
<div class='container'>
 	<div class='shadow'>
    #shadow-root(open)
      <style>...</style>
      <div class="scroll" part="scroll">
        <div class="wrapper" part="wrapper">
          <div class="canvases" part="canvases"></div>
          <div class="progress" part="progress"></div>
          <div class="cursor" part="cursor"></div>
        </div>
      </div>
  </div>	 
</div>  
```

> [!tip]
>
> 想要获取影子 DOM 内部的各种节点，必须先获取 `shadow-root`，直接对影子节点内部的节点执行 `querySelector` 是不能正常工作的。可以先在 `div.shadow` 节点上查找 `shadowRoot` 字段来获取影子根，然后通过 `querySelector` 查找想要的节点。

#### 代理事件并转发

在上面的 DOM 结构之上，`renderer` 使用 `addEventListener` 监听了 `click`，`dbclick`，`scroll`，`drag` ，`resize` DOM 事件，并转发为同名事件暴露出来。

### 初始化各类事件

wavesurfer 实例事件分为了两类，播放器事件和渲染器事件

由于 wavesurfer 本身是继承自 `Player` 类，因此能够监听一些播放器的事件，比如 `play`，`pause` 等

```typescript
this.onMediaEvent('play', () => {
  this.emit('play')
  this.timer.start()
}),
```

而渲染器事件就是基于上面 `renderer` 实例暴露的事件进行操作的，以 `click` 事件为例

```typescript
this.renderer.on('click', (relativeX, relativeY) => {
  if (this.options.interact) {
    this.seekTo(relativeX)
    this.emit('interaction', relativeX * this.getDuration())
    this.emit('click', relativeX, relativeY)
  }
}),
```

### 初始化注册插件

这里只初始化通过 options 传入的插件，我们通过手动调用 `registerPlugin` 不在其列，本质上也只是自动帮我们调用 `registerPlugin` 方法

```typescript
  private initPlugins() {
    if (!this.options.plugins?.length) return

    this.options.plugins.forEach((plugin) => {
      this.registerPlugin(plugin)
    })
  }
```

### 解析音频

在构造函数的最后，我们可以解析音频了，但为了保证用户调用 `registerPlugin` 注册的插件能够被初始化，通过将其送到微任务队列中来保证代码执行顺序的正确性

```typescript
  Promise.resolve().then(() => {
    this.emit('init')
    const { peaks, duration } = this.options
    if (initialUrl || (peaks && duration)) {
      this.load(initialUrl, peaks, duration).catch(() => null)
    }
  })
```

## `load` 解析音频

加载音频分为三步

1. 加载音频 blob
2. 加载音频 duration
3. 解析 blob 为 AudioBuffer

简单来看就是只做了这些任务

## `render` 渲染

需要注意分布渲染
