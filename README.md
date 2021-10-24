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
// ./router/index.ts
import metaRouter from "./metaRouter";

metaRouter.router.prefix("/v1");

import "../controller/v1/public/MataRouterController";
// or
import("../controller/v1/public/MataRouterController");

export default metaRouter.router;
```

```typescript
// ./routermetaRouter.ts
import Router from "@koa/router";
import MetaRouterClass from "koa-metarouter";

const router = new Router();
const metaRouter : MetaRouterClass = new MetaRouterClass(router);
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

const { All, Redirect, Post, Get, MetaRouter, Controller, ... } = metaRouter;

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
import Router from "@koa/router";
const router = new Router({
  methods: [
    "GET",
    "POST",
    ...
    "PURGE", // add method !!!
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
@Controller({})
export default class DemoController{
  @MetaRouter({ method: "purge" })
  async custom_a () : Promise<any> {}

  @Purge()
  async custom_decorators () : Promise<any> {}
}
```