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

