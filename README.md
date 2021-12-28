# koa-metarouter

> this project is use Typescript ‘reflect-metadata’ defined koa-router

- 💡 Simplified route definition
- 🔑 Non-invasive
- ⚙️ Multiple router instance
- 🔌 Extensible
- 📦 Extremely light

[中文文档](https://github.com/TsBoot/koa-metarouter/blob/main/README.zh.md)

# need \[reflect-metadata]

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

# Example
## Basic example

`npm i koa-metarouter`

```typescript
// ./router/metaRouter.ts
import Router from "@koa/router";
import MetaRouterClass from "koa-metarouter";

const router = new Router();
const metaRouter: MetaRouterClass = new MetaRouterClass(router);
export default metaRouter
const { Controller,Get } = metaRouter
export {
    Controller,
    Get,
}

// ./router/index.ts
import metaRouter from "./metaRouter";
import "../controller/DemoController";
// or import("../controller/DemoController");


// DemoController
import { Controller, Get } from "./metaRouter";

@Controller()
export default class DemoController {
  @Get() // url: /Demo/index
  async index (): Promise<any> {}
}

// ./App.ts
import Koa from "koa";
import router from "./router";
const koa = new Koa();
koa.use(router.routes());
koa.listen(3000)
```

### you can use change-case format default part
```cmd
 // https://www.npmjs.com/package/change-case

 // https://lodash.com/docs/4.17.15#lowerCase // recommend

  npm i lodash
  // or
  npm i change-case
```

```typescript
// ✨ this is default, you can cover it 
metaRouter.classNameFormat = (className : string) : string => {
  const reg = /controller$/i;
    className = className.replace(reg, "");
    return className;
};

// ✨ this is default, you can cover it 
metaRouter.functionNameFormat = (functionName : string) : string => {
  return functionName;
};
export default metaRouter;

```

  You can use the following decorators in Controller


| decorators ||||||
|   :----:   |   :----:   |    :----:  |    :----: | :----:  |  :----: |
|    Post    |     Get    |    Put     |  Delete   |   Del   |  Patch  |
|    Link    |    Unlink  |    Head    |  Options  |   All   |         |


  If you want to respond to any methods, you can use `All`

```typescript
// DemoController
import { Get, All } from "./metaRouter";
import { Context, Next } from "koa";

// ✨ Controller is necessary
@Controller({path:"/public"}, ...middleware) 
export default class DemoController {
  @Get()
  async test () : Promise<any> {}

  // ✨ if you want defined router name
  @All({name :"requestArgument"})
  async requestArgument () : Promise<any> {}

  // ✨ if you want add middleware
  @All(middleware1,middleware2,...)
  async middleware () : Promise<any> {}
  // or
  @All({path:"/middleware"},middleware1,middleware2,...)
  async middleware () : Promise<any> {}

  // static method 
  @All()
  static async staticTest (ctx:Context,next:Next) : Promise<any> {}
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

## Redirect

```typescript
@Controller({})
export default class DemoController {
  // ✨ default statusCode is 301
  @Redirect("/url_c")
  async url_a () : Promise<any> {}

  // ✨ if you want use code 302
  @Redirect("/url_b","/url_c",302)
  async url_b () : Promise<any> {}

  @Get()
  async url_c () : Promise<any> {}


}
```
>   ✨ more example please look test file

## custom usage
  use MetaRouter him self

  if you want realize custom http Methods, you can use like this

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

# more detial please see

[https://github.com/TsBoot/koa-metarouter/blob/main/__test__/TestController.ts](https://github.com/TsBoot/koa-metarouter/blob/main/__test__/TestController.ts)