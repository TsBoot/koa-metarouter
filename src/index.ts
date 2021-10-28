
import { Context, Middleware, Next } from "koa";
import type Router from "@koa/router";
import { LayerOptions } from "@koa/router";
import methods from "methods";

type UrlPath = string | RegExp;

// LayerOptions
interface MethodOptions {
  name?: string,

  path?: UrlPath | null | undefined
  className?: string | undefined
  methodName?: string | undefined
  method?: string | Array<string>

  sensitive?: boolean | undefined;
  strict?: boolean | undefined;
  end?: boolean | undefined;
  prefix?: string | undefined;
  ignoreCaptures?: boolean | undefined;
}

/**
 * 方法装饰器
 * @param optionsOrMiddleware 选项或中间件
 * @param middlewares 中间件数组
 * @returns
 */
export type RouterMethodDecorator = (
  optionsOrMiddleware?: MethodOptions | Middleware,
  ...middleware: Array<Middleware>
)=> MethodDecorator;

type ControllerDecorator = (controllerOptions?: { path?: string } | Middleware, ...middleware: Array<Middleware>)=> ClassDecorator;

type RedirectOptions = {
  from?: string,
  to: string,
  methodName?: string,
  className?: string
};
type RedirectMapItem = {
  from: string, // 也可以是路由名
  to: string, // 也可以是路由名
  statusCode: number | undefined
};

// Redirect (to: string, statusCode?: number | undefined): MethodDecorator
// Redirect (from: string, to: string, statusCode?: number | undefined): MethodDecorator
// Redirect (options: RedirectOptions, statusCode?: number | undefined): MethodDecorator
type RedirectDecorator = (
  toOrFromOrOptions: string | RedirectOptions,
  statusCodeOrTo?: string | number | undefined,
  statusCode?: number | undefined
)=> MethodDecorator;


type ArgumentsFormat = (
  optionsOrMiddleware?: MethodOptions | Middleware,
  ...middleware: Array<Middleware>
)=> {
  options: MethodOptions,
  middleware: Array<Middleware>
};

type MapItem = {
  customPath: UrlPath,
  method: string[],
  middleware: Array<Middleware>,
  options: MethodOptions
};



type GetPath = (customPath: UrlPath | null | undefined, customClassName: string | undefined, customMethName: string | undefined, className: string, methodName: string)=> string | RegExp;

class MataRouterClass {

  constructor (router: Router) {
    this.router = router;
  }

  router: Router;

  /**
   * 一个空的中间件
   */
  static emptyMiddleware: Middleware = async (_ctx: Context, next: Next): Promise<void> => {
    await next();
  };

  /**
   * 前部参数可选兼容函数
   * @param optionsOrMiddleware 选项或中间件
   * @param middleware 中间件
   * @returns
   */
  static argumentsFormat: ArgumentsFormat = (optionsOrMiddleware, ...middleware) => {
    let options: MethodOptions = {};
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

  /**
   * 获取路由路径
   * @param customPath 自定义的url路径
   * @param customClassName 自定义的类名
   * @param customMethName 自定义的方法名
   * @param className 实际的类名
   * @param methodName 实际的方法名
   * @return string 处理过的路由地址
   */
  getPath: GetPath = (customPath, customClassName, customMethName, className, methodName) => {
    // 如果有自定义路径使用自定义路径,否则使用默认名
    if (!customPath) {
      // 如果有自定义类名使用自定义类名,否则使用默认名
      if (!customClassName) {
        customClassName = this.classNameFormat(className);
      }
      // 如果有自定义函数名使用自定义函数名,否则使用默认名
      if (!customMethName) {
        customMethName = this.methodNameFormat(methodName);
      }
      customPath = "/" + customClassName + "/" + customMethName;
    }
    return customPath;
  };

  /**
   * 整个控制器中方法装饰器临时存放的路由表
   * 结构如下
   * {
   *    [method object] : Array<
   *      这里一个函数可能对应多个路由
   *      MapItem
   *    >
   * }
   */
  classRouterMap: Map<{[key: string]: unknown }, Array<MapItem>> = new Map();

  /**
   * 重定向时的临时存储路由表
   * 结构如下
   * {
   *    [method object] : Array<
   *      这里一个函数可能对应多个路由
   *      RedirectMapItem
   *    >
   * }
   */
  redirectRouterMap: Map<{[key: string]: unknown }, Array<RedirectMapItem>> = new Map();

  /**
   * 控制器装饰器
   * @param controllerOptions 控制器选项或中间件
   * @param middleware 中间件
   * @returns
   */
  Controller: ControllerDecorator = (controllerOptions = MataRouterClass.emptyMiddleware, ...middleware) => {
    // 前部参数可选兼容
    let path = "";
    if (typeof controllerOptions === "function") {
      middleware.unshift(controllerOptions);
    } else if (typeof controllerOptions === "object") {
      path = controllerOptions.path ? controllerOptions.path : "";
    }
    // 返回控制器装饰器,将map中的中间件和控制器中的中间件合并后注册成路由
    return (target: any) => {
      const arr = this.classRouterMap.get(target);
      if (arr) {
        arr.forEach(item => {
          const { customPath, method, options } = item;
          const registerMiddleware = [ ...middleware, ...item.middleware ];
          const layer = options as LayerOptions;
          this.router.register(path + customPath, method, registerMiddleware, layer);
        });
      }
      const redirectArr = this.redirectRouterMap.get(target);
      if (redirectArr) {
        redirectArr.forEach(item => {
          const { from, to, statusCode } = item;
          this.router.redirect(path + from, to, statusCode);
        });
      }
    };
  };

  /**
   * 默认的处理路由中类名的方法
   * @param className 类名
   * @returns {classPath} 对应的路由名
   */
  classNameFormat (className: string): string {
    const reg = /controller$/i;
    className = className.replace(reg, "");
    return className;
  }

  /**
 * 默认的处理路由中类名的方法
 * @param className 类名
 * @returns {classPath} 对应的路由名
 */
  methodNameFormat (methodName: string): string {
    return methodName;
  }

  /**
   * 方法装饰器
   * @param optionsOrMiddleware 选项或中间件
   * @param _middleware 中间件
   * @returns
   */
  MetaRouter: RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    // eslint-disable-next-line prefer-const
    let { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    let { method } = options;
    let customPath = options.path;
    const customClassName = options.className;
    const customMethName = options.methodName;
    return (controller: any, methodName: string | symbol, _desc: any) => {
      const Controller = controller.constructor;
      const item = async (ctx: Context, _next: Next): Promise<any> => {
        const instance = new Controller(ctx);
        return await instance[ methodName ]();
      };

      middleware.push(item);
      const className = controller.constructor.name;

      customPath = this.getPath(customPath, customClassName, customMethName, className, methodName as string);

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

  // 函数类型重载
  // Redirect (to: string, statusCode?: number | undefined): MethodDecorator
  // Redirect (from: string, to: string, statusCode?: number | undefined): MethodDecorator
  // Redirect (options: RedirectOptions, statusCode?: number | undefined): MethodDecorator
  Redirect: RedirectDecorator = (_from: string | RedirectOptions, _to: string | number | undefined = undefined, _statusCode: number | undefined = undefined) => {
    // 处理重载变量
    let from: string | undefined;
    let to: string;
    let statusCode: number | undefined;
    let customClassName: string | undefined;
    let customMethName: string | undefined;
    if (typeof _from === "string" && _to === undefined && _statusCode === undefined) {
      to = _from;
      from = undefined;
      statusCode = undefined;
    } else if (typeof _from === "string" && typeof _to === "number") {
      to = _from;
      from = undefined;
      statusCode = _to;
    } else if (typeof _from === "string" && typeof _to === "string") {
      to = _to;
      from = _from;
      statusCode = _statusCode;
    } else if (typeof _from === "string" && _to === undefined && typeof _statusCode === "number") {
      to = _from;
      from = undefined;
      statusCode = _statusCode;
    } else if (typeof _from === "object") {
      to = _from.to;
      from = _from.from;
      customClassName = _from.className;
      customMethName = _from.methodName;
      if (typeof _to === "number") {
        statusCode = _to;
      }
    } else {
      throw new Error("redirect url `to` must be require");
    }

    // 将重定向数据添加到Map中
    return (controller: any, methodName: string | symbol, _desc: any) => {
      const className = controller.constructor.name;
      const Controller = controller.constructor;

      from = this.getPath(from, customClassName, customMethName as string, className, methodName as string) as string;

      let arr = this.redirectRouterMap.get(Controller);
      if (!arr) {
        arr = [];
      }
      arr.push({
        from,
        to,
        statusCode,
      });
      this.redirectRouterMap.set(Controller, arr);
    };
  };

  // 以下是甜甜的装饰器糖果

  All: RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "all";
    return this.MetaRouter(options, ...middleware);
  };

  Get: RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "get";
    return this.MetaRouter(options, ...middleware);
  };

  Head: RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "head";
    return this.MetaRouter(options, ...middleware);
  };

  Post: RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "post";
    return this.MetaRouter(options, ...middleware);
  };

  Put: RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "put";
    return this.MetaRouter(options, ...middleware);
  };

  Delete: RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "delete";
    return this.MetaRouter(options, ...middleware);
  };
  Del = this.Delete;

  Patch: RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "patch";
    return this.MetaRouter(options, ...middleware);
  };

  Link: RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "link";
    return this.MetaRouter(options, ...middleware);
  };

  Unlink: RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "unlink";
    return this.MetaRouter(options, ...middleware);
  };

  Options: RouterMethodDecorator = (optionsOrMiddleware = MataRouterClass.emptyMiddleware, ..._middleware) => {
    const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "options";
    return this.MetaRouter(options, ...middleware);
  };

  // Options (firstMiddleware?: Middleware, ..._middleware: Array<Middleware>): MethodDecorator
  // Options (methodOptions?: MethodOptions, ..._middleware: Array<Middleware>): MethodDecorator
  // Options (optionsOrMiddleware: Middleware | MethodOptions | undefined = MataRouterClass.emptyMiddleware, ..._middleware: any[]): MethodDecorator {
  //   const { options, middleware } = MataRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
  //   options.method = "options";
  //   return this.MetaRouter(options, ...middleware);
  // }

}
export default MataRouterClass;
