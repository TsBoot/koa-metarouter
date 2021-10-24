import Router from "@koa/router";
import MetaRouterClass from "../lib";
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
export default metaRouter;
