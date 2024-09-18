---
title: WaveSurfer 频谱图加载与绘制流程
tag:
  - tools
date: 2024-08-25
---

## 频谱图如何绘制

这里简单介绍一下频谱图绘制的基本原理，不涉及编程内容

1. 获取音频文件

2. 将音频解析为为 PCM 格式

   > [!tip]
   >
   > PCM是一种将模拟信号转换为数字信号的方法。它通过定期采样音频波形的振幅，并将这些样本量化为离散的数字值来工作。他是一种无损、无压缩的音频格式,保留了原始音频信号的所有信息。
   >
   > 在提到 PCM 和 WAV 这种无损编码格式的时候，注意一些区别：
   >
   > - PCM 是一种编码方法，而WAV是一种文件格式。
   > - PCM 数据可以存储在多种文件格式中，不仅仅是 WAV。
   > - WAV 文件可以包含 PCM 数据，但也可以包含其他类型的音频数据。

3. 将 PCM 编码的文件进行快速傅里叶变换（fft），快速傅里叶变换的时候需要设置傅里叶变换的采样长度

   比如一个 176879 个采样点的音频，设置 `fftSample` 为 512 后，变换后剩下 1378 个时间段，两个相除差不多是 128，刚好是 fftsample 四分之一，之所以不是完全相等，是因为插件会设置一个 `noverlap` 来保证精确度，该字段会决定重叠部分的大小（重叠越高，精确度越高），这里的重叠部分就是四分之三，每次步进四分之一。

   > [!warning]
   >
   > fftSample 越大，计算出的频率越细致，同时也会导致时间维度上出现拖影变长，并且计算量变大

4. 因为画布可能不是无限长，所以需要经过重采样的步骤

   比如 1378 个时间段重采样到了 1216（画布的像素长度），如果不重采样，可能会导致画出来的频谱图颜色变淡（也许）

   重采样还是有很多算法的，这个和之前毕设做的插值算法还是有点关系的（毕竟要解决的都是缩放后坐标不匹配的问题），有双线性插值，lanczos 插值等

5. 最后将插值后的矩阵进行上色，这个过程可能会用到一些 colorMap，将强度映射到不同的颜色上，从而绘制出频谱图

## wavesurfer 频谱图具体绘制流程

1. 我们创建插件实例，注册到 `wavesurfer` 实例上，`wavesurfer` 实例会调用插件实例的 `onInit` 函数，这个过程涉及到 `SpectrogramPlugin` 类对 `BasePlugin` 类的 `onInit` 方法的重写

2. 在执行 `onInit` 的过程中，找到用户指定的 `container`（默认和 wavesurfer 实例共用一个 `container`），并且订阅了主波形图的重绘事件，每当其重绘之前插件实例也执行 `render` 操作

   虽说是订阅的重绘事件，但波形图第一次绘制也会触发重绘，因为 `wavesurfer` 实例也订阅了他自身的 `renderer` 的 `render` 事件。这个流程在前面的文章中提到过

   1. 构造函数中 wavesurfer 初始化播放器和渲染器的事件，主要体现是监听来自播放器和渲染器的事件
   2. 初始化插件，遍历构造函数传入的选项中的插件实例，调用他们的 `onInit` 方法
   3. 在 `onInit` 方法中插件实例监听来自 wavesurfer 实例的事件

3. `render` 之前我们要先获取频率数据，这个数据可以在用户指定 opts 的时候传入，但是文档中并没有说明，也许是还在开发中？若没有传入该信息，可以通过调用 `getFrequencies` 方法来获取频率信息，具体的代码如下：

   ```ts
   private render() {
     if (this.frequenciesDataUrl) {
       this.loadFrequenciesData(this.frequenciesDataUrl)
     } else {
       const decodedData = this.wavesurfer?.getDecodedData()
       if (decodedData) {
         this.drawSpectrogram(this.getFrequencies(decodedData))
       }
     }
   }
   ```

   频率数据是一个三维数组，第一维表示的是通道数；第二维表示时间轴上的采样点，每个元素表示一个时间窗口，这个维度的长度取决于音频长度和窗口的移动步长；第三维表示具体的频率信息，他的长度为 `fftSamples / 2`，每个元素是一个 `0-255` 的值，表示该频率的强度。

4. 获取到频率信息后，我们开始最终的绘制频谱图阶段。

   前面概括中提到，由于画布的长度限制，我们会对傅里叶变换后的数组进行重采样来适应画布的长度，源码见 [GitHub](https://github.com/katspaugh/wavesurfer.js/blob/main/src/plugins/spectrogram.ts#L714-L762)，这里的原理就不讲解，但是有一个可能比较常用的数学技巧，他是用来计算两个区间重叠部分的长度的

   ```typescript
   const overlap =
     oldEnd <= newStart || newEnd <= oldStart
       ? 0
       : Math.min(Math.max(oldEnd, newStart), Math.max(newEnd, oldStart)) -
         Math.max(Math.min(oldEnd, newStart), Math.min(newEnd, oldStart));
   ```

   如果老区间的尾部在新区间的前边，或者新区间的尾部在老区间的前边，都表示重叠部分为 0；否则如上面代码所示计算差值，但是上面的代码也有不足，他有冗余的判断，因此可以改写为

   ```typescript
   const overlap = Math.max(
     0,
     Math.min(oldEnd, newEnd) - Math.max(oldStart, newStart),
   );
   ```

   在重采样后，我们创建一个 `ImageData` 结构，并遍历刚才计算出来的频率信息矩阵，将强度映射到 `colorMap`，并且赋值到这个 imageData 中，最终将图片数据作为作为 bitmap 来绘制

   ```typescript
   createImageBitmap(imageData).then((renderer) => {
     spectrCc.drawImage(
       renderer,
       0,
       height * (1 - freqMax / freqFrom), // source x, y
       width,
       (height * (freqMax - freqMin)) / freqFrom, // source width, height
       0,
       height * c, // destination x, y
       width,
       height, // destination width, height
     );
   });
   ```

## 频谱图性能优化小记

在加载一个比较大的音频文件时，比如三分钟的彩云追月，同时搭配 zoom 插件来进行时间方向上的缩放，会明显感觉到卡顿，查看浏览器性能分析部分，可以看到快速傅里叶变换和重采样部分耗时最多，并且随着拉伸长度越长耗时越多（因为频谱图需要重采样的像素数更多），甚至可以达到 500ms，因此性能优化显得就很有必要了。这次优化方向为两个

1. 缓存 fft 的计算结果
2. 取消重采样

其中缓存部分很简单，设置一个闭包变量，渲染时若找到已经计算过的频谱信息，直接使用即可，否则根据音频 PCM 信息重新计算，这个过程大约能节省固定的 120ms

重采样是整个过程耗时的大头，他主要是为了解决数组长度和实际画布像素数不匹配的问题，我们可以使用最临近插值来加速重采样，但是可能会导致频谱图的失真，因此可以考虑借用浏览器内置的能力来实现，详情可见 [HTML living standing](https://html.spec.whatwg.org/multipage/canvas.html#drawing-images)，经过一番操作后，发现效果意外的不错，并且计算速度下降到了 50ms 左右，可以说快了十倍！
