---
title: JavaScript document
tag:
  - book
  - javascript
date: 2024-06-26
---

## 前置知识

JavaScript 本身是作为浏览器的语言开发的，但是后来在多种平台上实现了运行时，因此可以借由宿主平台提供不同的能力。比如浏览器平台能够提供操作文档各部分（DOM）的能力，node 平台可以提供服务端的功能。

JavaScript 的核心为 ECMAScript，它只包含语言自身的规范，并没有提供和平台相关的各种接口，比如输入输出等，这些能力都由宿主平台来提供，以浏览器为例，有一个 `window` 根对象，下面包含 `DOM` 类对象，`BOM` 类对象，还有 JavaScript 的语言核心（比如 Object Array）。

1. DOM
   - document
1. BOM
   - history
   - navigator
   - location
   - ...
1. JavaScript 核心能力
   - Object
   - Array
   - Function

我们这次只学习 `DOM` 相关的内容，相关的规范文件可以看 [DOM 官方规范](https://dom.spec.whatwg.org) 这个网页

## DOM 树的样子

我们网页上的每个元素（比如一个图片，一段文字）都是一个 DOM 节点，这些节点被有规律的组织成一棵树，就称作 DOM 树。通常 DOM 树以 `<html>` 元素为根，下面包含 `<head>` 和 `<body>` 两个子元素，比如

```html
<!doctype html>
<html>
  <head>
    <title>About elk</title>
  </head>
  <body>
    The truth about elk.
  </body>
</html>
```

这里的 `head` 就包含三个子元素，分别是文本类型节点 `↵␣␣`，元素类型节点 `title`，文本类型节点 `↵`。出于历史原因

1. `head` 节点前面的换行符和空格会被忽略，
1. `body` 节点下面的所有节点都会被重新放置到 `body` 节点的内部，并且处于最末尾的位置。

### 节点类型

一共有 12 种[节点类型](https://dom.spec.whatwg.org/#node)，我们通常用到四种

1. `document` 节点类型
1. `text` 节点类型
1. `comment` 节点类型
1. `element` 节点类型，即在 HTML 文件中写的各种标签（`<pre>`, `<div>` 等）

## JavaScript 操作 DOM

### 遍历（游走）

当获取到一个 DOM 节点后，可以通过下面的字段在 DOM 树中游走

1. `parentNode`
1. `previousSibling`，`nextSibling`
1. `firstChild`，`lastChild`，`childNodes`

注意游走的时候我们是不确定节点类型的，通常我们不关注包括注释节点，文本节点等内容，可以使用下面的字段

1. `parentElement`
1. `previousElementSibling`，`nextElementSibling`
1. `firstElementChild`，`lastElementChild`，`children`

这样遍历的时候只会选择那些 `element` 类型节点。

> 同时还会注意到，获取父节点的两个字段竟然不同，难道父节点可以不是 `element` 类型吗？
>
> 其实这是 `<html>` 节点的一个特例，我们通过 `document.documentElement` 来获取他，按理来说他没有父节点，他的 `parentNode` 应该返回 `null`，但实际上返回的是 `document`，因此特别使用 `parentElement` 来获取父元素。
>
> ```JavaScript
> while(elem = elem.parentElement) { // 向上，直到 <html>
>   alert( elem );
> }
> ```

### DOM 操作小甜点

对于一些特殊的元素，比如 `<table>`，DOM 规范提供了一些其他的字段来方便操作

1. `<table>`：提供了 `rows` 来操作 `<tr>` 的集合，`tHead`，`tFoot` 引用对应的元素
1. `<tr>`：提供了 `cells` 来操作 `<td>`，`<th>` 的集合

### 查找

上面的游走操作在所需元素相邻的时候比较好用，但是对于想获取某类元素，我们可以使用查找的 API 来加速这一过程。

#### query 类

包含两个函数 `elem.querySelectorAll` 和 `elem.querySelector`，他们都接受 CSS 选择器字符串作为参数，返回符合要求的所有元素

#### get 类

这类方法比较老了，但仍然是不可替代的，原因后面再说。

包含四个函数 `document.getElementById`，`elem.getElementsByClassName`，`elem.getElementsByTagName`，`document.getElementsByName`

除了通过 id 获取，剩下三个都是返回一个元素的集合。

#### 杂类

`elem.matches` 接受一个 CSS 选择器，判断当前节点是否符合要求，返回 boolean 类型

`elem.closest` 接受同上，判断当前节点符合要求的最近的祖先元素，包含自身

`elem.contains` 判断两个节点是否是包含关系

#### 不同点

query 类函数都是非实时的，返回的是一个快照，而 get 类都是实时的，例子如下：

```HTML
<div>First div</div>

<script>
  let divs1 = document.querySelectorAll('div');
  let divs2 = document.getElementsByTagName('div');
  alert(divs1.length); // 1
  alert(divs2.length); // 1
</script>

<div>Second div</div>

<script>
  alert(divs1.length); // 1
  alert(divs2.length); // 2
</script>
```

## 深入节点类型

### 节点层级

我们前面提到了四种节点类型，但是没有讨论他们的具体组织结构是怎样的，这里描述一下：

![dom hierarchy](https://zh.javascript.info/article/basic-dom-node-properties/dom-class-hierarchy.svg)

所有的节点都继承自抽象类 `EventTarget`，这个抽象类要求所有节点都由事件功能的支持。

`Node`也是抽象类，但是他多了我们上面讲的一些核心功能的接口，比如在树上遍历游走等， `nextSibling` 就是一个 getter 方法

`CharacterData` 亦是抽象类，被下面的 `Text` 和 `Comment` 类继承

`Document` 我们这里不介绍，他的子类的实例就是 `document` 对象

`Element` 类具体的实现了 `query 类`，`get 类` 等函数，因为浏览器不仅支持 HTML 文档，还要支持 XML 文档或者是 SVG 图像，因此他还是一个基类，并不经常出现。

之后就是我们最常用的 `HTMLElement`，有很多 HTML 元素都是他的实例（如 `<article>`，`<span>`）

对于一些承担特殊功能的元素，如 `input`，会有专门的类 `HTMLInputElement` 继承自 `HTMLElement`

### 节点内部字段

我们这里只简单讨论几个字段

1. `nodeType`
1. `innerHTML`，`outerHTML`，`textContent`，`nodeValue`
1. `tagName`，`nodeName`

### `nodeType`

`nodeType` 是一个数字，用来标识节点的类型，比如 1 就是元素，3 是文本节点，我们可以利用这个字段来判断节点的类型，但是还有更好（清晰）的方法，就是利用上面提到的节点层级，通过 `instanceof` 运算符判断

### 替换内部信息类

第二类字段可以用来获取或者修改元素的内容

`innerHTML` 会将元素内部的 HTML 以字符串形式返回，并且可以接受其他的 HTML 字符串并且替换内部原有的，但请注意

1. 如果新字符串中有 `script` 标签，是不会执行里面的脚本的。
1. 如果执行 += 操作，并不是附加 HTML 上去，而是会完全重写整个元素。

---

`outerHTML` 获取到的信息还包括自身的 tag，因此 `innerHTML` 可以视作其真子集，但同时修改 `outerHTML` 会有一点令人困惑，例子如下：

```html
<div>Hello, world!</div>

<script>
  let divEl = document.querySelector("div");
  // 使用 <p>...</p> 替换 div.outerHTML
  divEl.outerHTML = "<p>A new element</p>"; // (*)
  // 蛤！'div' 还是原来那样！
  alert(divEl.outerHTML); // <div>Hello, world!</div> (**)
</script>
```

1. 将原有的 div 元素移除文档
1. 将新的 HTML 插入到文档
1. `divEl` 还是引用被移除的那个元素，新的元素并没有被任何变量引用

---

`TextContent` 是更安全的获取与替换的字段，它只会获取元素的文本，并且修改时不会插入 HTML，仅仅插入给定的字符串，比如我们想显示用户输入的文本到文档中，如果使用 `innerHTML` 可能会导致 XSS 攻击

---

`nodeValue / data` 是给 `Comment` 和 `Text` 类型节点使用的，可以获取文本或者注释信息，比方说我们想实现模板的条件编译，可以这样写

```html
<!-- if isAdmin -->
<div>Welcome, Admin!</div>
<!-- /if -->
```

然后获取注释的内容进行判断是否编译

### `tagName` 和 `nodeName`

在对元素类型节点使用时没有区别，但是对文本节点或者注释节点使用就会有区别，`tagName` 会显示 `undefined`，但是 `nodeName` 会显示 `#comment`

### 总结

还有其他很多属性，比如 `hidden`，`id` 等，这里暂不赘述。

## HTML 元素特性和 DOM 属性

在 HTML 文件中，我们书写在标签内部的 `id` 等都属于特性（attributes），而在 JavaScript 中我们书写的 `el.id` 被称作 DOM 属性（properties）二者区别如下：

| 特性                    | 属性                                       |
| ----------------------- | ------------------------------------------ |
| 大小写不敏感            | 大小写敏感                                 |
| value 类型全部为 string | value 类型可以使 Boolean String 等多种格式 |

当一个元素有标准特性时，会自动生成相应的 DOM 属性，对于非标准的特性，需要通过下面的方法来获取或者修改，不能直接通过 DOM 属性（或者说点号操作符获取）

- `elem.hasAttribute(name)`
- `elem.getAttribute(name)`
- `elem.setAttribute(name, value)`
- `elem.removeAttribute(name)`

这里有一个特例，`el.href` 和 `elem.getAttribute('href')` 不一样，前者获取到的是完整的 URL，后者获取到的就是写在 HTML 文件中的东西

对于非标准的特性，HTML 规范可以用 `data-*` 这样的格式来描述，比如：

```html
<body data-about="Elephants">
  <script>
    alert(document.body.dataset.about); // Elephants
  </script>
</body>
```

## 更多 JavaScript 操作 DOM 的方法

之前我们介绍的操作方法都是在原有的 DOM 上进行的（比如遍历，查找，查看节点信息，完全替换节点内部 HTML）等，比较侧重**改**和**查**操作，我们没有方法来精细的操作一个节点的位置或者创建新节点，即**增**和**删**操作，本节将会补足这部分内容。

以在文档末尾添加一个 `hello world` 的 `p` 标签为例，我们可以使用 `createElement` 和 `createTextNode` 等方法来分别创建 `p` 标签和文本节点，然后通过使用插入方法将文本节点添加到元素节点上。常用的插入方法有：

1. `node.append(...nodes or strings)`
1. `node.prepend(...nodes or strings)`
1. `node.before(...nodes or strings)`
1. `node.after(...nodes or strings)`
1. `node.replaceWith(...nodes or strings)`

我们还想要删除某个节点，可以使用 `node.remove()` 方法

这里有个需求，如果我们需要把一个元素挪到另一个元素的后面，我们无须将其删除后重新添加到 DOM 中去，只需要调用 `after` 方法即可。

---

还有一些比较不常用的方法，比如 `DocumentFragment` 构造函数，创建一个模板元素，只有当他被真正添加到 DOM 节点中，里面的包括 `autoplay`，`script` 才会执行，[详情可见此处](https://zh.javascript.info/template-element)。

## 对类和样式的操作

别忘记了，document 规范可是包含了 DOM 规范和 CSSOM 规范的，所以对类和样式的操作也是必要的。

### 类操作

主要是两种方法

1. `className`：是个字符串，可以通过赋值直接修改类名，如果有多个类名，那么返回的是一个带有空格为间隔的字符串，所以处理时候要务必小心
1. `classList`：是一个特殊对象，具有一些方法来方便我们操作类
   1. `contains`：判断是否存在某个类名
   1. `toggle`：如果存在则移除，否则添加该类名
   1. `add`：添加该类名
   1. `remove`：移除该类名
   1. `replace`：替换类名

### 样式操作

样式操作常用的就只有一个，即对 `el.style.xxx` 进行操作，使用时候有一些注意点

1. 重置一个属性只需要将他的值设置为空字符串 `""`，或者使用 `elem.style.removeProperty` 方法

1. 对于有单位的属性，我们需要手动拼接字符串来加单位

1. `style` 属性只对内联的特性起作用，对内部样式表和外部样式表都不会感知，即如下例子：

   ```html
   <head>
     <style>
       body {
         color: red;
         margin: 5px;
       }
     </style>
   </head>
   <body>
     The red text
     <script>
       alert(document.body.style.color); // 空的
       alert(document.body.style.marginTop); // 空的
     </script>
   </body>
   ```

1. 获取样式使用 `getComputedStyle`，他返回的对象和 `style` 结构是一样的，但是返回的是\*\*解析 (resolved)\*\*样式，即 `em` 之类的相对单位会转化成 `px`。

## DOM 元素大小，定位，滚动

我们有时候想要获取某个 DOM 元素精确的长宽和位置，上面讲过的 `getComputedStyle` 可以使用，但是不同浏览器的实现不同，因此具有跨平台的问题，我们这里引入一些其他的概念和方法。先放一张总的概念图。

我们可以看到这里提到了 `offset` 和 `client` 两种名词，<del>在我看来，`offset` 表示的是和祖先之间关系，因此覆盖范围会更大，而 `client` 表示用户实际能看到的内容，因此处于内部</del>

### `offsetParent`，`offsetLeft`，`offsetTop`

![](https://zh.javascript.info/article/size-and-scroll/metric-offset-parent.svg)

`el.offsetParent` 表示离当前元素最近的祖先元素，这里的祖先元素是指

1. 最近的非 `static` 定位元素
1. `table` 或者 `td` `th`
1. `body` 元素

剩下的两个可以看图明白，我们平时 CSS 中使用的 `width` 和 `top` 和这个相同。

### `offsetWidth`，`offsetHeight`

![](https://zh.javascript.info/article/size-and-scroll/metric-offset-width-height.svg)

这个宽高包含元素自身的边框，其他没有什么好说的

### `clientLeft`，`clientRight`

没有滚动条的情况下，等同于边框的宽和高，否则应该还加上滚动条长宽

### `clientWidth`，`clientHeight`

![](https://zh.javascript.info/article/size-and-scroll/metric-client-width-height.svg)

没有 `padding` 的情况下，我们通过 CSS 设置的 `width` 就等于 `clientWidth`

### `scrollHeight`，`scrollWidth`，`scrollTop`

![](https://zh.javascript.info/article/size-and-scroll/metric-scroll-top.svg)

我们可以配合 `scrollTop` 做一些事情，比如检测是否滑动到最底部等。

---

### 相对屏幕的定位

上面提到的都是相对元素的定位，但有时候我们想要类似 `fixed` 的定位效果，就需要 `getBoundingClientRect` 函数，其获取效果如下图：

![](https://zh.javascript.info/article/coordinates/coordinates.svg)

我们这里获取到的就是 `x/y` 就可以命名为 `clientX/Y`，相对应的，还有 `pageX/Y`，这些值没有可以直接获取的函数，但可以通过 `scrollTop + y` 来计算。

我们这里通过元素获取坐标，反之也有一个函数 `elementFromPoint(x, y)`，可以获取指定坐标的元素，这个函数可以用来做一些开发者工具。

## 窗口高度和定位

这部分我确实没有用过，只记录自己感觉重要的东西吧。

获取当前界面整个文档的高度可以用 `window.innerHeight`，或者使用 `document.document.clientHeight`，前者带上滚动条，后者没有。按需使用即可。

---

对于文档的整个高度（包含由于太高而隐藏的部分），可以使用下面的魔法代码完成

```JavaScript
let scrollHeight = Math.max(
  document.body.scrollHeight, document.documentElement.scrollHeight,
  document.body.offsetHeight, document.documentElement.offsetHeight,
  document.body.clientHeight, document.documentElement.clientHeight
);
```

别问，问就是历史原因。

---

对于文档隐藏部分的高度，除了上面提到的 `el.scrollTop`外，还可以使用 `window.pageYOffset`，后者的兼容性更好。

这个属性是 `window.scrollY` 的别名，随意使用即可。

---

如果想要滚动到某个特定的位置，可以使用下面三个函数

- `scrollTo`：绝对定位滚动
- `scrollBy`：相对定位滚动
- `el.scrollIntoView`：将 `el` 元素显示到屏幕上，可以选择在顶部还是底部。
