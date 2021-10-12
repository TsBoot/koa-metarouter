
import { Context, Middleware, Next } from "koa";
import type Router from "@koa/router";
import type { LayerOptions } from "@koa/router";
import methods from "methods";

type UrlPath = string | RegExp;

// LayerOptions
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

export type RouterMethodDecorator = (
  optionsOrMiddleware ?: MethodOptions | Middleware,
  ...middleware : Array<Middleware>
) => MethodDecorator;

type RedirectDecorator = (
  urlPath : string,
  redirectPath : string,
  statusCode ?: number | undefined
) => MethodDecorator;

type ArgumentsFormat = (
  optionsOrMiddleware ?: MethodOptions | Middleware,
  ...middleware : Array<Middleware>
) => {
  options : MethodOptions,
  middleware : Array<Middleware>
};

class MataRouterClass {

  router : Router;
  static emptyMiddleware : Middleware = (_ctx : Context, next : Next) : void => {
    next();
  };

  constructor (router : Router) {
    this.router = router;
  }

  static argumentsFormat : ArgumentsFormat = (optionsOrMiddleware, ...middleware) => {
    let options : MethodOptions = {};
    if (typeof optionsOrMiddleware === "function") {
      options.path = undefined;
      options.method = undefined;
      middleware.unshift(optionsOrMiddleware);
    } else if (typeof optionsOrMiddleware === "object") {
      options = optionsOrMiddleware;
    }
    return {
      options,
      middleware,
    };
  };
  classNameFormat (className : string) : string {
    const reg = /controller$/i;
    className = className.replace(reg, "");
    return className;
  }
  functionNameFormat (functionName : string) : string {
    return functionName;
  }
  MetaRouter : RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    let { path, method } = options;
    return (controller : any, functionName : string | symbol, _desc : any) => {
      const className = controller.constructor.name;
      const item = async (ctx : Context, _next : Next) : Promise<any> => {
        const Controller = controller.constructor;
        const instance = new Controller(ctx);
        return await instance[ functionName ]();
      };

      middleware.push(item);

      if (!path) {
        path = "/" + this.classNameFormat(className) + "/" + this.functionNameFormat((functionName as string));
      }

      if (!method) {
        method = "all";
      }
      if (typeof method === "string") {
        if (method.toLowerCase() === "all") {
          method = methods;
        } else {
          method = [ method ];
        }
      }

      this.router.register(path, method, middleware, options as LayerOptions);

    };
  };

  Redirect : RedirectDecorator = (urlPath, redirectPath, statusCode) => {
    return () : void => {
      this.router.redirect(urlPath, redirectPath, statusCode);
    };
  };

  All : RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "all";
    return this.MetaRouter(options, ...middleware);
  };

  Get : RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "get";
    return this.MetaRouter(options, ...middleware);
  };

  Head : RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "head";
    return this.MetaRouter(options, ...middleware);
  };

  Post : RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "post";
    return this.MetaRouter(options, ...middleware);
  };

  Put : RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "put";
    return this.MetaRouter(options, ...middleware);
  };

  Delete : RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "delete";
    return this.MetaRouter(options, ...middleware);
  };
  Del = this.Delete;

  Patch : RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "patch";
    return this.MetaRouter(options, ...middleware);
  };

  Link : RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "link";
    return this.MetaRouter(options, ...middleware);
  };

  Unlink : RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "unlink";
    return this.MetaRouter(options, ...middleware);
  };

  Options : RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "options";
    return this.MetaRouter(options, ...middleware);
  };
}
export default MataRouterClass;
