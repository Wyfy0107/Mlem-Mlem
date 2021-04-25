import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Users } from './user.entity'
import { BaseCrudService } from '../base.service'
import { AuthService } from '../auth/auth.service'

@Injectable()
export class UsersService extends BaseCrudService<Users> {
  constructor(
    @InjectRepository(Users) repo: Repository<Users>,
    private authService: AuthService,
  ) {
    super(repo)
  }
}
