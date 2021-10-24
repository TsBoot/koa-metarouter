/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import metaRouter from "./metaRouter";
const { All, Redirect, Post, Get, Del, Delete, MetaRouter, Controller } = metaRouter;

@Controller()
export default class MethodTestController {


  @Get({ name: "testGet" })
  async testGet (): Promise<any> { }

  @Post()
  async testPost (): Promise<any> { }

  @All()
  async testAll (): Promise<any> { }

  @Del()
  async testDel (): Promise<any> { }

  @Delete()
  async Delete (): Promise<any> { }

  @MetaRouter({ method: "get" })
  async MetaRouter (): Promise<any> { }


  @Redirect("testGet")
  async strRedirect1 (): Promise<any> { }

  @Redirect("/StrRedirect2", "testGet")
  async strRedirect2 (): Promise<any> { }

  @Redirect("/StrRedirect3", "testGet", 302)
  async strRedirect3 (): Promise<any> { }

  @Redirect("/StrRedirect4", undefined, 302)
  async strRedirect4 (): Promise<any> { }

  @Redirect("/StrRedirect5", 302)
  async strRedirect5 (): Promise<any> { }


  @Redirect({ to: "/prefix/MethodTest/testGet" })
  async optRedirect1 (): Promise<any> { }

  @Redirect({ methodName: "OptRedirect3-methodName", to: "testGet" })
  async optRedirect2 (): Promise<any> { }

  @Redirect({ className: "TEST", to: "testGet" }) // to `router name`
  @Redirect({ className: "test", to: "/prefix/MethodTest/testGet" })
  async optRedirect3 (): Promise<any> { }

  @Redirect({ from: "/optRedirect4-from", className: "someStr", methodName: "someStr", to: "testGet" }, 302) // className and methodName is invalid
  async optRedirect4 (): Promise<any> { }

  @Redirect({ to: "testGet" }, 302)
  async optRedirect5 (): Promise<any> { }
}