import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { AuthenticatedUser } from '../types'
import { UserService } from '../../users/user.service'
import { JWT_STRATEGY } from './jwt.const'

type JWTPayload = {
  email: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate({
    email,
  }: JWTPayload): Promise<AuthenticatedUser | undefined> {
    const user = await this.userService.findOne({
      where: { email },
      relations: ['websites'],
    })

    if (!user) return undefined

    return user
  }
}
