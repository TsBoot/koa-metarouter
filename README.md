# koa-metarouter

> 还需要添加测试用例

this project is use Typescript ‘reflect-metadata’ defined koa-router

这个项目是用 `typescript` 中的`reflect-metadata` 来实现koa路由定义的插件

# need \[reflect-metadata] - 依赖 \[reflect-metadata]

[https://www.npmjs.com/package/reflect-metadata](https://www.npmjs.com/package/reflect-metadata "https://www.npmjs.com/package/reflect-metadata")

`npm i reflect-metadata`

```typescript
import "reflect-metadata";
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

# usage - 用例
## base usage - 基础用例

`npm i koa-metarouter`

```typescript

import metaRouter from "./metaRouter";

metaRouter.router.prefix("/v1");

import "../controller/v1/public/MataRouterController";
// or
import("../controller/v1/public/MataRouterController");

export default metaRouter.router;
```

```typescript
// metaRouter.ts
import Router from "@koa/router";
import MetaRouterClass from "koa-metarouter";
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

const metaRouter : MetaRouterClass = new MetaRouterClass(router);

// you can use "npm i change-case" format default path
// https://www.npmjs.com/package/change-case

// default 默认
metaRouter.classNameFormat = (className : string) : string => {
  const reg = /controller$/i;
    className = className.replace(reg, "");
    return className;
};

// default 默认
metaRouter.functionNameFormat = (functionName : string) : string => {
  return functionName;
};
export default metaRouter;

```


  You can use the following decorators in Controller

  你可以在控制器中使用以下装饰器

| decorators name - 装饰器名称 ||||||
|   :----:   |   :----:   |    :----:  |    :----: | :----:  |  :----: |
|    Post    |     Get    |    Put     |  Delete   |   Del   |  Patch  |
|    Link    |    Unlink  |    Head    |  Options  |   All   |         |


  If you want to respond to any methods, you can use `All`

  如果你希望响应任意方法,可以使用 `All`

```typescript
// DemoController
export default class DemoController {


  // prefix + ControllerName + FunctionName 
  // Url: /v1/Demo/test
  @Get() /
  async test () : Promise<any> {}


  // if you want set router name
  // 如果你想定义路由的名称,你可以这样做
  @All({path:"/requestArgument"}) // Url: /v1/requestArgument
  async requestArgument () : Promise<any> {}

  // if you want add middleware
  @All(middleware1,middleware2,...)
  async middleware () : Promise<any> {}
  // or
  @All({path:"/middleware"},middleware1,middleware2,...)
  async middleware () : Promise<any> {}

  // if you want set router name
  @All({name:"middleware"})
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

## Redirect 重定向

```typescript
export default class DemoController {
  // default statusCode is 301 默认的状态码是301
  @Redirect("/url_a","/url_c")
  async url_a () : Promise<any> {}

  // if you want use code 302, 如果你希望使用302临时重定向
  @Redirect("/url_b","/url_c",302)
  async url_b () : Promise<any> {}

  @Get()
  async url_c () : Promise<any> {}

}
```

## custom usage 自定义用例
 MetaRouter himself, 使用MetaRouter本体

>https://github.com/jshttp/methods

(HTML1.1)rfc7231:
>https://datatracker.ietf.org/doc/html/rfc7231#section-4

```
 +---------+-------------------------------------------------+-------+
 | Method  | Description                                     | Sec.  |
 +---------+-------------------------------------------------+-------+
 | GET     | Transfer a current representation of the target | 4.3.1 |
 |         | resource.                                       |       |
 | HEAD    | Same as GET, but only transfer the status line  | 4.3.2 |
 |         | and header section.                             |       |
 | POST    | Perform resource-specific processing on the     | 4.3.3 |
 |         | request payload.                                |       |
 | PUT     | Replace all current representations of the      | 4.3.4 |
 |         | target resource with the request payload.       |       |
 | DELETE  | Remove all current representations of the       | 4.3.5 |
 |         | target resource.                                |       |
 | CONNECT | Establish a tunnel to the server identified by  | 4.3.6 |
 |         | the target resource.                            |       |
 | OPTIONS | Describe the communication options for the      | 4.3.7 |
 |         | target resource.                                |       |
 | TRACE   | Perform a message loop-back test along the path | 4.3.8 |
 |         | to the target resource.                         |       |
 +---------+-------------------------------------------------+-------+
```
if you want realize custom http Methods, you can use like this

如果你想实现自定义的`http`请求方法,你可以这样使用

```typescript
import Router from "@koa/router";
const router = new Router({
  methods: [
    "HEAD",
    "OPTIONS",
    "GET",
    "PUT",
    "PATCH",
    "POST",
    "DELETE",
    "PURGE", // add method 这里添加自定义的方法 !!!
  ],
});
// -----------------------------------
import MataRouterClass, { RouterMethodDecorator } from "koa-metarouter";
const Purge : RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
  const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
  options.method = "purge";
  return MetaRouter(options, ...middleware);
};
// -----------------------------------

// DemoController
export default class DemoController{
  @MetaRouter({ method: "purge" })
  async custom_a () : Promise<any> {}

  @Purge()
  async custom_decorators () : Promise<any> {}
}
```

## Custom decorators - 自定义装饰器

```typescript
import { getDecorator, SimpleRouterMethodDecorator,emptyMiddleware } from "koa-metarouter"

const Purge : SimpleRouterMethodDecorator = (nameOrPath, pathOrMiddleware = emptyMiddleware, ...middleware) => {
  return getDecorator("Purge", nameOrPath, pathOrMiddleware, middleware);
};
```