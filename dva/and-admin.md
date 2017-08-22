# ant-admin

[原文地址](https://github.com/zuiidea/antd-admin)

## 目录

<!-- START doctoc -->
<!-- END doctoc -->

## 登录页是如何从根路由的布局分离出来

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

