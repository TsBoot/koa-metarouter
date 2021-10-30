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

const { All, Redirect, Post, Get, Head, Patch, Del, Delete, MetaRouter, Controller, Options, Link, Unlink, Put } = metaRouter;

// 自定义
const Purge: RouterMethodDecorator = (optionsOrMiddleware, ..._middleware) => {
  const { options, middleware } = MetaRouterClass.argumentsFormat(optionsOrMiddleware, ..._middleware);
  if (Array.isArray(options.method)) {
    options.method = [ ...options.method, "purge" ];
  } else if (typeof options.method === "string") {
    options.method = [ options.method, "purge" ];
  }
  return metaRouter.MetaRouter(options, ...middleware);
};

export default metaRouter;
export {
  All,
  Redirect,
  Get,
  Post,
  Del,
  Delete,
  Options,
  Link,
  Unlink,
  Put,
  MetaRouter,
  Controller,
  Head,
  Patch,
  Purge,
};
