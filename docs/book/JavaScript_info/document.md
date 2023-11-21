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
2. BOM
   - history
   - navigator
   - location
   - ...
3. JavaScript 核心能力
   - Object
   - Array
   - Function

我们这次只学习 `DOM` 相关的内容，相关的规范文件可以看 [DOM 官方规范](https://dom.spec.whatwg.org) 这个网页

## DOM 树的样子

我们网页上的每个元素（比如一个图片，一段文字）都是一个 DOM 节点，这些节点被有规律的组织成一棵树，就称作 DOM 树。通常 DOM 树以 `<html>` 元素为根，下面包含 `<head>` 和 `<body>` 两个子元素，比如

```html
<!DOCTYPE HTML>
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
2. `body` 节点下面的所有节点都会被重新放置到 `body` 节点的内部，并且处于最末尾的位置。

### 节点类型

一共有 12 种[节点类型](https://dom.spec.whatwg.org/#node)，我们通常用到四种

1. `document` 节点类型
2. `text` 节点类型
3. `comment` 节点类型
4. `element` 节点类型，即在 HTML 文件中写的各种标签（`<pre>`, `<div>` 等）

## JavaScript 操作 DOM

### 遍历（游走）

当获取到一个 DOM 节点后，可以通过下面的字段在 DOM 树中游走

1. `parentNode`
2. `previousSibling`，`nextSibling`
3. `firstChild`，`lastChild`，`childNodes`

注意游走的时候我们是不确定节点类型的，通常我们不关注包括注释节点，文本节点等内容，可以使用下面的字段

1. `parentElement`
2. `previousElementSibling`，`nextElementSibling`
3. `firstElementChild`，`lastElementChild`，`children`

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
2. `<tr>`：提供了 `cells` 来操作 `<td>`，`<th>` 的集合

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

#### **不同点**

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

<svg xmlns="http://www.w3.org/2000/svg" width="552" height="403" viewBox="0 0 552 403"><defs><style>@import url(https://fonts.googleapis.com/css?family=Open+Sans:bold,italic,bolditalic%7CPT+Mono);@font-face{font-family:'PT Mono';font-weight:700;font-style:normal;src:local('PT MonoBold'),url(/font/PTMonoBold.woff2) format('woff2'),url(/font/PTMonoBold.woff) format('woff'),url(/font/PTMonoBold.ttf) format('truetype')}</style></defs><g id="dom" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="dom-class-hierarchy.svg"><path id="Rectangle-9" fill="#FBF2EC" stroke="#DBAF88" stroke-width="2" d="M181 6h118v28H181z"/><path id="Rectangle-8" fill="#FBF2EC" stroke="#DBAF88" stroke-width="2" d="M181 74h118v28H181z"/><text id="EventTarget" fill="#AF6E24" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="200.9" y="24">EventTarget</tspan></text><text id="Node" fill="#AF6E24" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="225.6" y="91">Node </tspan></text><path id="Line-2" fill="#C06334" fill-rule="nonzero" d="M240.5 39.5l7 14h-6v17h-2v-17h-6l7-14z"/><path id="Rectangle-8-Copy" fill="#FBF2EC" stroke="#DBAF88" stroke-width="2" d="M181 144h118v28H181z"/><text id="Element" fill="#AF6E24" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="214.8" y="161">Element </tspan></text><path id="Line-2-Copy" fill="#C06334" fill-rule="nonzero" d="M240.5 109.5l7 14h-6v17h-2v-17h-6l7-14z"/><path id="Rectangle-8-Copy-4" fill="#FBF2EC" stroke="#DBAF88" stroke-width="2" d="M181 230h118v28H181z"/><text id="HTMLElement" fill="#AF6E24" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="200.4" y="247">HTMLElement </tspan></text><path id="Line-2-Copy-4" fill="#C06334" fill-rule="nonzero" d="M240.5 195.5l7 14h-6v17h-2v-17h-6l7-14zM72.5 158.5l7.273 13.86-5.999.117L74 183.98l.02 1-2 .04-.02-1-.226-11.503-5.998.118L72.5 158.5z"/><path id="Rectangle-8-Copy-6" fill="#FBF2EC" stroke="#DBAF88" stroke-width="2" d="M171 300h138v28H171z"/><text id="HTMLBodyElement" fill="#AF6E24" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="186" y="317">HTMLBodyElement </tspan></text><path id="Line-2-Copy-6" fill="#C06334" fill-rule="nonzero" d="M240.5 265.5l7 14h-6v17h-2v-17h-6l7-14z"/><path id="Rectangle-8-Copy-7" fill="#FBF2EC" stroke="#DBAF88" stroke-width="2" d="M1 300h138v28H1z"/><text id="HTMLInputElement" fill="#AF6E24" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="13.4" y="317">HTMLInputElement </tspan></text><path id="Line-2-Copy-7" fill="#C06334" fill-rule="nonzero" d="M159 261l-6.753 14.12-3.685-4.736-29.448 22.905-.79.614-1.227-1.578.79-.614 29.448-22.906-3.684-4.735L159 261z"/><path id="Rectangle-8-Copy-8" fill="#FBF2EC" stroke="#DBAF88" stroke-width="2" d="M339 300h138v28H339z"/><text id="HTMLAnchorElement" fill="#AF6E24" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="348.3" y="317">HTMLAnchorElement </tspan></text><path id="Line-2-Copy-8" fill="#C06334" fill-rule="nonzero" d="M312 261l15.305 3.28-3.749 4.684 29.069 23.255.78.625-1.249 1.562-.78-.625-29.069-23.254-3.748 4.685L312 261z"/><path id="Rectangle-8-Copy-2" fill="#FBF2EC" stroke="#DBAF88" stroke-width="2" d="M22 126h98v28H22z"/><text id="Document" fill="#AF6E24" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="42.2" y="144">Document </tspan></text><path id="Rectangle-8-Copy-2" fill="#FBF2EC" stroke="#DBAF88" stroke-width="2" d="M22 192h98v28H22z"/><text id="HTMLDocument" fill="#AF6E24" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="27.8" y="210">HTMLDocument </tspan></text><path id="Line-2-Copy-2" fill="#C06334" fill-rule="nonzero" d="M168 90l-8.862 12.902-2.905-5.251-34.749 19.224-.875.484-.968-1.75.875-.484 34.749-19.224-2.904-5.25L168 90z"/><path id="Rectangle-8-Copy-3" fill="#FBF2EC" stroke="#DBAF88" stroke-width="2" d="M369 126h118v28H369z"/><text id="CharacterData" fill="#AF6E24" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="381.2" y="144">CharacterData </tspan></text><path id="Line-2-Copy-3" fill="#C06334" fill-rule="nonzero" d="M314 91l15.648.379-2.813 5.299 36.634 19.439.883.468-.937 1.767-.884-.469-36.633-19.439-2.812 5.301L314 91zM458 159l13.93 7.138-4.836 3.552 9.712 13.218.592.806-1.612 1.184-.592-.806-9.712-13.218-4.834 3.553L458 159zM400 158l-1.376 15.592-5.11-3.146-8.662 14.078-.524.852-1.704-1.048.524-.852 8.663-14.078-5.11-3.143L400 158z"/><text id="Document-as-a-whole" fill="#C06334" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="6.6" y="235">Document as a whole</tspan></text><text id="&lt;input-type=&quot;…&quot;&gt;" fill="#C06334" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="13.4" y="341">&lt;input type="…"&gt;</tspan></text><text id="&lt;body&gt;" fill="#C06334" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="220.4" y="341">&lt;body&gt;</tspan></text><text id="&lt;a-href=&quot;…&quot;&gt;" fill="#C06334" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="365.8" y="341">&lt;a href="…"&gt;</tspan></text><text id="&lt;div&gt;...&lt;/div&gt;" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="192.6" y="188" fill="#AF6E24">&lt;</tspan> <tspan x="199.8" y="188" fill="#C06334">div</tspan> <tspan x="221.4" y="188" fill="#AF6E24">&gt;</tspan> <tspan x="228.6" y="188" fill="#DBAF88">...</tspan> <tspan x="250.2" y="188" fill="#AF6E24">&lt;/</tspan> <tspan x="264.6" y="188" fill="#C06334">div</tspan> <tspan x="286.2" y="188" fill="#AF6E24">&gt;</tspan></text><path id="Rectangle-8-Copy-3" fill="#FBF2EC" stroke="#DBAF88" stroke-width="2" d="M449 192h78v28h-78z"/><text id="Comment" fill="#AF6E24" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="463.8" y="210">Comment </tspan></text><text id="&lt;!--comment--&gt;" fill="#C06334" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="442.6" y="237">&lt;!--comment--&gt;</tspan></text><path id="Rectangle-8-Copy-3" fill="#FBF2EC" stroke="#DBAF88" stroke-width="2" d="M342 192h78v28h-78z"/><text id="Text" fill="#AF6E24" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="365.6" y="210">Text </tspan></text><text id="&quot;Hello&quot;" fill="#C06334" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="356.8" y="237">"Hello"</tspan></text></g></g></svg>

所有的节点都继承自抽象类 `EventTarget`，这个抽象类要求所有节点都由事件功能的支持。

`Node`也是抽象类，但是他多了我们上面讲的一些核心功能的接口，比如在树上遍历游走等， `nextSibling` 就是一个 getter 方法

`CharacterData` 亦是抽象类，被下面的 `Text` 和 `Comment` 类继承

`Document` 我们这里不介绍，他的子类的实例就是 `document` 对象

`Element` 类具体的实现了 `query 类`，`get 类` 等函数，因为浏览器不仅支持 HTML 文档，还要支持  XML 文档或者是 SVG 图像，因此他还是一个基类，并不经常出现。

之后就是我们最常用的 `HTMLElement`，有很多 HTML 元素都是他的实例（如  `<article>`，`<span>`）

对于一些承担特殊功能的元素，如 `input`，会有专门的类 `HTMLInputElement` 继承自 `HTMLElement`

### 节点内部字段

我们这里只简单讨论几个字段

1. `nodeType`
2. `innerHTML`，`outerHTML`，`textContent`，`nodeValue`
3. `tagName`，`nodeName`

### `nodeType`

`nodeType` 是一个数字，用来标识节点的类型，比如 1 就是元素，3 是文本节点，我们可以利用这个字段来判断节点的类型，但是还有更好（清晰）的方法，就是利用上面提到的节点层级，通过 `instanceof` 运算符判断

### 替换内部信息类

第二类字段可以用来获取或者修改元素的内容

`innerHTML` 会将元素内部的 HTML 以字符串形式返回，并且可以接受其他的 HTML 字符串并且替换内部原有的，但请注意

1. 如果新字符串中有 `script` 标签，是不会执行里面的脚本的。
2. 如果执行 += 操作，并不是附加 HTML 上去，而是会完全重写整个元素。

---

`outerHTML` 获取到的信息还包括自身的 tag，因此 `innerHTML` 可以视作其真子集，但同时修改 `outerHTML` 会有一点令人困惑，例子如下：

```html
<div>Hello, world!</div>

<script>
  let divEl = document.querySelector('div');
  // 使用 <p>...</p> 替换 div.outerHTML
  divEl.outerHTML = '<p>A new element</p>'; // (*)
  // 蛤！'div' 还是原来那样！
  alert(divEl.outerHTML); // <div>Hello, world!</div> (**)
</script>
```

1. 将原有的 div 元素移除文档
2. 将新的 HTML 插入到文档
3. `divEl` 还是引用被移除的那个元素，新的元素并没有被任何变量引用

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
```

## 更多 JavaScript 操作 DOM 的方法

之前我们介绍的操作方法都是在原有的 DOM 上进行的（比如遍历，查找，查看节点信息，完全替换节点内部 HTML）等，比较侧重**改**和**查**操作，我们没有方法来精细的操作一个节点的位置或者创建新节点，即**增**和**删**操作，本节将会补足这部分内容。

以在文档末尾添加一个 `hello world` 的 `p` 标签为例，我们可以使用 `createElement` 和 `createTextNode` 等方法来分别创建 `p` 标签和文本节点，然后通过使用插入方法将文本节点添加到元素节点上。常用的插入方法有：

1. `node.append(...nodes or strings)`
2. `node.prepend(...nodes or strings)`
3. `node.before(...nodes or strings)`
4. `node.after(...nodes or strings)`
5. `node.replaceWith(...nodes or strings)`

我们还想要删除某个节点，可以使用 `node.remove()` 方法

这里有个需求，如果我们需要把一个元素挪到另一个元素的后面，我们无须将其删除后重新添加到 DOM 中去，只需要调用 `after` 方法即可。

---

还有一些比较不常用的方法，比如 `DocumentFragment` 构造函数，创建一个模板元素，只有当他被真正添加到 DOM 节点中，里面的包括 `autoplay`，`script` 才会执行，[详情可见此处](https://zh.javascript.info/template-element)。

## 对类和样式的操作

别忘记了，document 规范可是包含了 DOM 规范和 CSSOM 规范的，所以对类和样式的操作也是必要的。

### 类操作

主要是两种方法

1. `className`：是个字符串，可以通过赋值直接修改类名，如果有多个类名，那么返回的是一个带有空格为间隔的字符串，所以处理时候要务必小心
2. `classList`：是一个特殊对象，具有一些方法来方便我们操作类
   1. `contains`：判断是否存在某个类名
   2. `toggle`：如果存在则移除，否则添加该类名
   3. `add`：添加该类名

### 样式操作

样式操作常用的就只有一个，即对 `el.style.xxx` 进行操作，使用时候有一些注意点

1. 重置一个属性只需要将他的值设置为空字符串 `""`，或者使用 `elem.style.removeProperty` 方法

2. 对于有单位的属性，我们需要手动拼接字符串来加单位

3. `style` 属性只对内联的特性起作用，对内部样式表和外部样式表都不会感知，即如下例子：

   ```html
   <head>
     <style> body { color: red; margin: 5px } </style>
   </head>
   <body>
   
     The red text
     <script>
       alert(document.body.style.color); // 空的
       alert(document.body.style.marginTop); // 空的
     </script>
   </body>
   ```

4. 获取样式使用 `getComputedStyle`，他返回的对象和 `style` 结构是一样的，但是返回的是**解析 (resolved)**样式，即 `em` 之类的相对单位会转化成 `px`。

## DOM 元素大小，定位，滚动

我们有时候想要获取某个 DOM 元素精确的长宽和位置，上面讲过的 `getComputedStyle` 可以使用，但是不同浏览器的实现不同，因此具有跨平台的问题，我们这里引入一些其他的概念和方法。先放一张总的概念图。

<svg xmlns="http://www.w3.org/2000/svg" width="670" height="602" viewBox="0 0 670 602"><defs><style>@import url(https://fonts.googleapis.com/css?family=Open+Sans:bold,italic,bolditalic%7CPT+Mono);@font-face{font-family:'PT Mono';font-weight:700;font-style:normal;src:local('PT MonoBold'),url(/font/PTMonoBold.woff2) format('woff2'),url(/font/PTMonoBold.woff) format('woff'),url(/font/PTMonoBold.ttf) format('truetype')}</style></defs><defs><linearGradient id="linearGradient-1" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#FFF"/><stop offset="100%" stop-color="#D1CFCD"/></linearGradient><linearGradient id="linearGradient-2" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#FFF"/><stop offset="100%" stop-color="#D1CFCD"/></linearGradient></defs><g id="dom" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="metric-all.svg"><text id="Introduction" fill="#643B0C" font-family="OpenSans-Bold, Open Sans" font-size="16" font-weight="bold"><tspan x="160" y="94">Introduction</tspan>  <tspan x="160" y="122" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">This Ecma Standard is based on several </tspan> <tspan x="160" y="141" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">originating technologies, the most well </tspan> <tspan x="160" y="160" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">known being JavaScript (Netscape) and </tspan> <tspan x="160" y="179" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">JScript (Microsoft). The language was </tspan> <tspan x="160" y="198" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">invented by Brendan Eich at Netscape and </tspan> <tspan x="160" y="217" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">first appeared in that company’s Navigator </tspan> <tspan x="160" y="236" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">2.0 browser. It has appeared in all </tspan> <tspan x="160" y="255" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">subsequent browsers from Netscape and </tspan> <tspan x="160" y="274" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">in all browsers from Microsoft starting with </tspan> <tspan x="160" y="293" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">Internet Explorer 3.0.</tspan> <tspan x="160" y="312" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">The development of this Standard started </tspan> <tspan x="160" y="331" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">in November 1996. The first edition of this </tspan> <tspan x="160" y="350" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">Ecma Standard was adopted by the Ecma </tspan> <tspan x="160" y="369" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">General Assembly of June 1997.</tspan> <tspan x="160" y="388" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">That Ecma Standard was submitted to ISO/</tspan> <tspan x="160" y="407" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">IEC JTC 1 for adoption under the fast-track </tspan> <tspan x="160" y="426" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">procedure, and approved as international </tspan> <tspan x="160" y="445" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">standard ISO/IEC 16262, in April 1998. The </tspan> <tspan x="160" y="464" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">Ecma General Assembly of June 1998 </tspan> <tspan x="160" y="483" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">approved the second edition of ECMA-262 </tspan> <tspan x="160" y="502" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">to keep it fully aligned with ISO/IEC 16262. </tspan> <tspan x="160" y="521" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">Changes between the first and the second </tspan> <tspan x="160" y="540" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">edition are editorial in nature.</tspan></text><path id="Rectangle-1" fill="#DBAF88" d="M491 162v290H117V162h374zm-25 25H142v240h324V187z"/><path id="Rectangle-2" stroke="#DBAF88" stroke-width="2" d="M141 62h326v500H141z"/><text id="scrollHeight" fill="#C06334" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal" transform="rotate(-90 592 310)"><tspan x="541.6" y="314.5">scrollHeight</tspan></text><text id="offsetHeight" fill="#C06334" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal" transform="rotate(-90 552 310)"><tspan x="501.6" y="314.5">offsetHeight</tspan></text><text id="scrollTop" fill="#C06334" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal" transform="rotate(-90 618 125)"><tspan x="580.2" y="129.5">scrollTop</tspan></text><path id="Line-27" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M466.5 62H640"/><path id="Line-28" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M492.5 163h92.14"/><path id="Line-29" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M492.5 451h92.14"/><path id="Line-33" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M467.5 189H640"/><path id="Line-32" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M467.5 427h72.14"/><path id="Line-26" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M466.5 561h148.14"/><path id="Line-25" fill="#C06334" fill-rule="nonzero" d="M605 64.5l7 14h-6v466h6l-7 14-7-14h6v-466h-6l7-14z"/><path id="Line-30" fill="#C06334" fill-rule="nonzero" d="M565 164.5l7 14h-6v255h6l-7 14-7-14h6v-255h-6l7-14z"/><text id="clientHeight" fill="#C06334" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal" transform="rotate(-90 510 304)"><tspan x="459.6" y="308.5">clientHeight</tspan></text><path id="Line-34" fill="#C06334" fill-rule="nonzero" d="M523 191.5l7 14h-6v206h6l-7 14-7-14h6v-206h-6l7-14z"/><text id="offsetTop" fill="#C06334" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal" transform="rotate(-90 104 83)"><tspan x="66.2" y="87.5">offsetTop</tspan></text><text id="clientLeft" fill="#166388" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal" transform="rotate(-90 130.5 237)"><tspan x="88.5" y="241.5">clientLeft</tspan></text><path id="Line-36" fill="#C06334" fill-rule="nonzero" d="M117 4.5l7 14h-6v128h6l-7 14-7-14h6v-128h-6l7-14z"/><path id="Line-31" fill="#C06334" fill-rule="nonzero" d="M631 64.5l7 14h-6v96.499l6 .001-7 14-7-14 6-.001V78.5h-6l7-14z"/><path id="Rectangle-14" fill="#FFF" d="M154 73h312v89H154z"/><path id="Rectangle-15" fill="#FFF" d="M154 451h312v93H154z"/><path id="Line-39" fill="#C06334" fill-rule="nonzero" d="M431 479.09l14 7-14 7-.001-6h-271.36l.001 6-14-7 14-7-.001 6h271.36l.001-6z"/><path id="Line-42" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M445.64 510v-84"/><path id="Line-43" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M141.64 510v-84"/><text id="clientWidth" fill="#C06334" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal"><tspan x="261.3" y="478">clientWidth</tspan></text><path id="Line-41" fill="#C06334" fill-rule="nonzero" d="M100 156.09l14 7-14 7v-6H18.639l.001 6-14-7 14-7-.001 6H100v-6z"/><text id="clientTop" fill="#166388" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal"><tspan x="147.7" y="178">clientTop</tspan></text><text id="offsetLeft" fill="#C06334" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal"><tspan x="17.5" y="154">offsetLeft</tspan></text><path id="Line-40" fill="#C06334" fill-rule="nonzero" d="M475 522.09l14 7-14 7-.001-6h-340.36l.001 6-14-7 14-7-.001 6h340.36l.001-6z"/><path id="Line-45" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M490.64 551V447"/><path id="Line-44" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M116.64 551V447"/><text id="offsetWidth" fill="#C06334" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal"><tspan x="258.3" y="516">offsetWidth</tspan></text><path id="Rectangle-233" stroke="#AF6E24" stroke-width="2" d="M1 1h668v600H1z"/><g id="Scrollbar" transform="translate(450 187)"><rect id="Rectangle-19" width="15" height="239" x=".5" y=".5" fill="#D1CFCD" stroke="#D1CFCD" rx="3"/><g id="Rectangle-18-+-Triangle-1"><rect id="Rectangle-18" width="15" height="19" x=".5" y=".5" fill="url(#linearGradient-1)" stroke="#D1CFCD" rx="3"/><path id="Triangle-1" fill="#7E7C7B" d="M8 7l3.2 6H4.8z"/></g><g id="Rectangle-18-+-Triangle-2" transform="matrix(1 0 0 -1 0 240)"><rect id="Rectangle-18" width="15" height="19" x=".5" y=".5" fill="url(#linearGradient-1)" stroke="#D1CFCD" rx="3"/><path id="Triangle-1" fill="#7E7C7B" d="M8 7l3.2 6H4.8z"/></g><g id="Rectangle-18-+-Triangle-3-+-Group" transform="translate(0 50)"><g id="Rectangle-18-+-Triangle-3" fill="url(#linearGradient-2)" stroke="#D1CFCD" transform="matrix(1 0 0 -1 0 51)"><rect id="Rectangle-18" width="15" height="50" x=".5" y=".5" rx="3"/></g><g id="Group" fill="#D1CFCD" stroke="#7E7C7B" transform="translate(4 20)"><path id="Rectangle-22" d="M.5.5h7v1h-7z"/><path id="Rectangle-23" d="M.5 3.5h7v1h-7z"/><path id="Rectangle-24" d="M.5 6.5h7v1h-7z"/><path id="Rectangle-25" d="M.5 9.5h7v1h-7z"/></g></g></g><g id="Group" transform="translate(115.676 162.5)"><g id="Line-4-+-Line-5" stroke="#166388" stroke-linecap="square" stroke-width="2" transform="translate(22.324 18.5)"><path id="Line-4" d="M2.5.5L0 6" transform="matrix(1 0 0 -1 0 6)"/><path id="Line-5" d="M5.5.5L3 6" transform="rotate(180 4.5 3)"/></g><g id="Line-4-+-Line-6" stroke="#166388" stroke-linecap="square" stroke-width="2" transform="matrix(1 0 0 -1 22.324 6.5)"><path id="Line-4" d="M2.5.5L0 6" transform="matrix(1 0 0 -1 0 6)"/><path id="Line-5" d="M5.5.5L3 6" transform="rotate(180 4.5 3)"/></g><path id="Line-49" fill="#166388" stroke="#166388" stroke-linecap="round" stroke-linejoin="bevel" stroke-width="2" d="M25.824 25.5h-25"/><path id="Line-50" fill="#166388" stroke="#166388" stroke-linecap="round" stroke-linejoin="bevel" stroke-width="2" d="M25.324 25V0"/><path id="Line-4" fill="#166388" fill-rule="nonzero" d="M19.328 21.676l.91.414 5.5 2.5.91.413-.589 1.296.09.198-.226.1-.102.227-.198-.09-.385.176-5.5 2.5-.91.414-.828-1.82.91-.414 4.297-1.954-3.797-1.726-.91-.413.828-1.821zM7.32 21.676l.828 1.82-.91.414-3.798 1.726 4.298 1.954.91.413-.827 1.821-.91-.414-5.5-2.5-.387-.176-.196.09-.103-.225-.225-.102.089-.198L0 25.003l.91-.413 5.5-2.5.91-.414z"/></g></g></g></svg>

我们可以看到这里提到了 `offset` 和 `client` 两种名词，<del>在我看来，`offset` 表示的是和祖先之间关系，因此覆盖范围会更大，而 `client` 表示用户实际能看到的内容，因此处于内部</del>

### `offsetParent`，`offsetLeft`，`offsetTop`


<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="597" height="520" viewBox="0 0 597 520"><defs><style>@import url(https://fonts.googleapis.com/css?family=Open+Sans:bold,italic,bolditalic%7CPT+Mono);@font-face{font-family:'PT Mono';font-weight:700;font-style:normal;src:local('PT MonoBold'),url(/font/PTMonoBold.woff2) format('woff2'),url(/font/PTMonoBold.woff) format('woff'),url(/font/PTMonoBold.ttf) format('truetype')}</style></defs><defs><linearGradient id="linearGradient-3" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#FFF"/><stop offset="100%" stop-color="#D1CFCD"/></linearGradient><linearGradient id="linearGradient-4" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#FFF"/><stop offset="100%" stop-color="#D1CFCD"/></linearGradient><pattern id="pattern-1" width="30" height="30" x="-12" y="-6" patternUnits="userSpaceOnUse"><use xlink:href="#image-2"/></pattern><image id="image-2" width="30" height="30" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAHqADAAQAAAABAAAAHgAAAADKQTcFAAAA/UlEQVRIDe3VXQ6DIAwA4LUea7uCIeFdD+f2bDReYbvGbqLOmmEEAQ2T8jJeDEnTr+VPaJrmnWVZmef58+IYbdtex3G8nxkHMZIeKRKoyRT4DKfAF5gb12BOfANz4VaYA3fCsXHsuu5GiG0IIV4AUPR9X50dhzGSHiny/3Kd+iPwvdnaqeZ8szWYTvYXfwzDUEgp936VwXFoXiO6QoQiYlXXtfeq/RK36VgVQijhU/LS13lonBOmAkKTquLN7zof0sQMUHPqlDreW/aQuCmnfy9Dkh5pBtbtx9hLtXrmd97jFPhyuLjxBaal4MQ1mBPfwFy4FebAnXBsPNnL9QFH9tNXxu42ugAAAABJRU5ErkJggg=="/></defs><g id="dom" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="metric-offset-parent.svg"><path fill="#FFF" d="M0 0h597v520H0z"/><path id="Rectangle-10" fill="url(#pattern-1)" fill-opacity=".5" stroke="#D1CFCD" stroke-width="3" d="M19.5 25.5h558v479h-558z"/><path id="Rectangle-1" fill="#DBAF88" d="M552 185v290H178V185h374zm-25 25H203v240h324V210z"/><text id="offsetTop:180px" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal" transform="rotate(-90 163 104.32)"><tspan x="100" y="108.82" fill="#C06334">offsetTop:</tspan> <tspan x="184" y="108.82" fill="#1C85B5">180px</tspan></text><text id="offsetLeft:180px" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal"><tspan x="34.3" y="179.32" fill="#C06334">offsetLeft:</tspan> <tspan x="126.7" y="179.32" fill="#1C85B5">180px</tspan></text><text id="Introduction" fill="#643B0C" font-family="OpenSans-Bold, Open Sans" font-size="16" font-weight="bold"><tspan x="223" y="247">Introduction</tspan>  <tspan x="223" y="275" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">This Ecma Standard is based on several </tspan> <tspan x="223" y="294" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">originating technologies, the most well </tspan> <tspan x="223" y="313" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">known being JavaScript (Netscape) and </tspan> <tspan x="223" y="332" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">JScript (Microsoft). The language was </tspan> <tspan x="223" y="351" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">invented by Brendan Eich at Netscape </tspan> <tspan x="223" y="370" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">and first appeared in that company’s </tspan> <tspan x="223" y="389" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">Navigator 2.0 browser. It has appeared </tspan> <tspan x="223" y="408" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">in all subsequent browsers from </tspan> <tspan x="223" y="427" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">Netscape and in all browsers from </tspan> <tspan x="223" y="446" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">Microsoft</tspan></text><path id="Line-40" fill="#C06334" fill-rule="nonzero" d="M179 26.5l7 14h-6v128.82h6l-7 14-7-14h6V40.5h-6l7-14z"/><path id="Line-41" fill="#C06334" fill-rule="nonzero" d="M163.41 179.91l14 7-14 7v-6H34.589l.001 6-14-7 14-7-.001 6H163.41v-6z"/><circle id="Oval-2" cx="203" cy="211" r="2" fill="#1C85B5"/><circle id="Oval-2" cx="179" cy="186" r="3" fill="#1C85B5"/><ellipse id="Oval-6" cx="364.25" cy="104" fill="#FBF2EC" stroke="#C06334" stroke-width="2" rx="100" ry="50"/><path id="Line" fill="#C06334" fill-rule="nonzero" d="M366 156.379v11.638h6l-7 14-7-14h6v-11.638h2z"/><text id="position:-absolute;" fill="#AF6E24" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal"><tspan x="296.5" y="95.793">position: absolute;</tspan> <tspan x="296.5" y="110.793">left: 180px;</tspan> <tspan x="296.5" y="125.793">top: 180px;</tspan></text><text id="offsetParent-&lt;MAIN&gt;-" fill="#AF6E24" font-family="PTMono-Bold, PT Mono" font-size="16" font-weight="bold"><tspan x="20.5" y="19.379">offsetParent &lt;MAIN&gt; </tspan></text><text id="&lt;DIV&gt;" fill="#AF6E24" font-family="PTMono-Bold, PT Mono" font-size="16" font-weight="bold"><tspan x="183.5" y="180.379">&lt;DIV&gt;</tspan></text><g id="Scrollbar" transform="translate(511 210)"><rect id="Rectangle-19" width="15" height="239" x=".5" y=".5" fill="#D1CFCD" stroke="#D1CFCD" rx="3"/><g id="Rectangle-18-+-Triangle-1"><rect id="Rectangle-18" width="15" height="19" x=".5" y=".5" fill="url(#linearGradient-3)" stroke="#D1CFCD" rx="3"/><path id="Triangle-1" fill="#7E7C7B" d="M8 7l3.2 6H4.8z"/></g><g id="Rectangle-18-+-Triangle-2" transform="matrix(1 0 0 -1 0 240)"><rect id="Rectangle-18" width="15" height="19" x=".5" y=".5" fill="url(#linearGradient-3)" stroke="#D1CFCD" rx="3"/><path id="Triangle-1" fill="#7E7C7B" d="M8 7l3.2 6H4.8z"/></g><g id="Rectangle-18-+-Triangle-3-+-Group" transform="translate(0 50)"><g id="Rectangle-18-+-Triangle-3" fill="url(#linearGradient-4)" stroke="#D1CFCD" transform="matrix(1 0 0 -1 0 51)"><rect id="Rectangle-18" width="15" height="50" x=".5" y=".5" rx="3"/></g><g id="Group" fill="#D1CFCD" stroke="#7E7C7B" transform="translate(4 20)"><path id="Rectangle-22" d="M.5.5h7v1h-7z"/><path id="Rectangle-23" d="M.5 3.5h7v1h-7z"/><path id="Rectangle-24" d="M.5 6.5h7v1h-7z"/><path id="Rectangle-25" d="M.5 9.5h7v1h-7z"/></g></g></g></g></g></svg>

`el.offsetParent` 表示离当前元素最近的祖先元素，这里的祖先元素是指

1. 最近的非 `static` 定位元素
2. `table` 或者 `td` `th`
3. `body` 元素

剩下的两个可以看图明白，我们平时 CSS 中使用的 `width` 和 `top` 和这个相同。

### `offsetWidth`，`offsetHeight`

<svg xmlns="http://www.w3.org/2000/svg" width="508" height="509" viewBox="0 0 508 509"><defs><style>@import url(https://fonts.googleapis.com/css?family=Open+Sans:bold,italic,bolditalic%7CPT+Mono);@font-face{font-family:'PT Mono';font-weight:700;font-style:normal;src:local('PT MonoBold'),url(/font/PTMonoBold.woff2) format('woff2'),url(/font/PTMonoBold.woff) format('woff'),url(/font/PTMonoBold.ttf) format('truetype')}</style></defs><defs><linearGradient id="linearGradient-1" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#FFF"/><stop offset="100%" stop-color="#D1CFCD"/></linearGradient><linearGradient id="linearGradient-2" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#FFF"/><stop offset="100%" stop-color="#D1CFCD"/></linearGradient></defs><g id="dom" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="metric-offset-width-height.svg"><path id="Rectangle-2" fill="#DBAF88" d="M420 130v290H30V130h390zm-25 25H55v240h340V155z"/><path id="Rectangle-1" stroke="#C06334" stroke-width="2" d="M359 177v199H76V177h283z"/><g id="scrollbar" transform="translate(379 155)"><rect id="Rectangle-19" width="15" height="239" x=".5" y=".5" fill="#D1CFCD" stroke="#D1CFCD" rx="3"/><g id="Rectangle-18-+-Triangle-1"><rect id="Rectangle-18" width="15" height="19" x=".5" y=".5" fill="url(#linearGradient-1)" stroke="#D1CFCD" rx="3"/><path id="Triangle-1" fill="#7E7C7B" d="M8 7l3.2 6H4.8z"/></g><g id="Rectangle-18-+-Triangle-2" transform="matrix(1 0 0 -1 0 240)"><rect id="Rectangle-18" width="15" height="19" x=".5" y=".5" fill="url(#linearGradient-1)" stroke="#D1CFCD" rx="3"/><path id="Triangle-1" fill="#7E7C7B" d="M8 7l3.2 6H4.8z"/></g><g id="Rectangle-18-+-Triangle-3-+-Group" transform="translate(0 50)"><g id="Rectangle-18-+-Triangle-3" fill="url(#linearGradient-2)" stroke="#D1CFCD" transform="matrix(1 0 0 -1 0 51)"><rect id="Rectangle-18" width="15" height="50" x=".5" y=".5" rx="3"/></g><g id="Group" fill="#D1CFCD" stroke="#7E7C7B" transform="translate(4 20)"><path id="Rectangle-22" d="M.5.5h7v1h-7z"/><path id="Rectangle-23" d="M.5 3.5h7v1h-7z"/><path id="Rectangle-24" d="M.5 6.5h7v1h-7z"/><path id="Rectangle-25" d="M.5 9.5h7v1h-7z"/></g></g></g><text id="border" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="21.9" y="75" fill="#C06334">border</tspan> <tspan x="29.1" y="89" fill="#1C85B5">25px</tspan></text><text id="padding" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="41.3" y="45" fill="#C06334">padding</tspan> <tspan x="52.1" y="59" fill="#1C85B5">20px</tspan></text><text id="content-width:284px" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="148.1" y="109" fill="#C06334">content width:</tspan> <tspan x="248.9" y="109" fill="#1C85B5">284px</tspan></text><text id="height:200px" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal" transform="rotate(-90 429.5 274)"><tspan x="386.3" y="278" fill="#C06334">height:</tspan> <tspan x="436.7" y="278" fill="#1C85B5">200px</tspan></text><path id="Line" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M360.5 175h88.142"/><path id="Line-2" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M360.5 377h88.142"/><path id="Line" fill="#C06334" fill-rule="nonzero" d="M442 177.5l7 14h-6V360h6l-7 14-7-14h6V191.5h-6l7-14z"/><path id="Line-15" fill="#C06334" fill-rule="nonzero" d="M345.5 110l14 7-14 7v-6H91.679l.001 6-14-7 14-7-.001 6H345.5v-6z"/><path id="Line-14" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M30.48 93v43"/><path id="Line-13" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M56.48 93v41"/><text id="border-2" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="385.9" y="76" fill="#C06334">border</tspan> <tspan x="393.1" y="90" fill="#1C85B5">25px</tspan></text><text id="padding-2" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="348.3" y="16" fill="#C06334">padding</tspan> <tspan x="359.1" y="30" fill="#1C85B5">20px</tspan></text><text id="scrollbar" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="358.1" y="48" fill="#C06334">scrollbar</tspan> <tspan x="376.1" y="62" fill="#1C85B5">16px</tspan></text><path id="Line-17" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M380.48 93v43"/><path id="Line-20" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M394.48 93v43"/><path id="Line-18" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M419.48 93v41"/><path id="Line-16" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M75.48 93v41"/><path id="Line-19" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M362.48 93v41"/><text id="offsetWidth-=-25+20+" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal"><tspan x="56.5" y="484" fill="#C06334">offsetWidth = </tspan> <tspan x="174.1" y="484" fill="#1C85B5">25+20+284+20+16+25 </tspan> <tspan x="333.7" y="484" fill="#C06334">=</tspan> <tspan x="342.1" y="484" fill="#1C85B5"> 390px</tspan></text><path id="Line-24" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M30.5 419v78"/><path id="Line-25" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M419.5 419v80"/><path id="Line-22" fill="#C06334" fill-rule="nonzero" d="M403 456.071l14 7-14 7v-6.001H47.089l.001 6.001-14-7 14-7-.001 5.999H403v-5.999z"/><text id="offsetHeight:290px" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal" transform="rotate(-90 483.5 280.5)"><tspan x="407.9" y="285" fill="#C06334">offsetHeight:</tspan> <tspan x="517.1" y="285" fill="#1C85B5">290px</tspan></text><path id="Line-27" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M417.5 131h88.142"/><path id="Line-28" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M417.5 420h88.142"/><path id="Line-26" fill="#C06334" fill-rule="nonzero" d="M469 132.59l7 14-6-.001V405.41h6l-7 14-7-14h6V146.589l-6 .001 7-14z"/><text id="Introduction" fill="#643B0C" font-family="OpenSans-Bold, Open Sans" font-size="16" font-weight="bold"><tspan x="79" y="193">Introduction</tspan>  <tspan x="79" y="221" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">This Ecma Standard is based on several </tspan> <tspan x="79" y="240" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">originating technologies, the most well </tspan> <tspan x="79" y="259" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">known being JavaScript (Netscape) and </tspan> <tspan x="79" y="278" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">JScript (Microsoft). The language was </tspan> <tspan x="79" y="297" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">invented by Brendan Eich at Netscape and </tspan> <tspan x="79" y="316" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">first appeared in that company’s Navigator </tspan> <tspan x="79" y="335" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">2.0 browser. It has appeared in all </tspan> <tspan x="79" y="354" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">subsequent browsers from Netscape and </tspan> <tspan x="79" y="373" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">in all browsers from Microsoft starting </tspan> <tspan x="79" y="392" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">with </tspan></text></g></g></svg>

这个宽高包含元素自身的边框，其他没有什么好说的

### `clientLeft`，`clientRight`

没有滚动条的情况下，等同于边框的宽和高，否则应该还加上滚动条长宽

### `clientWidth`，`clientHeight`

<svg xmlns="http://www.w3.org/2000/svg" width="500" height="493" viewBox="0 0 500 493"><defs><style>@import url(https://fonts.googleapis.com/css?family=Open+Sans:bold,italic,bolditalic%7CPT+Mono);@font-face{font-family:'PT Mono';font-weight:700;font-style:normal;src:local('PT MonoBold'),url(/font/PTMonoBold.woff2) format('woff2'),url(/font/PTMonoBold.woff) format('woff'),url(/font/PTMonoBold.ttf) format('truetype')}</style></defs><defs><linearGradient id="linearGradient-1" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#FFF"/><stop offset="100%" stop-color="#D1CFCD"/></linearGradient><linearGradient id="linearGradient-2" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#FFF"/><stop offset="100%" stop-color="#D1CFCD"/></linearGradient></defs><g id="dom" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="metric-client-width-height.svg"><path id="Rectangle-2" fill="#DBAF88" d="M411 130v290H21V130h390zm-25 25H46v240h340V155z"/><path id="Rectangle-1" stroke="#C06334" stroke-width="2" d="M350 177v199H67V177h283z"/><g id="Group-2" transform="translate(370 155)"><rect id="Rectangle-19" width="15" height="239" x=".5" y=".5" fill="#D1CFCD" stroke="#D1CFCD" rx="3"/><g id="Rectangle-18-+-Triangle-1"><rect id="Rectangle-18" width="15" height="19" x=".5" y=".5" fill="url(#linearGradient-1)" stroke="#D1CFCD" rx="3"/><path id="Triangle-1" fill="#7E7C7B" d="M8 7l3.2 6H4.8z"/></g><g id="Rectangle-18-+-Triangle-2" transform="matrix(1 0 0 -1 0 240)"><rect id="Rectangle-18" width="15" height="19" x=".5" y=".5" fill="url(#linearGradient-1)" stroke="#D1CFCD" rx="3"/><path id="Triangle-1" fill="#7E7C7B" d="M8 7l3.2 6H4.8z"/></g><g id="Rectangle-18-+-Triangle-3-+-Group" transform="translate(0 50)"><g id="Rectangle-18-+-Triangle-3" fill="url(#linearGradient-2)" stroke="#D1CFCD" transform="matrix(1 0 0 -1 0 51)"><rect id="Rectangle-18" width="15" height="50" x=".5" y=".5" rx="3"/></g><g id="Group" fill="#D1CFCD" stroke="#7E7C7B" transform="translate(4 20)"><path id="Rectangle-22" d="M.5.5h7v1h-7z"/><path id="Rectangle-23" d="M.5 3.5h7v1h-7z"/><path id="Rectangle-24" d="M.5 6.5h7v1h-7z"/><path id="Rectangle-25" d="M.5 9.5h7v1h-7z"/></g></g></g><text id="border" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="12.9" y="75" fill="#C06334">border</tspan> <tspan x="20.1" y="89" fill="#1C85B5">25px</tspan></text><text id="padding" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="32.3" y="45" fill="#C06334">padding</tspan> <tspan x="43.1" y="59" fill="#1C85B5">20px</tspan></text><text id="content-width:284px" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="139.1" y="109" fill="#C06334">content width:</tspan> <tspan x="239.9" y="109" fill="#1C85B5">284px</tspan></text><path id="Line-15" fill="#C06334" fill-rule="nonzero" d="M336.5 110l14 7-14 7v-6H82.679l.001 6-14-7 14-7-.001 6H336.5v-6z"/><path id="Line-14" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M21.48 93v43"/><path id="Line-13" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M47.48 93v41"/><text id="border-2" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="376.9" y="76" fill="#C06334">border</tspan> <tspan x="384.1" y="90" fill="#1C85B5">25px</tspan></text><text id="padding-2" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="339.3" y="16" fill="#C06334">padding</tspan> <tspan x="350.1" y="30" fill="#1C85B5">20px</tspan></text><text id="scrollbar" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal"><tspan x="349.1" y="48" fill="#C06334">scrollbar</tspan> <tspan x="367.1" y="62" fill="#1C85B5">16px</tspan></text><path id="Line-17" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M371.48 93v43"/><path id="Line-20" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M385.48 93v43"/><path id="Line-18" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M410.48 93v41"/><path id="Line-16" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M66.48 93v41"/><path id="Line-19" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M353.48 93v41"/><text id="clientWidth-=-20+284" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal"><tspan x="80.3" y="473" fill="#C06334">clientWidth = </tspan> <tspan x="197.9" y="473" fill="#1C85B5">20+284+20 </tspan> <tspan x="281.9" y="473" fill="#C06334">=</tspan> <tspan x="290.3" y="473" fill="#1C85B5"> 324px</tspan></text><path id="Line-24" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M46.5 376v88.142"/><path id="Line-25" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M370.5 376v88.142"/><path id="Line-22" fill="#C06334" fill-rule="nonzero" d="M354 445.071l14 7-14 7v-6.001H62v6.001l-14-7 14-7v5.999h292v-5.999z"/><text id="clientHeight:240px" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal" transform="rotate(-90 488.5 277.5)"><tspan x="412.9" y="282" fill="#C06334">clientHeight:</tspan> <tspan x="522.1" y="282" fill="#1C85B5">240px</tspan></text><path id="Line-27" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M365.5 156h120"/><path id="Line-28" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M365.5 394h120"/><path id="Line-26" fill="#C06334" fill-rule="nonzero" d="M476 160l7 14-6-.001V375h6l-7 14-7-14h6V173.999l-6 .001 7-14z"/><text id="height:200px" font-family="PTMono-Regular, PT Mono" font-size="12" font-weight="normal" transform="rotate(-90 422.5 274)"><tspan x="379.3" y="278" fill="#C06334">height:</tspan> <tspan x="429.7" y="278" fill="#1C85B5">200px</tspan></text><path id="Line-3" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M353.5 175h88.142"/><path id="Line-2" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M353.5 377h88.142"/><path id="Line" fill="#C06334" fill-rule="nonzero" d="M435 177.5l7 14h-6V360h6l-7 14-7-14h6V191.5h-6l7-14z"/><text id="Introduction" fill="#643B0C" font-family="OpenSans-Bold, Open Sans" font-size="16" font-weight="bold"><tspan x="69" y="193">Introduction</tspan>  <tspan x="69" y="221" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">This Ecma Standard is based on several </tspan> <tspan x="69" y="240" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">originating technologies, the most well </tspan> <tspan x="69" y="259" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">known being JavaScript (Netscape) and </tspan> <tspan x="69" y="278" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">JScript (Microsoft). The language was </tspan> <tspan x="69" y="297" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">invented by Brendan Eich at Netscape and </tspan> <tspan x="69" y="316" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">first appeared in that company’s Navigator </tspan> <tspan x="69" y="335" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">2.0 browser. It has appeared in all </tspan> <tspan x="69" y="354" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">subsequent browsers from Netscape and </tspan> <tspan x="69" y="373" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">in all browsers from Microsoft starting with </tspan></text></g></g></svg>

没有 `padding` 的情况下，我们通过 CSS 设置的 `width` 就等于 `clientWidth`

### `scrollHeight`，`scrollWidth`，`scrollTop`

<svg xmlns="http://www.w3.org/2000/svg" width="463" height="524" viewBox="0 0 463 524"><defs><style>@import url(https://fonts.googleapis.com/css?family=Open+Sans:bold,italic,bolditalic%7CPT+Mono);@font-face{font-family:'PT Mono';font-weight:700;font-style:normal;src:local('PT MonoBold'),url(/font/PTMonoBold.woff2) format('woff2'),url(/font/PTMonoBold.woff) format('woff'),url(/font/PTMonoBold.ttf) format('truetype')}</style></defs><defs><linearGradient id="linearGradient-1" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#FFF"/><stop offset="100%" stop-color="#D1CFCD"/></linearGradient><linearGradient id="linearGradient-2" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#FFF"/><stop offset="100%" stop-color="#D1CFCD"/></linearGradient></defs><g id="dom" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="metric-scroll-width-height.svg"><path fill="#FFF" d="M0 0h463v524H0z"/><text id="Introduction" fill="#643B0C" font-family="OpenSans-Bold, Open Sans" font-size="16" font-weight="bold"><tspan x="66" y="54">Introduction</tspan>  <tspan x="66" y="82" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">This Ecma Standard is based on several </tspan> <tspan x="66" y="101" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">originating technologies, the most well </tspan> <tspan x="66" y="120" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">known being JavaScript (Netscape) and </tspan> <tspan x="66" y="139" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">JScript (Microsoft). The language was </tspan> <tspan x="66" y="158" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">invented by Brendan Eich at Netscape </tspan> <tspan x="66" y="177" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">and first appeared in that company’s </tspan> <tspan x="66" y="196" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">Navigator 2.0 browser. It has appeared </tspan> <tspan x="66" y="215" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">in all subsequent browsers from </tspan> <tspan x="66" y="234" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">Netscape and in all browsers from </tspan> <tspan x="66" y="253" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">Microsoft starting with Internet Explorer </tspan> <tspan x="66" y="272" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">3.0.</tspan> <tspan x="66" y="291" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">The development of this Standard </tspan> <tspan x="66" y="310" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">started in November 1996. The first </tspan> <tspan x="66" y="329" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">edition of this Ecma Standard was </tspan> <tspan x="66" y="348" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">adopted by the Ecma General Assembly </tspan> <tspan x="66" y="367" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">of June 1997.</tspan> <tspan x="66" y="386" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">That Ecma Standard was submitted to </tspan> <tspan x="66" y="405" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">ISO/IEC JTC 1 for adoption under the </tspan> <tspan x="66" y="424" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">fast-track procedure, and approved as </tspan> <tspan x="66" y="443" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">international standard ISO/IEC 16262, in </tspan> <tspan x="66" y="462" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">April 1998. The Ecma General Assembly </tspan> <tspan x="66" y="481" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">of June 1998 approved the second </tspan> <tspan x="66" y="500" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">edition of ECMA-262 to keep it fully </tspan> <tspan x="66" y="519" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">aligned with ISO/IEC 16262. Changes </tspan> <tspan x="66" y="538" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">between the first and the second </tspan> <tspan x="66" y="557" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">edition are editorial in nature.</tspan></text><path id="Rectangle-15" fill="#FFF" d="M58 410h312v111H58z"/><path id="Rectangle-14" fill="#FFF" d="M58 35h312v89H58z"/><path id="Rectangle-1" fill="#DBAF88" d="M395 123v290H21V123h374zm-25 25H46v240h324V148z"/><path id="Rectangle-2" stroke="#DBAF88" stroke-width="2" d="M45 22h326v502H45z"/><text id="scrollHeight:723px" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal" transform="rotate(-90 426 270.5)"><tspan x="350.4" y="275" fill="#C06334">scrollHeight:</tspan> <tspan x="459.6" y="275" fill="#1C85B5">723px</tspan></text><path id="Line-27" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M371 22h78"/><path id="Line-26" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M371 524h78"/><path id="Line-25" fill="#C06334" fill-rule="nonzero" d="M439 26l7 14h-6v466h6l-7 14-7-14h6V40h-6l7-14z"/><path id="Line-39" fill="#C06334" fill-rule="nonzero" d="M335.36 102l14 7-14 7-.001-6H64v6l-14-7 14-7v6h271.359l.001-6z"/><path id="Line-42" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M352 154v-54"/><path id="Line-43" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M47 154v-54"/><text id="scrollWidth-=-324px" font-family="PTMono-Regular, PT Mono" font-size="14" font-weight="normal"><tspan x="149.2" y="105" fill="#C06334">scrollWidth = </tspan> <tspan x="266.8" y="105" fill="#1C85B5">324px</tspan></text><g id="Group-2" transform="translate(354 148)"><rect id="Rectangle-19" width="15" height="239" x=".5" y=".5" fill="#D1CFCD" stroke="#D1CFCD" rx="3"/><g id="Rectangle-18-+-Triangle-1"><rect id="Rectangle-18" width="15" height="19" x=".5" y=".5" fill="url(#linearGradient-1)" stroke="#D1CFCD" rx="3"/><path id="Triangle-1" fill="#7E7C7B" d="M8 7l3.2 6H4.8z"/></g><g id="Rectangle-18-+-Triangle-2" transform="matrix(1 0 0 -1 0 240)"><rect id="Rectangle-18" width="15" height="19" x=".5" y=".5" fill="url(#linearGradient-1)" stroke="#D1CFCD" rx="3"/><path id="Triangle-1" fill="#7E7C7B" d="M8 7l3.2 6H4.8z"/></g><g id="Rectangle-18-+-Triangle-3-+-Group" transform="translate(0 50)"><g id="Rectangle-18-+-Triangle-3" fill="url(#linearGradient-2)" stroke="#D1CFCD" transform="matrix(1 0 0 -1 0 51)"><rect id="Rectangle-18" width="15" height="50" x=".5" y=".5" rx="3"/></g><g id="Group" fill="#D1CFCD" stroke="#7E7C7B" transform="translate(4 20)"><path id="Rectangle-22" d="M.5.5h7v1h-7z"/><path id="Rectangle-23" d="M.5 3.5h7v1h-7z"/><path id="Rectangle-24" d="M.5 6.5h7v1h-7z"/><path id="Rectangle-25" d="M.5 9.5h7v1h-7z"/></g></g></g></g></g></svg>

我们可以配合 `scrollTop` 做一些事情，比如检测是否滑动到最底部等。

---

### 相对屏幕的定位

上面提到的都是相对元素的定位，但有时候我们想要类似 `fixed` 的定位效果，就需要 `getBoundingClientRect` 函数，其获取效果如下图：

<svg xmlns="http://www.w3.org/2000/svg" width="521" height="411" viewBox="0 0 521 411"><defs><style>@import url(https://fonts.googleapis.com/css?family=Open+Sans:bold,italic,bolditalic%7CPT+Mono);@font-face{font-family:'PT Mono';font-weight:700;font-style:normal;src:local('PT MonoBold'),url(/font/PTMonoBold.woff2) format('woff2'),url(/font/PTMonoBold.woff) format('woff'),url(/font/PTMonoBold.ttf) format('truetype')}</style></defs><g id="dom" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="coordinates.svg"><g id="noun_69008_cc" fill="#DBAF88" transform="translate(13 11)"><path id="Shape" d="M490.563 386H10.438C4.676 386 0 381.658 0 376.35V9.65C0 4.342 4.676 0 10.438 0h480.125C496.303 0 501 4.343 501 9.65v366.7c0 5.308-4.697 9.65-10.438 9.65zm-480.4-12.939h478.642V12.94H10.162V373.06z"/><path id="Shape" d="M20.859 54.1c-5.753 0-10.422-1.147-10.422-2.55 0-1.402 4.67-2.55 10.422-2.55H479.4c5.732 0 10.422 1.148 10.422 2.55 0 1.403-4.69 2.55-10.422 2.55H20.86zM33.8 31.627a6.024 6.024 0 11-12.05 0 6.024 6.024 0 1112.05 0zM63.988 31.627a6.024 6.024 0 11-12.05 0 6.024 6.024 0 1112.05 0zM94.177 31.627a6.024 6.024 0 11-12.05 0 6.024 6.024 0 1112.05 0z"/></g><text id="height" fill="#C06334" font-family="PTMono-Bold, PT Mono" font-size="14" font-weight="bold"><tspan x="417" y="208">height</tspan></text><text id="bottom" fill="#7E7C7B" font-family="PTMono-Bold, PT Mono" font-size="14" font-weight="bold"><tspan x="451" y="311">bottom</tspan></text><path id="Line-28" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M395 293h103"/><path id="Line-30" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M392 296v74.5"/><path id="Line-30-Copy" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M119 296v46"/><path id="Line-29" stroke="#C06334" stroke-dasharray="3,6" stroke-linecap="square" stroke-width="2" d="M396 120h30"/><text id="x" fill="#C06334" font-family="PTMono-Bold, PT Mono" font-size="14" font-weight="bold"><tspan x="62" y="113">x</tspan></text><text id="left" fill="#7E7C7B" font-family="PTMono-Bold, PT Mono" font-size="14" font-weight="bold"><tspan x="50" y="135">left</tspan></text><text id="y" fill="#C06334" font-family="PTMono-Bold, PT Mono" font-size="14" font-weight="bold"><tspan x="125" y="79">y</tspan></text><text id="width" fill="#C06334" font-family="PTMono-Bold, PT Mono" font-size="14" font-weight="bold"><tspan x="234" y="339">width</tspan></text><path id="Line" fill="#C06334" fill-rule="nonzero" d="M414 118.5V273h8l-9.5 19-9.5-19h8V118.5h3z"/><path id="Line-Copy" fill="#7E7C7B" fill-rule="nonzero" d="M476 65v208h8l-9.5 19-9.5-19h8V65h3z"/><path id="Line-2" fill="#C06334" fill-rule="nonzero" d="M371 309l19 9.5-19 9.5-.001-8H116v-3h254.999l.001-8z"/><path id="Line-3" fill="#C06334" fill-rule="nonzero" d="M100.05 109.903l18.95 9.6-19.05 9.4.042-8.001-76.5-.402-1.5-.008.016-3 1.5.008 76.5.402.042-8z"/><text id="right" fill="#7E7C7B" font-family="PTMono-Bold, PT Mono" font-size="14" font-weight="bold"><tspan x="180" y="375">right</tspan></text><path id="Line-3-Copy-2" fill="#7E7C7B" fill-rule="nonzero" d="M371 350l19 9.5-19 9.5v-8H21.005v-3H371v-8z"/><path id="Line-3-Copy" fill="#C06334" fill-rule="nonzero" d="M119 65v1.5l.003 34.249h8l-9.498 19.001-9.502-19h8L116 66.5V65h3z"/><path id="Rectangle-1" fill="#DBAF88" d="M392.629 119v175H118V119h274.629zM382 129H129v155h253V129z"/><text id="Introduction-This-Ec" fill="#643B0C" font-family="OpenSans-Bold, Open Sans" font-size="16" font-weight="bold" opacity=".8"><tspan x="138.946" y="153.8">Introduction</tspan>  <tspan x="138.946" y="181.8" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">This Ecma Standard is based on </tspan> <tspan x="138.946" y="200.8" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">several originating technologies, </tspan> <tspan x="138.946" y="219.8" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">the most well known being </tspan> <tspan x="138.946" y="238.8" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">JavaScript (Netscape) and JScript </tspan> <tspan x="138.946" y="257.8" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">(Microsoft). The language was </tspan> <tspan x="138.946" y="276.8" font-family="OpenSans-Regular, Open Sans" font-size="14" font-weight="normal">invented by Brendan Eich at </tspan></text><text id="top" fill="#7E7C7B" font-family="PTMono-Bold, PT Mono" font-size="14" font-weight="bold"><tspan x="125" y="96">top</tspan></text></g></g></svg>

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

