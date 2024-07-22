# 三思后过

## [322. 零钱兑换](https://leetcode.cn/problems/coin-change/)

### 深度优先暴力搜索算法

```javascript
var coinChange = function (coins, amount) {
  const stk = []
  let res = Number.MAX_SAFE_INTEGER
  function inner(remain) {
    if (remain == 0) {
      res = Math.min(res, stk.length)
      return
    } else if (remain < 0) return
    for (let i = 0; i < coins.length; i++) {
      stk.push(coins[i])
      inner(remain - coins[i])
      stk.pop(coins[i])
    }
  }
  inner(amount)
  return res == Number.MAX_SAFE_INTEGER ? -1 : res
};
```

最简单的暴力搜索的思路如下，假设我们有钱币 `a b c`，并且需要总数 `amount` 的钱币，那么可以迭代选取三种钱币，以 `a` 为例，问题就被缩小为了获取 `amount - a` 数目的钱币，并且此时我们已经支付了 `a` 硬币，将其放入一个栈中，重复上述过程，直到剩余钱币为 0。如果过程中出现剩余钱币为负数，表示这种兑换方式不可能，直接返回即可。

因此上述过程可以看作深度优先遍历，并且从根节点到最后遍历的叶节点构成了一个我们这里追踪的 `stk`，我们最后如果将 `amount` 降低到了 0，就统计 `stk` 的长度，表示一种兑换方式。

但是对于这道题，还需要一个 `res` 变量（需要是一个非常大的数），对所有可能的兑换方式取最小值，以获取最终答案，但是如果没有兑换方式，我们还需要进行一次判断来返回题目中要求的 `-1`。

### 贪心算法（不成立）

```JavaScript
var coinChange = function (coins, amount) {
  let res = 0
  coins.sort((x, y) => y - x)
  for (let i = 0; i < coins.length; i++) {
    while (amount - coins[i] >= 0) {
      res++
      amount -= coins[i]
    }
  }
  if(amount > 0 )return -1
  else if(amount == 0) return res
};
```

首先对钱币排个序，每次都选取最大的钱币，直到最大的钱币会导致溢出，我们再选用次一级的钱币，重复上述过程。如果最后还有 `amount` 剩余，表示无法兑换，返回 `-1`。

这个贪心错误之处在于，如果我们只有 `3 7` 两种钱币，需要兑换 `16` 元，那么这里的过程就为 `7 7`，并且最终剩余 `2`，导致答案错误，实际上应该是 `7 3 3`。

### 动态规划

```JavaScript
var coinChange = function (coins, amount) {
	const arr = new Array(amount + 1)
  arr[0] = 0

  for (let i = 0; i < amount + 1; i++) {
    if (arr[i] !== undefined) {
      for (const val of coins) {
        const pre = arr[i + val] ?? Number.MAX_SAFE_INTEGER
        arr[i + val] = Math.min(arr[i] + 1, pre)
      }
    }
  }
  return arr[amount] ?? -1
};
```

对于要兑换的 `amount` 数目所需要的最小数值，我们定义为 `f(x)`，那么 `f(x) = Math.min(f(x-a), f(x-b), f(x-c))`，依次构建一个递归式子，并且初始状态为 `f(0) = 0, f(k) = -1 (k < 0)`，通过这个已经可以用递归来做了，但是我选择的是自底向上计算，我们有 `f(0)`，就可以计算 `f(a), f(b), f(c)`，并且通过这三个新计算出来的值，再次重复上述过程。最终如果我们需要钱数的位置为 `undefined`，表示不可能有这种兑换方式。

## [739. 每日温度](https://leetcode.cn/problems/daily-temperatures/)

### 暴力做法

```JavaScript
var dailyTemperatures = function (temperatures) {
  const len = temperatures.length
  const res = new Array(len).fill(0)
  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len + 1; j++) {
      if (temperatures[i] < temperatures[j]) {
        res[i] = j - i
        break
      }
    }
  }
  return res
};
```

我们遍历每一天的温度， `i` 记作这一天的下标，然后从 `i+1` 天开始去寻找大于 `i` 天温度的一天，时间复杂度为 `O(n^2)`，但是题目给出的数据集规模是 `10^5`，因此暴力做法必定超时。

### 寻找规律加快循环

```javascript
var dailyTemperatures = function (temperatures) {
  const len = temperatures.length
  const res = new Array(len).fill(0)
  for (let i = 0; i < len; i++) {
    if (res[i] !== 0) continue
    for (let j = i + 1; j < len + 1; j++) {
      const ti = temperatures[i]
      const tj = temperatures[j]
      if (ti < tj) {
        res[i] = j - i
        for (let k = i + 1; k < j; k++) {
          const tk = temperatures[k]
          if ((tk < tj && tk > ti) || tk == ti) {
            res[k] = res[i] - (k - i)
          }
        }
        break
      }
    }
  }
  return res
}
```



首先要构造出上面暴力做法可能出现问题的一个数据集，即最坏情况，所有天数都是一样的温度就可以实现，因为无法找到高于他的温度，会一直向后遍历，导致时间复杂度变成 `O(n^2)`。因此可以去寻找一些规律来加速这一过程，比方说我们在遍历的时候找到了 `i` 对应的是 `j`，那么在这 `i-j` 天内，凡是温度高于 `i` 天且小于 `j` 天，或者温度等于 `i` 天的某个 `k` 天，我们就可以通过 `res[i]` 计算出 `res[k]`。

## [139. 单词拆分](https://leetcode.cn/problems/word-break/)

### 深度优先遍历（暴力做法）

```JavaScript
var wordBreak = function(s, wordDict) {
  let res = false
  function inner(substr){
    if(substr == "") {
      res = true
      return
    }
    for(const word of wordDict){
      if(substr.startsWith(word)){
        inner(substr.slice(word.length))
      }
    }
  }
  inner(s)
  return res
};
```

我们判断是否可以单词拆分，首先找到前缀符合的单词，然后对符合的部分进行切割，判断剩下的单词是否符合，最终直到空字符串，表示可以切割，设置最终的 `res`。

### 动态规划

```JavaScript
var wordBreak = function (s, wordDict) {
  const len = s.length
  const substrArr = []
  for (let i = 0; i <= len; i++) {
    substrArr.push(s.slice(0, i))
  }
  const dp = new Array(len + 1).fill(false)
  dp[0] = true
  for (let i = 1; i <= len; i++) {
    for (let j = 0; j < wordDict.length; j++) {
      const word = wordDict[j]
      if (substrArr[i].endsWith(word)) {
        dp[i] = dp[i - word.length]
        if (dp[i]) break
      }
    }
  }
  return dp[len]
};
```

我们从上面的暴力做法中可以隐约看到一个等式，`dp[i] = dp[i - len(suitStr)]`，其中 `dp[i]` 表示字符数为 `i` 时候是否可以拆分。如果可以拆分，我们就不考虑后面的单词了。所以 `if(dp[i]) break` 很有必要。

## [56. 合并区间](https://leetcode.cn/problems/merge-intervals/)

这是七月十九号百度一面的面试题，被面试官评价做的一坨……但最后还是过了，可以说是缺乏训练的典范

```javascript
var merge = function (intervals) {
  intervals.sort((x, y) => x[0] - y[0])
  const res = [intervals[0]]
  for (let i = 1; i < intervals.length; i++) {
    const item = intervals[i]
    const top = res[res.length - 1]
    if (item[0] <= top[1]) top[1] = Math.max(top[1], item[1])
    else res.push(item)
  }
  return res
}
```

我最开始在做的时候只考虑到了排序后遍历所有 interval 子项，如果没有重合就直接插入到结果数组中，有重合就找到更改位置，然后对指定位置的数组进行合并。但是忽略了一个情况，即我们 `res` 数组其实本身也是和 `arr` 一样有序，去寻找重合位置本身是浪费时间的行为，直接获取 `res` 最后一项，然后进行比较合并即可。

### 附赠题一

再附赠面试第二题，寻找一个字符串中括号内的数字。比如 `123abc(123)abc(abc),(456)` 我们应当返回 `[123, 456]`

```javascript
function match(s) {
  const res = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "(") {
      const nextIdx = s.indexOf(")", i);
      if (nextIdx === -1) {
        return res;
      } else {
        const substr = s.slice(i+1, nextIdx)
        if (substr.match(/^\d+$/)) { // 这里也可以 re.test 这个函数
          res.push(Number(substr))
        }
        i = nextIdx + 1;
      }
    }
  }
  return res;
}
```

这是使用了暴力的解法，但是还可以使用 JavaScript 的正则表达式捕获组来直接完成

```javascript
function match(s) {
  const re = /\((\d+)\)/g;
  const res = s.matchAll(re); // ...
}
```

注意这里的正则表达式不是 `/.*\((\d+)).*/`，因为 JavaScript 默认是贪婪匹配，如果使用 `.*` 会导致所有的字符被消耗殆尽，导致只能匹配到回溯时候的 `456`。

### 附赠题二

他问了 `bigInt` 可能会在什么情况下使用

```javascript
const nval1 = 9007199254740991 + 1
const nval2 = 9007199254740991 + 2
nval1 === nval2 // true
const bval1 =  9007199254740991n + 1n
const bval2 =  9007199254740991n + 2n
bval1 === bval2 // false
```

在 `SAFE VALUE` 之外进行计算，很有可能导致错误，这是因为 JavaScript 使用 IEEE754 来表示浮点数，阶码十一位，尾数五十二位

## [155. 最小栈](https://leetcode.cn/problems/min-stack/)

```javascript
var MinStack = function () {
  this.stk = []
  this.helper = [Number.MAX_SAFE_INTEGER]
};
MinStack.prototype.push = function (val) {
  this.stk.push(val)
  this.helper.push(Math.min(this.helper[this.helper.length - 1], val))
};
MinStack.prototype.pop = function () {
  this.stk.pop()
  this.helper.pop()
};
MinStack.prototype.top = function () {
  return this.stk[this.stk.length - 1]
};
MinStack.prototype.getMin = function () {
  return this.helper[this.helper.length - 1]
}
```

这道题我最开始想着要通过一个最小堆来配合栈使用，但是答案挺有意思，他用一个辅助栈来对应原栈中每个位置的最小值

## [739. 每日温度](https://leetcode.cn/problems/daily-temperatures/)

### 暴力解法

```javascript
var dailyTemperatures = function (temperatures) {
  const n = temperatures.length
  const res = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    if(res[i] !== 0) continue
    for (let j = i + 1; j < n; j++) {
      const ti = temperatures[i]
      const tj = temperatures[j]
      if(ti < tj) {
        for(let k = i; k < j ;k++){
          const tk = temperatures[k]
          if((tk < tj && tk >= ti)) {
            res[k] = j - k
          }
        }
        break
      }
    }
  }
  return res
};
```

通过二层循环找到最终的答案，但是有一点小优化，每当找到结果时候，再重新遍历一次，将所有大于 i 小于 j 温度的下标赋值，可以避免重复计算。但整体的时间复杂度还是 `n^2`

```javascript
var dailyTemperatures = function (temperatures) {
  const n = temperatures.length
  const res = new Array(n).fill(0)
  const stk = []
  for (let i = 0; i < n; i++) {
    const ti = temperatures[i]
    while (stk.length && temperatures[stk[stk.length - 1]] < ti) {
      const idx = stk.pop()
      res[idx] = i - idx
    }
    stk.push(i)
  }
  return res
};
```

通过单调栈来解决，这个单调栈是递减的，每当看到比栈顶大的元素，我们就让栈内比该元素小的所有元素都出栈，并为他们赋值答案，然后将该元素推入栈中，始终保持栈内的有序。遍历完所有元素后，栈内必定留存一些还没出栈的元素，表示没有比他们大的，因此直接赋值为 0 即可。

这里有个有意思的观察，栈内存储的是元素的下标，而不是元素本身，这样相当于多存储了一个信息，可以用来做很多事。相似的题目可以看

- [滑动窗口最大值](./fifth#_239-%E6%BB%91%E5%8A%A8%E7%AA%97%E5%8F%A3%E6%9C%80%E5%A4%A7%E5%80%BC)
