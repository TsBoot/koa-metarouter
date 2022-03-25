
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
type RouterMethodDecorator1 = (
  firstMiddleware?: Middleware,
  ...middleware: Array<Middleware>
)=> MethodDecorator;
type RouterMethodDecorator2 = (
  options?: MethodOptions,
  ...middleware: Array<Middleware>
)=> MethodDecorator;
type RouterMethodDecorator3 = (
  options?: string,
  ...middleware: Array<Middleware>
)=> MethodDecorator;
export type RouterMethodDecorator = RouterMethodDecorator1 & RouterMethodDecorator2 & RouterMethodDecorator3;


// type ControllerDecorator = (controllerOptions?: { path?: string } | Middleware, ...middleware: Array<Middleware>) => ClassDecorator;
type ControllerDecorator1 = (firstMiddlewares?: Middleware, ...middleware: Array<Middleware>)=> ClassDecorator;
type ControllerDecorator2 = (path: string, ...middleware: Array<Middleware>)=> ClassDecorator;
type ControllerDecorator3 = (options?: { path?: string, className?: string }, ...middleware: Array<Middleware>)=> ClassDecorator;
type ControllerDecorator = ControllerDecorator1 & ControllerDecorator2 & ControllerDecorator3;

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


/**
 * 类型重载,完善重定向的类型提示
 */
type RedirectDecorator1 = (
  to: string,
  statusCode?: number | undefined
)=> MethodDecorator;
type RedirectDecorator2 = (
  to: string,
  from: undefined,
  statusCode?: number | undefined
)=> MethodDecorator;
type RedirectDecorator3 = (
  from: string,
  to: string,
  statusCode?: number | undefined
)=> MethodDecorator;
type RedirectDecorator4 = (
  options: RedirectOptions,
  statusCode?: number | undefined
)=> MethodDecorator;
type RedirectDecorator = RedirectDecorator1 & RedirectDecorator2 & RedirectDecorator3 & RedirectDecorator4;





type ArgumentsFormat = (
  optionsOrMiddleware?: string | MethodOptions | Middleware,
  ...middleware: Array<Middleware>
)=> {
  options: MethodOptions,
  middleware: Array<Middleware>
};

type MapItem = {
  info: GetPathInfo,
  method: string[],
  middleware: Array<Middleware>,
  options: MethodOptions
};

type GetPathInfo = {
  customControllerPath: UrlPath | null | undefined,
  customControllerClassName: string | undefined,
  customPath: UrlPath | null | undefined,
  customClassName: string | undefined,
  customMethName: string | undefined,
  className: string,
  methodName: string
};

type GetPath = (info: GetPathInfo)=> string | RegExp;

class MetaRouterClass {

  constructor (router: Router) {
    this.router = router;
  }

  router: Router;

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
    } else if (typeof optionsOrMiddleware === "string") {
      options.path = optionsOrMiddleware;
      options.method = undefined;
    }
    return {
      options,
      middleware,
    };
  };

  /**
   * 获取路由路径
   * @param customControllerPath 自定义的控制器的路径
   * @param customControllerClassName 自定义的控制器的类名
   * @param customPath 自定义的url路径
   * @param customClassName 自定义的类名
   * @param customMethName 自定义的方法名
   * @param className 实际的类名
   * @param methodName 实际的方法名
   * @return string 处理过的路由地址
   */
  getPath: GetPath = ({ customControllerPath, customControllerClassName, customPath, customClassName, customMethName, className, methodName }) => {
    // 如果有自定义路径使用自定义路径,否则使用默认名
    if (!customPath) {
      // 如果有自定义类名使用自定义类名,否则使用默认名
      if (!customClassName) {
        if (customControllerClassName) {
          customClassName = customControllerClassName;
        } else {
          customClassName = this.classNameFormat(className);
        }
      }

      // 如果有自定义函数名使用自定义函数名,否则使用默认名
      if (!customMethName) {
        customMethName = this.methodNameFormat(methodName);
      }
      if (customControllerPath === "/") {
        customPath = "/" + customMethName;
      } else if (customControllerPath) {
        customPath = customControllerPath + "/" + customClassName + "/" + customMethName;
      } else {
        customPath = "/" + customClassName + "/" + customMethName;
      }
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
  Controller: ControllerDecorator = (path, ...middleware) => {
    let customControllerClassName: string;
    if (!path) path = "";
    // 第一个参数，可选兼容
    if (typeof path === "function") {
      middleware.unshift(path);
      path = "";
    } else if (typeof path === "object") {
      const options = path;
      path = options.path ? options.path : "";
      customControllerClassName = options.className ? options.className : "";
    }
    // 返回控制器装饰器,将map中的中间件和控制器中的中间件合并后注册成路由
    return (target: any) => {
      const arr = this.classRouterMap.get(target);
      if (arr) {
        arr.forEach(item => {
          const { info, method, options } = item;
          info.customControllerPath = path as string;
          info.customControllerClassName = customControllerClassName;
          const fullPath: UrlPath = this.getPath(info);

          const registerMiddleware = [ ...middleware, ...item.middleware ];
          const layer = options as LayerOptions;
          this.router.register(fullPath, method, registerMiddleware, layer);
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
  MetaRouter: RouterMethodDecorator = (optionsOrMiddleware, ..._middleware: Middleware[]) => {
    const { options, middleware } = MetaRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    let { method } = options;
    const customPath = options.path;
    const customClassName = options.className;
    const customMethName = options.methodName;
    return (controller: any, methodName: string | symbol, desc: any) => {
      // 判断是否是静态方法
      const isStatic = controller.name ? true : false;
      let Controller: { new(arg0: Context): any;[x: string]: unknown; ctx?: any; };
      if (isStatic) {
        Controller = controller;
      } else {
        Controller = controller.constructor;
      }
      let item;
      if (isStatic) {
        item = async (ctx: Context, next: Next): Promise<any> => {
          return await desc.value(ctx, next);
        };
      } else {
        item = async (ctx: Context, _next: Next): Promise<any> => {
          const instance = new Controller(ctx);
          return await instance[ methodName ]();
        };
      }

      middleware.push(item);
      const className = Controller.name;

      const info: GetPathInfo = { customControllerPath: "", customControllerClassName: "", customPath, customClassName, customMethName, className, methodName: methodName as string };

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

      arr.push({ info, method, middleware, options });
      this.classRouterMap.set(Controller, arr);

    };
  };

  // 函数类型重载

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
      const info = { customControllerPath: "", customControllerClassName: "", customPath: from, customClassName, customMethName: customMethName as string, className, methodName: methodName as string };
      from = this.getPath(info) as string;

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

  All: RouterMethodDecorator = (optionsOrMiddleware, ..._middleware) => {
    const { options, middleware } = MetaRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    options.method = "all";
    return this.MetaRouter(options, ...middleware);
  };

  Get: RouterMethodDecorator = (optionsOrMiddleware, ..._middleware) => {
    const { options, middleware } = MetaRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    if (Array.isArray(options.method)) {
      options.method = [ ...options.method, "get" ];
    } else if (typeof options.method === "string") {
      options.method = [ options.method, "get" ];
    }
    return this.MetaRouter(options, ...middleware);
  };

  Head: RouterMethodDecorator = (optionsOrMiddleware, ..._middleware) => {
    const { options, middleware } = MetaRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    if (Array.isArray(options.method)) {
      options.method = [ ...options.method, "head" ];
    } else if (typeof options.method === "string") {
      options.method = [ options.method, "head" ];
    }
    return this.MetaRouter(options, ...middleware);
  };

  Post: RouterMethodDecorator = (optionsOrMiddleware, ..._middleware) => {
    const { options, middleware } = MetaRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    if (Array.isArray(options.method)) {
      options.method = [ ...options.method, "post" ];
    } else if (typeof options.method === "string") {
      options.method = [ options.method, "post" ];
    }
    return this.MetaRouter(options, ...middleware);
  };

  Put: RouterMethodDecorator = (optionsOrMiddleware, ..._middleware) => {
    const { options, middleware } = MetaRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    if (Array.isArray(options.method)) {
      options.method = [ ...options.method, "put" ];
    } else if (typeof options.method === "string") {
      options.method = [ options.method, "put" ];
    }
    return this.MetaRouter(options, ...middleware);
  };

  Delete: RouterMethodDecorator = (optionsOrMiddleware, ..._middleware) => {
    const { options, middleware } = MetaRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    if (Array.isArray(options.method)) {
      options.method = [ ...options.method, "delete" ];
    } else if (typeof options.method === "string") {
      options.method = [ options.method, "delete" ];
    }
    return this.MetaRouter(options, ...middleware);
  };
  Del = this.Delete;

  Patch: RouterMethodDecorator = (optionsOrMiddleware, ..._middleware) => {
    const { options, middleware } = MetaRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    if (Array.isArray(options.method)) {
      options.method = [ ...options.method, "patch" ];
    } else if (typeof options.method === "string") {
      options.method = [ options.method, "pathc" ];
    }
    return this.MetaRouter(options, ...middleware);
  };

  Link: RouterMethodDecorator = (optionsOrMiddleware, ..._middleware) => {
    const { options, middleware } = MetaRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    if (Array.isArray(options.method)) {
      options.method = [ ...options.method, "link" ];
    } else if (typeof options.method === "string") {
      options.method = [ options.method, "link" ];
    }
    return this.MetaRouter(options, ...middleware);
  };

  Unlink: RouterMethodDecorator = (optionsOrMiddleware, ..._middleware) => {
    const { options, middleware } = MetaRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    if (Array.isArray(options.method)) {
      options.method = [ ...options.method, "unlink" ];
    } else if (typeof options.method === "string") {
      options.method = [ options.method, "unlink" ];
    }
    return this.MetaRouter(options, ...middleware);
  };

  Options: RouterMethodDecorator = (optionsOrMiddleware, ..._middleware) => {
    const { options, middleware } = MetaRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
    if (Array.isArray(options.method)) {
      options.method = [ ...options.method, "options" ];
    } else if (typeof options.method === "string") {
      options.method = [ options.method, "options" ];
    }
    return this.MetaRouter(options, ...middleware);
  };

}
export default MetaRouterClass;
