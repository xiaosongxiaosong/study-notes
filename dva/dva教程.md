# dva教程

[原文地址](https://github.com/dvajs/dva-docs/tree/master/v1/zh-cn/tutorial)

## 目录

<!-- START doctoc -->
<!-- END doctoc -->

## 前言

需要了解的是 dva 是对 redux 的一层浅封装，所以虽然我们不要求一定要了解 redux 才能学会使用 dva ，但是如果你对 redux 有所了解，再使用 dva 一定驾轻就熟，并且会了解很多潜在的知识点。 redux 社区较为成熟，文档也比较健全，可以范访问 [http://redux.js.org](http://redux.js.org) （[中文文档](http://cn.redux.js.org/index.html)）查看更多内容，其中会介绍整个生态系统的相关框架与设计思路，值得一看。

## 结构划分

很多同学在搭建项目的时候，往往会忽略项目结构的划分，实际上合理的项目划分往往能够提供规范的项目搭建思路。在 dva 架构的项目中，我们推荐的目录基本结构为：

```
.
├── /mock/            # 数据 mock 的接口文件
├── /src/             # 项目源码目录
│ ├── /components/    # 项目组件
│ ├── /routes/        # 路由组件（页面维度）
│ ├── /models/        # 数据模型
│ ├── /services/      # 数据接口
│ ├── /utils/         # 工具函数
│ ├── route.js        # 路由配置
│ ├── index.js        # 入口文件
│ ├── index.less
│ └── index.html
├── package.json      # 项目信息
└── porxy.config.js   # 数据 mock 配置
```
大家可以发现， dva 将项目中所有可能出现的功能性都映射到了对应的目录中，并且对整个项目的功能从目录上也有了清晰的体现，所以我们建议你的项目也按照这个目录来组织文件，如果你用的是 dva-cli 工具生成的 dva 脚手架模板，那么会帮你按照这样的目录生成好。


## 设计Model

在了解项目基本的结构划分以后，我们将要开始设计 model ，在设计 model 之前，我们来回顾一下我们需要做的项目是什么样的：

![](https://cloud.githubusercontent.com/assets/1179603/17655205/dfde2f4e-62dd-11e6-9c91-657ee4c17b91.png)

### Model 的抽象

从设计稿中我们可以看出，这部分功能基本是围绕 **以用户数据为基础** 的操作，其中包含：

1. 用户信息的展示（查询）

2. 用户信息的操作（增加，删除，修改）

有经验的同学不难发现，无论多复杂的项目也基本是围绕者数据的展示和操作，复杂一点的无非是组合了很多数据，有关联关系，只要分解开来， model 的结构层次依旧会很清晰，便于维护。

所以抽离 model 的原则就是抽离数据模型，很明显在这里，我们首先会抽离一个 users 的 model 。

### Model 的设计

在抽离了 users 以后，我们来看下如何设计，通常有以下两种方式：

1. 按照数据维度

2. 按照业务维度

#### 数据维度

按照数据维度的 model 设计原则就是抽离数据本身以及相关操作的方法，比如在本例的 users ：

```js
// models/users.js

export default {
  namespace: 'users',
  state: {
    list: [],
    total: null,
  },
  effects: {
    *query(){},
    *create(){},
    // 因为 delete 是关键字
    *'delete'(){},
    *update(){},
  },
  reducers: {
    querySuccess(){},
    createSuccess(){},
    deleteSuccess(){},
    updateSuccess(){},
  },
}
```

如果你写过后台代码，你会发现这跟我们常常写的后台接口是很类似的，只关心数据本身，至于在使用 users model 的组件中所遇到的状态管理等信息跟 model 无关，而是作为组件自身的 state 维护。

这种设计方法使得 model 很纯粹，在设计通用数据信息 model 的时候比较适用，比如当前用户登陆信息等数据 model 。但是在数据跟业务状态交互比较紧密，数据不是那么独立的时候会有些不那么方便，因为数据跟业务状态紧密相连的场景下，将状态放到 model 里面维护会使得我们的代码更加清晰可控，而这种方式就是下面将要介绍的 **业务维度** 方式的设计。

#### 业务维度

按照业务维度的 model 设计，则是将数据以及使用强关联数据的组件中的状态统一抽象成 model 的方法，在本例中， users model 设计如下：

```js
// models/users.js

export default {
  namespace: 'users',

  state: {
    list: [],
    total: null,
    loading: false, // 控制加载状态
    current: null,  // 当前分页信息
    currentItem: {},  // 当前操作的用户对象
    modalVisible: false,  // 弹出窗的显示状态
    modalType: 'create',  // 弹出窗的类型（添加用户，编辑用户）
  },
  effects: {
    *query(){},
    *create(){},
    // 因为 delete 是关键字
    *'delete'(){},
    *update(){},
  },
  reducers: {
    showLoading(){},
    showModal(){},
    hideModal(){},
    querySuccess(){},
    createSuccess(){},
    deleteSuccess(){},
    updateSuccess(){},
  },
}
```

需要注意的是，有可能初次接触到 name(){} 的语法有些陌生，这种写法可以看成是：

```js
name: function(){}
```

的简写，另外， `*name(){}` 前面的 `*` 号，表示这个方法是一个 **Generator 函数** ，具体可以参考 [Generator 函数的含义和用法](http://www.ruanyifeng.com/blog/2015/04/generator.html) 。

回到代码，可以看到，我们将业务状态也一并放到 model 当中去了，这样所有的状态变化都会在 model 中控制，会更容易跟踪和操作。

根据样例项目的情况，由于数据跟业务状态关联性强，所以我们采用 业务维度 的方式来设计我们的 model ，在设计好了 users model 的基本形态以后，接下来在写代码的过程中我们会不断完善。


## 组件设计方法

在初步确定了 model 的设计方法以后，让我们来看看如何设计 dva 的 React 组件。

### 组件设计

React 应用是由一个个独立的 Component 组成的，我们在拆分 Component 的过程中要尽量让每个 Component 专注做自己的事。

一般来说，我们的组件有两种设计：

1. Container Component

2. Presentational Component

### Container Component

Container Component 一般指的是具有 `监听数据行为` 的组件，一般来说他们的职责是 `绑定关联的 model 数据` ，以数据容器的角色包含其它子组件，通常在项目中表现出来的类型为： Layouts、Router Components 以及普通的 Containers 组件。

通常的书写形式为：

```js
import React, { Component, PropTypes } from 'react';

// dva 的 connect 方法可以进组件和数据关联在一起
import { connect } from 'dva';

// 组件本身
const MyComponent = (props) => {};
MyComponect.propTypes = {};

// 监听属性，建立组件和数据的映射关系
function mapStateToProps(state){
  return { ...state.data };
}

// 关联 model
export default connect(mapStateToProps)(MyComponect);
```

### Presentational Component

Presentational Component 的名称已经说明了它的职责，展示形组件，一般也称作： Dumb Component ，它不会关联订阅 model 上的数据，而所需数据的传递则是通过 props 传递到组件内部。

通常的书写的形式：

```js
import React, { Component, PropTypes } from 'react';

// 组件本身
// 所需要的数据通过 Container Component 通过 props 传递下来
const MyComponent = (props)=>{}
MyComponent.propTypes = {};

// 并不会监听数据
export default MyComponent;
```

### 对比

对组件分类，主要有两个好处：

1. 让项目的数据处理更加集中

2. 让组件高内聚低耦合，更加聚焦

试想如果每个组件都去订阅数据 model ，那么一方面组件本身跟 model 耦合太多，另一方面代码过于零散，到处都在操作数据，会带来后期维护的烦恼。

除了写法上订阅数据的区别以外，在设计思路上两个组件也有很大的不同。 Presentational Component 是独立的纯粹的，这方面很好的例子，大家可以参考 [ant.design UI组件的React实现](https://ant.design/docs/react/introduce-cn) ，每个组件跟业务数据并没有耦合关系，只是完成自己独立的任务，需要的数据通过 props 传递进来，需要操作的行为通过接口暴露出去。而 Conatainer Component 更像是状态管理器，它表现为一个容器，订阅子组件需要的数据，组织子组件的交互逻辑和展示。

## 组件设计实践

建议对照完整代码一起看 [dva-example-user-dashboard](https://github.com/dvajs/dva-example-user-dashboard) 。

按照之前快速上手的内容，我们可以使用 dva-cli 工具快速生成规范的目录，在命令行输入：

```shell
$ mkdir myApp && cd myApp
$ dva init
```

现在，规范的样例模板我们已经有了，接下来我们一步一步添加自己的东西，看看如何完成我们的组件设计。

### 设置路由

在准备好了 dva 的基本框架以后，需要为我们的项目配置一下路由，这里首先设置 User Router Container 的访问路径，并且在 /routes/ 下创建我们的组件文件 User.jsx 。

```js
// src/router.js
import React, { PropTypes } from 'react';
import { Router, Route } from 'dva/router';
import Users from './routes/User';

export default function ({ history }){
  return (
    <Router history={history}>
      <Route path="/users" component={User} />
    </Router>
  );
};
```

```jsx
// src/routes/Users.jsx
import React, { PropTypes } from 'react';

function Users(){
  return (
    <div>User Router Componect</div>
  );
}

Users.propTypes = {

};

export default Users;
```

其他路由可以自行添加，关于路由更多信息，可以查看 react-router 获取更多内容。

### Users Container Component 的设计

基础工作都准备好了，接下来就开始设计 Users Container Component 。在本项目中 Users Container 的表现为 Route Components （这也是 dva 推荐的结构划分），可以理解页面维度的容器，所以我们在 /routes/ 下加入 Users.jsx 。

我们采用 自顶向下 的设计方法，修改 ./src/routes/Users.jsx 如下：


