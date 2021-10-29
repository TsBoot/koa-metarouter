import Router from "@koa/router";
import MetaRouterClass, { RouterMethodDecorator } from "../lib";
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

export const Purge: RouterMethodDecorator = (optionsOrMiddleware, ..._middleware) => {
  const { options, middleware } = MetaRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
  options.method = "purge";
  return metaRouter.MetaRouter(options, ...middleware);
};

export default metaRouter;
