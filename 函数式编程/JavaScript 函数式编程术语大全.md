# JavaScript 函数式编程术语大全

[原文地址](http://www.css88.com/archives/7833)

## Arity

函数所需的参数个数。来自于单词 unary，binary，ternary。这个单词是由 `-ary` 与 `-ity` 两个后缀组成。例如，一个带有两个参数的函数被称为二元函数或者它的 arity 是2。

```js
const sum = (a, b) => a + b

const arity = sum.length
console.log(arity)  // 2

// The arity of sum is 2
```

# 高阶函数 Higher-Order Functions（HOF）

一个函数，以函数为参数 或/和 返回一个函数。

```js
const filter = (predicate, xs) => xs.filter(predicate)
```

```js
const is = (type) => (x) => Object(x) instanceof type
```

```js
filter(is(Number), [0, '1', 2, null]) // [0, 2]
```

## 偏应用函数 Partial Application

偏应用一个函数意思是通过预先填充原始函数的部分（不是全部）参数来创建一个新函数。

```js
// 创建偏应用函数
// 带一个函数参数 和 该函数的部分参数
const partial = (f, ...args) =>
  // 返回一个带有剩余参数的函数
  (...moreArgs) =>
    f(...args, ...moreArgs)

// 原始函数
const add3 = (a, b, c) => a + b + c

// 偏应用 2 和 3 到 add3 各你一个当参数的函数
const fivePlus = partial(add3, 2, 3) // (c) => 2 + 3 + c

fivePlus(4) // 9
```

你也可以使用 `Function.prototype.bind` 来实现偏应用函数

```js
const add1More = add3.bind(null, 2, 3) // (c) => 2 + 3 + c
```
偏应用函数应用通过对复杂的函数填充一部分数据来构成一个简单的函数。柯里化（Curried）通过偏应用函数实现。

## Currying

将多个参数的函数（多元函数）转换为一元函数的过程。

每当函数被调用时，它仅仅接受一个参数并且返回带有一个参数的函数，直到所有的参数传递完成。

```js
const sum = (a, b) => a + b

const curriedSum = (a) => (b) => a + b

curriedSum(40)(2) // 42

const add2 = curriedSum(2) // (b) => 2 + b

add2(10)  // 12
```

## 闭包 Closure

闭包是访问其作用域之外的变量的一种方法。正式一点的解释，闭包是一种用于实现吃法作用域的命名绑定的技术。它是一种用环境存储函数的方法。

闭包是一个作用域，在这个作用域能够捕获访问函数的局部变量，即使执行已经从定义它的块中移出。即，他们允许在声明变量的块执行完成之后保持对作用域的应用。

```js
const addTo = x => y => x + y
var addToFive = addTo(5)
addToFive(3)  // 8
```

函数 `addTo()` 返回一个函数（内部调用 `add()` ），将它存储在一个名为 `addToFive` 的变量中，并柯里化（Curried）调用，参数为 5。

通常， 当函数 `addTo` 完成执行时，其作用域与局部变量 `add` , `x` , `y` 不可访问。但是，它在调用 `addToFive()` 时返回8 。这意味着即使代码块执行完成后，函数 `addTo` 的状态也被保存，否则无法知道 addTo 被调用未 `addTo(5)`， `x` 的值设置为 5 。

词法作用域是能够找到 `x` 和 `add` 的值的原因 - 已完成执行的父级私有变量。这就称为 Closure （闭包）。

堆栈伴随着函数的词法作用域存储在父对象的引用形式中。这样可以防止闭包和底层变量被当做垃圾回收（因为至少有一个实时引用）。

Lambda VS Closure：lambda 本质上是一个内联定义的函数，而不是声明函数的标准方法。

lambda 经常可以作为对象传递。

闭合是一个函数，通过引用其函数体外部的字段来保持对外部变量的引用。

## 自动柯里化 Auto Currying

将一个将多个参数的函数转换为一个参数的函数，如果给定的参数数量少于正确的参数，则返回一个函数，该函数将获得其余的参数。当函数得到正确数量的参数时，它就会被求值。

lodash 和 Ramda 都有一个 curry 函数，使用的就是这种工作方式。

```js
const add = (x, y) => x + y

const curriedAdd = _.curry(add)
curriedAdd(1, 2)  // 3
curriedAdd(1)     // (y) => 1 + y
curriedAdd(1)(2)  // 3
```

## 函数合成 Function Composition

将两个函数合成在一起构成第三个函数，其中一个函数的输出是另一个函数的输入。

```js
const compose = (f, g) => f(g(a)) // Definition
const floorAndToString = compose((val) => val.toString(), Math.floor) // Usage
floorAndToSting(121.212121) // '121'
```

## Continuation

在一个程序执行的任意时刻，尚未执行的代码称为 Continuation。

```js
const printAsString = (num) => console.log(`Given ${num}`)

const addOneAndContinue = (num, cc) => {
  const result = num + 1
  cc(result)
}

addOneAndContinue(2, printAsString) // 'Given 3'
```

Continuation 在异步编程中很常见，当程序需要等待数据才能继续执行。一旦接受到数据，请求响应通常会被传递给程序的剩余部分，这个剩余部分就是 Continuation 。

```js
const continueProgramWith = (data) => {
  // 通过 data 继续执行
}

readFileAsync('path/to/file', (err, response) => {
  if (err) {
    // 错误处理
    return
  }
  continueProgramWith(response)
})
```

## 纯函数 Purity
