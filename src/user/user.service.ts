import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './user.entity'
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm'

import { BaseCrudService } from '../base.service'

@Injectable()
export class UserService extends BaseCrudService<User> {
  constructor(@InjectRepository(User) repo) {
    super(repo)
  }
}
