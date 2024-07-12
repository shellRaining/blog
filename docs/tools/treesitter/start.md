---
title: treesitter 入门
tag:
  - tools
  - treesitter
date: 2024-05-18
---

## 什么是 treesitter

treesitter 是一个用来生成*解析器*生成工具，同时还是一个*增量解析*库。能够从一份源代码（可以是你提供的文件或者是一个源代码片段）中生成一个精确的语法树

比如我们可以使用 treesitter 的 node 绑定来解析 JavaScript 代码。这里提到的 treesitter 就是我们实际上使用的工具，他是 c 语言编写的，但是提供了很多语言的绑定（通过 c 语言的 API 暴露出来），比如我们这里使用的 node 绑定，我们便可以通过 node 来调用其本身的功能，比如接受某种语言的特定语法规则，然后接受源代码并解析。

```javascript
const Parser = require("tree-sitter");
const JavaScript = require("tree-sitter-javascript");

// 使用 tree-sitter 的 node 绑定来创建一个解析器
const parser = new Parser();
// 设置解析器可以解析的语言为 JavaScript，这里的 JavaScript 是一个语法规则
parser.setLanguage(JavaScript);

const sourceCode = "let x = 1; console.log(x);";
const tree = parser.parse(sourceCode); // 传入源代码，返回一个语法树
console.log(tree.rootNode.toString()); // 打印语法树
```

最终打印结果为，这是我们的源代码 `let x = 1; console.log(x);` 的语法树

```plaintext
(program
  (lexical_declaration
    (variable_declarator
      name: (identifier)
      value: (number)
    )
  )
  (expression_statement
    (call_expression
      function:
        (member_expression
          object: (identifier)
          property: (property_identifier)
        )
      arguments: (arguments (identifier))
    )
  )
)
```

并且还可以获取其中每个节点的详细信息，比如节点的类型、开始和结束位置等。

```javascript
const callExpression = tree.rootNode.child(1).firstChild;
console.log(callExpression);
```

输出结果为

```plaintext
CallExpressionNode {
  type: call_expression,
  startPosition: {row: 0, column: 11},
  endPosition: {row: 0, column: 25},
  childCount: 2,
}
```

## 基础概念

首先需要知道四个名词

- `Parser`：解析器，用来解析源代码（需要指定 Language 和源代码）
- `Language`：语言，用来描述源代码的语法规则，通常由 treesitter CLI 制作出来，我们上面引入的 `tree-sitter-javascript` 就是一个语言
- `Tree`：语法树，解析器解析源代码后生成的树状结构
- `Node`：节点，语法树中的一个节点，包含节点的类型、开始和结束位置等信息。Node 有两种类型：`NamedNode` 和 `Anonymous`，这是因为有些无意义的节点不需要命名，比如一个 if 语句中的括号。我们选择保留匿名节点是为了方便语法高亮（比如彩虹括号🌈）

## Query

我们可以使用特定形式的 query 语句来搜索一个给定语法树内的特定节点（听起来很像是 JavaScript 正则匹配）

### 查询格式

我们首先要知道两个概念

- 元素（node's type)：节点的类型，比如 `call_expression`、`if_statement` 等，是一个不可分割的最小定义单元
- 表达式（S-expression）：表现为树结构，可以递归的定义为 `表达式 = 元素 | (元素 表达式*)`

我们可以将一个查询看作是一个 S-expression，比如下面这个查询

```plaintext
(binary_expression (number_literal) (number_literal))
```

就是一个简单的查询，binary_expression 是一个元素，后面的两个 (number_literal) 是表达式，而这段查询的意思是查找一个二元表达式，这个表达式的两个子节点都是 number_literal 元素。这就是一个最基本的查询，这里我们举另一个例子：

<img width='' src='https://raw.githubusercontent.com/shellRaining/img/main/2405/ts_query.png'>

从上图我们可以看出，我们要找的表达式如下

```plaintext
(binary_expression (binary_expression) (number)) @exp
```

这个查询的意思是找到一个二元表达式，这个表达式的左子节点是一个二元表达式，右子节点是一个 number

所以符合条件的就是第二行代码，在图中也是用蓝色标示出来

### 字段

有的 `Language` 在编写的时候 `Node` 会额外附带一个字段，我们可以使用其来进行更精确的匹配。字段就是在元素或者表达式前面加上一个标识符和一个冒号，比如下面这个查询

```plaintext
(binary_expression right: (number)) @node
```

这个查询的意思是找到一个二元表达式，这个表达式的右子节点是一个 number，这里的 `right` 就是一个字段，用来指定二元表达式的右子节点。这样我们就可以匹配

```javascript
1 + 3 // yes
1 + ‘5’ // no
'5' + 3 // yes
```

### 否定符

我们可以使用 `!` 符号来表示否定，使用方法是放到一个字段名前面，比如下面这个查询

```plaintext
(lexical_declaration
  (variable_declarator
      name: (identifier)
      !value
    ) @var
) @decl
```

我们就是为了找到一个词法声明，并且本身是一个变量声明，但是这个变量声明没有进行初始化，这样我们就可以匹配

```javascript
let x; // yes
let x = 1; // no
```

::: warning
为什么不可以去掉 `name: (identifier)`，去掉以后匹配会扩大到所有变量声明
:::

### 匿名节点查询

我们有时候想要找到一个二元表达式，但是不关心这个表达式的左右子节点是什么，只需要满足是全等就可以，这时候我们可以使用匿名节点，比如下面这个查询

```plaintext
(binary_expression
  operator: "==="
) @bin
```

就可以匹配（这里的 operator 是一个字段，但其实可以不用写）

```javascript
a === 3; // yes
b !== c; // no
a == 1; // no
```

### 捕获

我们可以使用 `@` 符号接上一个名字来捕获一个匹配的节点列表，比如我们上面所有的查询（S-expression）后面都有一个 `@xxx`，这个 `xxx` 就是捕获的名字，我们可以使用这个名字来获取匹配的节点列表。我们为其赋予了名字，这样我们就可以在后续的操作中使用这个名字来获取匹配的节点列表。

### 量词操作符

我们可以在 S-expression 后面添加量词操作符（\* + 或者 ?，用法同正则表达式）来匹配多个节点，比如下面这个查询

```plaintext
(function_declaration
  (formal_parameters
    (identifier)*
  ) @params
)
```

这个查询的意思是找到一个函数声明，这个函数声明的参数列表中有零个及以上标识符，这样我们就可以匹配下面的两个函数声明中的参数列表（注意包括逗号）

```javascript
function foo(a, b, c) {
  return a + b + c;
}

function bar() {
  return;
}
```

下面这个查询将会匹配所有的函数调用，不管有没有参数，如果有参数，我们就使用 `the-string-arg` 名称来捕获调用的参数

```plaintext
(call_expression
  function: (identifier) @the-function
  arguments: (arguments (string)? @the-string-arg))
```

### 捕获组

我们可以使用一个括号来将多个表达式组合在一起，这样就可以匹配多个相邻的节点（同时可以结合量词操作符），比如下面这个查询

```plaintext
(
  (comment)
  (function_declaration)
)
```

可以用来匹配后边是 function_declaration 的 comment（注意只匹配 comment，function_declaration 没有被包含在选中的组里）

### 可选列表

我们可以使用方括号将一些 S-expression 围起来（类似 JavaScript 正则表达式那样），表示可选的捕获列表，比如

```plaintext
[
 "let"
 "const"
] @keyword
```

就可以匹配所有的 `let` 和 `const` 单词

### 通配符节点

类似正则表达式的 `.`，treesitter query 中类似的节点为 `_` 匿名节点，`(_)` 非匿名节点

### 锚点

锚点类似正则表达式中的 `^ 和 $`，但是稍有不同，我们如果想要匹配一个数组中的第一个节点，可以这样写 query，将锚点 `.` 放在要匹配元素的前面

```plaintext
(array . (number) @first-element)
```

他就可以匹配 `[1, 2, 3]` 中的 `1`。同理如果想要匹配最后一个元素，放在匹配元素的后面就可以。

### 谓词

如果想要匹配一个对象中 `key` 和 `value` 相同的部分，我们无法通过之前的手段来获取响应的节点，因为没有一个 `equal` 的操作符，而谓词补充了这一点。

首先说谓词的格式，他是类似 `#name?` 这样的形式，常用的谓词有 `#eq?`，`#not-eq?`，`#any-eq?`，`#any-not-eq?`，`#match?`，`#not-match?`

比如上面的需求，我们可以这样写 query

```plaintext
(pair
  key: (property_identifier) @key
  value: (identifier) @value
  (#eq? @key @value)
) @res
```

这里的 res 就是最后捕获的结果就是

```javascript
const obj = {
  a: a, // yes
  b: b, // yes
  c: 1,
};
```
