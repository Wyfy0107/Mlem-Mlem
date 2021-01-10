import {
  Controller,
  Get,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common'
import { Crud, CrudController } from '@nestjsx/crud'

import { UserService } from './user.service'
import { User } from './user.entity'

@Crud({
  model: {
    type: User,
  },
  query: {
    maxLimit: 20,
    alwaysPaginate: true,
  },
})
@Controller('user')
export class UserController implements CrudController<User> {
  constructor(public service: UserService) {}
}
