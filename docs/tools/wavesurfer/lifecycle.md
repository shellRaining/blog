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

## `constructor`

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

### 初始化插件

#### wavesurfer 实例行为

构造函数这里只初始化通过 options 传入的插件，我们通过手动调用 `registerPlugin` 不在其列，本质上也只是自动帮我们调用 `registerPlugin` 方法

```typescript
  private initPlugins() {
    if (!this.options.plugins?.length) return

    this.options.plugins.forEach((plugin) => {
      this.registerPlugin(plugin)
    })
  }
```

而 `registerPlugin` 这个函数，会调用插件的 `_init` 方法（该方法继承自 `BasePlugin` 类），并且将插件实例推入到一个插件队列中，最后注册插件的 `destroy` 事件，当插件销毁时，将他从队列中剔除

```typescript
  public registerPlugin<T extends GenericPlugin>(plugin: T): T {
    plugin._init(this)
    this.plugins.push(plugin)

    // Unregister plugin on destroy
    this.subscriptions.push(
      plugin.once('destroy', () => {
        this.plugins = this.plugins.filter((p) => p !== plugin)
      }),
    )

    return plugin
  }
```

#### 插件行为

上面调用插件的 `_init` 方法后，该方法会调用插件实例自身的 `onInit` 方法，来进行插件初始化，然后控制流结束，等待执行 wavesurfer 渲染的微任务

> [!warning]
>
> 注意和插件的构造函数过程区分开，构造函数是用来创建插件实例的，在这个过程中传给构造函数的 opts 会被解析并赋值给实例；而 `onInit` 方法中会处理一些和 wavesurfer 实例相关的初始化过程，比如确定 container，注册 wavesurfer 实例的一些事件等。
>
> 比如 spectrogram 插件
>
> ```typescript
> onInit() {
>  this.container = this.container || this.wavesurfer.getWrapper()
>  this.container.appendChild(this.wrapper)
> 
>  if (this.wavesurfer.options.fillParent) {
>    Object.assign(this.wrapper.style, {
>      width: '100%',
>      overflowX: 'hidden',
>      overflowY: 'hidden',
>    })
>  }
>  this.subscriptions.push(this.wavesurfer.on('redraw', () => this.render()))
> }
> ```
>
> 他就在 `onInit` 中初始化了 `container`，并且注册 wavesurfer 的 `redraw` 事件，以便在 wavesurfer 每次**渲染前**也进行一次渲染

### 加载音频

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

加载音频分为三步

1. 加载音频 blob
2. 加载音频 duration
3. 解析 blob 为 AudioBuffer

简单来看就是只做了这些任务

## `render` 渲染

在加载音频后，renderer 就会开始渲染，大致的流程如下

1. `render`
2. `renderChannel`
3. **`renderMultiCanvas`**
4. `draw`
5. `renderSingleCanvas`
6. `renderWaveform`
7. `renderLineWaveform`

虽然过程看着多，实际上只是把渲染任务的复杂度摊平到每个函数中来进行处理，每层只负责一个简单的事情。我们来依次讲解

### 一：渲染入口

入口主要有三个任务

1. 主处理和 DOM 节点样式相关的内容，比如 `wrapper` 的长度和高度，滚动条和进度条的显示等，大多是一些不可或缺的杂活
2. 因为一段音频可能有多条通道，所以可能会渲染多条通道，而这部分的复杂性我们交给下一个函数处理
3. 在渲染前后发射相应的事件，`render` 和 `rendered`，有意思的是，`wavesurfer` 订阅了 `render` 事件，并且转发为 `redraw` 事件，因此在波形图渲染之前，还会先执行订阅了 `redraw` 的事件处理器，比如频谱图的 `render` 方法

### 二：渲染单条通道

这部分着重处理单条通道音频的渲染，首先创建一个 div 节点作为 canvas 的容器，并且将这个容器挂载到 `wrapper` 节点上，因此多次调用这个函数就可以在 `wrapper` 上放置多条通道的容器，最终形成多条通道的渲染效果

### 三：渲染多个区块

由于音频处理和渲染非常耗时，对于长达几分钟的音乐处理比较力不从心，因此出现了 **`renderMultiCanvas`** 函数来解决这个问题（这也是我感觉处理最巧妙的部分）

1. 获得视口的像素长度，以及这段长度在整段 canvas 长度的占比，从而让整段 canvas 被切分成了几个不同的区块，并且计算出我们视口所在的区块下标，只需要渲染当前视口及其前后的三个区块即可
2. 监听横向滚动事件（一般是音频在播放过程中自动滚动，或者用户水平滚动），每次滚动时，就重新寻找当前视口区块下标，进行新的绘制过程，并且当绘制的区块超过十块时候，会清除所有的 canvas 节点，重新渲染三块节点，这是为了避免 canvas 过多导致页面负担过重
3. 设置了一个对象，标注所有被渲染的区块下标，这样当渲染一个区块的时候，如果这个区块下标在这个 cache 中，就不用再次渲染

### 四：渲染单个区块

这个函数其实是 `renderMultiCanvas` 的一个内部函数，单拎出来似乎不太好……

我们上面传参的时候始终传递的是整条通道音频 buffer，但是由于上面对 canvas 进行分块，我们可以考虑将这个 buffer 也分块，这也是这个函数做的唯一事情

### 五：渲染单个 canvas

主要做了

1. 创建单个 canvas 并设置他的样式
2. 绘制进度条（就是已经播放过的部分）
3. 渲染波形图，这部分的复杂度交给了下一个函数

### 六：准备渲染所需信息

这部分主要是从用户传入的 opts 中获取 canvas context 绘制所需要的信息，包括笔刷的颜色，竖向的拉伸比例，自定义的渲染函数，还有渲染样式等（`renderBarWaveform` 和 `renderLineWaveform` 之分）

### 七：最终渲染

这一步是最终过程，我们此时有一个通道的一部分波形数据（一个 `Float32Array[]` 结构），通过将 canvas 笔触逐步移动到波形的顶点，最后封闭图形，绘制出波形图
