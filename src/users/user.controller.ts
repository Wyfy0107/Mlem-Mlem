import { CrudRequest, Override, ParsedBody, ParsedRequest } from '@nestjsx/crud'
import { Body, Post } from '@nestjs/common'

import { UserService } from './user.service'
import { Role, User } from './user.entity'
import { BaseCrudController } from '../base.controller'
import AppController from '../app.decorator'
import { AppFeatures } from '../app.types'
import { WithRole, BypassAuth } from '../auth/auth.decorator'

@AppController(AppFeatures.Users, {
  model: {
    type: User,
  },
  query: {
    maxLimit: 20,
  },
})
export class UserController extends BaseCrudController<User> {
  constructor(public service: UserService) {
    super()
  }

  @WithRole(Role.ADMIN)
  getMany(@ParsedRequest() req: CrudRequest) {
    return this.base.getManyBase(req)
  }

  @BypassAuth()
  @Override()
  createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() body) {
    return this.base.createOneBase(req, body)
  }

  @BypassAuth()
  @Post('/get-token')
  getToken(@Body() body: { email: string }) {
    return this.service.getToken(body.email)
  }
}
