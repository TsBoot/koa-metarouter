/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import metaRouter from "./metaRouter";

import "./TestController";

// const All = [ "HEAD", "ACL", "BIND", "CHECKOUT", "CONNECT", "COPY", "DELETE", "GET", "HEAD", "LINK", "LOCK", "M-SEARCH", "MERGE", "MKACTIVITY", "MKCALENDAR", "MKCOL", "MOVE", "NOTIFY", "OPTIONS", "PATCH", "POST", "PRI", "PROPFIND", "PROPPATCH", "PURGE", "PUT", "REBIND", "REPORT", "SEARCH", "SOURCE", "SUBSCRIBE", "TRACE", "UNBIND", "UNLINK", "UNLOCK", "UNSUBSCRIBE" ];
const All = [ "HEAD", "ACL", "BIND", "CHECKOUT", "CONNECT", "COPY", "DELETE", "GET", "HEAD", "LINK", "LOCK", "M-SEARCH", "MERGE", "MKACTIVITY", "MKCALENDAR", "MKCOL", "MOVE", "NOTIFY", "OPTIONS", "PATCH", "POST", "PROPFIND", "PROPPATCH", "PURGE", "PUT", "REBIND", "REPORT", "SEARCH", "SOURCE", "SUBSCRIBE", "TRACE", "UNBIND", "UNLINK", "UNLOCK", "UNSUBSCRIBE" ];

type ExpectRouterList = [
  (null | string),
  Array<string> | string,
  string,
];

const expectRouterList: ExpectRouterList[] = [
  [ "index", "get", "/" ],
  [ null, "get", "stringGet" ],
  [ null, "get", "/testRouterPath" ],
  [ "testRouterName", "get", "/MethodTest/testRouterName" ],
  [ null, "post", "/MethodTest/methodName" ],
  [ null, "Put", "/className/Put" ],

  [ null, All, "/MethodTest/All" ],
  [ null, [ "delete", "get", "post" ], "/MethodTest/Del" ], //  delete,"get", "post"
  [ null, "delete", "/MethodTest/Delete" ],
  [ null, "Link", "/MethodTest/Link" ],
  [ null, "Unlink", "/MethodTest/Unlink" ],
  [ null, "Options", "/MethodTest/Options" ],
  [ null, "Head", "/MethodTest/Head" ],
  [ null, "Patch", "/MethodTest/Patch" ],
  [ null, "Purge", "/MethodTest/Purge" ],

  [ null, "get", "/MethodTest/MetaRouter" ],
  [ null, [ "get", "post" ], "/MethodTest/MetaRouter2" ], // get Post
  [ null, "get", "/className/methodName" ],
  [ null, "get", "/MethodTest/changeName2" ],

  // 重定向
  [ null, All, "/MethodTest/strRedirect1" ],
  [ null, All, "/StrRedirect2" ],
  [ null, All, "/StrRedirect3" ],
  [ null, All, "/MethodTest/strRedirect4" ],
  [ null, All, "/MethodTest/strRedirect5" ],

  [ null, All, "/MethodTest/optRedirect1" ],
  [ null, All, "/MethodTest/OptRedirect3-methodName" ],
  [ null, All, "/test/optRedirect3" ],
  [ null, All, "/TEST/optRedirect3" ],
  [ null, All, "/optRedirect4-from" ],
  [ null, All, "/MethodTest/optRedirect5" ],

  // 控制器
  [ null, "get", "/ClassTest1/testGet" ],
  [ null, "get", "/ClassTest/ClassTest2/testGet" ],
  [ null, "get", "/ClassTest3/testGet" ],
  [ null, "get", "/ClassTest/ClassTest4/testGet" ],

  // 路由绑定静态方法
  [ null, "get", "/StaticTest/testGet" ],
  // 控制器路由为自定义的情况，不要class名

  // 增加了 控制器 "/" path情况
  [ null, "get", "/testGet" ],

  // 增加了控制器类名统一处理的情况
  [ null, "get", "/a/testGet" ],
  [ null, "get", "/b/testGet2" ],


];


function check () {
  let error = false;
  metaRouter.router.stack.forEach((item, index) => {
    if (!expectRouterList[ index ]) {
      return;
    }
    let method = expectRouterList[ index ][ 1 ];
    if (typeof method === "string") {
      method = method.toUpperCase();
      if (item.name === expectRouterList[ index ][ 0 ] && method && item.methods.includes(method) && item.path === expectRouterList[ index ][ 2 ]) {
        console.info("\x1B[36m%s\x1B[0m", `checked-${index}:${JSON.stringify(expectRouterList[ index ])}`);
      } else {
        error = true;
        console.info("\x1B[31m%s\x1B[0m", `error-${index}:${JSON.stringify([ item.name, item.methods, item.path ])}`);
        console.info("\x1B[31m%s\x1B[0m", `expect-${index}:${JSON.stringify(expectRouterList[ index ])}`);
      }
    } else if (Array.isArray(method)) {
      let match = true;
      method.forEach(m => {
        m = m.toUpperCase();
        if (match && !item.methods.includes(m)) {
          match = false;
        }
      });
      if (item.name === expectRouterList[ index ][ 0 ] && match && item.path === expectRouterList[ index ][ 2 ]) {
        console.info("\x1B[36m%s\x1B[0m", `checked-${index}:${JSON.stringify(expectRouterList[ index ])}`);
      } else {
        error = true;
        console.info("\x1B[31m%s\x1B[0m", `error-${index}:${JSON.stringify([ item.name, item.methods, item.path ])}`);
        console.info("\x1B[31m%s\x1B[0m", `expect-${index}:${JSON.stringify(expectRouterList[ index ])}`);
      }
    }
  });
  if (error) {
    throw new Error("test file check error");
  }
}

check();
export default metaRouter.router;
