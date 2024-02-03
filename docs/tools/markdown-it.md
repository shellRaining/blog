---
title: markdown-it 拓展
tag:
  - markdown-it
date: 2024-01-30
---

## markdown-it-sub

使用方式,通过默认导出

```javascript
const sub = require('markdown-it-sub')
var md = require('markdown-it')().use(sub);

const html = md.render('H~2~0')
```

输出渲染内容

```html
<p>H<sub>2</sub>O</p>
```

## markdown-it-wikilinks

输入 markdown 内容

```javascript
const wikilinks = require('markdown-it-wikilinks')(options)
const md = require('markdown-it')().use(wikilinks)

const html = md.render('Click [[Wiki Links|here]] to learn about [[/Wiki]] links.')
const html = md.render('[[Feline hypercuteness#Signs and symptoms]]')
```

输出渲染内容

```html
<p>Click <a href="./Wiki_Links.html">here</a> to learn about <a href="/Wiki.html">Wiki</a> links.</p>
<p><a href="./Feline_hypercuteness.html#Signs_and_symptoms">Feline hypercuteness</a> with anchor</p>
```
