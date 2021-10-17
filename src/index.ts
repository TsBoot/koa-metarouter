
import { Context, Middleware, Next } from "koa";
import type Router from "@koa/router";
import { LayerOptions } from "@koa/router";
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
type ControllerDecorator = (controllerOptions : { path ?: string }, ...middleware : Array<Middleware>) => ClassDecorator;
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

type MapItem = {
  customPath : UrlPath,
  method : string[],
  middleware : Array<Middleware>,
  options : MethodOptions
};

class MataRouterClass {
  classRouterMap : Map<{[key : string] : unknown }, Array<MapItem>> = new Map();
  static getrouterDirectory (target : any) : string {
    let path;
    if (!target.routerDirectory) {
      path = "/" + target.name;
    } else {
      path = target.routerDirectory + "/" + target.name;
    }
    return path;
  }
  Controller : ControllerDecorator = (controllerOptions, ...middleware) => {
    let { path } = controllerOptions;
    return (target : any) => {
      const arr = this.classRouterMap.get(target);
      if (arr) {
        arr.forEach(item => {
          const { customPath, method, options } = item;
          let registerMiddleware;
          if (middleware.length > 0) {
            registerMiddleware = [ ...middleware, ...item.middleware ];
          } else {
            registerMiddleware = item.middleware;
          }
          const layer = options as LayerOptions;
          if (!path) path = "";
          this.router.register(path + customPath, method, registerMiddleware, layer);
        });
      }
    };
  };
  router : Router;
  static emptyMiddleware : Middleware = async (_ctx : Context, next : Next) : Promise<void> => {
    await next();
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
    // eslint-disable-next-line prefer-const
    let { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    let { method } = options;
    let customPath = options.path;
    return (controller : any, functionName : string | symbol, _desc : any) => {
      const Controller = controller.constructor;
      const item = async (ctx : Context, _next : Next) : Promise<any> => {
        const instance = new Controller(ctx);
        return await instance[ functionName ]();
      };

      middleware.push(item);

      const classPath = MataRouterClass.getrouterDirectory(controller.constructor);

      if (!customPath) {
        customPath = this.functionNameFormat(classPath) + "/" + this.functionNameFormat((functionName as string));
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
      let arr = this.classRouterMap.get(Controller);
      if (!arr) {
        arr = [];
      }

      arr.push({ customPath, method, middleware, options });
      this.classRouterMap.set(Controller, arr);

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
