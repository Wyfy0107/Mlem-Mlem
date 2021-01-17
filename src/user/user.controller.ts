import {
  Controller,
  Get,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common'
import { Crud, CrudController } from '@nestjsx/crud'

import { UserService } from './user.service'
import { User } from './user.entity'
import { BaseCrudController } from '../base.controller'

@Crud({
  model: {
    type: User,
  },
  query: {
    maxLimit: 20,
  },
})
@Controller('user')
export class UserController extends BaseCrudController<User> {
  constructor(public service: UserService) {
    super()
  }
}
