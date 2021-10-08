
import type { Context, Middleware } from "koa";

let metaRouter : any;

type AllowMethod = "post" | "get" | "put" | "delete" | "del" | "patch" | "link" | "unlink" | "head" | "options" | "all";

type UrlPath = string | RegExp | (string | RegExp)[];

type RouterMethodDecorator = (method : AllowMethod, urlPath : UrlPath, ...middleware : Array<Middleware>) => MethodDecorator;
type SimpleRouterMethodDecorator = (urlPath : UrlPath, ...middleware : Array<Middleware>) => MethodDecorator;

const MetaRouter : RouterMethodDecorator = (method, urlPath, ...middleware) => (controller : any, functionName, _desc) => {
  metaRouter[ method ](urlPath, ...middleware, async (ctx : Context) : Promise<any> => {
    const Controller = controller.constructor;
    const obj = new Controller(ctx);
    return await obj[ functionName ]();
  });
};

const Post : SimpleRouterMethodDecorator = (urlPath, ...middleware) => {
  return MetaRouter("post", urlPath, ...middleware);
};
const Get : SimpleRouterMethodDecorator = (urlPath, ...middleware) => {
  return MetaRouter("get", urlPath, ...middleware);
};
const Put : SimpleRouterMethodDecorator = (urlPath, ...middleware) => {
  return MetaRouter("put", urlPath, ...middleware);
};
const Delete : SimpleRouterMethodDecorator = (urlPath, ...middleware) => {
  return MetaRouter("delete", urlPath, ...middleware);
};
const Del : SimpleRouterMethodDecorator = (urlPath, ...middleware) => {
  return MetaRouter("del", urlPath, ...middleware);
};
const Patch : SimpleRouterMethodDecorator = (urlPath, ...middleware) => {
  return MetaRouter("patch", urlPath, ...middleware);
};
const Link : SimpleRouterMethodDecorator = (urlPath, ...middleware) => {
  return MetaRouter("link", urlPath, ...middleware);
};
const Unlink : SimpleRouterMethodDecorator = (urlPath, ...middleware) => {
  return MetaRouter("unlink", urlPath, ...middleware);
};
const Head : SimpleRouterMethodDecorator = (urlPath, ...middleware) => {
  return MetaRouter("head", urlPath, ...middleware);
};
const Options : SimpleRouterMethodDecorator = (urlPath, ...middleware) => {
  return MetaRouter("options", urlPath, ...middleware);
};
const All : SimpleRouterMethodDecorator = (urlPath, ...middleware) => {
  return MetaRouter("all", urlPath, ...middleware);
};
export {
  AllowMethod,
  UrlPath,
  RouterMethodDecorator,
  MetaRouter,

  Post,
  Get,
  Put,
  Delete,
  Del,
  Patch,
  Link,
  Unlink,
  Head,
  Options,
  All,
};

function setRouter<T> (router : T) : T {
  metaRouter = router;
  return metaRouter;
}
export default setRouter;
