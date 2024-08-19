# wavesurfer 生命周期

一个 wavesurfer 的实例生命周期从调用下面的方法开始

```typescript
wavesurfer = WaveSurfer.create({
  container: "#wavesurfer",
});
```

## 初始化播放后端

首先初始化播放器，有三种可能

1. 如果传入 `media` 属性，那么就用用户传入的 HTMLAudioElement
2. 否则查看 `backend` 属性，若为 `WebAudio` 则使用 wavesurfer 内置的播放后端
3. 否则就自建一个 HTMLAudioElement 节点来作为播放后端

## 初始化用户配置

顾名思义，和 neovim 插件的配置差不多，就是进行一个对象的合并

```typescript
    this.options = Object.assign({}, defaultOptions, options)
```

这个配置对象还会同时被传给 `renderer`

## 初始化渲染器对象

渲染器是 wavesurfer 的私有字段，用来管理渲染部分相关的内容（包括 DOM 挂载，代理用户触发事件并转发）

### DOM 结构

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

想要获取影子 DOM 内部的各种节点，必须先获取 `shadow-root`，直接对影子节点内部的节点执行 `querySelector` 是不能正常工作的。可以先在 `div.shadow` 节点上查找 `shadowRoot` 字段来获取影子根，然后通过 `querySelector` 查找想要的节点。

### 代理事件并转发

在上面的 DOM 结构之上，`renderer` 使用 `addEventListener` 监听了 `click`，`dbclick`，`scroll`，`drag` 等 DOM 事件，并转发为同名事件暴露出来，同时还暴露了表示状态改变的 `render`，`rendered` 事件

## 初始化各类事件

wavesurfer 实例事件分为了两类，播放器事件和渲染器事件

## 初始化注册插件

> [!warning]
>
> 如何实现的插件单例
>
> 答：没有实现单例

## 解析音频

`loadAudio` 函数中触发的事件流

`init` -> `load` -> `loading?` -> `decode` -> `ready`
