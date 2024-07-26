---
title: TypeScript 高级类型
tag:
  - book
  - typescript
date: 2024-07-05
---

## 泛型

我们主要讲解 TypeScript 中泛型独特的地方，关于语法就不细说了。

### 泛型约束

有时候我们并不希望一个泛型函数的参数是任意类型，而是可以是某个类型的子类型，这时候就可以使用泛型约束功能，例子如下：

```typescript
function id<T extends Point>(x: T): T {
  return x;
}
```

我们将泛型参数设置为 `Point` 的子类型，并且输入输出值的类型都是这个泛型

---

我们还需要讨论基约束这个概念，才能更好的理解泛型约束。共有三种情况

1. `<T extends U>` 这表示约束泛型 `T` 的是另一个泛型 `U`
2. `<T extends type>` 这表示 `T` 的基约束是某个特定的类型 `type`
3. `<T>` 这隐晦的表示 `T` 的基约束是空对象字面量，也或者说是 `Object` 类型

---

我们写代码的时候还会遇到下面的错误：

```typescript
function fn<T extends Point>(p: T): T {
  return { x: 1, y: 1 };
}
```

这里就会爆出错误，说我们的返回值的类型不能赋给 `T`，这是因为我们接受的类型可能为一个三维坐标，而这里返回值写死了是一个二维坐标，无法满足输入输出类型相同这个条件。

### 泛型和其他的结合

泛型还可以和函数，类，接口，类型别名等结合使用，但我们不会细讲，就举一个泛型和类型别名的实例吧。我们需要构建一个二叉树，这个树的所有节点的值的类型都是一样的，定义如下：

```TypeScript
type Tree<T> {
	left: Tree<T> | null;
  right: Tree<T> | null;
  value: T;
}
```

这里既用到了类型别名的递归定义能力，也用到了泛型的能力。

## 局部类型

和 JavaScript 一样，TypeScript 中的类型也是有作用域的，如果我们将类型定义在一个函数中，这些类型定义只能在这个函数中使用，出了函数不会承认的。

## 联合类型与交叉类型

联合类型表示或的概念，使用字符 `|`，交叉类型表示且的概念，使用字符 `&`

其中前者类似数学运算里面的加号，具有低优先级，后者则是乘号，具有高优先级，因此可以得到类似分配律一样的东西（我暂时还没看到应用之处）

感觉是蛮简单的一个知识点，等遇到坑我再回来填

## 索引类型

对于一个对象来说，我们可以根据他的索引来访问他的属性，同理，对一个对象类型来说，我们可以使用索引来访问他的属性的类型

### 索引类型查询

通过索引类型查询我们可以知道一个对象类型的属性名类型，他的结果是一个由字符串字面量组成的联合类型，比如：

```typescript
interface Point {
  x: number;
  y: number;
}
type T = keyof Point; // 'x' | 'y'
```

当索引类型查询和*联合类型*与*交叉类型*结合起来的时候，就变得很有意思了 `keyof (A & B) === keyof A || keyof B`，看起来像不像一个乘法分配律

### 索引访问类型

用如下的语法可以获取一个对象类型的字段的类型 `T[k]`，其中 `T` 是一个对象类型，`k` 是一个键名

## 映射对象类型

映射对象类型是一种很有意思的类型，能够将一个对象映射为新的对象类型。很类似一个 `map` 的操作，语法如下

```TypeScript
{ readonly [P in K]? : T }
```

在该语法中，`readonly` 和问号都是可选的，`K` 是要遍历的类型，因为最终遍历的项 `P` 要作为新对象类型的键，因此 `K` 类型必须可以赋值给 `PropertyKey`。

由于上面的特性，我们使用映射对象类型的时候经常搭配索引查询类型和索引访问类型使用，三者结合起来能实现很强大的功能。

### 同态映射对象类型

强大也带来了潜在的复杂度，比如如何处理他的两个修饰符，只读和可选。我们这里先介绍一下**同态映射对象类型**这个概念，如果映射后的对象类型结构和源对象类型结构完全一致，这种映射对象类型就可以称作同态的。更具体来说，它具有如下的结构

```typescript
{ readonly [K in keyof T]? : X }
```

和上面相比看似只多了 `keyof` 操作，但实际上这保证了源对象和映射后的对象结构一致。

同态对象映射类型的一个性质是，可以保持源对象的修饰符不变，我们这里看个例子：

```TypeScript
type T = { a?: string; readonly b: number }
type K = keyof T
type MOT = { [P in K]: T[P] } // { a: string | undefined, b: number }
```

上面的 `MOT` 很明显不符合同态对象映射语法，导致最终映射后的对象结构出现了变化，a 字段失去了可选修饰，b 字段失去了只读修饰。

还有一些特殊情况，比如 `T` 类型是一个原始类型，那么不会发生映射的操作，例子如下：

```typescript
type HMOT<T, X> = { [p in keyof T]: X };
type T = string;
type R = HMOT<T, boolean>; // string
```

同理，如果 `T` 是一个联合类型，则对联合类型中的每个成员类型，都要进行求同态映射对象类型的操作，并将结果构造成一个联合类型。

### 修饰符拷贝

为了应对上面的问题，TypeScript 特殊处理了下面的语法：

```typescript
{ [P in K]: X }
```

这里的类型参数 `K` 如果有泛型约束 `K extends keyof T`，那么编译器也会将 `T` 的属性修饰符拷贝进去，看一个例子：

```typescript
type Pick<T extends object, U extends keyof T> = {
  [k in U]: T[k];
};
```

### 添加移除修饰符

我们可以在修饰符前面加上一个加号或者减号来表示增加或者删除该修饰符，语法如下：

```typescript
{ -readonly [p in keyof T]-? : T[P] }
```

这个语法可以使我们移除已有的修饰符，算是一个大进步！之前我们可以通过 `Partial` 工具类型来使所有字段可选，这时候我们同样可以构造一个 `Required` 工具类型来实现所有类型必选！

## 条件类型

条件类型的语法为 `T extends U ? X : Y`，这里的四个大写字母都表示一个类型，表示如果 `T` 能赋值给 `U`，那么返回 `X`，反之 `Y`，这个乍一看还是很简单的，但当 `T` 的类型复杂起来，还是有一点玄机。

### 分布式条件类型

在上面的语法中，如果 `T` 是一个裸类型参数，那么这个条件类型又被称作分布式条件类型。裸类型参数指没有被元组或者数组等包裹的类型参数。

如果这个裸类型参数同时还是一个联合类型，就会发生奇妙的事情，例子如下：

```TypeScript
T = A | B
T extends U ? X : Y // equal with (A extends U) ? X : Y | (B extends U) ? X : Y
```

我们可以利用这个特性实现过滤的效果，整个运算过程如下：

```typescript
type Exclude<T, U> = T extends U ? never : T

T = Exclude<string | undefined, null | undefined>
  = (string extends null | undefined ? never : string)
		| (undefined extends null | undefined ? never : string)
	= string | never
	= string
```

这里利用了 `never` 类型和任何类型做联合运算都会被合并的特性

---

但有时候我们想要避免分布式行为，可以按照如下的做法

```TypeScript
type CT<T> = T extends string ? true : false
type T = CT<string | number> // boolean

type CT<T> = [T] extends [string] ? true : false
```

## Infer 关键字

`infer` 关键字需要搭配条件类型的语法使用，`T extends infer U ? U : Y`，这里的 infer 必须出现在原来条件类型的类型 `U` 的位置上。内置工具类型 `ReturnType` 就是通过 infer 实现的。
