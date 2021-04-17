import { Controller, Post, UseGuards } from '@nestjs/common'

import { UserGoogleGuard } from './google/google.guard'
import { AuthService } from './auth.service'
import { AuthenticatedUser } from './types'
import { BypassAuth } from './auth.decorator'
import { User } from '../users/user.decorator'

@Controller()
export class AuthController {
  constructor(public authService: AuthService) {}

  @BypassAuth()
  @Post('login/google')
  @UseGuards(UserGoogleGuard)
  googleAuthRedirect(@User() user: AuthenticatedUser) {
    return this.authService.login(user)
  }
}
