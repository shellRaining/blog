---
title: TypeScript 类型体操
tag:
  - typescript
date: 2024-03-26
---

## 二叉树

```typescript
interface TreeNode<T> {
    value: T;
    left: TreeNode<T> | null;
    right: TreeNode<T> | null;
}
```
