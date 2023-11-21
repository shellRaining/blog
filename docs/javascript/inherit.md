---
title: javascript 中的继承
tag:
  - javascript
date: 2024-01-24
---

## 前置知识

首先要知道 `new` 操作符的工作原理

1. 在内存中创建一个新的对象
1. 将对象的 `[[prototype]]` 特性设置为构造函数的 `prototype` 属性
1. 将构造函数中的 `this` 指向这个新对象
1. 执行构造函数中的代码
1. 如果没有返回值，则返回这个创建的新对象

## 原型链继承

首先构造一个例子

<CodeRunner :height=450>{{ protoChainCode }}</CodeRunner>

将其图形化以后是这样

<img width="400px" src='https://raw.githubusercontent.com/shellRaining/img/main/2401/proto_chain.jpg'>

这里首先创建两个构造函数，然后将 `Child` 的 `prototype` 赋值为 `Parent` 的一个实例

::: warning
这里如果打印 sr 的 `constructor`，会发现是 Parent，因为设置 Child 的 `prototype` 的时候，并没有手动更改这个实例的 `constructor`，导致查询 sc 的 `constructor` 是沿着原型链不断向上查询，直到含有 `constructor` 的实例，即 Parent 的 `prototype`
:::

::: info
每个构造函数的原型都是 Object 的实例，故每个 Object 都享有 Object 原型上的一些方法，比如 `toString` 等，然后 Object 的原型是原型链的最顶端， `Object.__proto__.__proto__` 为 null
:::

这种继承方式的缺点有二

1. 会导致`子类原型`上的引用类型字段在`子类实例`上共享
1. 难以调用父类的构造函数，无法传参

上述的代码就有体现，父类可以传参，但是子类无法调用父类的构造函数

## 盗用构造函数

实现代码如下

<CodeRunner :height=420>{{ constructorStealing }}</CodeRunner>

我们首先还是创建两个构造函数，然后在子类构造函数中调用父类构造函数，同时改变父类构造函数的 this 值 (通过使用 call 或者 apply)，这样就可以盗用父类构造函数，获取父类构造函数中定义的字段，引用类型也会新建一个副本

这样就解决了原型链中无法方便的向父类构造函数传参的问题，同时也顺带解决了引用字段被共享的问题

但是这样做也是有问题的，首先是无法获取父类原型上定义的方法，如果想要继承父类方法，必须在父类的构造函数中定义，但是函数也是一个对象，这样做会导致很多功能相同的对象被创建，导致空间的浪费

## 组合式继承

为了彻底解决上述两份代码的问题，可以使用组合继承的方式

<CodeRunner :height='450'>{{ compositional }}</CodeRunner>

图形化如下

<img width='300px' src='https://raw.githubusercontent.com/shellRaining/img/main/2401/composition.jpg'>

解决了无法继承方法的问题，沿着原型链向上查找可以看到父类的原型的方法

::: warning
注意到在子类原型上，调用了一次构造函数，导致上面有不需要也不可能用的到的一些属性 (因为对象查找遮蔽机制)

同时，这里面也没有很好的处理子类原型的 constructor，导致直接打印 constructor 会出现父类的名字
:::

## 原型式继承

该方法适合没有构造函数，但是想要享有适当的继承机制的情况

<CodeRunner :height='400'>{{ prototypal }}</CodeRunner>

通过对一个对象实例调用 object 方法，可以通过一个临时构造函数生成一个新的对象，该对象使用起来的实际体验类似于浅拷贝，其示意图如下

<img width='300px' src='https://raw.githubusercontent.com/shellRaining/img/main/2401/prototypal.png'>

如果仅仅是访问原型上的属性，不会有任何的副作用，但是一旦进行更改操作，就会在新创建的对象中创建一个同名的属性，发生了遮蔽的效果

这个 object 函数在 JavaScript 中有一个效果相同的函数 `Object.create`，参数和 object 相同，但是多了一个参数，用来新增属性 (需要属性的 descriptor)

## 寄生式继承

该方法是在原型式继承的基础上进行增强，当我们使用 object 函数创建完副本以后，会在副本对象本身上添加一些函数，这就是寄生式继承，类似与原型式继承和工厂函数模式

缺点就是无法重用函数，导致占用过多

## 寄生式组合继承

这个方法是效率最好的，代码如下

<CodeRunner :height='400'>{{ parastic_composition }}</CodeRunner>

首先创建一个基类还有一个子类,然后创建一个用来改变子类 prototype 的函数 `inherit`,这个函数使用临时构造函数创建了父类原型的克隆对象,然后将其 constructor 增强后赋值给该对象,然后改变子类 prototype 的指向

其图形化表示如下

<img width='300px' src='https://raw.githubusercontent.com/shellRaining/img/main/2401/parasitic.png'>

<script setup>
import { ref } from 'vue'

const protoChainCode = ref(`\
function Parent(age) { this.age = age; }
function Child() { this.lang = ["c"]; }
Parent.prototype.speak = function () { };
Child.prototype = new Parent(21)

const sr = new Child()

console.log(sr);
console.log(sr.__proto__);
console.log(sr.__proto__.__proto__);
console.log(sr.__proto__.__proto__.__proto__);
console.log(sr.__proto__.__proto__.__proto__.__proto__);\
`)

const constructorStealing = ref(`\
function Base(age) {
  this.age = age;
  this.lang = ["c", "python"];
}

function Sub(age, name) {
  Base.call(this, age);
  this.name = name;
}

const sr = new Sub(21, "sr");
const shellRaining = new Sub(21, "shellRaining");
sr.lang.push('lua')
console.log(sr);
console.log(shellRaining);\
`)

const compositional = ref(`\
function Base(age) {
  this.age = age;
  this.lang = ["c"];
}
function Sub(age, name) {
  Base.call(this, age);
  this.name = name;
}
Base.prototype.speak = function () {
  console.log(this.name, this.lang);
};
Sub.prototype = new Base();

const sr = new Sub(21, "sr");
const shellRaining = new Sub(21, "shellRaining");
sr.lang.push("python");
sr.speak();
shellRaining.speak();\
`)

const prototypal = ref(`\
const base = { age: 21, lang: ["c"] };
function object(target) {
  function f() {}
  f.prototype = target;
  return new f();
}
const sr = object(base);
const shellraining = object(base);
sr.lang.push("python");
shellraining.age = 22
console.log(sr.age, sr.lang);
console.log(shellraining.age, shellraining.lang);\
`)

const parastic_composition = ref(`\
function Base(age) {
  this.age = age;
}
function Sub(age, name) {
  Base.call(this, age);
  this.name = name;
}
Base.prototype.speak = function () {};
(function inherit(Base, Sub) {
  const prototype = Object.create(Base.prototype);
  prototype.constructor = Sub;
  Sub.prototype = prototype;
})(Base, Sub);

const sr = new Sub(21, "sr");
console.log(sr);
console.log(sr.__proto__);
console.log(sr.__proto__.__proto__);\
`)
</script>
