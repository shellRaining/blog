---
title: WaveSurfer 的事件发射器实现
tag:
  - tools
date: 2024-08-06
---

`WaveSurfer` 这个类在实例化的时候，可以通过一些方法来监听事件，究其原因，是因为它继承自 `Player` 类，而这个 `Player` 类继承自 `EventEmitter` 这个类，该类的实例可以用来表示一些特殊的事物，他们存在一些特殊的方法，比如 `on`，`once`，`emit` 等，我们可以使用 `on` 这些方法来添加事件监听器，然后利用 `emit` 方法来触发这些事件，让事件监听器执行相应的操作。

理解起来很简单，这里介绍它主要是因为他的抽象概念很好，并且带有规整的类型定义，我们先从使用方法看起。

## 使用

下面是一个使用事件监听器的例子，因为 `emit` 方法实际上是 `protected`，所以这里将其继承后使用

```TypeScript
type MyEvents = {
  userLoggedIn: [username: string]
  dataLoaded: [data: any]
  error: [message: string]
}

class MyApp extends EventEmitter<MyEvents> {
  login(username: string) {
    console.log(`Logging in ${username}...`)
    this.emit('userLoggedIn', username)
  }
  loadData() {
    setTimeout(() => {
      const data = { id: 1, name: 'Sample Data' }
      this.emit('dataLoaded', data)
    }, 1000)
  }
  handleError(message: string) {
    this.emit('error', message)
  }
}

const app = new MyApp()
app.on('userLoggedIn', (username) => {
  console.log('username ' + username);
})
app.on('dataLoaded', (data) => {
  console.log('Data loaded:', data)
})
app.on('error', (message) => {
  console.error('Error occurred:', message)
})

app.login('Alice')
app.loadData()
app.handleError('Something went wrong')
```

可以看到在这个 `app` 的生命周期中（登录，加载数据，错误处理），每个阶段都会触发相应的事件，我们因此可以在 `app` 上附加一些事件监听器，来做一些自定义的操作。

等等，这是不是很像是订阅发布模式呢，我们可以通过事件监听器附加一些订阅，然后等到实际执行的时候触发发布操作，可以看到在 JavaScript 中似乎设计模式无处不在呢！

## 类型

这个模块提供了完善的类型定义，我们在使用他的时候，需要先自定义一个类将 `EventEmitter` 继承，继承过程中还需要指定我们可能涉及到的所有事件类型（通过泛型）

```TypeScript
interface MyEvents extends GeneralEventTypes {
  userLoggedIn: [username: string, age: number]
  dataLoaded: [data: any]
  error: [message: string]
}
class MyApp extends EventEmitter<MyEvents> {}
```

然后就可以注册监听器了，比如下面监听 `userLoggedIn` 事件，后面的回调函数签名必须是 `(username: string) => void`，无论是多还是少一个参数都不行。同理，假设闭门拼错了 `userLoggedIn` 这个单词，也会有类型提示来警告我们

```TypeScript
app.on('userLoggedIn', (username) => {
  console.log('username ' + username);
})
```

因此，`EventEmitter` 类的类型定义就呼之欲出了。我们首先定义最基本的事件集合 `GeneralEventTypes`，它可以被定义为一个接口或者类型别名，我倾向于接口，但源码里定义的时候选用了类型别名，好处可能是方便和不可拓展性。这里的索引名表示事件名称，索引类型是一个未知类型的数组（元组），用来表示后面该事件名称监听器需要接受的参数类型。然后再定义这个类，他的泛型参数需要可以赋值给 `GeneralEventTypes`

```TypeScript
interface GeneralEventTypes {
  [EventName: string]: unknown[]
}
class EventEmitter<EventTypes extends GeneralEventTypes> {}
```

再看一下内部方法的类型定义，以 `once` 方法为例，我们需要知道用户第一个传入的参数类型是什么，所以需要一个泛型参数，并且可以看到，我们需要一个工具类型定义，接受一个 `GeneralEventTypes` 和其中的事件名 `EventName`，并返回一个对应的函数

```TypeScript
type EventListener<EventTypes extends GeneralEventTypes, EventName extends keyof EventTypes> = (
  ...args: EventTypes[EventName]
) => void
public once<EventName extends keyof EventTypes>(
  event: EventName,
  listener: EventListener<EventTypes, EventName>,
): () => void {}
```

因为我们可能会对同一个事件创建多个监听器，因此需要一个 `map`，他的键是事件名，值是一个集合，用来储存所有的回调函数

```TypeScript
type EventMap<EventTypes extends GeneralEventTypes> = {
  [EventName in keyof EventTypes]: Set<EventListener<EventTypes, EventName>>
}
```

综上所述，我们可以写出所有的类型定义

```TypeScript
class EventEmitter<EventTypes extends GeneralEventTypes> {
  private listeners = {} as EventMap<EventTypes>
  public on<EventName extends keyof EventTypes>(
    event: EventName,
    listener: EventListener<EventTypes, EventName>,
    options?: { once?: boolean },
  ): () => void {}
  public un<EventName extends keyof EventTypes>(
    event: EventName,
    listener: EventListener<EventTypes, EventName>,
  ): void {}
  public once<EventName extends keyof EventTypes>(
    event: EventName,
    listener: EventListener<EventTypes, EventName>,
  ): () => void {}
  public unAll(): void {}
  protected emit<EventName extends keyof EventTypes>
    (eventName: EventName, ...args: EventTypes[EventName]): void {}
```

## 定义

上面提到了，我们这是一个订阅发布模式的类，因此可以写出下面的代码

```TypeScript
public on( event, listener, options) {
  if (!this.listeners[event]) this.listeners[event] = new Set()
  this.listeners[event].add(listener)

  if (options?.once) {
    const unsubscribeOnce = () => {
      this.un(event, unsubscribeOnce)
      this.un(event, listener)
    }
    this.on(event, unsubscribeOnce)
    return unsubscribeOnce
  }
  return () => this.un(event, listener)
}

public un(event, listener) {
  this.listeners[event]?.delete(listener)
}

protected emit(eventName, ...args): void {
  if (this.listeners[eventName]) {
    this.listeners[eventName].forEach((listener) => listener(...args))
  }
}
```

就这样，我们实现了一个简单的事件发射器类
