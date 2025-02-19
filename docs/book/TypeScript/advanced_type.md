---
title: TypeScript 高级类型
tag:
  - book
  - typescript
date: 2024-07-05
---

## 泛型

我们主要讲解 TypeScript 中泛型独特的地方，关于语法就不细说了。

### 类型参数默认类型

泛型参数和函数的参数很类似，可以定义默认的类型，例子如下：

```typescript
function id<T = number>(x: T): T {
  return x;
}
```

这里如果调用 `id()` 函数的同时没有传入泛型类型参数，那么默认类型就是 `number`。

### 泛型约束

有时候我们并不希望一个泛型函数的参数是任意类型，而是可以是某个类型的子类型，这时候就可以使用泛型约束功能，例子如下：

```typescript
function id<T extends Point>(x: T): T {
  return x;
}
```

我们将泛型参数设置为 `Point` 的子类型，并且输入输出值的类型都是这个泛型。

泛型约束就像是一个漏斗，父类型一般都是比较宽松的，然后通过 `extends` 关键字，将子类型进行细化（就像是经过漏斗筛选一样）

同时泛型约束可以搭配类型参数默认类型一起使用，其中默认类型必须满足泛型约束

---

我们还需要讨论基约束这个概念，才能更好的理解泛型约束。每个类型参数都有一个基约束，如果定义了泛型约束，基约束就是共有三种情况，如果没有定义泛型约束，基约束就是 `Object` 类型。具体分类如下：

1. `<T extends U>` 这表示约束泛型 `T` 的是另一个泛型 `U`
2. `<T extends type>` 这表示 `T` 的基约束是某个特定的类型 `type`
3. `<T>` 这隐晦的表示 `T` 的基约束是空对象字面量，也或者说是 `Object` 类型

---

我们写代码的时候还会遇到下面的错误：

```typescript
interface Point {
  x: number;
  y: number;
}

function fn<T extends Point>(p: T): T {
  return { x: 1, y: 1 };
}
```

这里就会爆出错误，说我们的返回值的类型不能赋给 `T`，这是因为我们接受的类型可能为一个三维坐标（他同时满足 Point 的泛型约束），而这里返回值写死了是一个二维坐标，无法满足输入输出类型相同这个条件。

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

> [!note]
> 我感觉这个功能很少用到，虽说具有防止污染全局命名空间的能力，但是就是不太习惯

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

索引类型查询还可以用于非对象类型（顶端类型和基本类型），其中顶端类型是需要特殊记忆的，基本类型是先转化为对应的包装对象，然后进行 `keyof` 操作，比如：

```typescript
type T = keyof any; // string | number | symbol
type T = keyof unknown; // never
type T = keyof boolean; // 'toString' | 'valueOf'
```

当索引类型查询和*联合类型*与*交叉类型*结合起来的时候，就变得很有意思了 `keyof (A & B) === keyof A || keyof B`，看起来像不像一个乘法分配律。

同理 `keyof (A | B) === keyof A & keyof B` 也是成立的

### 索引访问类型

用如下的语法可以获取一个对象类型的字段的类型 `T[k]`，其中 `T` 是一个对象类型，`k` 是一个键名

## 映射对象类型

映射对象类型是一种很有意思的类型，能够将一个对象映射为新的对象类型。很类似一个 `map` 的操作，语法如下

```TypeScript
{ readonly [P in K]? : T }
```

在该语法中，`readonly` 和问号都是可选的，`K` 是要遍历的类型（一般是一个联合类型），因为最终遍历的项 `P` 要作为新对象类型的键，因此 `K` 类型必须可以赋值给 `PropertyKey`。

由于上面的特性，我们使用映射对象类型的时候经常搭配索引类型查询和索引访问类型使用，三者结合起来能实现很强大的功能。

### 同态映射对象类型

强大也带来了潜在的复杂度，比如如何处理他的两个修饰符，只读和可选。我们这里先介绍一下**同态映射对象类型（Homomorphic Mapping Object Type）**这个概念，如果映射后的对象类型结构和源对象类型结构完全一致，这种映射对象类型就可以称作同态映射对象类型的。更具体来说，它具有如下的结构

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

> [!note]
> 为什么 TypeScript 会这样设计呢？主要有以下几个原因：
> 实用性： 对于大多数情况，我们并不真的需要把原始类型当作对象来映射。如果我们想把一个 string 类型映射成其他类型，通常我们期望的结果仍然是 string，而不是一个包含一堆字符串方法映射的对象。
> 性能： 如果 TypeScript 真的对原始类型的每一个方法名进行迭代，会产生大量不必要的计算，尤其是在大型项目中，可能会导致性能问题。
> 类型安全： 即使 TypeScript 允许你迭代原始类型的包装对象属性，你也无法保证这些属性在运行时一定存在。因为 JavaScript 允许在原型链上动态添加或修改属性。

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

最终的对象映射类型结构肯定和原对象类型结构不同，因此是非同态对象映射类型，但是由于 `U` 的泛型约束，我们可以保证 `U` 的属性修饰符和 `T` 的属性修饰符一致。

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

`infer` 关键字还可以再一个类型声明中多次使用，比如：

```typescript
type CT<T> = T extends { a: infer U; b: infer U } ? U : never;
type T = CT<{ a: string; b: number }>; // string | number

type CT<T> = T extends { a: infer U; b: infer V } ? [U, V] : never;
type T = CT<{ a: string; b: number }>; // [string, number]
```

## 内置工具类型

### `Partial<T>`

Partial 接受一个对象模样的类型（比如接口，对象字面量，对象的类型别名等），将其所有的字段设置为可选的，他的定义和使用方法：

```typescript
/**
 * Make all properties in T optional
 */
type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface A {
  x: number;
  y: number;
}

type T = Partial<A>; // { x?: number; y?: number; }”
```

如果你传入了基本类型……根据上面同态对象映射的语法，他会原本返回这个基本类型，而不是进行装包

### `Required<T>`

Required 和 Partial 相反，将所有的字段设置为必选的，他的定义和使用方法：

```typescript
/**
 * Make all properties in T required
 */
type Required<T> = {
  [P in keyof T]-?: T[P];
};

interface A {
  x?: number;
  y?: number;
}

type T = Required<A>; // { x: number; y: number; }
```

### `Readonly<T>`

Readonly 将所有的字段设置为只读的，他的定义和使用方法：

```typescript
/**
 * Make all properties in T readonly
 */
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

interface A {
  x: number;
  y: number;
}

type T = Readonly<A>; // { readonly x: number; readonly y: number; }

const a: T = { x: 1, y: 2 };
a.x = 3; // error
a.y = 4; // error
```

### `Record<K, T>`

Record 接受一个 `PropertyKey` 类型的 `K` 和一个类型 `T`，返回一个对象类型，这个对象类型的键名是 `K` 的内容，值是 `T` 类型，他的定义和使用方法：

```typescript
/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends keyof any, T> = {
  [P in K]: T;
};
```

这里 `keyof any` 在前面提到过，是一个联合类型，包含了 `string`，`number`，`symbol` 这三种类型。

### `Pick<T, K>`

Pick 接受一个对象模样的类型 `T` 和一个 `PropertyKey` 类型的联合类型 `K`，返回一个对象类型，这个对象类型的键名既在 `T` 中，又在 `K` 中，对应的类型是 `T` 中对应的类型，他的定义和使用方法：

```typescript
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

interface A {
  x: number;
  y: number;
  z: number;
}

type T = Pick<A, "x" | "y">; // { x: number; y: number; }
```

### `Omit<T, K>`

Omit 和 Pick 相反，接受一个对象模样的类型 `T` 和一个 `PropertyKey` 类型的联合类型 `K`，返回一个对象类型，这个对象类型的键名既在 `T` 中，又不在 `K` 中，对应的类型是 `T` 中对应的类型，他的定义和使用方法：

```typescript
/**
 * Construct a type with the properties of T except for those in type K.
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

interface A {
  x: number;
  y: number;
  z: number;
}

type T = Omit<A, "x" | "y">; // { z: number; }
```

### `Exclude<T, U>`

Exclude 接受两个类型 `T` 和 `U`，返回一个类型，这个类型是 `T` 中的所有类型，但是不在 `U` 中的类型，他的定义和使用方法：

```typescript
/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U> = T extends U ? never : T;

type T = Exclude<string | undefined, null | undefined>; // string
```

这里用到了裸类型的分布式条件类型特性，可以看前面的讲解

### `Extract<T, U>`

Extract 和 Exclude 相反，接受两个类型 `T` 和 `U`，返回一个类型，这个类型是 `T` 中的所有类型，但是在 `U` 中的类型，他的定义和使用方法：

```typescript
/**
 * Extract from T those types that are assignable to U
 */
type Extract<T, U> = T extends U ? T : never;

type T = Extract<string | undefined, null | undefined>; // undefined
```

### `NonNullable<T>`

NonNullable 接受一个类型 `T`，返回一个类型，这个类型是 `T` 中的所有类型，但是不包含 `null` 和 `undefined`，他的定义和使用方法：

```typescript
/**
 * Exclude null and undefined from T
 */
type NonNullable<T> = T & {};

type T = NonNullable<string | null | undefined>; // string
```

这个写法很神奇，我最开始的实现方式是 `Exclude<T, null | undefined>`，这样写和官方实现比起来确实不够优雅，但原理需要讲解一下，比如我们传入了 string 类型，`string & {}` 会先发生一次装包，让 string 变成对应的对象，然后进行交叉操作，最终结果肯定还是 string 对应的对象，因此结果还是 string……我个人是看不懂这一系列操作啦，不过既然可以用，还是得记忆一下

还有就是空对象字面量 `{}`，他表示不允许访问任何自定义属性，但是 `Object` 原型上的方法和属性还是可以访问的

### `Parameters<T>`

Parameters 接受一个函数类型 `T`，返回一个元组类型，这个元组类型是 `T` 函数的所有参数类型组成的元组，他的定义和使用方法：

```typescript
/**
 * Obtain the parameters of a function type in a tuple
 */
type Parameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

type T = Parameters<(x: number, y: string) => void>; // [number, string]
```

### `ConstructorParameters<T>`

ConstructorParameters 接受一个构造函数类型 `T`，返回一个元组类型，这个元组类型是 `T` 构造函数的所有参数类型组成的元组，他的定义和使用方法：

```typescript
/**
 * Obtain the parameters of a constructor function type in a tuple
 */
type ConstructorParameters<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never;

type T = ConstructorParameters<abstract new (x: number, y: string) => void>; // [number, string]
```

### `ReturnType<T>`

ReturnType 接受一个函数类型 `T`，返回一个类型，这个类型是 `T` 函数的返回值类型，他的定义和使用方法：

```typescript
/**
 * Obtain the return type of a function type
 */
type ReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any;

type T = ReturnType<(x: number, y: string) => void>; // void
```

### `InstanceType<T>`

InstanceType 接受一个构造函数类型 `T`，返回一个类型，这个类型是 `T` 构造函数的实例类型，他的定义和使用方法：

```typescript
/**
 * Obtain the instance type of a constructor function type
 */

type InstanceType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : any;

type T = InstanceType<abstract new (x: number, y: string) => void>; // { x: number, y: string }
```

## 类型查询

TypeScript 对 JavaScript 的 `typeof` 操作符进行了拓展，让其也可以在类型声明中使用，其余没有什么好讲的

```typescript
const a = { x: 0 };
type T = typeof a; // { x: number }
```

## 类型断言

有时候一些工具库的类型声明做的不好，导致开发者比编译器更清晰某个变量的类型，这时候可以通过类型断言来细化这个变量，他有两种语法

1. 尖括号语法

   ```typescript
   const username = document.getElementById("username") as HTMLInputElement; // HTMLElement
   username.value(
     // error
     <HTMLElement>username,
   ).value; // right
   ```

   由于这种语法和 `JSX` 语法冲突，所以不推荐使用

2. as 语法

   ```typescript
   const username = document.getElementById("username") as HTMLInputElement; // HTMLElement
   username.value(
     // error
     username as HTMLElement,
   ).value; // right
   ```

`<T>expr` 和 `expr as T` 类型断言是有前提的，不能随意断言，必须满足两个条件之一：

1. T 类型能够赋值给 expr 表达式的类型
2. expr 表达式的类型能够赋值给 T 类型

这表示类型断言能够细化和宽泛化一个变量的类型，但不能像 c 语言那样强制转化类型

---

还有两种特殊的断言

1. const 断言
   是一种特殊的尖括号或者 as 断言，他会将一个变量断言为一个不可变的字面量类型，比如将数组转换为元组，string 转换成字符串字面量

   ```typescript
   const a = "hello" as const; // 'hello'
   const b = [1, 2, 3] as const; // [1, 2, 3]
   ```

2. 非空断言
   在写函数的时候我们通常会有一个判断参数是否合法的校验，假设这个校验在另一个外部的函数中，他会确保变量不为空，但是编译器并不知道这一点，这时候我们可以使用非空断言 `!` 来告诉编译器这个变量一定不为空

   ```typescript
   function fn(a: string | null) {
     if (isNull(a)) {
       return;
     }
     return a!.toUpperCase();
   }
   ```

## 类型细化

类型细化这个概念……其实和类型断言很相关，就是编译器替我们自动细化类型的过程，比如下面的例子：

```typescript
type A = { x: number } | { y: string };
function fn(a: A) {
  if ("x" in a) {
    return a.x;
  }
  return a.y;
}
```

我们当然会觉得这个过程理所应当，但他确实是一个知识点，一个润物细无声的过程，因此这里不多讲述了

唯一新的知识点是断言函数，它有两种形式

1. ```typescript
   function assert(x: unknown): asserts x is T) {}
   ```

   只有当 x 的类型是 T 的子类型的时候，这个函数才会返回，否则会抛出异常

2. ```typescript
   function assert(x: unknown): asserts x {}
   ```

   只有当 x 的值为真的时候，这个函数才会返回，否则会抛出异常

这种函数的返回值都是 `null` 或者 `undefined`，因为他们都会抛出异常，他们可以用来细化类型

```typescript
function assertIsNumber(x: any): asserts x is number {
  if (typeof x !== "number") {
    throw new Error("Not a number");
  }
}

function f(x: any, y: any) {
  x: // any
  y: // any

  assertIsNumber(x);
  assertIsNumber(y);

  x: // number
  y: // number
}
```
