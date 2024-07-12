---
title: 学习 Wavesurfer 的前置知识
tag:
  - tools
  - tech_blog
date: 2024-08-20
---

`WaveSurfer` 可以绘制一段声音的波形图（又称作振幅图），声音波形图一般是时间作为横坐标，声音大小（振幅）作为纵坐标，如下所示

![wavesurfer](https://2f0f3db.webp.li/2024/09/wavesurfer.png)

如果你对上面声音的各种概念不熟悉，现在来简单讲一下（下面摘抄自[博客园](https://www.cnblogs.com/yunhgu/p/14048309.html)）：

## 音频概念

1. 通道数（channel）
   又称声道数。是在采集（录制）声音时引入的概念，即用几个通道去录制声音。一般来说，单声道和双声道的音频文件较为常见。例如在声源的不同位置放置通道去录制，则可以获得多通道的音频数据。还有多通道音频（比如 5.1 环绕声）
1. 采样率（sampleRate）
   即每秒钟内采集的样本个数，每个通道分别采集。音频文件的采样率通常较高，例如 44100Hz、32000Hz 等。在 `WaveSurfer` 中默认采样率为 8000Hz
1. 位深（bitDepth）
   又称之为 量化精度、位宽，表示一个样本值采用多少 bit 来表示，用的bit越多则越接近样本的原值。例如若用 3 个bit表示，则只有 2 的 3 次方，也就是 8 个不同的值，而若用 16bit、24bit 或更多的 bit 去量化样本值，则表示的不同指就越多，从而音频听起来就更逼真。
   对于一个 3 分钟的双声道音频，采样率 44.1 kHz，位深 16 位：文件大小 ≈ 3 \* 60 \* 44100 \* 2 \* 2 ≈ 31.75 MB
   这是因为播放时间为 3 \* 60 = 180s，每次采样为 2byte \* 2 = 4byte（因为 16 位为两字节），乘以频率后即为答案
1. 帧数
   帧数也就是样本个数。对于“总帧数”要根据上下文来判断，可以是一个通道（声道）的总帧数，也可以是所有通道的总帧数。计算公式为：样本个数=文件的大小/位深精度/通道数。
1. 波形图
   又称振幅图，是音频的振幅（或能量）这个维度的图形表达。波形图的横坐标一般为时间，纵坐标一般为 dB (即分贝)来表示；有的时候只关心振幅的趋势，那就对振幅进行归一化为 `[-1,1]` 范围内。

## 基础 API

我们通常使用 `<audio>` 节点来播放一段音频，除了 HTML 声明外，我们还可以通过 `Audio` 构造函数来创建一个节点，然后加入到文档中。这个 `Audio` 构造函数返回的是一个 `HTMLAudioElement` 对象，该对象没有独特的属性，他的所有属性都继承自 `HTMLMediaElement` 和 `HTMLElement`，因此也可以访问比如 `currentSrc` 这些属性，常用的属性还包括

- [`src`](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/src)
- [`currentTime`](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/currentTime)
- [`duration`](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/duration)
- [`paused`](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/paused)
- [`muted`](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/muted)
- [`volume`](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/volume) 等

> [!tip]
>
> 这里的 `currentSrc` 和 `src` 是不一样的，如果我们从本地路径获取了一段二进制音频对象，这里的 `currentSrc` 就是那个相对路径，而 `src` 使我们将该 blob 对象使用 `createObjectURL` 转换后的路径

## Web Audio API

上面提供的 API 只能实现基本的播放，快进，跳转等功能，对于显示波形图还是无能为力的，但是 JavaScript 提供了 Web Audio API 来更进一步操作，正如 [MDN 文档](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API)所说

> Web Audio API 并不取代 `<audio>` 媒体元素，而是对其进行补充，正如 `<canvas>` 与 `<img>` 元素并存一样。您的使用场景将决定您采用何种工具来实现音频功能。若您仅需控制音频轨道的播放，`<audio>` 媒体元素提供了比 Web Audio API 更简便快捷的解决方案。若您需要进行更复杂的音频处理及播放，Web Audio API 则提供了更为强大的功能和精细的控制。

首先讲一点基础概念

### 音频节点

音频节点是 Web Audio API 中的基本构建块，每个节点执行一个特定的音频处理或生成任务，他们可以相互连接，形成一个音频处理网络或图。

音频节点有三类：

1. 输入节点（Source Nodes）：

   产生音频信号的节点。例如：`AudioBufferSourceNode`（播放预加载的音频），`OscillatorNode`（生成音调），`MediaElementAudioSourceNode`（连接到 `<audio>` 元素）。

1. 处理节点（Processing Nodes）：

   修改或分析通过它们的音频。例如：`GainNode`（控制音量，也被称作增益节点），`BiquadFilterNode`（应用音频滤波器），`DelayNode`（添加延迟）。

1. 输出节点（Destination Nodes）：

   音频的最终目的地。主要是 `AudioDestinationNode`，代表音频输出设备（如扬声器）。

连接节点需要使用节点实例的 `connect` 方法，参数节点表示下一个经过的节点，比如 source 类型的节点不能作为 `connect` 的参数，因为他们是起点节点。

同时还要注意，一个节点可以连接到多个不同的其他节点，形成一个音频图（网络），在后面混音的部分我们会看一个例子

### 音频上下文

我们前面提到的音频节点并不是凭空创建出来的，而是要在一个音频上下文中才能创建。音频上下文代表了一个完整的音频处理图，并且是所有音频节点创建和音频处理的环境或容器。主要功能如下：

1. 创建音频节点：可以通过 `createGain()`、 `createOscillator()`、`createBiquadFilter()` 等方法
1. 管理音频时间：提供了一个精确的时间线用于调度音频事件
1. 控制音频状态：比如控制音频的暂停开始等
1. 全局音频设置：比如采样率等

MDN 文档里面提供了一个比较好的[例子](https://codepen.io/Rumyra/pen/qyMzqN/?editors=0010)，我们这里也给一个 AI 生成的例子，第一个 `oscillator` 节点属于输入节点，第二个 `gainNode` 属于处理节点

```JavaScript
const audioContext = new AudioContext();

// 创建一个振荡器节点
const oscillator = audioContext.createOscillator();
oscillator.type = 'sine';
oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // 设置频率为 440Hz

// 创建一个增益节点
const gainNode = audioContext.createGain();
gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // 设置音量为一半

// 连接节点
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);

// 开始播放
oscillator.start();
```

再看一个我自己写的例子

```typescript
const loadBtnEl = document.querySelector("#load") as HTMLButtonElement;
const playBtnEl = document.querySelector("#play") as HTMLButtonElement;

let audioContext: AudioContext | undefined;
let audioBuffer: AudioBuffer | undefined;

loadBtnEl.addEventListener("click", async () => {
  audioContext = new AudioContext();
  const blob = await fetch("/example.wav").then((value) => value.blob());
  const arrayBuffer = await blob.arrayBuffer();
  audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
});

playBtnEl.addEventListener("click", () => {
  if (audioContext && audioBuffer) {
    const sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(audioContext.destination);
    sourceNode.start(0);
  }
});
```

> [!note]
>
> 由于浏览器的自动播放策略，上面的音频实际上没法直接播放，需要用户执行一些其他的操作（比如点击播放按钮）才能播放，详情可以看[浏览器自动播放策略](https://developer.chrome.com/blog/autoplay/#webaudio)
>
> 因此上面我写的代码里面并没有在最外层创建 AudioContext，而是在用户点击一个按钮后才创建，就是为了避免浏览器爆出 warning（恼人的谷歌浏览器）

### `BufferSourceNode`

表现为一个音频源，它包含了一些写在内存中的音频数据，通常储存在一个 ArrayBuffer 对象中

创建方法：

```JavaScript
const sourceNode = ctx.createBufferSource();
```

提供数据：

```JavaScript
sourceNode.buffer = buffer;
```

例：

```JavaScript
function playBuffer(buffer) {
  const sourceNode = ctx.createBufferSource();
  sourceNode.buffer = buffer;
  sourceNode.connect(ctx.destination);
  sourceNode.start(0);
}
```

#### start() 开始播放

```JavaScript
start(when, offset, duration)
```

- `when`: 何时开始播放（秒）（参数可省掉）
- `offset`: 音频的何处开始播放（秒）（参数可省掉）
- `duration`: 播放多长时间（参数可省掉）
- 返回值：无

例：

```JavaScript
sourceNode.start(ctx.currentTime + 5, 1.5, 3.0);
```

上述语句表示：5秒后开始播放（当前时间+5），从音频1.5秒开始，播放到4.5秒处停止（持续3.0秒）。

若 `when` 参数的值小于等于 `ctx.currentTime` ，则默认立即开始播放。下面 `stop()` 也一样。

#### stop() 结束

```JavaScript
stop(when)
```

- `when`: 何时结束（秒）（参数可省掉）
- 返回值：无

例：

```JavaScript
sourceNode.stop(ctx.currentTime + 5);
```

上述语句表示：5秒后结束（当前时间+5），然后**整个 SourceNode 就作废了**，要播放就需要重新创建对象。

#### loop / loopStart / loopEnd 循环播放设定

- `loop`: 是否循环播放
- `loopStart`: 循环开始点
- `loopEnd`: 循环结束点

例：

```JavaScript
sourceNode.loop = true;
sourceNode.loopStart = 2.2;
sourceNode.loopEnd = 6.0;
```

上述语句表示：2.2 秒到 6.0 秒是循环节，播放到 6.0 秒处立即返回 2.2 秒继续播放。

可以指定循环节位置，是 SourceNode 比 `<audio>` 更强大的地方之一。所以，在游戏开发中，即使背景音乐也应该用 Web Audio API 而不用 `<audio>`。

#### onended 播放完毕事件

- `onended`: 播放完毕后触发的事件

例：

```JavaScript
sourceNode.onended = function () {
  alert('播放完毕！');
};
```

### `GainNode`

- 用于调节音量
- 创建方法： `ctx.createGain()`
- 调音量： `gainNode.gain.value = 0.5`（取值范围 0.0-1.0）

例：（把上文以及上一节的 playBuffer() 加上音量功能）

```JavaScript
function playBuffer(buffer, volume) {
  const sourceNode = ctx.createBufferSource();
  sourceNode.buffer = buffer;
  const gainNode = ctx.createGain();
  gainNode.gain.value = volume;
  sourceNode.connect(gainNode);
  gainNode.connect(ctx.destination);
  sourceNode.start(0);
}
```

上述代码，Node 连接成 `sourceNode` -> `gainNode` -> `destination`。然后，可以随时通过修改 `gainNode.gain.value` 的值，来调节音量。

#### gain

- 使用 `gainNode.gain.value` 调音量。
- `gain` 是一个 `AudioParam` 对象，`gain.value` 才是音量的具体值（0.0-1.0）。
- **AudioParam** 是个 Audio API 特有的对象（下文分解↓↓）

### `AudioParam`

`AudioParam` 不是 Node，而是一个很有用的类。

某些 Node 的**数值型参数**可采用 AudioParam 记录数值。

AudioParam 不仅可以直接给 `value` 一个固定值，而且能让数值产生**渐变**效果，例如让音量从高慢慢变低，产生淡出效果。

#### value

- 直接改数值。

例：

```JavaScript
gainNode.gain.value = 0.5;
```

#### setValueAtTime()

```JavaScript
setValueAtTime(value, startTime)
```

- 在指定时间把数值改成指定值。
- value: 指定值。
- startTime: 指定时间。

例：

```JavaScript
gainNode.gain.setValueAtTime(0.5, ctx.currentTime + 0);
gainNode.gain.setValueAtTime(1.0, ctx.currentTime + 1);
```

上述代码将在0秒处设置关键帧，音量为0.5。然后在1秒处设置关键帧，音量为1.0。

音量与时间的关系如下图所示：

![setValueAtTime 线性图](https://2f0f3db.webp.li/2024/09/1.png)

#### linearRampToValueAtTime() 线性渐变

```JavaScript
linearRampToValueAtTime(value, endTime)
```

- 把数值**线性渐变**到指定值
- value: 指定值
- endTime: 指定时间

例：

```JavaScript
gainNode.gain.setValueAtTime(0.5, ctx.currentTime + 0);
gainNode.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 1);
```

上述代码将在0秒处设置关键帧，音量为0.5。然后在1秒处设置**线性渐变关键帧**，音量为1.0。于是从上一关键帧到该关键帧，音量将产生线性渐变效果。

音量与时间的关系如下图所示：

![linearRampToValueAtTime 线性图](https://2f0f3db.webp.li/2024/09/2.png)

#### exponentialRampToValueAtTime() 指数渐变

```JavaScript
exponentialRampToValueAtTime(value, endTime)
```

- 把数值**指数渐变**到指定值
- value: 指定值
- endTime: 指定时间

例：

```JavaScript
gainNode.gain.setValueAtTime(0.5, ctx.currentTime + 0);
gainNode.gain.exponentialRampToValueAtTime(1.0, ctx.currentTime + 1);
```

上述代码将在0秒处设置关键帧，音量为0.5。然后在1秒处设置**指数渐变关键帧**，音量为1.0。于是从上一关键帧到该关键帧，音量将产生指数渐变效果。

### DynamicsCompressorNode 动态压缩器

这是一个动态混音器，用于把多个音源实时混音，并防止爆音。

**创建方法：** `ctx.createDynamicsCompressor()`

**用法：** 直接把多个音源 connect 到这个Node即可。

例：

```JavaScript
const compressorNode = ctx.createDynamicsCompressor();
sourceNode1.connect(compressorNode);
sourceNode2.connect(compressorNode);
sourceNode3.connect(compressorNode);
compressorNode.connect(ctx.destination);
```

虽然可以把多个 Node 直接 connect 到 ctx.destination，但是不建议这么做，因为这样可能会出现爆音现象。若有同时播放多个声音的需求（例如一个游戏的各种音效），记得**通过 DynamicsCompressorNode 混合多个声音**。
