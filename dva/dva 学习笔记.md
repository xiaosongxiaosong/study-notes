# dva 学习笔记

## ant-admin 登录页是如何从根路由的布局分离出来

[issues 188](https://github.com/zuiidea/antd-admin/issues/188)

> 我现在是在utils/config.js写了这个openPages: ['/login'],只要在openPages里的页面都会直接加载而不会加载布局

```js
// ./src/routes/app.js
if (config.openPages && config.openPages.indexOf(location.pathname) > -1) {
  return <div>{children}</div>
}
```

```js
// ./src/utils/config.js
openPages: ['/login'],
```

## 如何 abort 请求

## model 中定时轮询的实现与问题

目前的实现方式是单独实现了一个管理状态的组建，接受相关参数进行轮寻。

##  多个异步 effects 时序控制问题

[Issues 248](https://github.com/dvajs/dva/issues/248)

> 两个方案： 
>
> 通过 put action 去调? yield put({ type: 'auth' });，缺点是不会等待完成 
>
> auth 抽到 model 外，然后在 effect 里用 yiled * 去调他

```js
// model.js
// ...
import { service } from '../services';
function* doSomeThing({ call, put, select }){
  // 等待 doAnotherThing 完成后继续处理
  yield* doAnotherThing({ call, put, select });
  // 一些异步部操作
  const data = yield call(service.start);
  yield put({ type: 'setData', payload: data });
}
function* doAnotherThing({ call, put, select }){
  const { params } = yield select(state => state.namespace);
  const data = yield call(service.stop, params);
  yield put({ type: 'setData', payload: null });
}

export default {

  namespace: 'namespace',

  state: {
    data: null,
    // state ...
  },

  subscriptions: {
    // subscriptions ...
  },

  effects: {
    *doSomeThing({ payload }, { call, put, select }){
      yield call(doSomeThing, { call, put, select });
    },
  },

  reducers: {
    setData(state, action) {
      return { ...state, data: action.payload };
    },
  },
};
```
dva@2.0 发布以后，dispatch 返回 Proimse，可以通过发起多个 action 的方式进行控制了

[dva 2.0 发布](https://github.com/sorrycc/blog/issues/48)

> dispatch(effectAction) => Proimse
> 
> 为了方便在视图层 dispatch action 并处理回调，比如 #175，我们在 dispatch 里针对 effect 类型的 action 做了返回 Promise 的特殊处理。
