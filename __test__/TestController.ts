import { Purge, All, Redirect, Post, Get, Del, Delete, MetaRouter, Controller, Unlink, Link, Put, Options, Head, Patch } from "./metaRouter";

@Controller()
export default class MethodTestController {

  @Get({ name: "index", path: "/" })
  async index (): Promise<any> {}

  @Get({ path: "/prames/:params" }) // 测试params传参
  async prames (): Promise<any> {
  }

  @Get("stringGet")
  async stringGet (): Promise<any> { }

  @Get({ path: "/testRouterPath" })
  async testRouterPath (): Promise <any> {}

  @Get({ name: "testRouterName" })
  async testRouterName (): Promise<any> {}

  @Post({ methodName: "methodName" })
  async Post (): Promise<any> { }

  @Put({ className: "className" })
  async Put (): Promise<any> { }

  @All()
  async All (): Promise<any> { }

  @Del({ method: [ "get", "post", "post", "post" ]})
  async Del (): Promise<any> { }

  @Delete()
  async Delete (): Promise<any> { }

  @Link()
  async Link (): Promise<any> { }

  @Unlink()
  async Unlink (): Promise<any> { }

  @Options()
  async Options (): Promise<any> { }

  @Head()
  async Head (): Promise<any> { }
  @Patch()
  async Patch (): Promise<any> { }
  @Purge()
  async Purge (): Promise<any> { }


  @MetaRouter({ method: "get" })
  async MetaRouter (): Promise<any> { }

  @MetaRouter({ method: [ "get", "post" ]})
  async MetaRouter2 (): Promise<any> { }

  @Get({ className: "className", methodName: "methodName" })
  async changeName (): Promise<any> { }

  @Get({ className: "", methodName: "" })
  async changeName2 (): Promise<any> { }


  @Redirect("testRouterName")
  async strRedirect1 (): Promise<any> { }

  @Redirect("/StrRedirect2", "testRouterName")
  async strRedirect2 (): Promise<any> { }

  @Redirect("/StrRedirect3", "testRouterName", 302)
  async strRedirect3 (): Promise<any> { }

  @Redirect("/testRouterPath", undefined, 302)
  async strRedirect4 (): Promise<any> { }

  @Redirect("testRouterName", 302)
  async strRedirect5 (): Promise<any> { }


  @Redirect({ to: "/testRouterPath" })
  async optRedirect1 (): Promise<any> { }

  @Redirect({ methodName: "OptRedirect3-methodName", to: "testRouterName" })
  async optRedirect2 (): Promise<any> { }

  @Redirect({ className: "TEST", to: "testRouterName" }) // to `router name`
  @Redirect({ className: "test", to: "/testRouterPath" })
  async optRedirect3 (): Promise<any> { }

  @Redirect({ from: "/optRedirect4-from", className: "someStr", methodName: "someStr", to: "testRouterName" }, 302) // className and methodName is invalid
  async optRedirect4 (): Promise<any> { }

  @Redirect({ to: "testRouterName" }, 302)
  async optRedirect5 (): Promise<any> { }
}


@Controller()
export class ClassTestController {
}
@Controller("")
export class ClassTest1Controller {
  @Get()
  async testGet (): Promise<any> { }
}
@Controller("/ClassTest")
export class ClassTest2Controller {
  @Get()
  async testGet (): Promise<any> { }
}

@Controller({})
export class ClassTest3Controller {
  @Get()
  async testGet (): Promise<any> { }
}

@Controller({ path: "/ClassTest" })
export class ClassTest4Controller {
  @Get()
  async testGet (): Promise<any> { }
}

@Controller()
export class StaticTestController {
  @Get()
  static async testGet (): Promise<any> { }
}

@Controller({ path: "/" })
export class ControllerTest1Controller {

  @Get() // 35:/testGet
  async testGet (): Promise<any> { }

  @Redirect("/rootRedirectRouterPath", "/rootRedirectRouterPath2")
  async rootRedirectRouterPath (): Promise<any> { }
}

// 如果在控制器上定义了customClassName，则默认使用
@Controller({ className: "a" })
export class ControllerTest2Controller {

  @Get() // /a/testGet
  async testGet (): Promise<any> { }

  @Get({ className: "b" }) // /b/testGet
  async testGet2 (): Promise<any> { }

  @Redirect("/rootRedirectRouterPath2")
  async rootRedirectRouterPath2 (): Promise<any> { }
}
