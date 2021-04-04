import { Controller, Post, UseGuards } from '@nestjs/common'
import { UserGoogleGuard } from './google/google.guard'
import { AuthService } from './auth.service'
import { AuthenticatedUser } from './types'
import { User } from '../users/user.decorator'

@Controller()
export class AuthController {
  constructor(public authService: AuthService) {}

  @Post('login/google')
  @UseGuards(UserGoogleGuard)
  googleAuthRedirect(@User() user: AuthenticatedUser) {
    return this.authService.login(user)
  }
}
