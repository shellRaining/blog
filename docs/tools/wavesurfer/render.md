## 前置知识

`WaveSurfer` 可以绘制一段声音的波形图（又称作振幅图），声音波形图一般是时间作为横坐标，声音大小（振幅）作为纵坐标，如下所示

如果你对上面声音的各种概念不熟悉，现在来简单讲一下（下面摘抄自[博客园](https://www.cnblogs.com/yunhgu/p/14048309.html)）：

### 音频概念

1. 通道数
   又称声道数。是在采集（录制）声音时引入的概念，即用几个通道去录制声音。一般来说，单声道和双声道的音频文件较为常见。例如在声源的不同位置放置通道去录制，则可以获得多通道的音频数据。还有多通道音频（比如 5.1 环绕声）
2. 采样率
   即每秒钟内采集的样本个数，每个通道分别采集。音频文件的采样率通常较高，例如 44100Hz、32000Hz 等。在 `WaveSurfer` 中默认采样率为 8000Hz
3. 位深
   又称之为 量化精度、位宽，表示一个样本值采用多少 bit 来表示，用的bit越多则越接近样本的原值。例如若用 3 个bit表示，则只有 2 的 3 次方，也就是 8 个不同的值，而若用 16bit、24bit 或更多的 bit 去量化样本值，则表示的不同指就越多，从而音频听起来就更逼真。
   对于一个 3 分钟的双声道音频，采样率 44.1 kHz，位深 16 位：文件大小 ≈ 3 _ 60 _ 44100 _ 2 _ 2 ≈ 31.75 MB
   这是因为播放时间为 3 _ 60 = 180s，每次采样为 2byte _ 2 = 4byte（因为 16 位为两字节），乘以频率后即为答案
4. 帧数
   帧数也就是样本个数。对于“总帧数”要根据上下文来判断，可以是一个通道（声道）的总帧数，也可以是所有通道的总帧数。计算公式为：样本个数=文件的大小/位深精度/通道数。
5. 波形图
   又称振幅图，是音频的振幅（或能量）这个维度的图形表达。波形图的横坐标一般为时间，纵坐标一般为 dB (即分贝)来表示；有的时候只关心振幅的趋势，那就对振幅进行归一化为 `[-1,1]` 范围内。

### 基础 API

我们通常使用 `<audio>` 节点来播放一段音频，除了 HTML 声明外，我们还可以通过 `Audio` 构造函数来创建一个节点，然后加入到文档中。这个 `Audio` 构造函数返回的是一个 `HTMLAudioElement` 对象，该对象没有独特的属性，他的所有属性都继承自 `HTMLMediaElement` 和 `HTMLElement`，因此也可以访问比如 `currentSrc` 这些属性，常用的属性还包括 [`src`](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/src)、[`currentTime`](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/currentTime)、[`duration`](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/duration)、[`paused`](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/paused)、[`muted`](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/muted) 和 [`volume`](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/volume) 等

> [!tip]
>
> 这里的 `currentSrc` 和 `src` 是不一样的，如果我们从本地路径获取了一段二进制音频对象，这里的 `currentSrc` 就是那个相对路径，而 `src` 使我们将该 blob 对象使用 `createObjectURL` 转换后的路径

### Web Audio API

上面提供的 API 只能实现基本的播放，快进，跳转等功能，对于显示波形图还是无能为力的，但是 JavaScript 提供了 Web Audio API 来更进一步操作，正如 [MDN 文档](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API)所说

> Web Audio API 并不取代 `<audio>` 媒体元素，而是对其进行补充，正如 `<canvas>` 与 `<img>` 元素并存一样。您的使用场景将决定您采用何种工具来实现音频功能。若您仅需控制音频轨道的播放，`<audio>` 媒体元素提供了比 Web Audio API 更简便快捷的解决方案。若您需要进行更复杂的音频处理及播放，Web Audio API 则提供了更为强大的功能和精细的控制。

首先讲一点基础概念

#### 音频节点

音频节点是 Web Audio API 中的基本构建块，每个节点执行一个特定的音频处理或生成任务，他们可以相互连接，形成一个音频处理网络或图。

音频节点有三类：

1. 输入节点（Source Nodes）：

   产生音频信号的节点。例如：`AudioBufferSourceNode`（播放预加载的音频），`OscillatorNode`（生成音调），`MediaElementAudioSourceNode`（连接到 `<audio>` 元素）。

2. 处理节点（Processing Nodes）：

   修改或分析通过它们的音频。例如：`GainNode`（控制音量，也被称作增益节点），`BiquadFilterNode`（应用音频滤波器），`DelayNode`（添加延迟）。

3. 输出节点（Destination Nodes）：

   音频的最终目的地。主要是 `AudioDestinationNode`，代表音频输出设备（如扬声器）。

#### 音频上下文

我们前面提到的音频节点并不是凭空创建出来的，而是要在一个音频上下文中才能创建。音频上下文代表了一个完整的音频处理图，并且是所有音频节点创建和音频处理的环境或容器。主要功能如下：

1. 创建音频节点：可以通过 `createGain()`、 `createOscillator()`、`createBiquadFilter()` 等方法
2. 管理音频时间：提供了一个精确的时间线用于调度音频事件
3. 控制音频状态：比如控制音频的暂停开始等
4. 全局音频设置：比如采样率等

MDN 文档里面提供了一个比较好的[例子](https://codepen.io/Rumyra/pen/qyMzqN/?editors=0010)，我们这里也给一个 AI 生成的例子

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

> [!note]
>
> 由于浏览器的自动播放策略，上面的音频实际上没法直接播放，需要用户执行一些其他的操作（比如点击播放按钮）才能播放，详情可以看[浏览器自动播放策略](https://developer.chrome.com/blog/autoplay/#webaudio)

## 音频处理

好了，讲了这么多，终于可以到 `WaveSurfer` 是如何处理音频这部分了，我们首先看一个最简单的使用例子，自顶向下的了解整个处理过程

```JavaScript
const wavesurfer = WaveSurfer.create({
  container: "#app",
  waveColor: "rgb(200, 0, 200)",
  progressColor: "rgb(100, 0, 100)",
  url: "./audio/ah.mp4",
});

wavesurfer.on("click", () => {
  wavesurfer.play();
});
```

我们通过一个静态方法创建了对象，然后为其添加了点击事件监听器，一旦点击网页上的波形图，就开始播放。再回头关注传入的对象，里面包含挂载到的最终位置，波形图颜色，进度条颜色，和音频文件位置四个属性，我们就从这个静态方法开始入手，其函数签名如下，传入参数类型[见 GitHub 链接](https://github.com/katspaugh/wavesurfer.js/blob/ca98b389ca5448d8fc0b646acbd90b3ddf3204ec/src/wavesurfer.ts#L10-L79)：

```TypeScript
  public static create(options: WaveSurferOptions) {}
```

这个静态方法实际上就是对构造函数的一个包装，也就是工厂函数……
