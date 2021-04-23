import { CrudRequest, Override, ParsedBody, ParsedRequest } from '@nestjsx/crud'

import { UserService } from './user.service'
import { Role, Users } from './user.entity'
import { BaseCrudController } from '../base.controller'
import AppController from '../app.decorator'
import { AppFeatures } from '../app.types'
import { WithRole } from '../auth/auth.decorator'

@AppController(AppFeatures.Users, {
  model: {
    type: Users,
  },
  query: {
    maxLimit: 20,
  },
})
@WithRole(Role.Admin)
export class UserController extends BaseCrudController<Users> {
  constructor(public service: UserService) {
    super()
  }

  @Override()
  getMany(@ParsedRequest() req: CrudRequest) {
    return this.base.getManyBase(req)
  }

  @Override()
  createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() body) {
    return this.base.createOneBase(req, body)
  }
}
