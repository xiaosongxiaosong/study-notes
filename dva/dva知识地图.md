# dva 知识地图

不知道大家学习 react 或 dva 时会不会有这样的疑惑：

* ES6 特性那么多，我需要全部学会吗？
* react component 有三种写法，我需要全部学会吗？
* reducer 的增删改应该怎么写？
* 怎样做全局/局部的错误处理？
* 怎么发异步请求？
* 怎么处理复杂的异步业务逻辑？
* 怎么配置路由
* ……

这篇文档梳理了基于 dva-cli 使用 dva 的最小知识集，让你可以用最少的时间掌握创建类似 dva-hackernews 的全部知识，并且不需要掌握额外的冗余知识。

## JavaScript 语言

### 变量声明

#### const 和 let

不要用 var ，而是使用 const 和 let ，分别表示常量和变量。不同于 var 的函数作用域， const 和 let 都是块级作用域。

```js
const DELAY = 1000;

let count = 0;
count += 1;
```

#### 模板字符串

模板字符串提供了另一种做字符串组合的方法。

```js
const user = 'world';
console.log(`hello ${user}`); // hello world

//多行
const content = `
  Hello ${firstName},
  Thanks for ordering ${qty} tickets to ${event}.
`;
```

#### 默认参数

```js
function logActivity(activity = 'skiing'){
  console.log(activity);
}

logActivity(); // skiing
```

### 箭头函数

函数的快捷写法，不需要通过 function 关键字创建函数，并且还可以省略 return 关键字。

同事箭头函数还会继承当前上下文的 this 关键字。

比如：

```js
[1, 2, 3].map(x => x + 1); // [2, 3, 4]
```

等同于：

```js
[1, 2, 3].map((function(x){
  return x + 1;
}).bind(this));
```

### 模块的 Import 和 Export

import 用于引入模块， export 用于导出模块。

比如：

```js
// 引入全部
import dva from 'dva';

// 引入部分
import { connect } from 'dva';
import { Link, Route } from 'dva/router';

// 引入全部并作为 github 对象
import * as github from './services/github';

// 导出默认
export default App;
// 部分导出，需 import { App } form './file' 引入
export class App extend Component {};
```

### ES6 对象和数组

#### 析构赋值

析构赋值让我们从 Object 或 Array 里取部分数据存为变量。

```js
// 对象
const user = { name: 'guanguan', age: 2 };
const { name, age } = user;
console.log(`${name} : ${age}`); // guanguan : 2

// 数组
const arr = [1, 2];
const [foo, bar] = arr;
console.log(foo); // 1
```

我们也可以析构传入的函数参数。

```js
const add = (state, { payload }) => {
  return state.concat(payload); // 这个地方的 return 是否可以省略???
};
```

> 这个地方的 return 是否可以省略？？？

析构是还可以配 alias ，让代码更具有语义。

```js
const add = (state, { payload: todo }) => {
  return state.concat(todo);
};
```

> alias ？？？

#### 对象字面量改进

这是析构的反向操作，用于重新组织一个 Object。

```js
const name = 'duoduo';
const age = '8';

const user = { name, age }; // { name: 'duoduo', age: '8' }
```

定义对象方法时，还可以省去 function 关键字。

```js
app.model({
  reducers: {
    add() {} //等同于add: function() {}
  },
  effects: {
    *addRemote() {} // 等同于 addRemote: function*() {}
  },
});
```

#### Spread Operator

Spread Operator 即3个点 ... ，有几种不同的使用方法。

可用于组装数组。

```js
const todos = ['Learn dva'];
[...todos, 'Learn antd']; // ['Learn dva', 'Learn antd']
```

也可用于获取数组的部分项。

```js
const arr = ['a', 'b', 'c'];
const [first, ...rest] = arr;
rest; // ['b', 'c']

// with ignore
const [first, , ...rest] = arr;
rest; // ['c']
```

还可收集函数参数为数组。

```js
function directions(first, ...rest){
  console.log(rest);
}
directions('a', 'b', 'c'); // 'b', 'c'
```

代替apply。

```js
function foo(x, y, z){}
const args = [1, 2, 3];

// 下面两句效果相同
foo.apply(null, args);
foo(...args);
```

对于 Object 而言，用于组合成新的 Object。

```js
const foo = {
  a: 1,
  b: 2,
};
const bar = {
  b: 3,
  c: 2;
};
const d = 4;

const ret = { ...foo, ...bar, d }; // { a: 1, b: 3, c: 2, d: 4}
```

此外，在 JSX 中 Spread Operator 还可用于扩展 props。

#### Promises（Promise？？？）

Promise 用于更优雅地处理异步请求。比如发起异步请求：

```js
fetch('/api/todos')
  .then(res => res.json())
  .then(data => ({ data }))
  .catch(err => ({ err }));
```

定义Promise

```js
const delay = (timeout) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
};

delay(1000).then(_ => {
  console.log('executed');
});
```

> \_ =&gt; {} ???

#### Generators

dva 的 effects 是通过 generator 组织的。 Generator 返回的是迭代器，通过 yield 关键字实现暂停功能。

这是一个典型的 dva effect ，通过 yield 把异步逻辑通过同步的方式组织起来。

```js
app.model({
  namespace: 'todos',
  effects: {
    *addRemote({ payload: todo }, { put, call }){
      yield call(addTodo, todo);
      yield put({ type: 'add', payload: todo });
    },
  },
});
```



