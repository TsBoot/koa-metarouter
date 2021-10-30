# koa-metarouter

> 这个项目是使用Typescript装饰器简化路由定义流程的路由插件

- 💡 简化路由定义
- 🔑 无侵入
- ⚙️ 可以创建多路由实例
- 🔌 可扩展
- 📦 轻量的

[English Document](https://github.com/TsBoot/koa-metarouter/blob/main/README.md)

# 依赖 TS新特性,需要 ‘reflect-metadata’ 插件

[https://www.npmjs.com/package/reflect-metadata](https://www.npmjs.com/package/reflect-metadata "https://www.npmjs.com/package/reflect-metadata")

`npm i reflect-metadata`

```typescript
// 入口文件
import "reflect-metadata";
```

```json
// 添加ts配置
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

# 使用方法
## 基础用法

`npm i koa-metarouter`

```typescript
// ./router/metaRouter.ts
import Router from "@koa/router";
import MetaRouterClass from "koa-metarouter";

const router = new Router();
const metaRouter : MetaRouterClass = new MetaRouterClass(router);

// ./router/index.ts
import metaRouter from "./metaRouter";
import "../controller/MetaRouterController";
// or
import("../controller/MetaRouterController");
const { Get } = metaRouter;
export default metaRouter;
export {
  Get
};

// DemoController
import { Get } from "./metaRouter";

@Controller()
export default class MethodTestController {
  @Get() // url: /MethodTest/index
  async index (): Promise<any> {}
}

// ./App.ts
import Koa from "koa";
import router from "./router";
const koa = new Koa();
koa.use(router.routes());
koa.use(router.allowedMethods());
```




### 你可以使用大小写转换工具为路由名称统一格式化

```cmd
  // https://www.npmjs.com/package/change-case

  //https://lodash.com/docs/4.17.15#lowerCase // 推荐

  npm i lodash
  // or
  npm i change-case
```



```typescript
// 这个方法是默认的,你可以覆盖该函数
metaRouter.classNameFormat = (className : string) : string => {
  const reg = /controller$/i;
    className = className.replace(reg, "");
    return className;
};

// 这个方法是默认的,你可以覆盖该函数
metaRouter.functionNameFormat = (functionName : string) : string => {
  return functionName;
};
export default metaRouter;

```
  你可以在控制器中使用以下装饰器

| 装饰器名称 ||||||
|   :----:   |   :----:   |    :----:  |    :----: | :----:  |  :----: |
|    Post    |     Get    |    Put     |  Delete   |   Del   |  Patch  |
|    Link    |    Unlink  |    Head    |  Options  |   All   |         |


  如果你希望响应任意方法,可以使用 `All`

```typescript
// DemoController
import { Get, All } from "./metaRouter";

// ✨ Controller是必须使用的
@Controller({path:"/public"}, ...middleware) 
export default class DemoController {

  @Get()
  async test () : Promise<any> {}

  // ✨ 如果你想定义路由的名称,你可以这样做
  @All({name :"requestArgument"})
  async requestArgument () : Promise<any> {}

  // ✨ 如果你想添加中间件
  @All(middleware1,middleware2,...)
  async middleware () : Promise<any> {}
  // 或者
  @All({path:"/middleware"},middleware1,middleware2,...)
  async middleware () : Promise<any> {}
 
}

```

```typescript
interface MethodOptions {
  name ?: string,

  path ?: UrlPath | null | undefined
  method ?: string | Array<string>

  sensitive ?: boolean | undefined;
  strict ?: boolean | undefined;
  end ?: boolean | undefined;
  prefix ?: string | undefined;
  ignoreCaptures ?: boolean | undefined;
}
```

## 重定向(仅支持工程内部)

```typescript
@Controller({})
export default class DemoController {
  // ✨ 默认是301跳转
  @Redirect("/url_c")
  async url_a () : Promise<any> {}

  // ✨ 你也可以自己定义 302
  @Redirect("/url_c",302)
  @Redirect("/url_b","/url_c",302) // 或
  async url_b () : Promise<any> {}

  @Get()
  async url_c () : Promise<any> {}
}
```
> ✨ 如果你想查看更多使用方法请查看测试用例


## 自定义装饰器

使用MetaRouter本体

如果你想实现自定义的`http`请求方法,你可以这样使用

```typescript
// ./router/metaRouter.ts
import Router from "@koa/router";
import MetaRouterClass, { RouterMethodDecorator } from "koa-metarouter";
const router = new Router({
  methods: [
    "HEAD",
    "OPTIONS",
    "GET",
    "PUT",
    "PATCH",
    "POST",
    "DELETE",
    "PURGE", // add method 这里添加自定义的方法
  ],
});

const metaRouter: MetaRouterClass = new MetaRouterClass(router);

const { All, Redirect, Post, Get, Head, Patch, Del, Delete, MetaRouter, Controller, Options, Link, Unlink, Put } = metaRouter;

// custom Method Name
const Purge: RouterMethodDecorator = (optionsOrMiddleware, ..._middleware) => {
  const { options, middleware } = MetaRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
  if (Array.isArray(options.method)) {
    options.method = [ ...options.method, "purge" ];
  } else if (typeof options.method === "string") {
    options.method = [ options.method, "purge" ];
  }
  return metaRouter.MetaRouter(options, ...middleware);
};

export default metaRouter;
export {
  All,
  Redirect,
  Get,
  Post,
  Del,
  Delete,
  Options,
  Link,
  Unlink,
  Put,
  MetaRouter,
  Controller,
  Head,
  Patch,
  Purge,
};

```

# 更多信息请查看

[https://github.com/TsBoot/koa-metarouter/blob/main/__test__/TestController.ts](https://github.com/TsBoot/koa-metarouter/blob/main/__test__/TestController.ts)