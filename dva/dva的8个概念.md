# dva 的 8 个概念
[原文地址](https://github.com/dvajs/dva/blob/master/docs/Concepts_zh-CN.md)

## 数据流向

数据的改变发生通常是通过用户交互行为或者浏览器行为（如路由跳转等）触发的，当此类行为会改变数据的时候可以通过 dispatch 发起一个 action ，如果是同步行为会直接通过 Reducers 改变 State，如果是异步行为（副作用）会先触发 Effects 然后流向 Reducers 最终改变 State，所以在 dva 中，数据流向非常清晰简洁，并且思路基本跟开源社区保持一致（也是来自于开源社区）。

## Models

### State

`type State = any`

State 表示 Model 的状态数据，通常表现为一个 JavaScript 对象（当然它可以是任何值）；操作的时候每次都要当作不可变数据（immutable data）来对待，保证每次都是全新对象，没有引用关系，这样才能保证 State 的独立性，便于测试和追踪变化。

在 dva 中你可以通过 dva 的实例属性 _store 看到顶部的 state 数据，但是通常你很少会用到：

```js
const app = dva();

console.log(app._store);  // 顶部的 state 数据
```

### Action

`type AsyncAction = any`

Action 是一个普通 JavaScript 对象，他是改变 State 的唯一途径。无论是从 UI 事件、网络回调，还是 WebSocket 等数据源所获得的数据，最终都会通过 dispatch 函数调用一个 action，从而改变对应的数据。action 必须带有 type 属性指明具体的行为，其它字段可以自定义，如果要发起一个 action 需要使用 dispatch 函数；需要注意的是 dispatch 是在组件 connect Models 以后，通过 props 传入的。

```js
dispatch({
  type: 'add',
});
```

### dispatch 函数

`type dispatch = (a: Action) => Action`

dispatching function 是一个用于触发 action 的函数，action 是改变 State 的唯一途径，但是它只是描述了一个行为，而 dispatch 可以看作是触发这个行为的方式，而 Reducer 则是描述如何改变数据的。

在 dva 中，connect Model 的组件通过 props 可以访问 dispatch，可以调用 Model 的 Reducer 或者 Effects，常见的形式如：

```js
dispatch({
  type: 'user/add', // 如果在 model 外调用，需要加上 namespace
  payload: {},      // 需要传递的信息
});
```

### Reducer

`type Reducer <S, A> = (state: S, action: A) => S`

Reducer （也称为 reducing function）函数接受两个参数：之前已经累计运算的结果和当要被累计的值，返回的是一个新的累计结果。该函数把一个集合归并成一个单值。

Reducer 的概念来自于函数式编程，很多语言都有 reduce API。如在 JavaScript 中：

```js
[{x: 1}, {y: 2}, {z: 3}].reduce(function(prev, next){
  return Object.assign(prev, next);
});

// return {x: 1, y: 2, z: 3}
```

在 dva 中，reducers 聚合积累的结果是当前 model 的 state 对象。通过 actions 中传入的值，与当前 reducers 中的值进行运算获得新的值（也就是新的 state）。需要注意的是 Reducer 必须是纯函数，所以同样的输入必然得到同样的输出，它们不应该产生任何副作用。并且，每一次计算都应该使用不可变数据 [immutable data](https://github.com/MostlyAdequate/mostly-adequate-guide/blob/master/ch3.md#reasonable)，这种特性简单的理解就是每次操作都是返回一个全新的数据（独立，纯净），所以热重载和时间旅行这些功能才能够使用。

### Effect

Effect 被称之为副作用，在我们的应用中，最常见的就是异步操作。它（？？？）来自于函数编程的概念，之所以叫副作用是因为它使得我们的函数变得不纯，同样的输入不一定获得同样的输出。

dva 为了控制副作用的操作，底层引入了 redux-sagas 做异步流程控制，由于采用了 generator 的相关概念，所以将异步转成同步的写法，从而将 effects 转为纯函数。至于我们为什么这么纠结于纯函数，如果你想了解更多可以阅读 [Mostly adequate guide to FP](https://github.com/MostlyAdequate/mostly-adequate-guide)，或者它的中文译本 [JS函数式编程指南](https://www.gitbook.com/book/llh911001/mostly-adequate-guide-chinese/details)

### Subscription

Subscription 是一种从源获取数据的方法，它来自于 elm。

Subscription 语义是订阅，用于订阅一个数据源，然后根据条件 dispatch 需要的 action。数据源可以是当前的时间、服务器的 websocket 连接、keyboard 输入、geolocation变化、history 路由变化等等。

```js
import key from 'keymaster';
...
app.model({
  namespace: 'count',
  subscriptions: {
    keyEvent(dispatch){
      key('⌘+up, ctrl+up', ()=>{ dispatch({type: 'add'}) });
    },
  },
});
```

## Router

这里的路由通常是指前段路由，由于我们的应用现在通常是单页应用，所以需要前端代码来控制路由逻辑，通过浏览器提供的 History API 可以监听浏览器的 url 变化，从而控制路由相关操作。

dva 实例提供了 router 方法来控制路由，使用的是 react-router 。

```jsx
import { Router, Route } from 'dva/router';

app.router(({ history }) => 
  <Router history={history}>
    <Route path="/" component={HomePage} />
  </Router>
);
```

## Route Component

在组件设计方法中，我们提到过 Container Components，在 dva 中我们通常将其约束为 Route Components，因为在 dva 中我们通常以页面维度来设计 Container Components。

所以在 dva 中，通常需要 connect Model 的组件都是 Route Components，组织在 /routers/ 目录下，而 /components/ 目录下则是纯组件（Presentational Components）。