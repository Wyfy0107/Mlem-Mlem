import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { User } from './user.entity'
import { BaseCrudService } from '../base.service'
import { AuthService } from '../auth/auth.service'

@Injectable()
export class UserService extends BaseCrudService<User> {
  constructor(
    @InjectRepository(User) repo: Repository<User>,
    private authService: AuthService,
  ) {
    super(repo)
  }

  getToken(email: string) {
    return this.authService.sign(email)
  }
}
