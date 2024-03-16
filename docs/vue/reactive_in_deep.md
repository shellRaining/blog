---
title: Vue 响应式原理
tag:
  - vue
  - interview_question
date: 2024-03-16
---

## 响应式基础概念

首先知道两个名词：

- 副作用：当我们执行一个函数时，我们期望它只是返回一个值，而在执行过程中没有修改外部的变量，这就是没有副作用。而如果函数执行过程中修改了外部的变量，那么就是有副作用。
- 响应式变量：当被访问时，会收集依赖（track）于这个响应式变量的副作用函数，当这个响应式变量发生变化时，会触发（trigger）这些副作用函数。

他们两个是配合在一起使用的，在 Vue 中，负责产生副作用的函数（最底层的）是 `effect`，而负责产生响应式变量的函数是 `reactive`，`ref` 等函数。

如果只有响应式变量没有副作用，当响应式变狼发生变化时，同步的更新并不会发生。而如果副作用中没有响应式变量，里面的改动根本不会被监听（track）到。

```javascript
// 1. 响应式变量没有副作用
let obj = reactive({ value: 1 })
let a = obj.value
obj.value = 2
console.log(a) // 1

// 2. 副作用中没有响应式变量
effect(() => {
  console.log(a)
})
obj.value = 3 // 不会触发更新，即对 a 打印的函数不会被执行

// 3. 副作用中有响应式变量
let b = 0
effect(() => {
  b = obj.value
})
obj.value = 4
console.log(b) // 4
```

## 响应式原理（effect）

从上面的介绍中可以知道，想要实现自动触发（响应式），就先要收集（track）这些副作用函数（effectFn），当响应式变量发生变化时，再执行这些副作用（trigger）。

我们这里先不实现响应式变量，只是手动进行依赖收集和触发。

```javascript
let sum = 0
let a = 1
let b = 2
// 副作用函数
const effectFn = () => {
  sum = a + b
}

const dep = new Set()
function track() {
  dep.add(effectFn)
}
function trigger() {
  dep.forEach(effect => effect())
}

// 首先收集副作用函数
track()
// 触发副作用函数
trigger()
console.log(sum) // 3
// 更改响应式变量
a = 2
// 再次触发副作用函数
trigger()
console.log(sum) // 4
```

现在我们是手动进行依赖收集和触发，但是这样还不太方便，我们可以把这些逻辑封装到 `effect` 函数中。同理，track 函数也需要重构一下

```javascript
function effect(effectFn) {
  track(effectFn) // [!code highlight] 注意这里的 track 函数位置，实际上是在后面即将讲解的 reactive 函数中调用，这里只是为了演示自动触发才放在这里
  effectFn()
}
function track(effectFn) {
  dep.add(effectFn)
}
```

这样就完成了一个丐版的依赖收集和触发。

## 依赖收集具体细节

上面我们的例子中，只是对单个值进行了依赖收集，而如果响应式变量是一个对象呢，我们就需要对对象中的每个被访问的属性进行依赖收集。首先想一下收集器的结构，响应式对象的每个属性都有一个收集器（对应着一个存储多个 effectFn 的 Set），因此这个收集器是一个 Map，key 是属性名，value 是 Set。

不过还有一个问题，如果一个 effectFn 中访问了多个响应式对象，而这些对象又有相同的属性名，那么上面的依赖收集就会出现覆盖的现象，因此我们需要一个 WeakMap 来存储上面的 Map，其中 key 是响应式对象，value 是上面的 Map。

```javascript
let product = { price: 10, quantity: 2 }, total = 0;
const targetMap = new WeakMap();     // ① 初始化 targetMap，保存观察对象
const effect = () => { total = product.price * product.quantity };
const track = (target, key) => {     // ② 收集依赖
  let depsMap = targetMap.get(target);
  if(!depsMap){
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if(!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(effect);
}

const trigger = (target, key) => {  // ③ 执行指定对象的指定属性的所有副作用
  const depsMap = targetMap.get(target);
  if(!depsMap) return;
    let dep = depsMap.get(key);
  if(dep) {
    dep.forEach( effect => effect() );
  }
};

track(product, 'price');
console.log(`total: ${total}`); // total: 0
effect();
console.log(`total: ${total}`); // total: 20
product.price = 20;
trigger(product, 'price');
console.log(`total: ${total}`); // total: 40
```

## 响应式原理（响应式变量）

现在我们要实现响应式变量，来自动进行依赖收集和触发。以 `reactive` 为例

首先需要知道，`reactive` 函数返回的是一个 Proxy 对象，代理了传入其中的 target 对象，当访问和修改这个 Proxy 对象时，会触发 get 和 set 方法，我们可以在这两个方法中进行依赖收集和触发。

```javascript
function createHandler(isReadonly: boolean, shallow = false) {
  return {
    get(target: object, key: PropertyKey) {
      if (key === ReactiveFlag.IS_READONLY) {
        return isReadonly;
      } else if (key === ReactiveFlag.IS_REACTIVE) {
        return !isReadonly;
      }

      const res = Reflect.get(target, key);

      if (shallow) {
        return res;
      }

      if (isObject(res)) {
        return isReadonly ? readonly(res) : reactive(res);
      }

      if (!isReadonly) {
        track(target, key);
      }
      return res;
    },
    set(target: object, key: PropertyKey, value: any) {
      if (isReadonly) {
        console.warn("try to write in a readonly object");
        return true;
      }
      const res = Reflect.set(target, key, value);
      trigger(target, key);
      return res;
    },
  };
}
```

这是我的一个实现，可以通过这个实现 `reactive`，`readonly`，`shallowReactive`，`shallowReadonly` 函数等。

## 总结

首先需要知道两个概念：副作用和响应式变量。副作用是指函数执行过程中修改了外部变量，而响应式变量是指被访问时，会收集依赖于这个响应式变量的副作用函数，当这个响应式变量发生变化时，会触发这些副作用函数。

然后介绍响应式变量的结构，以 `reactive` 为例，他返回传入 target 的 Proxy 对象，代理了其 get 和 set 方法，分别在访问时进行依赖收集和修改时触发副作用函数。

当我们访问这个对象的一个属性时，触发了代理的 get 方法，首先获取该响应式变量所处的副作用函数（通过一个全局变量 activeEffect 来保存），然后将其存入到一个特殊结构中，然后返回属性值。

这个特殊结构（targetMap）是一个 WeakMap，key 是响应式对象，value 是一个 Map，key 是属性名，value 是一个 Set，存储了所有访问了这个属性的副作用函数。

然后当我们修改这个对象的一个属性时，触发了代理的 set 方法，通过传入的 `target` 和 `key` 从 targetMap 中获取到对应的副作用函数，然后执行这些副作用函数。完成 trigger 操作。至此，响应式过程结束。
