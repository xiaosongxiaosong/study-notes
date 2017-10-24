# Redux-saga 中文文档

[原文地址](http://leonshi.com/redux-saga-in-chinese/index.html)


## 基本概念

### 使用 Saga 辅助函数

redux-saga 提供了一些辅助函数，用来在一些特定的 action 被发起到 Store 时派生任务。

这些辅助函数构建在低阶 API 之上。我们将会在高级概念一节看到这些函数是如何实现的。

第一个函数， takeEvery 是最常见的，它提供了类似 redux-thunk 的行为。

让我们演示一下常见的 AJAX 例子。每次点击 Fetch 按钮时，我们发起了一个 FETCH_REQUESTED 的 action 。

首先我们创建一个将执行异步 action 的任务：

```js
import { call, put } form 'redux-saga/effects';

export function* fetchData(action){
  try {
    const data = yield call(Api.fetchUser, action.payload.url);
    yield put({ type: 'FETCH_SUCCEEDED', data });
  } catch(error){
    yield put({ type: 'FETCH_FAILED', error });
  }
}
```

然后在每次 FETCH_REQUESTED action 被发起时启动上面的任务。

```js
import { takeEvery } from 'redux-saga';

function* watchFetchData(){
  yield* takeEvery('FETCH_REQUESTED', fetchData);
}
```

在上面的例子中，takeEvery 允许多个 fetchData 实例同时启动。在某个特定时刻，我们可以启动一个新的 fetchData 任务，尽管之前还有一个或多个 fetchData 尚未结束。

如果我们只想得到最新那个请求的响应（例如，始终显示最新版本的数据）。我们可以使用 takeLatest 辅助函数。

```js
ipmort { takeLatest } from 'redux-saga';

function* watchFetchData() {
  yield* takeLatest('FETCH_REQUESTED', fetchData);
}
```

和 takeEvery 不同，在任何时刻 takeLatest 只允许执行一个 fetchData 任务。并且这个任务是最后被启动的那个。如果之前已经有一个任务在执行，那之前的这个任务会自动被取消。

### 声明式 Effects

在 redux-saga 的世界里，Sagas 都用 Generator 函数实现。我们从 Generator 里 yield 纯 Javascript 对象以表达 Saga 逻辑。我们称呼那些对象为 Effect。Effect 是一个简单的对象，这个对象包含了一些给 middleware 解释执行的信息。你可以把 Effect 看作是发送给 middleware 的指令以执行某些操作（调用某些异步操作，发起一个 action 到 store）。

你可以使用 redux-saga/effects 包里提供的函数来创建 Effect。

这一部分和接下来的部分，我们将介绍一些基础的 Effect。并见识到这些 Effect 概念是如何让 Sagas 很容易地被测试的。

Sagas 可以多种形式 yield Effect。最简单的方式就是 yield  一个 Promise。

举个例子，假设我们有一个监听 PRODUSTS_REQUESTED action 的 Saga。每次匹配到 action，它会启动一个从服务器上获取产品列表的任务。

```js
import { takeEvery } from 'redux-saga';
import Api from './path/to/api';

function* watchFetchProduts() {
  yield* takeEvery('PRODUCTS_REQUESTED', fetchProducts);
}

function* fetchProducts() {
  const products = yield Api.fetch('/products');
  console.log(products);
}
```

在上面的例子中，我们在 Generator 中直接调用了 Api.fetch （在 Generator 函数中， yield 右边的任何表达式都会被求值，结果会被 yield 给调用者）。

Api.fetch('/products') 触发了一个 AJAX 请求并返回一个 Promise，Promise 会 resolve 请求的响应，这个 AJAX 请求将立即执行。看起来简单又地道，但...

假设我们想测试上面的 generator:

```js
const iterator = fetchProducts();
assert.deepEqual( iterator.next().value, ?? ) // 我们期望得到什么？
```

我们想要检查 generator yield 的结果的第一个值。在我们的情况里，这个值是执行 Api.fetch('/products') 这个 Promise 的结果。在测试过程中，执行真正的服务（real service）是一个既不可行也不适用的方法，所以我们必须模拟（mock）Api.fetch 函数。也就是说，我们需要将真实的函数替换为一个假的，这个假的函数并不会真的发送 AJAX 请求而只会检查是否用正确的参数调用了 Api.fetch （在我们的情况里，正确的参数是'/products'）。

模拟使测试更加困难和不可靠。另一方面，那些只简单地返回值的函数更加容易测试，因此我们可以使用简单的 equal() 来检查结果。这是编写最可靠测试用例的方法。


相比于在 Generator 中直接调用异步函数，我们可以仅仅 yield 一条描述函数调用的信息。也就是说，我们将简单地 yield 一个看起来像下面这样的对象：

```js
// Effect -> 调用 Api.fetch 函数并传递 `。/products` 作为参数
{
  CALL: {
    fn: Api.fetch,
    args: ['./products']
  }
}
```

换句话说，Generator 将会 yield 包含指令的文本对象，redux-saga middleware 将确保执行这些指令并将指令的结果反馈给 Generator。这样的话，在测试 Generator 时，所有我们需要做的就是，将 yield 后的对象作为一个简单的 deepEqual 来检查它是否 yield 了我们期望的指令。

出于这样的原因，radux-saga 提供了一个不一样的方式来执行异步调用。

```js
import { call } from 'redux-saga/effects';

function* fetchProducts() {
  const products = yield call(Api.fetch, '/products');
  // ...
}
```

我们使用了 call(fn, ...args) 这个函数。与前面的例子不同的是，现在我们不立即执行异步调用，相反， call 创建了一条描述结果的信息。就像在 Redux 里你使用 action 创建器，创建一个将被 Store 执行的、描述 action 的纯文本对象。 call 创建了一个纯文本对象描述函数调用。redux-saga middleware 确保执行函数调用并在响应被 resolve 时恢复 generator。

这让你能容易地测试 Generator，就算它在 Redux 环境之外。因为 call 只是一个返回纯文本对象的函数而已。

```js
import { call } from 'redux-saga/effects';
import Api from '...';

const iterator = fetchProducts();

// expects a call instruction
assert.deepEqual(
  iterator.next().value,
  call(Api.fetch, '/products'),
  'fetchProducts should yield an Effect call(Api.fetch, "./products")'
);
```

现在我们不需要模拟任何东西了，一个简单的相等测试就足够了。

这些声明式调用的优势是，我们可以通过简单地遍历 Generator 并在 yield 后的成功的值上面做一个 deepEqual 测试，就能测试 Saga 中所以的逻辑。这是一个真正的好处，因为复杂的异步操作都不再是黑盒，你可以详细地测试操作逻辑，不管他有多么复杂。

call 同样支持调用对象方法，你可以使用一下形式，为调用的函数提供一个 this 上下文：

```js
yield call([obj, obj.method, arg1, arg2, ...]);
```

apply 提供了另外一种调用的方式：

```js
yield apply(obj, obj.method[, arg1, arg2, ...]);
```

call 和 apply 非常适合返回 Promise 结果的函数。另外一个函数 cps 可以用来处理 Node 风格的函数（例如，fn(...args, callback) 中的 callback 是 (error, result) => () 这样的形式， cps 表示的是延续传递风格）。

举个例子：

```js
import { cps } from 'redux-saga';

const content = yield cps(readFile, '/path/to/file');
```

当然你也可以像测试 call 一样测试它：

```js
import { cps } from 'redex-saga/effects';

const iterator = fetchSaga();
assert.deepEqual(iterator.next().value, cps(readFile, '/path/to/file'));
```

cps 同 call 的方法调用形式是一样的。


### 发起 action 到 store

在前面的例子上更进一步，假设每次保存之后，我们想发起一些 action 通知 Store 数据获取成功了（目前我们先忽略失败的情况）。

我们可以找出一些方法来传递 Store 的 dispatch 函数到 Generator。然后 Generator 可以在接收到获取的响应之后调用它。

```js
// ...

function* fetchProducts(dispatch){
  const products = yield call(Api.fetch, '/products');
  dispatch({ type: 'PRODUCTS_RECEIVED', products });
}
```

然而，该解决方案与我们在上一节中看到的从 Generator 内部直接调用函数，有着相同的缺点。如果我们想要测试 fetchProducts 接收到 AJAX 响应之后执行 dispatch，我们还需要模拟 dispatch 函数。

相反，我们需要同样的声明式的解决方案。只需要创建一个对象来指示 middleware 我们需要发起一些 action，然后让 middleware 执行真实的 dispatch。这种方式我们就可以同样的方式测试 Generator 的 dispatch：只需要检查 yield 后的 Effect，并确保它包含正确的指令。

redux-saga 为此提供了另外一个函数 put，这个函数用于创建 dispatch Effect。

```js
import { call, put } from 'redux-saga/effects';
// ...

function* fetchProducts(){
  const products = yield call(Api.fetch, '/products');
  // 创建并 yield 一个 dispatch Effect
  yield put({ type: 'PRODUCTS_RECEIVED', products });
}
```

现在，我们可以像上一节那样轻易地测试 Generator：

```js
import { call, put } from 'redux-saga/effects';
import Api from '...';

const iterator = fetchProducts();

// 期望一个 call 指令
assert.deepEqual(
  iterator.next().value,
  call(Api.fetch, '/products'),
  'fetchProducts should yield an Effect call(Api.fetch, "/products")'
);

// 创建一个假的响应对象
const products = {};

// 期望一个 dispatch 指令
assert.deepEqual(
  iterator.next(products).value,
  put({ type: 'PRODUCTS_RECEIVED', products }),
  "fetchProducts should yield an Effect put({ type: 'PRODUCTS_RECEIVED', products })"
);
```

现在我们通过 Generator 的 next 方法来将假的响应对象传递到 Generator。在 middleware 环境之外，我们可完全控制 Generator，通过简单地模拟结果并还原 Generator，我们可以模拟一个真实的环境。相比与去模拟函数和窥探调用，模拟数据要简单的多。


### 错误处理

在这一节中，我们将看到如何在前面的例子中处理故障案例。我们假设远程读取因为某些原因失败了，APO函数 Api.fetch 返回一个被拒绝的 Promise。

我们希望通过在 Saga 中发起 PRODUCTS_REQUEST_FAILED action 到 Store 来处理那些错误。

我们可以使用熟悉的 try/catch 语法在 Saga 中捕获错误。

```js
import Api from './path/to/api';
import { call, put } from 'redux-saga/effects';

//...
function* fetchProducts(){
  try{
    const products = yield call(Api.fetch, '/products');
    yield put({ type: 'PRODUCTS_RECEIVED', products });
  } catch(error){
    yield put({ type: 'PRODUCTS_REQUEST_FAILED', error });
  }
}
```

为了测试故障案例，我们将使用 Generator 的 throw 方法。

```js
import { call, put } from 'redux-saga/effects';
import Api from '...';

const iterator = fetchProducts()

// 期望一个 call 指令
assert.deepEqual(
  iterator.next().value,
  call(Api.fetch, '/products'),
  "fetchProducts should yield an Effect call(Api.fetch, './products')"
);

// 创建一个模拟的 error 对象
const error = {};

// 期望一个 dispatch 指令
assert.deepEqual(
  iterator.throw(error).value,
  put({ type: 'PRDUCTS_REQUEST_FAILED', error }),
  "fetchProducts should yield an Effect put({ type: 'PRODUCTS_REQUEST_FAILED', error })"
); 
```

在这个案例中，我们传递一个模拟的 error 对象给 throw，这会引发 Generator 中断当前执行流并执行捕获区块（catch block）。

当然了，你并不一定得到在 try/catch 区块中处理错误，你也可以让你的 API 服务返回一个正常的含有错误标识的值。例如，你可以捕获 Promise 的拒绝操作，并将他们映射到一个错误字段对象。

```js
import Api from './path/to/api'
import { take, put } from 'redux-saga/effects'

function fetchProductsApi() {
  return Api.fetch('/products')
    .then(response => {response})
    .catch(error => {error})
}

function* fetchProducts() {
  const { respone, error } = yield call(fetchProductsApi);
  if (respone) {
    yield put({ type: 'PRODUCTS_RECEIVED', respone });
  } else {
    yield put({ type: 'PRODUCTS_REQUEST_FAILED', error });
  }
}
```

### 一个常见的抽象概念：Effect

概括来说，从 Saga 内触发异步操作（Side Effect）总是由 yield 一些声明式的 Effect 来完成的（你也可以直接 yield Promise，但是这会让测试变得困难，就像我们在第一节中看到的一样）。

一个 Saga 所做的实际上是组合那些所有的 Effect，共同实现所需的控制流。最简单的是只需把 yield 一个接一个地放置，就可对 yield 过的 Effect 进行排序。你也可以使用熟悉的控制流操作符（if, while, for）来实现更复杂的控制流。

我们已经看到，使用 Effect 诸如 call 和 put，与高阶 API 如 takeEvery 相结合，让我们实现与 redux-thunk 同样的东西，但又有额外的易于测试的好处。

但 redux-saga 相比 redux-thunk 还提供另一种好处。在【高级】一节，你会遇到一些更强大的 Effect，让你可以表达更复杂的控制流的同时，仍然拥有可测试性的好处。


## 高级

### 监听未来的 action

到现在为止，我们已经使用了辅助函数 takeEvery 在每个 action 来到时派生一个新的任务。这多少有些模仿 redux-thunk 的行为：举个例子，每次一个组件调用 fetchProducts Action 创建器，Action 创建器就会发起一个 thunk 来执行控制流。

在现实情况中，takeEvery 只是一个在强大的低阶 API 之上构建的辅助函数。在这一节中我们将看到一个新的 Effect，即 take。take 让我们通过全面控制 action 观察进程来构建复杂的控制流成为可能。

take 就像我们更早之前看到的 call 和 put。它创建另一个命令对象，告诉 middleware 等待一个特定的 action。正如在 call Effect 的情况中，middleware 会暂停 Generator，只到返回的 Promise 被 resolve。在 take 的情况中，它将会暂停 Generator 直到一个匹配的 action 被发起了。

使用 take 组织代码有一个小问题。在 takeEvery 的情况中，被调用的任务无法控制何时被调用，它们将在每次 action 被匹配时一遍一遍地被调用。并且他们也无法控制何时停止监听。

而在 take 的情况中，控制恰恰相反。与 action 被推向任务处理函数函数不同，Saga 是自己主动拉取 action 的。看起来就像是 Saga 在执行一个普通的函数调用 action = getNextAction() ，这个函数将在 action 被发起时 resolve。

这样的反向控制让我们能够实现一些使用传统的 push 方法做非常规事情的控制流。

一个简单的例子，假设在我们的 Todo 应用中，我们希望监听用户的操作，并在用户初次创建完三条 Todo 信息时显示祝贺信息。

```js
import { take, put } from 'redux-saga/effects';

function* watchFirstThreeTodosCreation() {
  for (let i = 0; i < 3; i++) {
    const action = yield take('TODO_CREATED');
  }
  yield put({ type: 'SHOW_CONGRATULATION' });
}
```
与 while(true) 不同，我们运行一个只迭代三次的 for 循环。在 take 初次的 3 个 TODO_CREATED action 之后，watchFirstThreeTodosCreation Saga 将会使应用显示一条祝贺信息然后终止。这意味着 Generator 会被回收并且响应的监听不会再发生。

主动拉取 action 的另一个好处是我们可以使用熟悉的同步风格来描述我们的控制流。举个例子，假设我们希望实现一个这样的登录控制流，有两个 action 分别是 LOGIN 和 LOGOUT。使用 takeEvery（或 redux-thunk）我们必须要写两个分别的任务（或 thunks）：一个用于 LOGIN，另一个用于 LOGOUT。

结果就是我们的逻辑现在分开在两个地方。别人为了阅读我们的代码搞明白这是怎么回事，他必须阅读两个处理函数的源代码并且要在两处逻辑之间建立连接。这意味着他必须通过在心中重新排列放在几个地方的代码逻辑获取正确的排序，从而在脑中重建控制流模型。

使用拉取模式，我们可以在同一个地方写控制流。

```js
function* loginFlow() {
  while(true) {
    yield take('LOGIN');
    // ... perform the login logic
    yield take('LOGOUT');
    // ... perform the logout logic
  }
}
```

与重复处理相同的 action 不同，loginFlow Saga 更好理解，因为序列中的 actions 是期望之中的。他知道 LOGIN action 后面应该始终跟着一个 LOGOUT action。LOGOUT 也应该始终跟在一个 LOGIN 后面（一个好的 UI 程序应该始终强制执行顺序一致的 actions，通过隐藏或禁用意料之外的 action）。


### 无阻塞调用

在上一节中，我们看到了 take Effect 让我们可以在一个集中的地方更好地描述一个非常规的流程。

重温一下登录流程示例：

```js
function* loginFlow() {
  while(true) {
    yield take('LOGIN')
    // ... perform the login logic
    yield take('LOGOUT')
    // ... perform the logout logic
  }
}
```

让我们来完成这个例子，并实现真实的登录/登出逻辑。假设有这样一个 Api，它允许我们在一个远程服务器上验证用户的权限。如果验证成功，服务器将会返回一个授权令牌，我们的应用程序将会通过 DOM storage 存储这个令牌。

当用户登出，我们将直接删除以前存储的授权令牌。

初始尝试：

到目前为止，我们拥有所有需要的 Effects 用来实现上述流程。我们可以使用 take Effect 等待 store 中指定的 action。我们也可以使用 call Effect 进行同步调用，最后使用 put Effect 来发起 action 到 store。

> 注意，以下代码有个小问题

```js
import { take, put, call } from 'redux-saga/effects';
import Api from '...';

function* authorize(user, password) {
  try {
    const token = yield call(Api.authorize, user, password);
    yield put({ type: 'LOGIN_SUCCESS' , token });
    return token;
  } catch(error) {
    yield put({type: 'LOGIN_ERROR', error});
  }
}

function* loginFlow() {
  while (true) {
    const { user, password } = yield take('LOGIN_REQUEST');
    const token = yield call(authorize, user, password);
    if (token){
      yield call(Api.storeItem({ token }));
      yield take('LOGOUT');
      yield call(Api.clearItem('token'));
    }
  }
}
```

首先我们创建了一个独立的 Generator authorize，它执行真实的 Api 调用并在成功后通知 Store。

loginFlow 在一个 while(true) 循环中实现它所有的流程，这样做的意思是：一旦到达流程最后一步（LOGOUT），通过等待一个新的 LOGIN_REQUEST action 来启动一个新的迭代。

loginFlow 首先等待一个 LOGIN_REQUEST action。然后在 action 的 payload 中获取有效凭据（即 user 和 password）并调用一个 call 到 authorize 任务。

正如你注意到的，call 不仅可以用来调用返回 Promise 的函数。我们也可以用它来调用其他 Generator 函数。在上面的例子中，loginFlow 将等待 authorize 直到它终止或返回（即执行 api 调用后，发起 action 然后返回 taken 至 loginFlow）。

如果 Api 调用成功了，authorize 将发起一个 `LOGIN_SUCCESS` action 然后返回获取到的 token。如果调用导致了错误，将会发起一个 `LOGIN_ERROR` action。

如果调用 authorize 成功，loginFlow 将在 DOM storage 中存储返回的 token，并等待 LOGIN action。当用户登出，我们删除存储的 token 并等待一个新的用户登录。

在 authorize 失败的情况下，它将返回一个 undefined 值，这将导致 loginFlow 跳过当前处理进程并等待一个新的 LOGIN_REQUEST action。

观察整个逻辑是如何存储在一个地方的。一个新的开发者阅读我们的代码时，不必在为了理解控制流而在各个地方来回切换。这就像是在阅读同步代码：他们的自然顺序确定了执行步骤。并且我们有很多 Effects 可以调用其他函数并等待它们的结果。

但是上面的方法还是有一个小问题：

假设 loginFlow 正在等待如下的调用被 resolve：

```js
function* loginFlow() {
  while(true) {
    ...
    try {
      const token = yield call(authorize, user, password)
      ...
    }
    ...
  }
}
```

但用户点击了 LOGOUT 按钮使得 LOGOUT action 被发起。

下面的例子演示了假象的一系列事件：

```
UI                              loginFlow
--------------------------------------------------------
LOGIN_REQUEST...................call authorize.......... waiting to resolve
........................................................
........................................................                     
LOGOUT.................................................. missed!
........................................................
................................authorize returned...... dispatch a `LOGIN_SUCCESS`!!
........................................................
```

当 loginFlow 在 authorize 中被阻塞了，最终发生在开始调用和收到响应之间的 LOGOUT 将会被错过，因为那时 loginFlow 还没有执行 yield take('LOGOUT') 。

上面代码的问题是 call 是一个会阻塞的 Effect。即 Generator 在调用结束之前不能执行或处理其他任何事情。但是在我们的情况中，我们不仅希望 loginFlow 执行授权调用，也想监听可能发生在调用未完成之前的 LOGOUT action。因为 LOGOUT 与调用 authorize 是并发的。

所以我们需要的是一些非阻塞调用 authorize 的方法。这样 loginFlow 就可以继续执行，并且监听并发的或响应未完成之前发出的 LOGOUT action。

为了表示无阻塞调用，redux-saga 提供了另一个 Effect：fork。当我们 fork 一个任务，任务会在后台启动，调用者也可以继续它自己的流程，而不用等待被 fork 的任务结束。

所以为了让 loginFlow 不错过一个并发的 LOGOUT，我们不应该使用 call 调用 authorize 任务，而应该使用 fork。

```js
import { fork, call, take, put } from 'redux-saga/effects';

function* loginFlow(){
  while(true) {
    //...
    try {
      // 无阻塞调用，这里返回的值是什么？
      const ?? = yield fork(authorize, user, password);
      // ...
    }
    // ...
  }
}
```

现在的问题是，自从 authorize 的 action 在后台启动之后，我们获取不到 token 的结果（因为我们不应该等待它）。所以我们需要将 token 存储操作移到 authorize 任务内部。

```js
import { fork, call, take, put } from 'redux-saga/effects';
import Api from '...';

function* authorize(user, password) {
  try {
    const token = yield call(Api.authorize, user, password);
    yield put({type: 'LOGIN_SUCCESS', token});
  } catch(error) {
    yield put({type: 'LOGIN_ERROR', error})
  }
}

function* loginFlow() {
  while(true) {
    const { user, password } = yield take('LOGIN_REQUEST');
    yield fork(authorize, user, password);
    yield take(['LOGOUT', 'LOGIN_ERROR']);
    yield call(Api.clearItem('token'));
  }
}
```

我们使用了 yield take(['LOGOUT', 'LOGIN_ERROR'])。意思是监听了2个并发的 action：

* 如果 authorize 任务在用户登出之前成功了，它将会发起一个 LOGIN_SUCCESS action 然后结束。然后 loginFlow Saga 只会等待一个未来的 LOGOUT action 被发起（因为 `LOGIN_ERROR` 永远不会发生）。

* 如果在 authorize 任务结束之前，用户就登出了，那么 loginFlow 将收到一个 LOGOUT action 并且也会等待下一个 LOGIN_REQUEST。

注意 Api.clearItem 应该是冥等调用。如果 authorize 调用时没有存储 token 也不会有任何影响。loginFlow 仅仅是保证在等待下一次登录之前，storage 中并没有 token。

但是还没完。如果我们在 Api 调用期间收到一个 LOGOUT action，我们必须要 取消 authorize 处理进程，否则将有两个并发的任务，并且 authorize 任务将会继续进行，并在成功的响应（或失败的响应）返回后发起一个 LOGIN_SUCCESSS action （或一个 `LOGIN_ERROR` action），而这将导致状态不一致。

> 冥等调用???

为了取消 fork 任务，我们可以使用一个指定的 Effect cancel。

```js
import { take, put, call, fork, cancel } from 'redux-saga/effects'

// ...

function* loginFlow() {
  while(true) {
    const {user, password} = yield take('LOGIN_REQUEST');
    // fork return a Task object
    const task = yield fork(authorize, user, password);
    const action = yield take(['LOGOUT', 'LOGIN_ERROR']);
    if(action.type === 'LOGOUT'){
      yield cancel(task);
    }
    yield call(Api.clearItem('token'));
  }
}
```

yield fork 的返回结果是一个 Task 对象。我们将它们返回的对象赋给一个本地常量 task。如果我们收到一个 LOGOUT action，我们将那个 task 传入给 cancel Effect。如果任务仍在运行，他会被中止。如果任务已经完成，那什么也不会发生，取消操作将会是一个空操作。最后，如果该任务完成了但是有错误，那我们什么也没做，因为我们知道，任务已经完成了。

假设在我们收到一个 LOGIN_REQUEST action 时，我们在 reducer 中设置了一些 isLoginPending 标识为 true，以便可以在界面上显示一些消息或者旋转 loading。如果此时我们在 Api 调用期间收到一个 LOGOUT action，并通过杀死它（即任务被立即停止）简单粗暴地中止任务。那我们可能又以不一致的状态结束了。因为 isLoginPending 仍然是 true，而 reducer 还在等待一个结果 action （`LOGING_SUCCESS` 或 `LOGIN_ERROR`）。

幸运的是，cancel Effect 不会粗暴地结束我们的 authorize 任务，它会在里面抛出一个特殊的错误，给 authorize 一个机会执行自己的清理逻辑。而被取消的任务应该捕获这个错误，假设它需要在结束之前做一些事情的话。

我们的 authorize 已经有一个 try/catch 区块，但它定义了一个通用的处理程序，这个程序会在每次错误发生错误时发起 `LOGIN_ERROR` action。但登录取消并不是错误。所以 authorize 任务必须仅在授权失败时发起 LOGIN_ERROR action。

```js
import { isCancelError } from 'redux-saga';
import { take, call, put } from 'redux-saga/effects';
import Api from '...';

function* authorize(user, password) {
  try {
    const token = yield call(Api.authorize, user, password);
    yield put({ type: 'LOGIN_SUCCESS', token });
    return token;
  } catch(error){
    if (!isCancelError(error)){
      yield put({type: 'LOGIN_ERROR', error});
    }
  }
}
```

你可能已经注意到了，我们仍然没有做任何与清除 isLoginPending 状态相关的事情。对于这一点，有两个可能的解决方案：

* 发起一个指定的 action `RESET_LOGIN_PENDING` 。

* 或者更简单，让 reducer 收到 LOGOUT action 时清除 isLoginPending。


### 同时执行多个任务

yield 指令可以很简单的将异步控制流以同步的写法表现出来，但于此同时我们将也会需要同时执行多个任务，我们不能直接这样写：

```js
// 错误写法，effects 将按照顺序执行
const users = yield call(fetch, '/users'),
      repos = yield call(fetch, '/repos');
```

由于第二个 effect 将会在第一个 call 执行完毕后才开始。所以我们需要这样写：

```js
// 正确的写法，effects 将会同步执行
const [users, repos] = yield [
  call(fetch, '/users'),
  call(fetch, '/repos'),
];
```

当我们需要 yield 一个包含 effects 的数组，generator 会被阻塞直到所有的 effects 都执行完毕，或者当一个 effect 被拒绝（就像 Promise.all 的行为）。


### 在多个 Effects 之间启动 race

有时候我们同时启动多个任务，但又不想等待所有任务完成，我们只希望拿到胜利者：即第一个被 resolve 或 reject 的任务。race Effect 提供了一个方法，在多个 Effects 之间触发一个竞赛（race）。

下面的示例演示了触发一个远程的获取请求，并且限制了1秒内响应，否则作超时处理。

```js
import { race, take, put } from 'redux-saga/effects';

function* fetchPostsWithTimeout() {
  const { posts, timeout } = yield race({
    posts: call(fetchApi, '/posts'),
    timeout: call(delay, 1000),
  });

  if (posts){
    put({type: 'POSTS_RECEIVED', posts});
  } else {
    put({type: 'TIMEOUT_ERROR'});
  }
}
```

race 的另一个有用的功能是，他会自动取消那些失败的 Effects。例如，假设我们有两个 UI 按钮：

* 第一个用于在后台启动一个任务，这个任务运行在一个无限循环的 while(true) 中

* 一旦该后台任务启动了，我们启用第二个按钮，这个按钮用于取消该任务。

```js
import { race, take, put } from 'redux-saga/effects';

function* backgroundTask(){
  while(true) { ... }
}

function* watchStartBackgroundTask(){
  while(true) {
    yield take('START_BACKGROUND_TASK');
    yield race({
      task: call(backgroundTask),
      cancel: take('CANCEL_TASK'),
    })
  }
}
```

在 CANCEL_TASK action 被发起的情况下，race Effect 将自动取消 backgroundTask ，并且在 backgroundTask 中抛出一个取消错误。


### 通过 yield* 对 Sagas 进行排序

你可以使用内置的 yield* 操作符来组合多个 sagas，使得它们保持顺序。这让你可以一种简单的程序风格来排列你的宏观任务。

```js
function* playLevelOne(getState) { ... }

function* playLevelTwo(getState) { ... }

function* playLevelThree(getState) { ... }

function* game(getState) {
  const score1 = yield* playLevelOne(getState);
  put(showScore(score1));

  const score2 = yield* playLevelTwo(getState);
  put(showScore(score2));

  const score3 = yield* playLevelThree(getState);
  put(showScore(score3));
}
```

注意，使用 yield* 将导致该 Javascript 运行环境漫延至整个序列。由此产生的迭代器将 yield 所有来自于嵌套迭代器里的值。一个更强大的替代方案是使用更通用的中间间组合机制。


### 组合 Sagas

使用 yield* 为组合 Sagas 提供了一种通畅的方式，但这个方法也有一些局限性：

* 你可能会想要单独测试嵌套的 Generator。这导致了一些重复的测试代码及重复执行的开销。我们不希望执行一个嵌套的 Generator，而仅仅是想确认它是被传入正确的参数来调用。

* 更重要的是，yield* 只允许任务的顺序组合，所以一次你只能 yield* 一个Generator。

你可以直接使用 yield 来并行地启动一个或多个子任务。当 yield 一个 call 至 Generator，Saga 将等待 Generator 处理结束，然后以返回的值恢复执行（或错误从子任务中传播过来，则抛出异常）。

```js
function* fetchPosts() {
  yield put( actions.requestPosts() );
  const products = yield call(fetchApi, '/products');
  yield put( actions.receivePosts(products) );
}

function* watchFetch() {
  while (yield take(FETCH_POSTS)) {
    yield call(fetchPosts);
  }
}
```

yield 一个队列的嵌套的 Generators，将同时启动这些子 Generators，并等待它们完成。然后以所有返回的结果恢复执行：

```js
function* mainSaga(getState) {
  const results = yield [ call(task1), call(task2), ...];
  yield put( showResults(results) );
}
```

事实上，yield Sagas 并不比 yield 其他 effects（未来的 actions，timeouts，等待）不同。这意味着你可以使用 effect 合并器将那些 Sagas 和所有其他类型的 Effect合并。

例如，你可能希望用户在有限的时间内完成一些游戏：

```js
function* game(getState) {
  let finished;
  while(!finished) {
    // 必须在 60 秒内完成
    const {score, timeout} = yield race({
      score: call( play, getState),
      timeout: call(delay, 60000),
    });

    if (!timeout) {
      finished = true;
      yield put( showScore(score) );
    }
  }
}
```


### 任务的取消

我们已经在 [无阻塞调用](#无阻塞调用) 一节中看到了取消任务的示例。在这节，我们将回顾一下，在一些更加详细的情况下取消的语义。

一旦任务被 fork，可以使用 yield cancel(task) 来中止任务执行。取消正在运行的任务，将抛出 SagaCancellationException 错误。

来看看它是如何工作的，让我们先考虑一个简单的例子：一个可通过某些 UI 命令启动或停止的后台任务。在接受到 `START_BACKGROUND_SYNC` action 后，我们 fork 一个后台任务，周期性地从远程服务器同步一些数据。

这个任务将会一直执行直到一个 `STOP_BACKGROUND_SYNC ` action 被触发。然后我们取消后台任务，等待下一个 `STOP_BACKGROUND_SYNC` action。

```js
import { SagaCancellationException } from 'redux-saga';
import { take, put, call, fork, cancel } from 'redux-saga/effects';
import actions from 'somewhere';
import { someApi, delay } from 'somewhere';

function* ngSync() {
  try{
    while(true) {
      yield put(actions.requestStart());
      const result = yield call(someApi);
      yield put(actions.requestSuccess(result));
      yield call(delay, 5000);
    }
  } catch(error) {
    // 或直接使用 isCancelError(error)
    if (error instanceof SagaCancellationException) {
      yield put(actions.requestFailure('Sync cancelled'));
    }
  }
}

function* main() {
  while( yield take(START_BACKGROUND_SYNC) ) {
    // 启动后台任务
    const bgSyncTask = yield fork(bgSync);

    // 等待用户的停止行为
    yield take(STOP_BACKGROUND_SYNC);
    // 用户点击了停止，取消了后台任务
    // 将抛出一个 SagaCancellationException 错误至被 fork 的 bgSync 任务
    yield cancel(bgSyncTask);
  }
}
```

yield cancel(bgSyncTask) 将在当前执行的任务中抛出一个 SagaCancellationException 类型的异常。在上面的示例中，异常是由 bgSync 引发的。注意，未被捕获的 SagaCancellationException 不会向上冒泡。在上面的示例中，如果 bgSync 没有捕获取消错误，错误将不会被传播到 main。

取消正在执行的任务，也将同时取消被阻塞在当前 Effect 中的任务。

举个例子，假设在应用程序生命周期的某个时刻，还有挂起的（未完成的）调用调用链：

```js
function* main() {
  const task = yield fork(subtask);
  ...
  // later
  yield cancel(task);
}

function* subtask(){
  ...
  yield call(subtask2)
  ...
}

function* subtask2() {
  ...
  yield call(someApi) // currently blocked on this all
  ...
}
```

`yield cancel(task)` 将触发 subtask 任务的取消，反过来它将触发 subtask2 的取消。subtask2 中将抛出一个 SagaCancellationException 错误，然后另一个 SagaCancellationException 错误将会在 subtask 中抛出。如果 subtask 没有处理取消异常，一条警告信息将在控制台中打印出来，以警告开发者（如果 process.evv.NODE_ENV 变量存在，并且它被设置为 development，就仅仅会打印日志信息而不是警告信息）。

取消异常的主要目的是让已取消的任务执行任何自定义的清理逻辑，因此，我们不会让应用程序状态不一致。在上面后台同步的示例中，通过捕获取消异常，bgSync 能够发起一个 requestFailure action 至 store。否则，store 可能会变得状态不一致（例如，等待一个被挂起的请求的结果）。

注意：记住重要的一点，yield cancel(task) 不会等待被取消的任务完成（即执行其 catch 区块）。cancel Effect 的行为和 fork 有点类似。一旦取消发起，它就会尽快返回。一旦取消，任务通常应尽快完成它的清理逻辑然后返回。在某些情况下，清理逻辑可能涉及一些异步操作，但被取消的任务变成了独立的进程，并且没有办法让它们重新加入主控制流程（除了通过 Redux store 为其他任务发起 action，然而这将会导致控制流变的复杂且难以理解。更好的作法是尽快结束一个已取消的任务）。

#### 自动取消

除了手动取消任务，还有一些情况的取消是自动触发的：

1. 在 race Effect 中。所有参与竞赛的任务，除了优胜者（最先完成的任务），其他任务都会被取消。

2. 并行的 Effect（yield [...]）。一旦其中任何一个任务被拒绝，并行的 Effect 将会被拒绝（受 Promise.all 启发）。在这种情况下，所有其他的 Effect 将被自动取消。


### 常见的并发模式

在基础知识部分，我们看到了如何使用辅助函数 takeEvery 和 takeLatest 来管理 Effects 之间的并发。

在本节中，我们将看到如何使用低阶 Effects 来实现那些辅助函数。

#### takeEvery

```js
function* takeEvery(pattern, saga, ...args) {
  while(true) {
    const action = yield take(pattern);
    yield fork(saga, ...args.concat(action));
  }
}
```

takeEvery 可以让多个 saga 任务并行被 fork 执行。

#### takeLatest

```js
function* takeLatest(pattern, saga, ...args) {
  let lastTask;
  while(true) {
    const action = yield take(pattern);
    if (lastTask){
      yield cancel(lastTask); // 如果任务已经结束，则 cancel 为空操作
    }
    lastTask = yield fork(saga, ...args.concat(action));
  }
}
```

takeLatest 不允许多个 saga 任务并行地执行。一旦接收到新的发起的 action，它就会取消前面的 fork 过的任务（如果这些任务还在执行的话）。

在处理 AJAX 请求的时候，如果我们只希望获取最后那个请求的响应，takeLatest 就会非常有用。


### Sagas 测试示例

查看仓库示例

https://github.com/yelouafi/redux-saga/blob/master/examples/counter/test/sagas.js

https://github.com/yelouafi/redux-saga/blob/master/examples/shopping-cart/test/sagas.js


### 连接 Sagas 至外部输入和输出

我们已经看到了，take Effect 是通过等待 action 被发起到 Store 来解决（resolved）的。也看到了 put Effect 是通过发起一个 action 来解决的，action 被作为参数传给 put Effect。

但 Saga 启动了（不管是初始启动或是稍后动态启动），middleware 会自动将它的 take / put 连接至 store。这2个 Effect 可以被看作是一种 Saga 的输入/输出。

redux-saga 提供了一种方式在 redux middleware 环境外部运行 Saga，并可以连接至自定义的输入输出。

```js
import { runSaga } from 'redux-saga';

function* saga() { ... }

const myIO = {
  subscribe: ..., // 用于解决 take Effects
  dispatch: ...., // 用于解决 put Effects
  getState: ...,  // 用于解决 select Effects
};

runSaga(
  saga(),
  myIO,
);
```

## 技巧

### 节流

你可以通过在监听的 Saga 里调用一个 delay 函数，针对一系列发起的 action 进行节流。举个例子，假设用户在文本框输入文字的时候，UI 触发了一个 INPUT_CHANGED action：

```js
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function* handleInput(input) {
  ...
}

function* watchInput() {
  while(true) {
    const { input } = yield take('INPUT_CHANGED');
    yield fork(handleInput, input);
    // 节流 500ms
    yield call(delay, 500);
  }
}
```

通过延迟 fork，watchInput 将会被阻塞 500ms，发生在此期间内的所有 `INPUT_CHANGED action` 都会被忽略。这保证了 Saga 在每 500ms 内只触发一次 `INPUT_CHANGED` action。

但是上面的代码还有一个小问题。take 一个 action 后，watchInput 将睡眠 500ms，这意味着它会忽略发生在这期间内的所有action。这也许是节流的目的，但是要注意的是 watcher 也将错过那个尾部 action：即最后的那个 action 也许正好发生在这 500ms内。如果你是对文本框的输入操作进行节流，这可能是不可取的，因为，如果最后的输入操作发生在这 500ms 内，你可能会希望响应最后的那个输入，即使节流限制已经过去了。


