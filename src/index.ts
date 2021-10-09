
import { Context, Middleware, Next } from "koa";
import type Router from "@koa/router";
let metaRouter : Router;

type UrlPath = string | RegExp;

type RouterMethodDecorator = (name : string | null, method ?: UrlPath, path ?: UrlPath | Middleware, ...middleware : Array<Middleware>) => MethodDecorator;
type SimpleRouterMethodDecorator = (name : string, path ?: UrlPath | Middleware, ...middleware : Array<Middleware>) => MethodDecorator;
type SimpleRedirectDecorator = (urlPath : string, redirectPath : string, statusCode ?: number | undefined) => MethodDecorator;

const emptyMiddleware = (_ctx : Context, next : Next) : void => {
  next();
};

const MetaRouter : RouterMethodDecorator = (name, methodOrpath, pathOrMiddleware = emptyMiddleware, ...middleware) => {
  let _name : string | null = name;
  let _method = methodOrpath;
  let _path = pathOrMiddleware;
  let _middleware = middleware;
  // 如果 path 是正则或字符串,说明有name参数
  if (name === null || typeof pathOrMiddleware === "string" || pathOrMiddleware instanceof RegExp) {
    _path = pathOrMiddleware as string;
  } else {
    _name = name;
    _method = name;
    if (methodOrpath) {
      _path = methodOrpath;
    } else {
      throw new Error("Path parameters must be specified");
    }
    _middleware = [ pathOrMiddleware as Middleware, ...middleware ];
  }
  return (controller : any, functionName : any, _desc : any) => {
    const item = async (ctx : Context) : Promise<any> => {
      const Controller = controller.constructor;
      const obj = new Controller(ctx);
      return await obj[ functionName ]();
    };
    _middleware.push(item);
    if (!_name && _name === null) {
      metaRouter.register(_path as UrlPath, [ _method as string ], _middleware);
    } else {
      metaRouter.register(_path as UrlPath, [ _method as string ], _middleware, {
        name: _name,
      });
    }
  };
};

const Redirect : SimpleRedirectDecorator = (urlPath, redirectPath, statusCode) => {
  return (_controller : any, _functionName : any, _desc : any) => {
    metaRouter.redirect(urlPath, redirectPath, statusCode);
  };
};

function getDecorator (method : string, nameOrPath : string, pathOrMiddleware : Middleware | UrlPath | undefined, middleware : Array<Middleware>) : MethodDecorator {
  let _name : string | null = nameOrPath;
  let _path = pathOrMiddleware;
  let _middleware = middleware;
  if (typeof pathOrMiddleware === "string" || pathOrMiddleware instanceof RegExp) {
    _path = pathOrMiddleware as string;
  } else {
    _name = null;
    _path = nameOrPath;
    _middleware = [ pathOrMiddleware as Middleware, ...middleware ];
  }
  return MetaRouter(_name, method, _path, ..._middleware);
}

/**
 *  The following code is sweet sugar
 *  下面是一些为了简化使用而定义的方法
 */
const All : SimpleRouterMethodDecorator = (nameOrPath, pathOrMiddleware = emptyMiddleware, ...middleware) => {
  return getDecorator("All", nameOrPath, pathOrMiddleware, middleware);
};

const Get : SimpleRouterMethodDecorator = (nameOrPath, pathOrMiddleware = emptyMiddleware, ...middleware) => {
  return getDecorator("Get", nameOrPath, pathOrMiddleware, middleware);
};
const Head : SimpleRouterMethodDecorator = (nameOrPath, pathOrMiddleware = emptyMiddleware, ...middleware) => {
  return getDecorator("Head", nameOrPath, pathOrMiddleware, middleware);
};
const Post : SimpleRouterMethodDecorator = (nameOrPath, pathOrMiddleware = emptyMiddleware, ...middleware) => {
  return getDecorator("Post", nameOrPath, pathOrMiddleware, middleware);
};
const Put : SimpleRouterMethodDecorator = (nameOrPath, pathOrMiddleware = emptyMiddleware, ...middleware) => {
  return getDecorator("Put", nameOrPath, pathOrMiddleware, middleware);
};
const Delete : SimpleRouterMethodDecorator = (nameOrPath, pathOrMiddleware = emptyMiddleware, ...middleware) => {
  return getDecorator("Delete", nameOrPath, pathOrMiddleware, middleware);
};
const Del = Delete;
const Patch : SimpleRouterMethodDecorator = (nameOrPath, pathOrMiddleware = emptyMiddleware, ...middleware) => {
  return getDecorator("Patch", nameOrPath, pathOrMiddleware, middleware);
};
const Link : SimpleRouterMethodDecorator = (nameOrPath, pathOrMiddleware = emptyMiddleware, ...middleware) => {
  return getDecorator("Link", nameOrPath, pathOrMiddleware, middleware);
};
const Unlink : SimpleRouterMethodDecorator = (nameOrPath, pathOrMiddleware = emptyMiddleware, ...middleware) => {
  return getDecorator("Unlink", nameOrPath, pathOrMiddleware, middleware);
};
const Options : SimpleRouterMethodDecorator = (nameOrPath, pathOrMiddleware = emptyMiddleware, ...middleware) => {
  return getDecorator("Options", nameOrPath, pathOrMiddleware, middleware);
};
export {
  UrlPath,
  SimpleRouterMethodDecorator,
  MetaRouter,

  Redirect,

  All,
  Get,
  Head,
  Post,
  Put,
  Delete,
  Del,
  Patch,
  Link,
  Unlink,
  Options,

  getDecorator,
  emptyMiddleware,
};

function setRouter (router : Router) : Router {
  metaRouter = router;

  return metaRouter;
}
export default setRouter;
