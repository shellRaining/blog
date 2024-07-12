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