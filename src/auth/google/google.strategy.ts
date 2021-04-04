import { PassportStrategy } from '@nestjs/passport'
import * as GoogleIdTokenStrategy from 'passport-google-id-token'
import { Injectable } from '@nestjs/common'

import { UserService } from '../../users/user.service'
import { AuthenticatedUser } from '../types'
import { GOOGLE_STRATEGY } from './google.const'

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
  constructor(private userService: UserService) {
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

    const newUser = {
      email,
      firstName,
      lastName,
    }

    return this.userService.repository.save(newUser)
  }
}
