import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-google-oauth20'
import { Injectable } from '@nestjs/common'

import { UserService } from '../../user/user.service'
import { AuthenticatedUser } from '../types'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private userService: UserService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/google/redirect',
      scope: ['email', 'profile'],
    })
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<AuthenticatedUser> {
    const { name, emails } = profile
    const checkUser = await this.userService.findOne({
      where: { email: emails[0].value },
    })
    if (checkUser) return checkUser

    const newUser = {
      email: emails[0].value as string,
      firstName: name.givenName as string,
      lastName: name.familyName as string,
    }

    const saveUser = await this.userService.repository.save(newUser)

    return saveUser
  }
}
