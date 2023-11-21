---
title: JavaScript 中的 RegExp
tag:
  - book
  - javascript
date: 2024-06-29
---

## 模式和修饰符

我们可以通过两种方式创建正则表达式

1. 通过 `new RegExp(pattern, flags)` 类来创建，这两个参数都是字符串类型
2. 通过简写语法 `/pattern/flags` 来创建

第二种写法和第一种等价，简写语法实际上就是正则类的一个实例。但是如果创建一个动态的正则表达式，我们必须用第一种，因为简写语法无法使用模板字符串

### 修饰符

修饰符有下面几个

1. `g` 表示匹配全部，和 neovim 的修饰符相同
2. `i` 表示大小写不敏感
3. `u` 表示开启完整的 Unicode 支持
4. `m` 表示开启多行模式
5. `s` 表示开启 dotall 模式，允许 `.` 去匹配换行符
6. `y` 表示开启粘滞模式

### 简单的方法

#### `str.match(regex)`

他有三种工作情况：

1. 如果正则对象有 `g` 修饰符，那么返回一个数组，其中是所有的匹配项，没有其他信息
2. 如果找到了匹配项，那么返回一个数组，数组第一项是匹配的结果，还有一些额外的信息，比如 `index`，`length` 等
3. 如果没有匹配项，直接返回 `null`，所以要注意检测

#### `str.replace(regex, replacement)`

第一个参数没有什么好说的，后面的 `replacement` 有一些特殊用法。

- `$&` 用来插入被匹配到的字符串，比如 

  ```JavaScript
  alert( "I love HTML".replace(/HTML/, "$& and JavaScript") ); // I love HTML and JavaScript
  ```

- ``$ˋ`` 用来匹配被替换文本之前的文本，比如

  ```JavaScript
  alert( "I love HTML".replace(/HTML/, "$` and JavaScript") ); // I love I love  and JavaScript
  ```

- `$'` 用来匹配被替换文本之后的文本

- `$n` 与分组有关

- `$<name>` 同上

- `$$` 用来插入字符 `$`

  #### `regex.match(str)`

  用来检测传入字符串是否满足该正则规则，返回一个布尔值

## 字符类

我们上个章节主要介绍了正则表达式的修饰符，现在讲一下正则对象的中的字符类，主要有以下几个

1. `\n` 用来表示数字类
2. `\s` 用来表示空格类，包括换行符，制表符，还有一些特殊字符
3. `\w` 用来表示单字类，单字被定义为拉丁字母或数字或下划线 `_`
4. `.` 用来匹配所有的字符（除了 `\n` 换行符）

其中每个类都有他们自己的反向类，可以通过将字符大写来访问，比如 `\N`

## Unicode 支持

Unicode 中的每个字符都有很多的属性，来表示他们的类别，我们可以根据这些类别来进行筛选字符，比如

```JavaScript
let str = "A ბ ㄱ";

alert( str.match(/\p{L}/gu) ); // A,ბ,ㄱ
alert( str.match(/\p{L}/g) ); // null（没有匹配项，因为没有修饰符 "u"）
```

其中 `L` 表示字符，他还有一些子类别，比如 `Ll` 表示小写字符，具体可以看 [https://zh.javascript.info/regexp-unicode#unicode-shu-xing-p](https://zh.javascript.info/regexp-unicode#unicode-shu-xing-p)

## 锚点

这里介绍三个锚点

1. `^` 用来检测是否在行首
1. `$` 用来检测是否在行尾
1. `\b` 用来检测是否在单词的边界，注意不适用于非拉丁字母

## 转义

有一些特殊的字符因为在正则表达式中有特殊作用，所以想要匹配这些字符需要进行转义，这些字符包括 `[ ] { } ( ) \ ^ $ . | ? * +`。

转义主要是分两种情况讨论，如果我们使用简写语法，还需要包含 `/` 字符进行转义。如果是字符串类型构造，我们还需要注意字符串还会对字符预先进行转义，比如

```JavaScript
alert( "Chapter 5.1".match(/\d\.\d/) ); // 5.1（匹配了！）
let reg = new RegExp("\d\.\d");
alert( "Chapter 5.1".match(reg) ); // null
```

这是因为字符串也有转义的功能，比如 `\n` 就是换行符，这里 `\d` 由于不表示任意有含意的转义，因此被忽略，正确形式为

```JavaScript
let regStr = "\\d\\.\\d";
alert(regStr); // \d\.\d（现在对了）
let regexp = new RegExp(regStr);
alert( "Chapter 5.1".match(regexp) ); // 5.1
```
