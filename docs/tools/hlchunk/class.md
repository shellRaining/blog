---
title: hlchunk 对类的实现
tag:
  - tools
  - hlchunk
date: 2024-06-16
---

## hlchunk 中对于类的实现

由于 `hlchunk` 更像是一堆 `mod` 实现的集合体，因此设置一个 `BaseMod` 显得比较合理，但同时 `Lua` 不具备完善的 `class` 机制，因此需要我们手动实现一个能够继承的类，使用方式的伪代码为

```lua
class(constructor)
class(base, constructor)
```

### 创建一个类

根据上面的伪代码，我们定义 `class` 传入一个函数参数 `constructor`，然后 `class` 的返回值是一个表示类的表，比如：

```lua
local BaseMod = class(function (self, args)
    self.args = args
end)
```

当我们调用 `BaseMod` 的时候，传入的构造函数会被调用，并且返回一个新的对象（在 `Lua` 中称作表），代码如下：

```lua
local function createClass(base, user_ctor)
    local c = {}

    if base then
        for i, v in pairs(base) do
            c[i] = v
        end
        c._base = base
    end

    c.__index = c
    c.init = user_ctor
    return c
end
local function baseClass(user_ctor)
    local c = createClass(nil, user_ctor)
    local mt = {}
    mt.__call = function(_, ...)
        local obj = {}
        setmetatable(obj, c)
        user_ctor(obj, ...)
        return obj
    end
    setmetatable(c, mt)
    return c
end
```

这个函数首先调用 `createClass`，创建空表，将构造函数复制到这个空表的 `init` 字段上，并且将自己的 `__index` 设置为自己（为了方便以后作为实例的元表，可以查询原型上的字段）。然后将这个表返回给 `c`。

此时 `c` 还不能调用，我们为其设置 `__call` 字段，这样就可以调用这个新创建的 `class`。当调用（相当于 `new`） 这个类的时候，创建一个新对象，然后为其设置原型（通过 `setmetatable`），然后调用构造函数，最终完成原型的设置，还有实例字段的设置。

### 继承一个类

还是根据上面的伪代码，我们可以按照下面这样继承一个类：

```lua
local BaseMod = class(function() end)
local ChunkMod = class(BaseMod, function() end)
```

我们首先构造一个原型对象（表），然后将父类（被继承的类）的原型字段全部复制到新建的原型对象上，然后设置这个原型对象的 `__call` 字段，保证可以生成合理的子类实例，代码如下：

```lua
local function derivedClass(base, user_ctor)
    local c = createClass(base, user_ctor)
    local mt = {}
    mt.__call = function(_, ...)
        local instance = {}
        setmetatable(instance, c)
        if user_ctor then
            user_ctor(instance, ...)
        else
            if base and base.init then
                base.init(instance, ...)
            end
        end
        return instance
    end
    setmetatable(c, mt)
    return c
end
```

函数内第一行代码就完成了构造原型表的过程，我们主要看如何设置 `__call` 以保证他可以被调用的。

1. 首先构造一个空的实例对象，然后设置他的原型为 `c`
1. 如果用户传入了构造函数 `user_ctor`，我们就调用用户的构造函数，否则我们就调用父类的构造函数，最终返回实例对象

### 总结

图形化的描述这个继承的过程如下

<img width='500' src='https://raw.githubusercontent.com/shellRaining/img/main/2406/lua_class.jpg'>
