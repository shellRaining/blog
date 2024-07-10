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

想到这个方法前我看了提示，想到了 `S(i, j) = prefixSum(j) - prefixSum[i - 1]`，然后打算遍历所有的前缀和，查看这个前缀和加上 `k` 后是否存在（如果存在，那么我们的 `res` 就加上满足条件的个数）。

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