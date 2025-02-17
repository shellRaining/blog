---
title: 初识 beancount
tag:
  - beancount
  - tools
date: 2025-02-12
---

> [!note]
> 复式记账是一种基本技巧，每个人都要在高中阶段学习
> —— beancount 作者

很遗憾我的高中阶段并没有学习这方面的内容，也导致我现在对自己的开支一无所知，由此有了本系列内容来弥补这一缺陷和遗憾。我们先从 `why` 和 `how` 讲起，然后最终过渡到如何更好的使用 `beancount` 这个工具。

## 记账能获得什么

1. 最基本的就是对钱的流向有一个明确的了解
2. 为了实现某个储蓄目标，可以根据开支做出合理的预算统计
3. 投资方面的指导（谁知道呢，后面有机会实践吧）
4. 个人价值的估算（这个也是比较模糊的，我这么容易被量化嘛）
5. 偶尔我们会忘记自己是否支付过某笔交易，记账可以帮我们轻易追踪

## 如何记账

记账实际上就是构建一个语料数据库（或者理解为一个 Excel 表格），他由一些按照时间排列的交易对象（表格中的行）组成，每个交易对象代表拥有的某些账户之间的资金流动，这些数据能够组成你的财务数据的时间线。

我们所要做的仅是通过 `复式记账法` 来记录每笔交易，复式记账法很简单，原则如下：

> 每次向账户记账一笔金额时，必须有相应的反向金额记账到其他一个或多个账户，并且这些金额的总和必须为零。

这里的账户是一个更广泛的概念，不单指银行账户等，还能指代寿命等，可以理解为一个盛纳物品的容器，它用来对资产进行计数，并且内部的资产随着时间变化而变化，账户的形象化展示如下，主体由黑色时间线表示，时间线上面的数字表示当前时间点所剩的余额，白色椭圆表示一笔交易，里面的数字表示这个账户余额的变化：

![账户的形象化展示](https://2f0f3db.webp.li/2025/02/202502121844150.png)

我们已经可以通过这样的时间线来记账了，而且他还有个名字叫`单式记账`，该方法对简单的记录已经足够，但是记账是一个长期且复杂度较高的工程，稍有笔误就会导致最终金额偏差，且无法纠正，因此我们发展出复式记账

![复式记账基本展示](https://2f0f3db.webp.li/2025/02/202502121901940.png)

正如你上图看到的，我们每一笔交易都会关乎到两个或者多个账户，一笔交易中所有账户交易总额为 0，比如上图第一笔交易，涉及到两个账户，支票和餐厅，支票账户减少了 79，餐厅账户增加了 79，代数和为 0；同理第二笔交易，涉及到信用卡和餐厅，信用卡账户减少了 35，餐厅账户增加了 35，代数和为 0。假设我们某笔帐记错了，必定会出现代数和不为 0 的情况，通过工具我们能够及时检查出错误并修正，这就是复式记账的可靠之处

再看一个更复杂的例子：

![复式记账收入记录](https://2f0f3db.webp.li/2025/02/202502121904368.png)

第三笔交易涉及到三个账户，工资，支票和税收，工资账户减少了 2905，税收增加了 905，支票增加了 2000，代数和为 0。你可能好奇这里工资为什么会是负数，因为我们可以想象工资也是一个账户，我们付出了工时来让其增加，然后领工资就是让其减少。同理你可以将寿命看做一个账户，我们的工时就会从这个账户里面扣除（是不是显得有点残酷）

账户大致分为下面四种：

1. 资产账户：比如银行账户，现金等
2. 收入账户：比如工资账户，投资账户等
3. 负债账户：比如信用卡账户，贷款账户等
4. 支出账户：比如房租账户，餐厅账户等

他们根据关注点不同又可以分为两类

1. 资产与负债：此类账户我们只关注某个时间点的余额，比如银行账户，信用卡账户等，资产账户通常是正数，负债账户通常是负数
2. 收入与支出：此类账户我们关注的是某个时间段内的变化，比如工资，房租等，根据他们的变化可以进行报税等操作……收入账户通常是负数，支出账户通常是正数

|                  | 正号     | 负号        |
| ---------------- | -------- | ----------- |
| 仅关注某个时间点 | assets   | liabilities |
| 仅关注某个时间段 | expenses | income      |

综上所述，我们可以得到下面的恒等式：

$$
\text{assets} + \text{expenses} + \text{income} + \text{liabilities} = 0
$$

只关注资产和负债可以获得资产负债表，只关注收入和支出可以获得损益表，这两个表是我们日常记账的基础，通过这两个表我们可以了解自己的财务状况，做出合理的预算和规划

总结下来，我们学到了复式记账的基本概念，现在只需要一个工具（beancount）来进行实践了！

## beancount 安装

仅针对 MacOS 的包管理器来说

1. 下载 Python，需求版本为 3.8 或更高

   ```bash
   brew install python
   ```

2. 下载 pipx，用于安装 Python 工具，并且保证其不会影响到你的系统 Python 环境

   ```bash
   brew install pipx
   ```

3. 安装 beancount

   ```bash
   pipx install beancount beanquery # 注意这里下载的是 beancount v3 版本，还有和他一起使用的 beanquery
   bean-check # 检查是否安装成功，如果报错说没有找到该程序，说明安装不成功
   ```

4. 安装可视化工具 fava

   ```bash
   pipx install fava
   ```

下载完 beancount 后，我们获得了如下工具

1. bean-check

   对指定的 beancount 账本文件运行 bean-check 工具，会验证验证该文件的语法和交易是否正确，并会执行一些额外的验证（由配置的插件来执行），如果检查中发现了错误会报错，反之直接退出

2. bean-query

   用于查询 beancount 账本文件，可以查询账本中的交易，账户余额等信息，和 SQL 语句有些类似

3. bean-format

   用于格式化 beancount 账本文件，可以将账本文件格式化为一种标准的格式，方便查看和维护

4. bean-example

   用于生成一个简单的 beancount 账本文件，可以用于学习和测试

## beancount 起步

我们可以创建一个极简的 beancount 文件来学习

```beancount test.beancount
2014-01-01 open Assets:Checking
2014-01-01 open Equity:Opening-Balances

2014-01-02 * "Deposit"
  Assets:Checking           100.00 USD
  Equity:Opening-Balances
```

文件创建后在命令行输入 `bean-check test.beancount` 来检查语法等是否正确，如果正确的话什么都不会输出，从上面我们可以看到 beancount 的一些语法规则

1. 货币必须全部使用大写字母
2. 账户名称不允许使用空格，但可以使用连字符
3. 描述部分必须要用双引号包裹
4. 日期必须是 `YYYY-MM-DD` 格式

只掌握上面的语法就已经可以进行简单的记账了，接下来我们会学习更多的语法

## beancount 语法

一个 beancount 文件由众多指令和选项构成，其中指令是主要组成部分，我们上面极简的文件中就只包含了两种指令，`open` 和 `tx`，接下来更详细的了解他们的语法

指令都以 `YYYY-MM-DD [type] ...` 的格式出现，从下面的例子可以看出：

```beancount
2014-02-03 open Assets:US:BofA:Checking ; 开户指令

2014-04-10 note Assets:US:BofA:Checking "Called to confirm wire transfer." ; 注释指令

2014-05-02 balance Assets:US:BofA:Checking   154.20 USD ; 余额断言指令
```

其中指令的顺序并不重要，beancount 会在解析文件后自动重新排序，因此，开户指令是可以在交易指令之后出现的，但是为了更好的可读性，我们还是建议按照时间顺序来编写

> [!tip]
>
> beancount 的单行注释以 `;` 为开头，和 Python 的 `#` 注释类似

```beancount
2014-02-03 * "Initial deposit"
  Assets:US:BofA:Checking         100 USD
  Assets:Cash                    -100 USD

2014-02-02 open Assets:US:BofA:Checking
```

同时请注意，我们的指令都被视作当天最开始时（即零时零分）发生的，因为我们的指令并不是严格的 ISO 8601 格式，没有写上具体的小时和分钟，这对我们理解 `open`，`close`，`balance` 等指令是很重要的，例如下面的例子：

```beancount
2014-02-03 open Assets:US:BofA:Checking
2014-02-03 * "Initial deposit"
  Assets:US:BofA:Checking         100 USD
  Assets:Cash                    -100 USD
2014-02-03 balance Assets:US:BofA:Checking   100 USD ; 这是一个时间上非法的指令，因为 balance 指令是在零时零分发生的，此时的余额应是 0
2014-02-03 close Assets:US:BofA:Checking ; 同理这个也是不合法的，因为 close 指令是在当天最开始时发生的，而这个指令是在交易指令之后发生的
```

上面的两条不合法的指令会导致 `bean-check` 报错，因此我们需要注意这一点，只要把这两条指令时间改成 `2014-02-04` 就可以了

### open

`open` 指令用于开设一个账户，他的语法如下：

```beancount
YYYY-MM-DD open ACCOUNT [CURRENCY]
```

`ACCOUNT` 是一个账户名称，他的名称必须满足如下规则：

1. 必须由 `Assets`，`Liabilities`，`Income`，`Expenses` 或者 `Equity` 开头，然后是一个或多个由 `:` 分隔的子账户名称组成，他们可以构成一个树状结构
1. 每个部分首字母必须是大写
1. 不能包含空格

   ```plaintext
   Assets
   ├── Cash
   ├── Wechat
   ├── Alipay
   └── Bank
       ├── BOC ; 中国银行
       ├── CMB ; 招商银行
       └── CEB ; 光大银行
   ```

这个树状结构使用了更清晰的层次表示，每个层级通过缩进和连接线来展示父子关系，使得整体结构更加直观和优雅。

`CURRENCY` 是一个货币名称，可以不指定，但是指定了可以获得更好的错误检测能力

### close

`close` 指令用于关闭一个账户，他的语法如下：

```beancount
YYYY-MM-DD close ACCOUNT
```

一旦关闭一个账户，他就不能再被使用了，并且还不能再重新开启，因此关闭一个账户前，一定要使用 `balance` 指令来确保账户余额为 0

### commodity

`commodity` 指令用于定义一个货币，他的语法如下：

```beancount
YYYY-MM-DD commodity CURRENCY
    name: "NAME" ; 这里换成货币的全称，比如 `人民币`
    asset-class: "ASSET-CLASS" ; 这里换成货币的资产类别，比如 `cash`，`stock` 等
```

这个指令是可选的，整个账目中没有这个指令也可以

### txn

交易是最常用的指令，他的语法如下：

```beancount
YYYY-MM-DD txn "counterparty" "description" #tag
  ACCOUNT1 AMOUNT1 CURRENCY1
  ACCOUNT2 AMOUNT2 CURRENCY2
  ...
```

先看第一行，其中 txn 可以换为 `*` 或者 `!` 这两个简写符号，前者表示交易已经完成，后者表示交易还在进行中，一般来说只用前者就可以了，跟在 `txn` 之后的第一个引号内填写交易对方的名称，第二个引号内填写交易的描述，最后一项是交易的 tag，是可选的部分，如果有 tag，会更方便标注和筛选交易。

> [!tip]
> 相比一个个打标签，标签栈也许是更好用的语法
>
> ```beancount
> pushtag #berlin-trip-2014
> 2014-04-23 * "Flight to Berlin"
>  Expenses:Flights              -1230.27 USD
>  Liabilities:CreditCard
> poptag #berlin-trip-2014
> ```
>
> 这样我们就可以在交易中使用 `#berlin-trip-2014` 这个标签，而不用每次都写上

之后几行是交易的具体内容，每一行代表一个账户的变化（又叫做分录），例子如下：

```beancount
2014-10-05 * "Costco" "Shopping for birthday" #germany
  Liabilities:CreditCard:CapitalOne         -45.00          USD
  Assets:AccountsReceivable:John            ((40.00/3) + 5) USD
  Assets:AccountsReceivable:Michael         40.00/3         USD
  Expenses:Shopping
```

注意到最后一个分录没有写明金额，这是因为 beancount 会自动计算，但这有一个前提，就是只有一个分录没有写金额，如果有多个分录没有写金额，beancount 会报错。beancount 之所以能做到自动计算，是因为所有分录之和必为 0，这样就可以通过其他分录的金额来计算出这个分录的金额

> [!tip]
> 分录中的数额还是比较有讲究的：
> 如果涉及到汇率问题，可以使用 `@` 和 `@@` 来表示，`@` 表示单价，`@@` 表示总价，比如 `100 USD @ 6.5 CNY` 表示 100 美元兑换人民币，其中 1 美元兑换 6.5 人民币，`100 USD @@ 650 CNY` 表示 100 美元兑换 650 人民币，二者语法上是一致的
> 如果涉及到股票购买和卖出，可以使用 `{}` 来表示，比如 `100 Tencent {1500 CNY}` 表示购买 100 股腾讯股票，单价 1500 人民币
> 更详细的内容可以看 [BYVoid 的文章](https://byvoid.com/zhs/blog/beancount-bookkeeping-2/)

### balance

`balance` 指令用于断言一个账户的余额，他的语法如下：

```beancount
YYYY-MM-DD balance ACCOUNT AMOUNT CURRENCY
```

我们一般对 `Assets` 下的子账户进行断言，因为对消费之类的账户进行断言是没有意义的。如果断言失败，beancount 会报错，这样我们就可以及时发现错误。建议每过一周或者一个月做一次断言。例子如下：

```beancount
2025-02-16 balance Assets:Wechat         48.39 CNY
```

### pad

`pad` 指令用于填充一个账户，他的语法如下：

```beancount
YYYY-MM-DD pad ACCOUNT1 ACCOUNT2
```

一般用在开户后初始化账户金额，比如我们开户后，账户余额为 0，但是我们希望账户余额为 100，这时候就可以使用 `pad` 指令来填充：

```beancount
2014-02-03 open Assets:Checking
2014-02-03 pad Assets:Checking Assets:Cash ; 表示将 `Assets:Cash` 的余额填充到 `Assets:Checking` 中
2014-02-03 balance Assets:Checking   100 USD ; 这里的 balance 指令是合法的，因为前面有一个 pad 指令，如果没有 balance，就不会有填充的效果
```

---

前面我们提到了指令，现在看一下 `option` 这个语法

### option

`option` 指令用于设置一些选项，他不是指令，而是一种配置，他的语法为 `option NAME VALUE`：

```beancount
option "title" "Ed’s Personal Ledger"
option "operating_currency" "CNY"
```

更多的选项可以看 [这里](https://beancount.github.io/docs/beancount_options_reference.html)

---

除了上面两个，还有一些特例，比如 `include`，`plugin`

### include

`include` 指令用于引入其他文件，他的语法如下：

```beancount
include "filename"
```

路径名可以是相对路径或者绝对路径，如果是相对路径，beancount 会在当前文件所在的目录下寻找，如果是绝对路径，beancount 会在指定的路径下寻找。这很适合用来将账本拆分成多个文件，方便管理和维护，更详细的拆分方法可以看 [BYVoid 的文章](https://byvoid.com/zhs/blog/beancount-bookkeeping-4)

## Neovim 和 beancount（可选）

我一般都是使用 Neovim 来进行文本编辑的，但 Neovim 对 beancount 的支持并不算一流，这里介绍一些小经验

### LSP

可以使用 [beancount-language-server](https://github.com/polarmutex/beancount-language-server) 这个语言服务器，他在 mason 中也有对应包，因此下载相对方便，配置方法在仓库的 README 中也有提到，只需要指明你的 beancount 文件的路径即可

### treesitter

Neovim 的 treesitter 对 beancount 的支持并不算很好，只提供了增量选择这一个功能，甚至连高亮都没有……因此如果没有需求，你可以不用安装他的解析器

### highlight

为了解决没有高亮的问题，可以通过手动定义语法和高亮来解决，我使用了 [vim-beancount](https://github.com/nathangrigg/vim-beancount)，你可以将[这份代码](https://github.com/nathangrigg/vim-beancount/blob/master/syntax/beancount.vim)放置到 `$XDG_CONFIG_HOME/nvim/syntax/beancount.vim` 中

### snippet

Beancount LSP 的提示还是比较孱弱的，很多时候要通过 snippet 来增强编辑体验。很遗憾，[GitHub 上搜到的 snippet](https://github.com/Lencerf/vscode-beancount/blob/master/snippets/beancount.json) 是针对 vscode 的，并不能直接用于 Neovim，因此我这里重写了一份 [snippet](https://github.com/shellRaining/nvim/blob/main/snippets/beancount.json)，你可以试试看，如果有更好的建议，欢迎 pr！

## 记账小技巧

如果每笔交易都手动记账，那这将会是一个非常繁琐的事情，你花在记账上的时间可能比花在消费的时间还要多（悲），因此可以通过一些工具来简化这个过程

比如我们校园卡 app 并没有提供导出账单的功能，因此我选择通过借助大模型的能力来解决这个问题，经过多次测试，发现火山引擎的 `Doubao-1.5-vision-pro-32k` 模型效果更好，使用的 prompt 如下：

````markdown
你是一名专业的会计师，你的任务是根据用户提供的账单文件（包括图片，PDF，表格等）生成beancount交易数据。
以下是你可以使用的账户：

```beancount
2025-02-12 open Assets:Bank:BOC ; 中国银行 Bank of China
2025-02-12 open Assets:Cash ; 现金 Cash
2025-02-12 open Assets:CampusCard ; 校园卡 Campus Card
; ... 写自己的资产账户即可
2025-02-12 open Expenses:Food:Breakfast ; 早餐 Breakfast
; ... 这里同理，需要自己替换
2025-02-12 open Equity:Opening - Balances
```

这是你需要解析的账单文件：
<bill_files>
{{BILL_FILES}}
</bill_files>
在生成beancount交易数据时，请遵循以下要求和注意事项：

1. 只输出最终的交易条目。
2. 条目中的账户必须从上面提供的账户中挑选，不允许使用其他任何账户。
3. 如果收到的是一张图片，大概率是校园卡流水的截图，其中支付涉及食堂时，根据时间选择“Expenses:Food:Breakfast（早餐）”、“Expenses:Food:Lunch（午餐）”或者“Expenses:Food:Dinner（晚餐）”；如果是超市，大概率是“Expenses:Food:Snack（零食）”相关。校园卡流水的充值项，一般涉及“Assets:Bank:BOC（中国银行）”账户和“Assets:CampusCard（校园卡）”账户。
4. 如果收到的是一个 csv 或者 PDF，你大概率可以通过文件名来确定它代表的是什么账户（比如中国银行，招商银行，又或者微信流水），如果确实无法获知来源，你什么不用返回，直接告诉我就好。
5. 最终返回的数据必须能通过 bean-check 和 fava 的校验，交易条目按照时间从老到新排列。

请在markdown代码块内写下你的最终交易条目。例如：

```beancount
2025-02-13 * "玉泉校区靓园-持卡人消费" "消费"
  Expenses:Food:Breakfast 1.5 CNY
  Assets:CampusCard

2025-02-14 * "玉泉校区靓园-持卡人消费" "消费"
  Expenses:Food:Breakfast 1.0 CNY
  Assets:CampusCard
```

立即开始转换工作。
````

同理你也可以写一个微信和支付宝以及各种银行卡的转换 prompt，这里就不赘述了
