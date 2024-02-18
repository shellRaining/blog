---
title: react 和 redux 初步使用
tag:
  - react
  - essay
date: 2024-02-13
---

## 安装 redux

可以使用 create-react-app 的模板来初始化一个项目，但是这样做有很多的无用代码

```bash
pnpx create-react-app my-app --template redux # 这样使用的是 next.js 的模板
npx create-react-app my-app --template redux # 这样使用的是 create-react-app 的模板
# 至于为什么会出现这种区别我暂时不想知道……
```

或者通过手动安装，这个是官方推荐的 redux 编写方式，是一套工具集的结合，用来简化 redux 的使用，而我们下面的代码没有使用到这个工具集，而是单独使用 redux

```bash
pnpm install @reduxjs/toolkit
```

在 react 中使用 redux 需要一个中间件的配合，因为 redux 本身就可以脱离 react 使用，而我们需要管理的是组件之间的状态，所以需要一个中间件 react-redux

```bash
pnpm install react-redux
```

## 核心概念介绍

### store

store 是用来保存全局数据的地方，可以将其看作是一个容器（带有推送功能），整个应用只能有一个 store

### state

state 可以看作是 store 的一个快照，包含了某个时间点的全部数据，并且一个 state 对应这一个 view，state 相同，view 就相同

### action

State 的变化，会导致 View 的变化。但是，用户接触不到 State，只能接触到 View。所以，State 的变化必须是 View 导致的。

Action 就是 View 发出的通知，表示 State 应该要发生变化了。

Action 是一个对象。其中的 type 属性是必须的，表示 Action 的名称。其他属性可以自由设置。

### store.dispatch()

`store.dispatch()` 是 View 发出 Action 的唯一方法。

### reducer

Store 收到 Action 以后，必须给出一个新的 State，这样 View 才会发生变化。这种 State 的计算过程就叫做 Reducer。

Reducer 是一个函数，它接受 Action 和当前 State 作为参数，返回一个新的 State。

记得传入传出状态对象的格式需要严格保持一致

### store.subscribe()

Store 允许使用 `store.subscribe()` 方法设置监听函数，一旦 State 发生变化，就自动执行这个函数。

`store.subscribe` 方法返回一个函数，调用这个函数就可以解除监听。

## 工作流程

![工作流程](https://cdn.shiniest.cn/static/202302/ReduxDataFlowDiagram.gif)

## 基础实例

我们首先需要明白使用 redux 的一个基本流程

1. 首先创建一个 reducer 函数，这个函数接受两个参数，第一个是 state（记得传入一个默认参数作为初始状态），第二个是 action，这是一个对象，其中有一个 type 属性来表示执行的操作类型
1. 创建一个 store，这个 store 会接受一个 reducer 函数作为参数
1. 注册一个监听函数到这个 store 上，这个监听函数会在每次 dispatch 一个 action 之后执行
1. 通过调用这个 store 上的 dispatch 方法来执行一个 action
1. 在第三步中的监听函数上添加改变 view 的副作用

首先通过 CDN 来引入 redux，做一个简单的例子

```html
<html>
 <body>
  <div>
   <button id="inc">+</button>
   <span id="counter"> 0 </span>
   <button id="dec">-</button>
  </div>
  <script type="module">
   import { createStore } from "https://cdnjs.cloudflare.com/ajax/libs/redux/5.0.1/redux.legacy-esm.min.js";
      // 1 create a reducer function
      function reducer(state = { count: 0 }, action) {
        if (action.type === "INC") {
          return { count: state.count + 1 };
        } else if (action.type === "DEC") {
          return { count: state.count - 1 };
        }
        return state;
      }

      // 2 create a store
      const store = createStore(reducer);

      // 3 subscribe to the store
      store.subscribe(() => {
        console.log("has changed");
      });

      // 4 dispatch an action when a button is clicked
      const incBtn = document.getElementById("inc");
      const decBtn = document.getElementById("dec");
      incBtn.addEventListener("click", () => {
        store.dispatch({
          type: "INC",
        });
      });
      decBtn.addEventListener("click", () => {
        store.dispatch({
          type: "DEC",
        });
      });
  </script>
 </body>
</html>
```

::: warning
注意我们通过 CDN 引入的格式，是通过对一个链接 import 得到了文件，然后解构得到需要的函数，这需要了解更多 JavaScript 模块化的知识……

还有一个好玩的，redux 中文文档的 CDN 链接过期了，我给他们提了一个 pr，希望能够更新…… 😄
:::

## 使用 redux toolkit

redux toolkit 简化了上面的流程，上面相同逻辑的代码如下

1. 首先使用 `createSlice` 创建一个 slice，他很类似一个 store 的切片（在我看来）
1. 从上面的 slice 中解构出 reducer 和 action
1. 使用 `configureStore` 从不同的 slice 创建组合一个 store，这个 store 会接受他们的 reducer 函数组成的对象作为参数
1. 使用的时候首先使用 Provider 组件包裹整个应用，然后在 APP 使用 `useSelector` 和 `useDispatch` 来获取 state 和 dispatch 方法

```javascript
import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    incremented: state => {
      // Redux Toolkit 允许在 reducers 中编写 "mutating" 逻辑。
      // 它实际上并没有改变 state，因为使用的是 Immer 库，检测到“草稿 state”的变化并产生一个全新的
      // 基于这些更改的不可变的 state。
      state.value += 1
    },
    decremented: state => {
      state.value -= 1
    }
  }
})

export const { incremented, decremented } = counterSlice.actions

const store = configureStore({
  reducer: counterSlice.reducer
})

store.subscribe(() => console.log(store.getState()))
store.dispatch(incremented())
store.dispatch(incremented())
store.dispatch(decremented())
```

::: warning
createSlice 中的 reducer 尽量不要使用箭头函数，因为可能会导致 bug，尽管我不知道为什么，他似乎使用了 Immer 来进行一些神奇的操作……
:::

::: info 吐槽
我不知道为什么要使用这个工具……因为从上面的步骤看来，这玩意还是比较复杂的
:::

### 使用异步请求部分

我们首先定义一个函数，这个函数返回一个异步函数，在这个异步函数里面我们可以使用 dispatch 来执行 action，这样我们就可以在异步请求完成之后执行 action

```javascript
function addDelayNum(num) {
  return async (dispatch) => {
    await sleep(1000);
    dispatch(addNum(num));
  };
}
```

![异步流程](https://cn.redux.js.org/assets/images/ReduxAsyncDataFlowDiagram-d97ff38a0f4da0f327163170ccc13e80.gif)

## 参考文章

[https://www.shiniest.cn/blog/article/159](https://www.shiniest.cn/blog/article/159)
