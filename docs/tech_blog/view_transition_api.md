---
title: view transition API 介绍
tag:
  - tech_blog
date: 2024-08-02
---

## view transition 的变化过程

1. view transition 被触发：根据页面类型的不同（SPA 和 MPA），触发条件也不同。在 SPA 的情况下，给 `document.startViewTransition()` 传入一个更改 DOM 的回调函数会触发 view transition。在 MPA 的情况下，从一个文档跳转到另一个同源文档会触发，同时需要在 css 中包含触发的规则。

   一个活动的 view transition 会与一个 ViewTransition 实例相关联，这个实例就是上面提到的 `startViewTransition` 函数的返回值。该实例包含很多 promise，可以用来在一个 view transition 的不同阶段执行不同的钩子函数。

2. 捕获旧快照：在老的页面上，API 会捕获带有 `view-transition-name` 这个 css 字段的 DOM 元素，并且为他们设置一个快照。

3. 视图变化发生：在 SPA 应用中，被传入 `startViewTransition` 的回调函数被调用，用来更改 DOM，并且在回调函数执行成功后，`ViewTransition.updateCallbackDone` 这个 promise 会被兑现，允许响应 DOM 更改这个事件。在 MPA 应用中，导航将会在前后文档中发生（我并不确定这段话到底说了什么）

4. 捕获新快照：在新的页面上，API 会捕获一个新快照，并且 view transition 动画效果蓄势待发，`ViewTransition.ready` 这个 promise 被兑现，允许我们执行自定义的动画效果，而不是默认的渐入渐出效果。

5. 动画执行：老的页面执行 `out` 动画，新的页面执行 `in` 动画，默认情况下 `out` 动画是透明度（opacity）逐渐从 1 变为 0，`in` 动画反之，实现一个交叉过渡的效果。

6. 动画结束：结束后会兑现 `ViewTransition.finished` 这个 promise

> 如果 page visibility 为 `hidden`，那么将不会执行动画效果
>
> 至于这个 page visibility API，可以看 [MDN 文档](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)，可以简单认为是浏览器为了节省性能提出的一个 API

## view transition 伪元素树

为了我们能够处理动画过程中的节点，view transition API 创建了一棵伪元素树来供我们使用，其结构如下：

```
::view-transition
└─ ::view-transition-group(root)
  └─ ::view-transition-image-pair(root)
      ├─ ::view-transition-old(root)
      └─ ::view-transition-new(root)
```

在 SPA 应用中，这棵树可以在文档顶层（HTML 节点处）看到，在 MPA 应用中，我们可以在新页面中看到这棵树。我们依次看一下这些伪元素

1. `::view-transition` 是整棵树的根节点。当我们触发了一个 view transition 过程，这个伪元素就会被插入到 `<html>` 节点下。它覆盖在整个页面的上方，作为所有 `::view-transition-group` 的容器。

2. `::view-transition-group` 是一个盛放 view transition 快照的容器。上一个小节中提到，一个过渡动画会有两个快照（过渡前，过渡后）我们把他们整合到一个伪元素中。

   这个伪元素可以在括号中放置一个参数，用来表示指定 `view-transition-name` 节点的快照合集（`::view-transition-group`）。因为我们在触发一个 view transition 的时候可能会同时修改很多 DOM 节点，同时我们还想对不同节点执行不同的过渡动画，这些节点的过渡前后的快照都是不同的，因此有了这个设计。这里提到的 `view-transition-name` 是一个 css 声明，用法如下：

   ```css
   figcaption {
     view-transition-name: figure-caption;
   }
   ::view-transition-old(figure-caption),
   ::view-transition-new(figure-caption) {
     animation-duration: 0.5s;
     height: 100%;
   }
   ```

   在我们设定了这个 css 属性后，就可以像 `::view-transition-group(figure-caption)` 这样来选取。注意，每当你设置一个 `view-transition-name` 的同时，一个对应的 group 就在过渡动画触发时生成。

3. `::view-transition-old(root)` 和 `::view-transition-new(root)` 表示元素过渡前后的快照，我们可以在其上设置各种 css 属性，包括动画等。

## 创建一个基础的视图过渡动画

### 基础的 SPA 过渡效果

```JavaScript
function updateView(event) {
  const displayNewImage = () => {
    const mainSrc = `${targetIdentifier.src.split("_th.jpg")[0]}.jpg`;
    galleryImg.src = mainSrc;
    galleryCaption.textContent = targetIdentifier.alt;
  };

  // Fallback for browsers that don't support View Transitions:
  if (!document.startViewTransition) {
    displayNewImage();
    return;
  }
  // With View Transitions:
  const transition = document.startViewTransition(() => displayNewImage());
}
```

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.5s;
}
figcaption {
  view-transition-name: figure-caption;
}
::view-transition-old(figure-caption),
::view-transition-new(figure-caption) {
  position: absolute;
  top: 0;
  right: 0;
  left: auto;
  transform-origin: right center;
}
::view-transition-old(figure-caption) {
  animation: 0.25s linear both shrink-x;
}
::view-transition-new(figure-caption) {
  animation: 0.25s 0.25s linear both grow-x;
}
```

这里我省略了很多不相干的代码，只是为了展示使用的样例，完整代码可以看 [MDN 的样例](https://glitch.com/edit/#!/basic-view-transitions-api)

可以看到这里设置了两个 css 过渡效果，当我们触发过渡后，整个页面会拍摄一个旧快照和一个新快照，然后进行对比，执行切换的动画效果，但是 `figcaption` 标签自定义了它自己的动画，不用遵循默认动画，因此有了新的效果。

> [!note]
>
> 但这带来了一个新问题，以我的博客为例，点击切换主题的按钮后，会触发全页面的过渡效果，但是他还检测到我的切换页面的过渡设置，导致页面切换动画也被执行，为此我没有直接设置链接的 `view_transtion_name` 属性，而是当点击后动态设置，动画执行后再移除这些属性。
>
> 顺便提一下，如果不想要某个节点发生过渡效果，可以将该节点的 `view_transition_name` 设置为 `none`
