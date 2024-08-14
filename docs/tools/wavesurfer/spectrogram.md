## WaveSurfer 的频谱图绘制流程

1. 创建插件实例，注册到 `wavesurfer` 实例上，并调用插件实例的 `onInit` 函数，这个过程涉及到`SpectrogramPlugin` 类对 `BasePlugin` 类的 `onInit` 方法的重写

2. 在执行 `onInit` 的过程中，找到用户指定的 `container`（默认和 wavesurfer 实例共用一个 `container`），并且订阅了主波形图的重绘事件，每当其重绘后插件实例也执行 `render` 操作

   虽说是订阅的重绘事件，但波形图第一次绘制也会触发重绘，因为 `wavesurfer` 实例也订阅了他自身的 `renderer` 的 `render` 事件，整个流程如下

   1. `wavesurfer` 实例开始监听事件
   2. `wavesurfer` 为他自身的 `renderer`（渲染器）设置事件
   3. 初始化插件，遍历构造函数传入的选项中的插件实例，调用他们的 `onInit` 方法
   4. 插件实例注册他自身的事件

3. 获取频率数据，这个频率数据可以由外部传入，但是文档中并没有说明，也许是还在开发中？若没有传入该信息，通过 `getFrequencies` 方法来获取频率信息