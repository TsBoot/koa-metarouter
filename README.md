# koa-metarouter

this project is use Typescript ‘reflect-metadata’ defined koa-router

这个项目是用 `typescript` 中的`reflect-metadata` 来实现koa路由定义的插件

# need [reflect-metadata] - 依赖 [reflect-metadata]

`npm i reflect-metadata`

`import "reflect-metadata";`

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

```typescript
// DemoController
export default class DemoController extends BaseController {
  @Post("/public/Demo/requestArgument/:id",
    multer.single("avatar"),
    otherMiddleware
  )
  async requestArgument () : Promise<any> {

    const {
      body,
      file,
      query,
    } = this.ctx.request;
    const { params, header } = this.ctx;

    return {
      body,
      file,
      query,
      params,
      header
    }
  }
```