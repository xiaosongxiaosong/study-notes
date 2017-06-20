# dva 知识地图

[原文地址](https://github.com/dvajs/dva-knowledgemap)

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

## 目录

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [JavaScript 语言](#javascript-%E8%AF%AD%E8%A8%80)
  - [变量声明](#%E5%8F%98%E9%87%8F%E5%A3%B0%E6%98%8E)
    - [const 和 let](#const-%E5%92%8C-let)
    - [模板字符串](#%E6%A8%A1%E6%9D%BF%E5%AD%97%E7%AC%A6%E4%B8%B2)
    - [默认参数](#%E9%BB%98%E8%AE%A4%E5%8F%82%E6%95%B0)
  - [箭头函数](#%E7%AE%AD%E5%A4%B4%E5%87%BD%E6%95%B0)
  - [模块的 Import 和 Export](#%E6%A8%A1%E5%9D%97%E7%9A%84-import-%E5%92%8C-export)
  - [ES6 对象和数组](#es6-%E5%AF%B9%E8%B1%A1%E5%92%8C%E6%95%B0%E7%BB%84)
    - [析构赋值](#%E6%9E%90%E6%9E%84%E8%B5%8B%E5%80%BC)
    - [对象字面量改进](#%E5%AF%B9%E8%B1%A1%E5%AD%97%E9%9D%A2%E9%87%8F%E6%94%B9%E8%BF%9B)
    - [Spread Operator](#spread-operator)
  - [Promises（Promise？？？）](#promisespromise)
  - [Generators](#generators)
- [React Component](#react-component)
  - [Stateless Functional Components](#stateless-functional-components)
  - [JSX](#jsx)
    - [Component 嵌套](#component-%E5%B5%8C%E5%A5%97)
    - [className](#classname)
    - [JavaScript 表达式](#javascript-%E8%A1%A8%E8%BE%BE%E5%BC%8F)
    - [Mapping Array to JSX](#mapping-array-to-jsx)
    - [注释](#%E6%B3%A8%E9%87%8A)
    - [Spread Attributes](#spread-attributes)
  - [Props](#props)
    - [propTypes](#proptypes)
    - [往下传数据](#%E5%BE%80%E4%B8%8B%E4%BC%A0%E6%95%B0%E6%8D%AE)
    - [往上传数据](#%E5%BE%80%E4%B8%8A%E4%BC%A0%E6%95%B0%E6%8D%AE)
  - [CSS Modules](#css-modules)
    - [定义全局 CSS](#%E5%AE%9A%E4%B9%89%E5%85%A8%E5%B1%80-css)
    - [classnames Package](#classnames-package)
- [Reducer](#reducer)
  - [增删改](#%E5%A2%9E%E5%88%A0%E6%94%B9)
  - [嵌套数据的增删改](#%E5%B5%8C%E5%A5%97%E6%95%B0%E6%8D%AE%E7%9A%84%E5%A2%9E%E5%88%A0%E6%94%B9)
- [Effect](#effect)
  - [put](#put)
  - [call](#call)
  - [select](#select)
- [错误处理](#%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86)
  - [全局错误处理](#%E5%85%A8%E5%B1%80%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86)
  - [本地错误处理](#%E6%9C%AC%E5%9C%B0%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86)
- [异步请求](#%E5%BC%82%E6%AD%A5%E8%AF%B7%E6%B1%82)
  - [GET 和 POSt](#get-%E5%92%8C-post)
  - [统一错误处理](#%E7%BB%9F%E4%B8%80%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86)
- [Subscription](#subscription)
  - [异步数据初始化](#%E5%BC%82%E6%AD%A5%E6%95%B0%E6%8D%AE%E5%88%9D%E5%A7%8B%E5%8C%96)
    - [path-to-regexp Pachage](#path-to-regexp-pachage)
- [Router](#router)
  - [Config with JSX Element \(router.js\)](#config-with-jsx-element-%5Crouterjs%5C)
  - [Route Components](#route-components)
    - [通过 connect 绑定数据](#%E9%80%9A%E8%BF%87-connect-%E7%BB%91%E5%AE%9A%E6%95%B0%E6%8D%AE)
    - [Injected Props（e.g. location）（内置属性）](#injected-propseg-location%E5%86%85%E7%BD%AE%E5%B1%9E%E6%80%A7)
  - [基于 action 进行页面跳转](#%E5%9F%BA%E4%BA%8E-action-%E8%BF%9B%E8%A1%8C%E9%A1%B5%E9%9D%A2%E8%B7%B3%E8%BD%AC)
- [dva 配置](#dva-%E9%85%8D%E7%BD%AE)
  - [Redux Middleware](#redux-middleware)
  - [history](#history)
    - [切换 history 为 browserHistory](#%E5%88%87%E6%8D%A2-history-%E4%B8%BA-browserhistory)
    - [去除 hashHistory 下的 \_k 查询参数](#%E5%8E%BB%E9%99%A4-hashhistory-%E4%B8%8B%E7%9A%84-%5C_k-%E6%9F%A5%E8%AF%A2%E5%8F%82%E6%95%B0)
- [工具](#%E5%B7%A5%E5%85%B7)
  - [通过 dva-cli 创建项目](#%E9%80%9A%E8%BF%87-dva-cli-%E5%88%9B%E5%BB%BA%E9%A1%B9%E7%9B%AE)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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
  return state.concat(payload); // 这个地方的 return 是否可以省略？？？
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

### Promises（Promise？？？）

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

> \_ =&gt; {} ？？？

### Generators

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

## React Component

### Stateless Functional Components

React Component 有 3 种定义方式，分别是 React.createClass, class 和 Stateless Functional Component。推荐尽量使用最后一种，保持简洁和无状态。这是函数，不是   Object，没有 this 作用域，而是 pure function（纯函数）。

比如定义 App Component：

```js
function App(props){
 function handleClick(){
   props.dispatch({ type: 'app/create' });
 };
 return <div onClick="handleClick">${props.name}</div>
};
```

等同于：

```js
class App extends React.Component {
  handleClick(){
    this.props.dispatch({ type: 'app/create' });
  }
  render(){
    return <div oClick={this.handleClick.bind(this)}>${this.props.name}</div>
  }
}
```

### JSX

#### Component 嵌套

类似 HTML， JSX 里可以给组件添加子组件。

```js
<App>
  <Header />
  <MainContent />
  <Footer />
</App>
```

#### className

class 是保留字，所以添加样式时，需用 className 代替 class。

```
<h1 className="fancy">Hello dva</h1>
```

#### JavaScript 表达式

JavaScript 表达式需要用 {} 括起来，会执行并返回结果。

比如：

```
<h1>{ this.props.title }</h1>
```

#### Mapping Array to JSX

可以把数组映射为 JSX 元素列表。

```
<ul>
  { this.props.todos.map((todo, i) => <li key={i}>{ todo }</li>) }
</ul>
```

#### 注释

尽量不要用 // 做单行注释

#### Spread Attributes

这是 JSX 从 ECMAScript6 借鉴过来的很有用的特性，用于扩展组件 props。

比如：

```js
const attrs ={
  href: 'http://example.org',
  target: '_blank',
};
<a {...attrs}>Hello</a>
```

等同于

```js
const attrs ={
  href: 'http://example.org',
  target: '_blank',
};
<a href={attrs.href} target={attrs.target}>Hello</a>
```

### Props

数据处理在 React 中是非常重要的概念之一，分别可以通过 props， state 和 context 来处理数据。而在 dva 应用里，你只需要关心 props。

#### propTypes

JavaScript 是弱类型语言，所以请尽量声明 propTypes 对 Props 进行校验，以减少不必要的问题。

```js
function App(props){
  return <div>{props.name}</div>
};
App.propTypes = {
  name: React.PropTypes.string.isRequired,
};
```

内置的 prop type 有：

* PropTypes.array
* PropTypes.bool
* PropTypes.func
* PropTypes.number
* PropTypes.object
* PropType.string

#### 往下传数据

![](https://camo.githubusercontent.com/ed04df6d56d8555cf99a754296b60f569b371663/68747470733a2f2f7a6f732e616c697061796f626a656374732e636f6d2f726d73706f7274616c2f4e417a654d79556f504d71786652762e706e67)

#### 往上传数据

![](https://camo.githubusercontent.com/a8ffad4e9534c1d1c651f10baa55c37250118b8d/68747470733a2f2f7a6f732e616c697061796f626a656374732e636f6d2f726d73706f7274616c2f66694b4b67444775454a66537678762e706e67)

### CSS Modules

一张图理解 CSS Modules 的工作原理：![](https://camo.githubusercontent.com/d1341a45402a32a6112f7a99cd99341eab2abbad/68747470733a2f2f7a6f732e616c697061796f626a656374732e636f6d2f726d73706f7274616c2f535742775754625a4b7178774550712e706e67)

button class 在构建之后会被重命名为 ProductList\_button\_1FU0u 。 button 是 local name ，而 ProductList\_button\_1FU0u 是 global name 。你可以用简短的描述性名字，而不需要关心命名冲突问题。

然后你要做的全部事情就是在 css/less 文件里写 .button {...} ，并在组件里通过 styles.button 来引用他。

#### 定义全局 CSS

CSS Modules 默认是局部作用域，想要声明一个全局规则，可用 :global 语法。

比如：

```css
.title{
  color: red;
}
:global(.title){
  color: green;
}
```

然后在引用的时候：

```jsx
<App className={sytle.title} /> // red
<App class="title" />           // green
```

#### classnames Package

在一些复杂的场景中，一个元素可能对应多个 className， 而每个 className 又基于一些条件来决定是否出现。这时， classnames 这个库就非常有用。

```jsx
import classnames from 'classnames';

const App = (props) => {
  const cls = classnames({
    btn: true,
    btnLarge: props.type === 'submit',
    btnSmall: props.type === 'edit',
  });
  return <div className={ cls } />
}
```

这样，传入不同的 type 给 App 组件，就会返回不同的 className 组合：

```jsx
<App type="submit" /> // btn btnLarge
<App type="edit" />   // btn btnSmall
```

## Reducer

reducer 是一个纯函数，接受 state 和 action ， 返回老的或新的 state。即： \(state, action\) =&gt; state

### 增删改

以 todos 为例：

```jsx
app.model({
  namespace: 'todos',
  state: [],
  reducers: {
    add(state, { payload: todo }) {
      return state.concat(todo);
    },
    remove(state, { payload: id }) {
      return state.filter(todo => todo.id !== id);
    },
    update(state, { payload: updatedTod }) {
      return state.map(todo => {
        if (todo.id === updatedTodo.id){
          return { ...todo, ...updatedTodo };
        } else {
          return todo;
        }
      });
    },
  },
});
```

### 嵌套数据的增删改

建议最多一层嵌套，以保持 state 的扁平化，深层嵌套会让 reducer 很难写和难以维护。

```jsx
app.model({
  namespace: 'app',
  state: {
    todos: [],
    loading: false,
  },
  reducers: {
    add(state, { payload: todo }) {
      const todos = state.todos.concat(todo);
      return { ...state, todos };
    },
  },
});
```

## Effect

### put

用户触发 action

```jsx
yield put({ type: 'todos/add', payload: 'Learn Dva' });
```

### call

用于调用异步逻辑，支持 Promise。

```jsx
const result = yield call(fetch, '/todos');
```

### select

用于从 state 里获取数据。

```jsx
const todos yield select(state => state.todos);
```

## 错误处理

### 全局错误处理

dva 里， effects 和 subscriptions 的抛错全部会走 onError hook。所以可以在 onError 里统一处理错误。

```jsx
const app = dva({
  onError(e, dispatch){
    console.log(e.message);
  },
});
```

然后 effects 里的抛错和 reject 的 promise 就都会被捕获了。

### 本地错误处理

如果需要对某些 effects 的错误进行特殊处理，需要在effect 内部加上 trt catch。

```jsx
app.model({
  effects: {
    *addRemote() {
      try{
        // your code here
      } catch(e){
        console.log(e.message);
      }
    },
  },
});
```

## 异步请求

异步请求基于 whatwg-fetch，API 详见： [https://github.com/github/fetch](https://github.com/github/fetch)

### GET 和 POSt

```jsx
import request from '../utils/request';

// GET
request('/api/todos');

// POST
request('/api/todos', {
  method: 'POST',
  body: JSON.stringify({ a: 1}),
});
```

### 统一错误处理

加入约定后台返回以下格式时，做统一的错误处理。

```js
{
  status: 'error',
  message: '',
}
```

编辑 utils/request.js ，加入以下中间件：

```js
function parseErrorMessage({ data }) {
  const { status, message } = data;
  if (status === 'error') {
    throw new Error(message);
  }
  return { data };
}
```

然后，这类错误就会走到 onError hook 里。

## Subscription

subscriptions 是订阅，用于订阅一个数据源，然后根据需要 dispatch 相应的 action。数据源可以是当前的时间、服务器的 websocket 连接、keyboard 输入、 geolocation 变化、 history 路由变化等等。格式为 \({ dispatch, history }\) =&gt; unsubscribe 。

### 异步数据初始化

比如：当用户进入 /users 页面时。触发 action users/fetch 加载用户数据。

```jsx
app.model({
  subscriptions: {
    setup({ dispatch, history }){
      history.listen(( pathname ) => {
        if (pathname === '/users'){
          dispatch({
            type: 'users/fetch',
          });
        }
      });
    },
  },
});
```

#### path-to-regexp Pachage

如果 url 规格比较复杂，比如 /users/:userId/search ，那么匹配和 userId 的获取都会比较麻烦。这是（时？？？）推荐用 path-to-regexp 简化这部分逻辑。

```jsx
import pathToRegexp from 'path-to-regexp';

// in subscription
const match = pathToRegexp('/users/userId/search').exec(pathname);
if (match){
  const userId = match[1];
  // dispatch action with userId
}
```

## Router

### Config with JSX Element \(router.js\)

```jsx
<Route path="/" component={App}>
  <Route path="accounts" component={Accounts} />
  <Route path="statements" component={Statements}>
</Route>
```

### Route Components

Route Components 是指 ./src/routers/ 目录下的文件，他们是 ./src/router.js 里匹配的 Component。

#### 通过 connect 绑定数据

比如：

```jsx
import { connect } from 'dva';

function mapStateToProps(state, ownProps){
  return {
    users: state.users,
  };
}
export default connect(mapStateToProps)(App);
```

然后 App 里就有了 dispatch 和 users 两个属性。

> dispatch 从哪里来的？？？

#### Injected Props（e.g. location）（内置属性）

Route Component 会有额外的 props 用以获取路由信息。

* location

* params

* children

更多详见： [react-router](https://github.com/ReactTraining/react-router/blob/v2.8.1/docs/guides/RouteConfiguration.md)

### 基于 action 进行页面跳转

```jsx
import { routerRedux } from 'dva/router'

// Inside Effects
yield put(routerRedux.push('/logout'));

// Outside Effects
dispatch(routerRedux.push('/logout'));

// With query
routerRedux.push({
  pathname: 'logout',
  query: {
    page: 2,
  },
});
```

除了 push\(location\) 外还有更多方法，详见 [react-router-redux](https://github.com/reactjs/react-router-redux#pushlocation-replacelocation-gonumber-goback-goforward)

## dva 配置

### Redux Middleware

比如要添加 redux-logger 中间件：

```jsx
import createLogger from 'redux-logger';

const app = dva({
  onAction: createLogger(),
});
```

注：onAction 支持数组，可同时传入多个中间件。

### history

#### 切换 history 为 browserHistory

```jsx
import { browserHistory } from 'dva/router';

const app = dva({
  history: browserHistory,
});
```

#### 去除 hashHistory 下的 \_k 查询参数

```jsx
import { useRouterHistory } from 'dva/router';
import { createHashHistory } from 'history';

const app = dva({
  history: useRouterHistory(createHashHistory)({ queryKey: false }),
});
```

## 工具

### 通过 dva-cli 创建项目

先安装 dva-cli 。

```shell
$ npm install dva-cli -g
```

然后创建项目。

```sh
$ dva new myapp
```

最后，进入目录并启动。

```
cd myapp
npm start
```
