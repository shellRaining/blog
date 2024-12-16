---
title: rust 所有权
tag:
  - book
date: 2024-10-04
---

rust 是一门没有自动垃圾回收（GC）的语言，但他却能保证内存安全，这是因为他独特的所有权机制。我之前学习的语言大多是手动 GC（比如 c 语言） 或者自动 GC（比如 JavaScript）的，rust 提供了一个全新的视角来考量垃圾回收这个问题。

## 内存模型

理解所有权需要先了解 rust 变量分配的内存模型。对于标量类型，rust 直接存储在栈上；对于组合类型，他们既有可能存放在栈上，也有可能存放在堆上。当组合类型的长度可以确定的时候，比如一个长度已经确定的数组或者元组，他们直接存放在栈上，如果是一个包含动态大小类型（比如 Vec 或者 String）的结构体，那么这些字段会存储在堆上，而结构体本身（包含指向堆的指针）存储在栈上。

## 作用域

在 rust 中，除了定义数据类型的大括号（比如结构体……），剩下的所有大括号都会形成一个作用域。包括且不限于以下几种结构：

- if、while 等流程控制语句中的大括号
- match 模式匹配的大括号
- 单独的大括号
- 函数定义的大括号
- mod 定义模块的大括号

作用域结束后，内部定义的变量所占用的内存会被销毁释放

> [!note]
>
> 实际上被销毁这个说法不是完全正确的，因为字符串字面量是存储在全局代码段的，不会被销毁
>
> ```rust
> fn main(){
>     {
>       let s = "hello";
>       println!("{:p}", s);  // 0x7ff6ce0cd3f8
>     }
> 
>     let s = "hello";
>     println!("{:p}", s);  // 0x7ff6ce0cd3f8
> 
> ```

## 所有权的核心

1. rust 的每一个值都对应着一个变量，该==变量==被视为这个值的==所有者==
2. 同一时间段一个值只有一个所有者
3. 当所有者离开自己的作用域时，他所持有的值就会被回收

第三点保证了不会出现内存泄漏的问题，因为在离开作用域时，指针和他所指向的内存一定会被释放，具体来说 rust 会调用一个特殊的 drop 函数。同时第二点和第三点是相辅相成的，如果一个值可以同时拥有多个所有者，离开作用域的时候就会导致多次释放的问题，这也是蛮恐怖的。

```rust
fn main() {
    {
        let s1 = String::from("hello"); // 从此处起，s 开始有效
        // 使用 s
    }                                  // 此作用域已结束，调用 drop 函数
                                       // s 不再有效
}
```

> [!tip]
>
> 在 C++ 中，这种 item 在生命周期结束时释放资源的模式有时被称作**资源获取即初始化**（*Resource Acquisition Is Initialization (RAII)*）。这就是 rust 社区里面经常会看到的一个名词，所以不要害怕，名词之类的东西，你只要了解以后就不会感觉神秘和畏惧

### 从内存视角来看

上面的例子中，s 表示的是一个可变字符串的变量，它实际上是一个胖指针，存储在栈上，胖指针内部的指针指向了字符串数据实际存储的堆地址，如图所示

![String in memory](https://2f0f3db.webp.li/2024/10/trpl04-01.svg)

在离开作用域后，最先被销毁的是 s1 这根指针，然后他指向的字符串实际内容会被销毁，因此 rust 编译器可以绝对保证不会出现野指针的情况（或者叫悬挂引用）

```rust
fn main(){
  let sf = f();  // f() 返回值是一个无效引用
}

fn f() -> &String {
  let s = String::from("hello");
  &s  // 返回 s 的引用
}   // s 跳出作用域，堆中 String 字符串被释放
```

## rust 的三种语义

### rust 变量的“复制”

与其说变量复制，倒不如说是变量所有权的移动（move），听我细细道来。

下面的复制操作，在其他语言中这样赋值是正确的，但在Rust中这样的赋值会报错。

```rust
fn main(){
  let s1 = String::from("hello");
  let s2 = s1;

  // 将报错error: borrow of moved value: `s1`
  println!("{},{}", s1, s2); 
}
```

从所有权的角度来看，s1 首先获取字符串胖指针的所有权，然后被 s2 抢走了（因为同一时间的两个变量不能同时占用同一个数据的所有权）因此下面的情况可能在其他语言出现，但在 rust 中绝对不会，如果出现这种情况，就会导致前面提到的多次释放问题

![s1 and s2 pointing to the same value](https://2f0f3db.webp.li/2024/10/trpl04-02.svg)

因此权衡之下，rust 选择直接将 s1 无效化（s1 仍然存在，只是变成未初始化变量，rust 不允许使用未初始化变量，可重新为其赋值）

![s1 moved to s2](https://2f0f3db.webp.li/2024/10/trpl04-04.svg)

综上所述，这个过程看起来就像是发生了变量的移动，而不是传统意义上的复制操作

### rust 真正意义上的复制

默认情况下，在将一个值保存到某个位置时总是进行值的移动，使得只有目标位置才拥有这个值，而原始变量将变成暂时不可用的状态。这是 rust 的移动语义。

rust 还有 Copy 语义，和 Move 语义几乎相同，唯一的区别是 Copy 后，原始变量仍然可用，这就是我们最熟悉的复制。但 rust 默认是使用移动语义，如果想要使用复制语义，要求要拷贝的数据类型实现了Copy Trait。

Rust中默认实现了Copy Trait的类型，包括但不限于：

- 所有整数类型
- 所有浮点数类型
- 布尔类型
- 字符类型，char
- 元组，当且仅当其包含的类型都可以 Copy 的时候。比如 `(i32, i32)` 是 Copy 的，但 `(i32, String)` 不是
- 共享指针类型或共享引用类型

因此下面的代码就可以正常运行，因为 i32 类型已经实现了 copy trait

```rust
fn main() {
  let x = 3;   // 3是原始数据类型，它直接存储在栈中，所以x变量的值是3，x拥有3
  let n = x;   // Copy x 的值到变量n，n 现在拥有一个 3，但 x 仍然拥有自己的 3
}
```

而对于我们自定义的结构体，由于没有实现 copy trait（还有后面提到的 clone trait），就会有一个报错

```rust
#[derive(Debug)]
struct Xyz(i32, i32);

#[derive(Copy, Clone, Debug)]
struct Def(i32, i32);

let x = Xyz(11, 22);
let y = x;
println!("x: {:?}", x); // 会报错 // [!code error]
println!("y: {:?}", y);

let d = Def(33, 44);
let e = d;
println!("d: {:?}", d);
println!("e: {:?}", e);
```

### rust 的克隆（深拷贝）

只有那些实现了 Clone Trait 的类型才可以进行克隆，常见的数据类型都已经实现了 Clone，因此它们可以直接使用 `clone()` 方法来克隆。对于那些没有实现 Clone Trait 的自定义类型，需要手动实现 Clone Trait。在自定义类型之前加上 `#[derive(Clone)]` 即可。

要注意 Copy 和 Clone 时的区别，如果不考虑自己实现 Copy trait 和 Clone trait，而是使用它们的默认实现，那么：

- Copy 时，只拷贝变量本身的值，如果这个变量指向了其它数据，则不会拷贝其指向的数据
- Clone 时，拷贝变量本身的值，如果这个变量指向了其它数据，则也会拷贝其指向的数据

综上所述，Copy 是浅拷贝，Clone 是深拷贝，Rust会对每个字段每个元素递归调用 `clone()`，直到最底部。

## 函数传参和返回时的所有权变化

**函数参数类似于变量赋值，在调用函数时，会将所有权移动给函数参数**。

**函数返回时，返回值的所有权从函数内移动到函数外变量**。

```rust
fn main(){
  let s1 = String::from("hello");
  let s2 = f1(s1); // 所有权从s1移动到f1的参数，然后f1返回值的所有权移动给s2
  println!("{}", s2); // 注意，println!()不会转移参数s2的所有权

  let x = 4;
  f2(x);     // 没有移动所有权，而是拷贝一份给f2参数
}  // 首先x跳出作用域，
   // 然后s2跳出作用域，并释放对应堆内存数据，
   // 最后s1跳出作用域，s1没有所有权，所以没有任何其他影响

fn f1(s: String) -> String {
  let ss = String::from("world"); 
  println!("{},{}", s,ss);
  s  // 返回值s的所有权移动到函数外
}    // ss跳出作用域

fn f2(i: i32){
  println!("{}",i);
}   // i跳出作用域
```

## 参考

1. [https://rust-book.junmajinlong.com/ch6/02_move_copy.html#copy%E8%AF%AD%E4%B9%89](https://rust-book.junmajinlong.com/ch6/02_move_copy.html#copy%E8%AF%AD%E4%B9%89)
2. [https://rustwiki.org/zh-CN/book/ch04-01-what-is-ownership.html](https://rustwiki.org/zh-CN/book/ch04-01-what-is-ownership.html)
