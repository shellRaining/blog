# 一遍过

## [22. 括号生成](https://leetcode.cn/problems/generate-parentheses/)

```JavaScript
var generateParenthesis = function (n) {
  const set = new Set()

  function inner(level) {
    if (level == 1) return ['()']
    const res = []
    const pre = inner(level - 1)
    for (const s of pre) {
      const charsPre = Array.from(s)
      for (let i = 0; i <= s.length; i++) {
        const charsAfter = charsPre.slice()
        charsAfter.splice(i, 0, '(', ')')
        const newStr = charsAfter.join('')
        if (!set.has(newStr)) {
          res.push(newStr)
          set.add(newStr)
        }
      }
    }
    return res
  }

  return inner(n)
}
```

### 哈希表查重（Set）+ 暴力递归

我们可以观察到，当 `n=1` 时，必定返回 `['()']`，而当 `n=2` 时，我们只需要对 `n=1` 的结果进行遍历，然后在其上执行一些操作，先对字符串切割形成数组 `['(', ')']`，然后对数组之间的缝隙，下标 `k=0, 1, -1`，分别插入一对括号，然后执行 `join` 的操作，经过哈希表去重后加入结果。

## [438. 找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/)

### 暴力做法

```JavaScript
var findAnagrams = function (s, p) {
  const charCnt = new Map()
  const targetCharCnt = new Map()
  const sl = s.length
  const pl = p.length
  const aCode = ('a').charCodeAt(0)

  // init charCnt
  for (let i = 0; i < 26; i++) {
    charCnt.set(String.fromCharCode(aCode + i), 0)
    targetCharCnt.set(String.fromCharCode(aCode + i), 0)
  }
  for (let i = 0; i < pl; i++) {
    charCnt.set(s[i], charCnt.get(s[i]) + 1)
    targetCharCnt.set(p[i], targetCharCnt.get(p[i]) + 1)
  }

  // loop
  const res = []
  const step = sl - pl + 1
  for (let i = 0; i < step; i++) {
    let flag = true
    for (const [k, v] of charCnt) {
      if (v !== targetCharCnt.get(k)) {
        flag = false
        break
      }
    }
    if (flag) {
      res.push(i)
    }
    const firstChar = s[i]
    const newChar = s[i + pl]
    charCnt.set(firstChar, charCnt.get(firstChar) - 1)
    charCnt.set(newChar, charCnt.get(newChar) + 1)
  }
  return res
}
```



首先计算 `p` 字符串的字符频次表，然后针对 `s` 字符串相同长度的子字符串进行频次计算，如果频次相同，说明是一个异位词。这里遍历可以保持一个不变量，即当前遍历开始时的频次表一定是当前子串的，直到遍历末期我们才对子串首字符频率减一，对后面新字符频率加一。

## [1. 两数之和](https://leetcode.cn/problems/two-sum/)

虽说是最简单的题，但如果不好好审题，还是会做错，注意点有两个：

1. 他测试用例里面的数字是可以重复的
2. 他要求返回的值是一个数组，分别表示两个数的下标

```javascript
var twoSum = function (nums, target) {
  const map = new Map()
  const len = nums.length
  for (let i = 0; i < len; i++) {
    map.set(nums[i], i)
  }
  for (let i = 0; i < len; i++) {
    const sub = target - nums[i]
    if (map.has(sub)) {
      const idx = map.get(sub)
      if(idx !== i) return [i, idx]
    }
  }
}
```

## [49. 字母异位词分组](https://leetcode.cn/problems/group-anagrams/)

```javascript
var groupAnagrams = function (strs) {
  const map = new Map()
  for(const s of strs) {
    const sortedStr = s.split('').sort((a, b) => a.charCodeAt() - b.charCodeAt()).join('')
    if(map.has(sortedStr)) map.get(sortedStr).push(s)
    else map.set(sortedStr, [s])
  }
  return Array.from(map, ([_, val]) => val)
}
```

思路明确，但是要注意 JavaScript 相关的 API 使用参数

1. `charCodeAt` 不是必须的，因为 JavaScript sort 默认使用 Unicode 编码来进行排序
2. `Array.from` 可以对 Map 类型使用（因为实现了迭代器协议），`Array.from` 的第二个参数是一个回调函数，这个回调函数会被传入 `v 和 k`，对于 Map 对象来说，v 就是一个长度为 2 的元组，一个元素是 Map 的 key，第二个元素是 Map 的 val。

## [128. 最长连续序列](https://leetcode.cn/problems/longest-consecutive-sequence/)

```javascript
var longestConsecutive = function (nums) {
  const set = new Set(nums)
  let cnt = 1
  let res = 0

  for (const num of nums) {
    if (!set.has(num)) continue
    let up = num + 1
    let down = num - 1
    while (set.has(up)) {
      set.delete(up)
      up++
      cnt++
    }
    while (set.has(down)) {
      set.delete(down)
      down--
      cnt++
    }
    if (cnt > res) res = cnt
    cnt = 1
  }
  return res
}
```

代码不难理解，就是在选择如何遍历的时候犹豫了很久，一开始打算直接遍历 set，但是 map 和 set 都是无法使用下标直接获取元素的，因此不太现实，那就选择用原数组遍历。

先找到原数组中的一个数，然后分别找出这个数在数组中最长能够蔓延的范围，找到后将他们从 set 中删除，并记录当前最长的范围。由于数组中并没有删除这些范围中的数字，因此在遍历数组的过程中需要加入一个判断，如果不存在这个数字，证明他早已被先前的范围所囊括，直接遍历下一个数字即可。

## [283. 移动零](https://leetcode.cn/problems/move-zeroes/)

```javascript
var moveZeroes = function (nums) {
  let cur = 0
  let front = 0
  const len = nums.length
  for (; front < len; front++) {
    if (nums[front] !== 0) {
      nums[cur++] = nums[front]
    }
  }
  while (cur < len) nums[cur++] = 0
}
```

没啥难度，最简单的双指针，写的时候别忘记快慢指针都要挪动，慢指针表示元素即将放入的位置，快指针表示当前即将被判断是否符合条件的元素。

## [11. 盛最多水的容器](https://leetcode.cn/problems/container-with-most-water/)

```javascript
var maxArea = function (height) {
  const len = height.length
  let l = 0
  let r = len - 1
  let capcity = 0

  while (l < r) {
    const cur = (r - l) * Math.min(height[l], height[r])
    if (cur > capcity) capcity = cur
    height[l] > height[r] ? r-- : l++
  }

  return capcity
}
```

这道题还是双指针，只需要找出

> 当我们即将移动指针的时候，如果想让下一次水量大于当前的水量，必须要移动相对短板的那个指针，因为移动长板必定导致水量小于等于当前值

这个关系式即可，还有注意，由于短板效应，数学运算时候记得用 `min` 而不是 `max`

## [15. 三数之和](https://leetcode.cn/problems/3sum/)

```javascript
var threeSum = function (nums) {
  const len = nums.length
  const res = []
  nums.sort((x, y) => x - y)

  for (let i = 0; i < len; i++) {
    if (nums[i] === nums[i - 1]) continue
    let l = i + 1
    let r = len - 1
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r]
      if (sum < 0) l++;
      else if (sum > 0) r--;
      else {
        res.push([nums[i], nums[l], nums[r]])
        do l++; while (nums[l] === nums[l - 1])
        do r--; while (nums[r] === nums[r + 1])
      }
    }
  }
  return res
}
```

这道题已经被做烂了，唯一要注意的就是判断最后相等后，要挪动 l 和 r 两根指针，以避免重复，同时使用 do while 语句可以减少代码量。注意不加花括号就要加引号。

## [42. 接雨水](https://leetcode.cn/problems/trapping-rain-water/)

```javascript
var trap = function (height) {
  const len = height.length
  const lmax = new Array(len).fill(0)
  const rmax = new Array(len).fill(0)
  for (let i = 0, curMax = 0; i < len; i++) {
    curMax < height[i] ? curMax = height[i] : lmax[i] = curMax - height[i]
  }
  for (let i = len - 1, curMax = 0; i >= 0; i--) {
    curMax < height[i] ? curMax = height[i] : rmax[i] = curMax - height[i]
  }
  return lmax.reduce((pre, cur, idx) => pre + Math.min(cur, rmax[idx]), 0)
};
```

这道题我在做的时候不太好分类，他说是动态规划的解法，要注意的点是这里的 `reduce` 函数，回调函数的参数分别为 `pre cur idx`，这三个我们都会使用到，用来从数组获取我们的最终值。

## [3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)

```javascript
var lengthOfLongestSubstring = function (s) {
  const len = s.length
  const set = new Set()
  let l = 0
  let r = 0
  let max = 0

  while (r < len) {
    if (set.has(s[r])) {
      while (s[l] !== s[r]) set.delete(s[l++])
      l++
    } 
    set.add(s[r++])
    max = Math.max(r - l, max)
  }
  return max
};
```

这道题还是双指针的应用，秉持着左闭右开的优良传统，这道题之所以想要使用 set 而不是 map，是因为 map 的 value 如果用来存储下标，只能简化 l 下标重新定位，不能简化从 map 中清除 l 到目标点所有字母的这个动作。故直接使用 set。

## [438. 找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/)

```javascript
var findAnagrams = function (s, p) {
  function a2i(c) { return c.charCodeAt(0) - 97 }
  function equal(x, y) { return x.every((v, i) => v === y[i]) }
  const sf = new Array(26).fill(0)
  const pf = new Array(26).fill(0)
  const slen = s.length
  const plen = p.length
  if(slen < plen) return []
  for (let i = 0; i < plen; i++) {
    sf[a2i(s[i])]++
    pf[a2i(p[i])]++
  }
  const res = []
  if (equal(sf, pf)) res.push(0)
  for (let i = 0; i < slen - plen; i++) {
    sf[a2i(s[i])]--
    sf[a2i(s[i + plen])]++
    if (equal(sf, pf)) res.push(i + 1)
  }
  return res
}
```

这道题的思路很简单，就是匹配字符的频次，但是需要注意的点还是蛮多的

1. 我第一次做是通过一个 map 来进行统计频次，但是这会涉及到极其复杂的字母加减运算，考虑到全部是小写字母，我们可以直接用 26 个整数长度的数组来表示。然后写一些辅助函数 `a2i` 和 `equal` 来帮助进行字母到下标和相等判断的计算。
2. `equal` 函数是通过 `every` 函数实现的，因此可以重视一下这些新的 ES 函数
3. 使用 for in 遍历的时候确实会遍历原型对象，但是要注意只会遍历所有**可枚举对象**，我们自己设置的 key 都是可枚举的，而比方说 `Array.prototype` 上的方法都是不可枚举的，故不会遍历出来。
4. 我们可以首先将 0 号位进行判断，然后进行增减的操作。

## [209. 长度最小的子数组](https://leetcode.cn/problems/minimum-size-subarray-sum/)

```javascript
var minSubArrayLen = function (target, nums) {
  let l = 0
  let r = 0
  let sum = 0
  let res = Number.MAX_SAFE_INTEGER
  while (r <= nums.length) {
    if (sum < target ) sum += nums[r++]
    else {
      res = Math.min(res, r - l)
      sum -= nums[l++]
    }
  }
  return res === Number.MAX_SAFE_INTEGER ? 0 : res
};
```

思路就是最简单的双指针滑动窗口，唯一要注意的是左闭右开和 while 循环的退出范围

## [53. 最大子数组和](https://leetcode.cn/problems/maximum-subarray/)

```javascript
var maxSubArray = function (nums) {
  const len = nums.length
  const dp = new Array(len + 1)
  dp[0] = Number.MIN_SAFE_INTEGER

  for (let i = 1; i <= len; i++) {
    dp[i] = Math.max(dp[i - 1] + nums[i - 1], nums[i - 1])
  }
  return Math.max(...dp)
};
```

我记得这是数据结构课程的教科书的第一节内容，应该给出了一个叫做联机算法的解决方案。但这道题还可以用动态规划来做，首先要找到一个成立的递推关系，我们记包含第 i 个元素时能取到的最大值为 `dp[i]`，那么就有 `dp[i] = Math.max(dp[i-1] + num[i], num[i])`。这个关系式看着简单，但想要找出来还是得有经验才行。

看递推关系 `dp[i]` 只和 `dp[i-1]` 有关，因此可以用滚动变量来优化，我猜测联机算法就是这样的。

## [189. 轮转数组](https://leetcode.cn/problems/rotate-array/)

```javascript
var rotate = function (nums, k) {
  function reverse(i, j) {
    while (i < j) {
      [nums[i], nums[j]] = [nums[j], nums[i]]
      i++, j--
    }
  }
  const len = nums.length
  k %= len
  reverse(0, len - 1)
  reverse(0, k - 1)
  reverse(k, len - 1)
};
```

这是一道死记硬背的题目……唯一要注意的点是 k 可能大于数组长度，要取余操作。

## [238. 除自身以外数组的乘积](https://leetcode.cn/problems/product-of-array-except-self/)

```javascript
var productExceptSelf = function (nums) {
  const len = nums.length
  const lm = new Array(len).fill(1)
  const rm = new Array(len).fill(1)
  for (let i = 1; i < len; i++) { lm[i] = lm[i - 1] * nums[i - 1] }
  for (let i = len - 2; i >= 0; i--) { rm[i] = rm[i + 1] * nums[i + 1] }
  return lm.map((v, i) => v * rm[i])
};
```

前缀和经典题目

## [73. 矩阵置零](https://leetcode.cn/problems/set-matrix-zeroes/)

```javascript
function setZeroes(matrix) {
  const m = matrix.length;
  const n = matrix[0].length;
  const point = [];

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] === 0) point.push([i, j]);
    }
  }

  point.forEach(([x, y]) => {
    for (let i = 0; i < m; i++) matrix[i][y] = 0;
    for (let i = 0; i < n; i++) matrix[x][i] = 0;
  });
}
```

最简单的办法用一个状态数组存储所有为 0 的位置，然后第二次遍历解决

但是题解还给出了一个常数空间的方法，我们可以利用 `matrix[0]` 和 `matrix[0][k]` 来存储当前列和行是否有 0，如果第二次遍历的时候看见了 0，则对当前单元格变 0 处理。当然这样还会导致第一行第一列数据不准确，因此需要两个额外变量存储他们是否包含 0，最后统一处理。

## [54. 螺旋矩阵](https://leetcode.cn/problems/spiral-matrix/)

```javascript
var spiralOrder = function (matrix) {
  const row = matrix.length
  const col = matrix[0].length
  let l = 0, r = col - 1, t = 0, b = row - 1
  const res = []
  while (true) {
    for (let i = l; i <= r; i++) res.push(matrix[t][i])
    if (++t > b) break
    for (let i = t; i <= b; i++) res.push(matrix[i][r])
    if (--r < l) break
    for (let i = r; i >= l; i--) res.push(matrix[b][i])
    if (--b < t) break
    for (let i = b; i >= t; i--) res.push(matrix[i][l])
    if (++l > r) break
  }
  return res
};
```

感觉还是一个套路题，我们用 `l r t b` 来表示四周的墙壁，每次都遍历一堵墙壁，然后将这堵墙壁靠内部移动，之后进行一次判断，如果对向的两堵墙壁错开了，表示流程结束。

## [48. 旋转图像](https://leetcode.cn/problems/rotate-image/)

```javascript
var rotate = function (matrix) {
  const n = matrix.length
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++)
    [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]]
  for (let j = 0; j < n / 2; j++) for (let i = 0; i < n; i++)
    [matrix[i][j], matrix[i][n - j - 1]] = [matrix[i][n - j - 1], matrix[i][j]]
}
```

我很讨厌的一道题，应该就是一个普通的体力活题目

这道题的解法就是先进行矩阵转置，然后左右对称的两列互换。

## [20. 有效的括号](https://leetcode.cn/problems/valid-parentheses/)

```javascript
var isValid = function (s) {
  const list = Array.from(s)
  const stk = []
  function isLeft(c) { return c === '(' || c === '{' || c === '[' }
  function match(lc, rc) {
    if (lc === '(') return rc === ')'
    if (lc === '{') return rc === '}'
    if (lc === '[') return rc === ']'
    return false
  }
  for (const c of list) {
    if (isLeft(c)) stk.push(c)
    else {
      if (!match(stk[stk.length - 1], c)) return false
      stk.pop()
    }
  }
  return stk.length === 0;
}
```

最简单的栈的解法，不过有一些小知识点。ASCII 码表中只有小括号是紧邻着的（40 41），中括号和大括号都是中间隔一个符号（91 93）（123 125）



