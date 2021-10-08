# koa-metarouter

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
// router.ts
import Router from "@koa/router";
import MetaRouter from "koa-metarouter";

const router = new Router();
router.prefix("/v1");

const metaRouter = MetaRouter(router);

import "../controller/v1/public/DemoController";
// or
import("../controller/v1/public/DemoController");

export default metaRouter;
```
  You can use the following decorators in Controller

  你可以在控制器中使用以下装饰器

|          |            |            |           |       |         |
|    ----  |    ----    |     ----   |     ----  |  ---- |   ----  |
|   Post   |     Get    |    Put     |  Delete   |  Del  |  Patch  |
|   Link   |    Unlink  |    Head    |  Options  |  All  |         |


  If you want to respond to any methods, you can use `All`

  如果你希望响应任意方法,可以使用 `All`

```typescript
// DemoController
export default class DemoController extends BaseController {

  @Get("/public/Demo/requestArgument/:id",
    ...otherMiddleware
  )
  async requestArgument () : Promise<any> {
    const { params } = this.ctx;
    return {
      params.id
    }
  }

  // if you want set router name
  // 如果你想定义路由的名称,你可以这样做
  @All("routerName","/url",
    ...otherMiddleware
  )
  async requestArgument () : Promise<any> {}
}
```

## Redirect 重定向

```typescript
export default class DemoController extends BaseController {
  // default statusCode is 301 默认的状态码是301
  @Redirect("/url_a/:id","/url_c/:id")
  async url_a () : Promise<any> {}

  // if you want use code 302, 如果你希望使用302临时重定向
  @Redirect("/url_b/:id","/url_b/:id",302)
  async url_b () : Promise<any> {}

  @Get("/url_c/:id")
  async url_c () : Promise<any> {}

}
```

## custom usage 自定义用例
 MetaRouter himself, 使用MetaRouter本体

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
// router.ts
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
    "PURGE", // add method 这里添加自定义的方法
  ],
});

// DemoController
export default class DemoController extends BaseController {
  @MetaRouter("purge", "/custom_a")
  async custom_a () : Promise<any> {}

  @MetaRouter("purge", "/custom_a"
    ...otherMiddleware
  )
  async custom_a () : Promise<any> {}

  // if you want set router name
  // 如果你想定义路由的名称,你可以这样做
  @MetaRouter("routerName", "purge", "/custom_b")
  async custom_b () : Promise<any> {}

  // or not set name, must be equal null
  @MetaRouter(null, "purge", "/custom_c")
  async custom_c () : Promise<any> {}
}
```