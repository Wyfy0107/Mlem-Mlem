import { PassportStrategy } from '@nestjs/passport'
import * as GoogleIdTokenStrategy from 'passport-google-id-token'
import { Injectable } from '@nestjs/common'

import { UsersService } from '../../users/user.service'
import { AuthenticatedUser } from '../types'
import { ADMIN_EMAIL, GOOGLE_STRATEGY } from './google.const'
import { Role } from 'src/users/user.entity'

type GoogleIdTokenResponse = {
  payload: {
    email: string
    given_name: string
    family_name: string
    picture: string
    sub: string
    email_verified: boolean
  }
  [key: string]: any
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  GoogleIdTokenStrategy,
  GOOGLE_STRATEGY,
) {
  constructor(private userService: UsersService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
    })
  }

  async validate({
    payload,
  }: GoogleIdTokenResponse): Promise<AuthenticatedUser> {
    const { given_name: firstName, family_name: lastName, email } = payload
    const user = await this.userService.findOne({
      where: { email },
    })

    if (user) return user

    const role = email === ADMIN_EMAIL ? Role.Admin : Role.User

    const newUser = {
      email,
      firstName,
      lastName,
      role,
    }

    return this.userService.repository.save(newUser)
  }
}
