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

可能要通过 take 或者 takeEvery 来实现，暂时不投入确认。

## model 中定时轮询的实现与问题

目前的实现方式是单独实现了一个管理状态的组建，接受相关参数进行轮寻。

### 更新：

通过 saga 的 fork 接口创建一个子任务，子任务中进行 for 循环，同时监听销毁资源的 effects，资源销毁时将 fork 的子任务取消掉。

[参考资料](http://leonshi.com/redux-saga-in-chinese/docs/advanced/NonBlockingCalls.html)

示例代码：

```js
// model.js
// ...
import { service } from '../services';

function* keepalive({ call, put }) {
  while (true) {
    // do something ...
    yield call(delay, 1000 * 20);
  }
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
    *loginSucceed({ payload }, { put, fork, take, cancel, call }) {
      const task = yield fork(keepalive, { put, call });
      yield take(['logout', 'loginFaild']);
      yield cancel(task);
    },
    *loginFaild({ payload }, { }) {
      // do something ...
    },
    *logout({ payload }, { }) {
      // do something ...
    },
  },

  reducers: {
    setData(state, action) {
      return { ...state, data: action.payload };
    },
  },
};
```


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

## jwt 管理实现

```js
// src/model/app.js
import { auth, delay } from '../utils';

const aliveInterval = 10 * 60 * 1000;
function* keepalive({ call, put }) {
  while (true) {
    // 判断 jwt 是否需要更新
    const timeLeft = auth.getJwtTimeLeft();
    if (timeLeft < aliveInterval) {
      const res = yield call(updateJwt, { call, put });
      if (false === res) {
        // jwt 更新失败
        return yield put({ type: 'loginFaild' });
      }
    }
    yield call(delay, aliveInterval);
  }
}

const updateJwt = async () => {
  // 获取用户信息，用于更新jwt
  const userInfo = getUserInfo();
  const expired = auth.getUserLoginExpired();
  // 发送 request 更新jwt
  const response = await user.userLogin({ username: userInfo.username, password: userInfo.password, expired });
  if (response.data) {
    // 缓存jwt
    saveJwt();
    return true;
  }
  if (response.err) {
    return false;
  }
};

export default {
  namespace: 'app',
  state:  { /* ... */ },
  subscriptions: { /* ... */ },
  effects: {
    // ...
    *loginSucceed({ payload }, { put, fork, take, cancel, call }) {
      const task = yield fork(keepalive, { put, call });
      auth.setUpdateJwtHandle(updateJwt);
      yield take(['logout', 'loginFaild']);
      auth.setUpdateJwtHandle(null);
      yield cancel(task);
    },
  },
  reducers: { /* ... */ },
};
```

```js
// src/utils/auth.js
let updateJwtHandle = null;
const setUpdateJwtHandle = (handle) => {
  updateJwtHandle = handle;
};

const getEffectiveJwt = () => {
  // debugger;
  return new Promise((resolve, reject) => {
    const error = new Error('Unauthorized');
    error.response = { status: 401 };
    const jwt = getJwt();
    if (jwt) {
      return resolve(jwt);
    } else if (!updateJwtHandle) {
      return reject(error);
    }
    // debugger;
    updateJwtHandle().then(() => {
      return resolve(getJwt());
    }).catch(() => {
      return reject(error);
    });
  });
};

export default {
  getEffectiveJwt,
};
```

```js
// src/utils/request.js
import fetch from 'dva/fetch';
import { getEffectiveJwt } from './auth';

function request(resource, opts) {
  // debugger;
  return getEffectiveJwt().then((jwt) => {
    return ajax(resource, opts, jwt);
  }).catch(err => ({ err }));
}

function requestNotNecessaryJwt(resource, opts) {
  return getEffectiveJwt().then((jwt) => {
    return ajax(resource, opts, jwt);
  }).catch(() => {
    return ajax(resource, opts);
  });
}

function requestWithoutJwt(resource, opts) {
  return ajax(resource, opts);
}

function ajax(resource, opts, jwt) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (jwt) {
    headers.Authorization = `Bearer ${jwt}`;
  }
  const options = Object.assign({}, {
    method: 'GET',
    mode: 'cors',
    headers,
  }, opts);

  return fetch(resource, options)
    .then(checkStatus)
    .then(parseText)
    .then(parseJSON)
    .then(data => ({ data }))
    .catch(err => ({ err }));
}

export default {
  request,
  requestNotNecessaryJwt,
  requestWithoutJwt,
};
```
