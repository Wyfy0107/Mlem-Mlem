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
    try {
      const user = await this.userService.findOne({
        where: { email },
      })

      if (!user) return undefined

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }
    } catch (error) {
      // TODO: Improve error handling
      // labels=bug
      console.log(error)
    }
  }
}
