# 几乎过不去

## [560. 和为 K 的子数组](https://leetcode.cn/problems/subarray-sum-equals-k/)

### 滑动窗口解法（双指针）

```JavaScript
var subarraySum = function (nums, k) {
  let l = 0;
  let r = 0
  let sum = 0
  let res = 0
  const len = nums.length
  while (l < len) {
    if (sum < k) {
      sum += nums[r]
      r++
    } else if (sum == k) {
      res++
      sum += nums[r]
      r++
    } else {
      sum -= nums[l]
      l++
    }
  }
  return res
};
```

这是一个失败的解法，原因是滑动窗口要求单调性（并且还要求数组元素全正或者全负），否则，假设右端点进入了一个负数，那么整个窗口的和会变小而不是变大，导致滑动窗口失效。并且，如果数组一半正一半负，在全负的时候想让 `sum` 变大需要我们右移左端点，而全正时候要求我们右移右端点，一半正一半负的时候移动任一点都可以，这会导致非常复杂的情况，我尝试了很多遍都失败了。

### 暴力解法

```JavaScript
var subarraySum = function (nums, k) {
  const len = nums.length
  let res = 0
  for (let l = 0; l < len; l++) {
    let sum = 0
    for (let r = l; r < len; r++) {
      sum += nums[r]
      if (sum == k) res++
    }
  }
  return res
};
```

暴力解法就是用 `i j` 来模拟数组的两端，然后进行求和操作，整体的时间复杂度是 `O(n^2)`，本题的数据规模是 `2 * 10^4`，最后也是超时。

### 哈希表 + 前缀和（向后延伸）

我的第一个做法是通过所有测试用例的，但是时间复杂度非常差。

```JavaScript
var subarraySum = function (nums, k) {
  const hash = new Map()
  const len = nums.length
  const prefixSum = new Array(len).fill(0)
  for (let i = 0; i < len; i++) {
    prefixSum[i] = nums[i] + (prefixSum[i - 1] ?? 0)
  }
  prefixSum.forEach((val, idx) => {
    if (hash.has(val)) {
      hash.get(val).push(idx)
    } else {
      hash.set(val, [idx])
    }
  })
  let res = 0
  prefixSum.forEach((v, i) => {
    const sum = v + k
    if (hash.has(sum)) {
      const idxs = hash.get(sum)
      for (let j = 0; j < idxs.length; j++) {
        if (idxs[j] > i) res++
      }
    }
    if (v == k) {
      res++
    }
  })
  return res
}
```

想到这个方法前我看了提示，想到了 `S(i, j) = prefixSum[j] - prefixSum[i - 1]`，然后打算遍历所有的前缀和，查看这个前缀和加上 `k` 后是否存在（如果存在，那么我们的 `res` 就加上满足条件的个数）。

具体的代码流程是，首先计算出前缀和（我这里不包含 `prefixSum[0] = 0` 这个新加入的条目，因为当时没有学相关知识），然后将每个前缀和的位置加入哈希表。比如：

`nums = [1, 1, 1], k = 2`，我们计算出来的前缀和为 `[1, 2, 3]`，那么哈希表就为 `[1]: [0], [2]: [1], [3]: [2]`

再之后遍历前缀和 `i`，找到是否存在 `i + k`，以 `1` 为例，他对应的 `i + k` 为 `3`，在哈希表中存在一个条目，且该条目下标为 `2` 大于当前遍历下标 `0`，所以 `res` 加一。如果当前遍历条目自身等于 `k`，说明 `S(0, k)` 子数组本身也满足，`res` 加一。

这个算法的时间复杂度在特殊情况下也会退化为 `O(n^2)`。假设 `k=0`，所有数据都是 `0`，每次都要查找遍历整个位置数组。但是特殊情况触发条件比第一种暴力算法好多了，比如 `k=0` 数字全 `1` ，暴力算法肯定完蛋，但这个算法由于有哈希表计算出了前缀和，知道不可能有答案，所以会节省很多时间。

### 哈希表 + 前缀和

```JavaScript
var subarraySum = function (nums, k) {
  const len = nums.length
  const prefixSum = new Array(len + 1).fill(0)
  for (let i = 0; i < len; i++) {
    prefixSum[i + 1] = prefixSum[i] + nums[i]
  }
  const hash = new Map()
  for (let i = 0; i <= len; i++) {
    hash.set(prefixSum[i], 0)
  }
  let res= 0
  for (let i = 0; i <= len; i++) {
    res += (hash.get(prefixSum[i] - k) ?? 0)
    const cnt = hash.get(prefixSum[i])
    hash.set(prefixSum[i], cnt + 1)
  }
  return res
};
```

这个是看了[灵山艾茶府](https://leetcode.cn/problems/subarray-sum-equals-k/solutions/2781031/qian-zhui-he-ha-xi-biao-cong-liang-ci-bi-4mwr)的讲解后自己写的。有一些改动：

1. 前缀和引入了首项为 `0`，避免无法计算 `S(0, k)`
2. 边遍历边加入哈希

第一个就不讲了，看第二个，首先我们知道 `S(i, j) = k` 可以转化为 `S(i) = S(j + 1) - k`，那么可以用 `j` 来遍历，然后遍历的同时从哈希表中查看 `cnt[S[j + 1] - k]` 的个数，同时为了保证 `k = 0` 时不出现 `S(i) - S(i) = 0` 这样的惨剧，我们把 `hash.set`放在迭代的最后面。

---

再次更新，因为看到这道题又做错了。注意点为

1. 这个数组不是单调数组，而且还有负数
2. 前缀和已经不是问题了，但没考虑到对一个 `sub` 来说，可能有多个匹配的位置，比如 `[1,-1,0]`，若要求和为 0，他的前缀和为 `[0, 1, 0, 0]`，当遍历到最后一个项的时候，存在 `p[3] - [0] = 0` 和 `p[3] - p[2] = 0` 这两种可能，因此需要一个哈希表来记录同一个前缀和出现的次数。

## [239. 滑动窗口最大值](https://leetcode.cn/problems/sliding-window-maximum/)

### 暴力做法

```javascript
var maxSlidingWindow = function (nums, k) {
  const len = nums.length
  function max(start, end) {
    let res = Number.MIN_SAFE_INTEGER
    while (start < end) {
      res = nums[start] > res ? nums[start] : res
      start++
    }
    return res
  }
  const res = [max(0, k)]

  for (let i = 1; i <= len - k; i++) {
    if (res[i - 1] === nums[i - 1]) {
      res.push(max(i, i + k))
    } else {
      res.push(Math.max(res[i - 1], nums[i + k - 1]))
    }
  }

  return res
};
```

虽然有所改进，但本质上还是一个 `n^2` 的算法，没什么好讲的

### 单调队列

```javascript
var maxSlidingWindow = function (nums, k) {
  const len = nums.length
  const q = []
  const res = []
  for (let i = 0; i < len; i++) {
    while (q.length && nums[q[q.length - 1]] < nums[i]) q.pop()
    q.push(i)
    if (i - q[0] + 1 > k) q.shift()
    if (i >= k - 1) res.push(nums[q[0]])
  }
  return res
};
```

单调队列中存储的是下标，这些下标对应的数值是降序排列。我们遍历所有的数字，记正在遍历的数字为 cur，下标为 idx，我们先找出单调队列中所有小于 cur 的数字，将其 pop 出去，然后将 cur 推到单调队列中，比如 `[4, 2, 1]` 面对 3，会依次 pop 出 1 和 2，然后推进 3，最终变成 `[4, 3]`。

然后如果当前单调队列中表示的最大值的下标超过了题目给定的窗口范围，我们就将其 shift 出去，让下一个值作为新的最大值，并且最终推送到结果数组中（需要保证窗口已经形成）。

## [76. 最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/)

```javascript
var minWindow = function (s, t) {
  const sf = new Array(128).fill(0)
  const tf = new Array(128).fill(0)
  for (const c of t) tf[c.charCodeAt(0)]++
  const len = s.length
  function cover() { return sf.every((v, i) => v >= tf[i]) 
  
  let l = 0, r = 0
  let minLen = Number.MAX_SAFE_INTEGER
  let resIdx = 0
  while (r <= len) {
    if (cover()) {
      if (minLen > r - l) {
        minLen = r - l
        resIdx = l
      }
      sf[s[l].charCodeAt(0)]--
      l++
    } else {
      sf[s[r]?.charCodeAt(0)]++
      r++
    }
  }
  return minLen === Number.MAX_SAFE_INTEGER ? "" : s.slice(resIdx, resIdx+minLen)
};
```

这道题还是子串类型，也还是过不去，一开始隐约有滑动窗口的感觉，但实现到代码上就稀烂了，写了两层 while 循环。后面看了解答确信是双指针（滑动窗口），就按照套路去写，也确实没有问题。需要注意点有

1. 滑动窗口我们每次只需要处理一格就可以
2. 区间选择上统一遵循左闭右开，但是这样就会导致 `r == len` 的时候，我们仍然保持 cover  的状态，但结果可能不是最优解，还需要继续把 l 指针向右移动，因此循环的条件就变成了 `while(r <= len)`，以保证可以继续循环下去。但这还带来了新的问题，如果此时不匹配，那么就会执行 else 语句中的自增操作，会触发 undefined 报错，因此用可选链操作符来避免此行为。
3. 我们最后要返回一个最小长度，因此初始值选择最大安全整数，同时还有没有匹配子串的情况，最后一行返回代码就是用来解决这个问题的。

这道题实质上是 [209. 长度最小的子数组](./once.md#_209-%E9%95%BF%E5%BA%A6%E6%9C%80%E5%B0%8F%E7%9A%84%E5%AD%90%E6%95%B0%E7%BB%84) 的翻版，可以先看他熟悉一下。

## [84. 柱状图中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram/)

### 暴力做法

```javascript
var largestRectangleArea = function (heights) {
  const n = heights.length
  let res = 0
  let curArea = 0
  for (let i = 0; i < n; i++) {
    const minH = []
    minH[i] = heights[i]
    for (let j = i + 1; j < n; j++) {
      minH[j] = Math.min(minH[j - 1], heights[j])
    }
    for (let j = i; j < n; j++) {
      curArea = (j - i + 1) * minH[j]
      res = Math.max(res, curArea)
    }
  }
  return res
};
```

使用了一点优化空间的技巧，没有一开始计算全部的 `minH`，是在遍历时候才开始计算，但整体的时间复杂度还是 `n^2`，没法过测试。

### 单调栈

```javascript
var largestRectangleArea = function (heights) {
  const n = heights.length;
  const stk = []
  const lIdx = new Array(n).fill(-1)
  const rIdx = new Array(n).fill(n)
  let res = 0
  for (let i = 0; i < n; i++) {
    const h = heights[i]
    while (stk.length && h <= heights[stk[stk.length - 1]]) stk.pop()
    if (stk.length) lIdx[i] = stk[stk.length - 1]
    stk.push(i)
  }
  stk.length = 0
  for (let i = n - 1; i >= 0; i--) {
    const h = heights[i]
    while (stk.length && h <= heights[stk[stk.length - 1]]) stk.pop()
    if (stk.length) rIdx[i] = stk[stk.length - 1]
    stk.push(i)
  }
  for (let i = 0; i < n; i++) {
    const h = heights[i]
    res = Math.max(res, h * (rIdx[i] - lIdx[i] - 1))
  }
  return res
};
```

还是看解析才过的，甚至看完解析后还是做不出来，因为没有考虑好单调栈的单调性。我最开始想着应该用单调递减栈，比如 `heights = [2,1,5,6,2,3]`，每次碰到比栈顶大的元素就出栈，并且记录当前元素的 lIdx，但是第五个元素就无法获知自己左边比自己小的元素信息了，所以有了 `lIdx[4] = -1` 这个错误。

换成递增栈后，每个元素在进栈前，都会记录自己的 lIdx，这样就可以保留左侧的信息。这道题还有一些注意点

1. 获取的是右侧和左侧第一个小于自身的元素下标，然后通过 `r - l - 1` 来表示长度，元素自身表示高度，求得乘积。这也是为什么出栈的时候要小于等于
2. 清空栈的时候有多种方法，比如 `splice`，重新赋值，还有设置 length，benchmark 可以看[这个帖子](https://stackoverflow.com/a/1232046/19749278)

## [152. 乘积最大子数组](https://leetcode.cn/problems/maximum-product-subarray/)

```javascript
var maxProduct = function (nums) {
  const n = nums.length
  const maxdp = new Array(n).fill(1)
  const mindp = new Array(n).fill(1)
  for (let i = 1; i <= n; i++) {
    maxdp[i] = Math.max(maxdp[i - 1] * nums[i - 1], mindp[i - 1] * nums[i - 1], nums[i - 1])
    mindp[i] = Math.min(maxdp[i - 1] * nums[i - 1], mindp[i - 1] * nums[i - 1], nums[i - 1])
  }
  maxdp.shift()
  return Math.max(...maxdp)
}
```

我倒不是很愿意把这道题放在这类，但……确实没看答案就真的不会做

我们这里得保持一个 mindp 来供 maxdp 使用