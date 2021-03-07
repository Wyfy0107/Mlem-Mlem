import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { AuthenticatedUser } from '../types'
import { UserService } from '../../user/user.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(email: string): Promise<AuthenticatedUser | undefined> {
    const user = await this.userService.findOne({
      where: { email },
      relations: ['website'],
    })

    if (!user) return undefined

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      website: user.website,
    }
  }
}
