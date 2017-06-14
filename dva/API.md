# API

[原文地址](https://github.com/dvajs/dva/blob/master/docs/API_zh-CN.md)

## 输出文件

### dva

默认输出文件

### dva/mobile

dva/mobile 是无 router 版的 dva，可用于多页应用、react-native 等。叫 dva/mobile 有点欠考虑，可能在下个大版本中改名。

### dva/router

默认输出 react-router@2.x 接口，react-router-redux 的接口通过属性 routerRedux 输出。

比如：

```js
import { Router, Route, routerRedux } from 'dva/router';
```

### dva/fetch

异步请求库，输出 isomorphic-fetch 的接口。不和 dva 强绑定，可以选择任意的请求库。

### dva/saga

输出 redux-saga 的接口，主要用于用例的编写。（用例中需要用到 effects）

## dva API

### `app = dva(opts)`

创建应用，返回 dva 实例。（注： dva 支持多实例）

opts 包含：
* history ：指定给路由用的 history，默认是 hashHistory
* initialState ：指定初始数据，优先级高于 model 中的 state，默认是 {}

如果要配置 history 未 browserHistory，可以这样：

```js
import { browserHistory } from 'dva/router';

const app = dva({
  history: browserHistory,
});
```

另外，出于易用性的考虑， opts 里也可以配所有的 hooks，下面包含全部的可配属性：

```js
const app = dva({
  history,
  initialState,
  onError,
  onAction,
  onStateChange,
  onReducer,
  onEffect,
  onHmr,
  extraReducers,
  extraEnhancers,
});
```

### `app.use(hooks)`

配置 hooks 或者注册插件。（插件最终返回的是 hooks）

比如注册 dva-loading 插件的例子：

```js
import createLoading from 'dva-loading';

app.use(createLoading(opts));
```

#### hooks 包含：

##### `onError(fn, dispatch)`

effect 执行错误或 subscription 通过 done 主动抛错时触发，可用于管理全局出错状态。

注意：subscription 并没有加 try...catch ，所以有错误时需要通过第二个参数 done 主动抛错。例子：

```js
app.model({
  subscriptions: {
    setup({ dispatch }, done){
      done(e);
    },
  },
});
```

如果我们用 antd，那么最简单的全局错误处理通常会这么做：

```js
import { message } from 'antd';

const app = dva({
  onError(e) {
    message.errar(e.message, /* duration */);
  },
});
```

##### `onAction(fn | fn[])`

在 action 被 dispatch 时触发，用于注册 redux 中间件，支持函数或函数数组格式。

例如我们要通过 redux-logger 打印日志：

```js
import createLogger from 'redux-logger';

const app = dva({
  onAction: createLogger(opts),
});
```

##### `onStateChange(fn)`

state 改变时触发，可用于同步 state 到 localStorage，服务器端等。

##### `onReducer(fn)`

封装 reducer 执行。比如借助 redux-undo 实现 redo/undo：

```js
import undoable from 'redux-undo';

const app = dva({
  onReducer: reducer => {
    return (state, action) => {
      const undoOpts = {};
      const newState = undoable(reducer, undoOpts)(state, action);
      // 由于 dva 同步了 routing 数据，所以需要把这部分还原
      return { ...newState, routing: newState.present.routing };
    },
  },
});
```

##### `onEffect(fn)`

封装 effect 执行。比如 dva-loading 基于此实现了自动处理 loading 状态。

##### onHmr(fn)

热替换相关，目前用于 babel-plugin-dva-hmr 。

##### `extraReducers`

指定额外的 reducer，比如 redux-form 需要指定额外的 from reducer：

```js
import { reducer as formReducer } from 'redux-form';

const app = dva({
  extraReducers: {
    form: formReducer,
  },
});
```

##### `extraEnhancers`

