/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import metaRouter from "./metaRouter";

import "./TestController";

metaRouter.router.prefix("/prefix");

const expectRouterList = [
  [ null, "get", "/prefix/Test/Test/testGet" ],
];

metaRouter.router.stack.forEach(i => {
  console.info(i.name, i.methods, i.path);
});
