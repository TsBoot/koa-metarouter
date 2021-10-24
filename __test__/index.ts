/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import metaRouter from "./metaRouter";

import "./TestController";

const expectRouterList = [
  [ null, "get", "/Test/testGet" ],
];

metaRouter.router.stack.forEach(i => {
  console.info(i.name, i.methods, i.path);
});
