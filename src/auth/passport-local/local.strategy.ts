import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { Injectable, NotFoundException } from '@nestjs/common'
import bcrypt from 'bcrypt'

import { UserService } from '../../user/user.service'
import { AuthenticatedUser } from '../types'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private userService: UserService) {
    super({
      userNameField: 'email',
    })
  }

  async validate(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser | undefined> {
    const user = await this.userService.findOne({ where: { email } })
    if (!user) return undefined

    const check = await bcrypt.compare(password, user.password)
    if (!check) return undefined

    return user
  }
}
