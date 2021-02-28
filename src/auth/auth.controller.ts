import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { UserGoogleGuard } from './google/google.guard'
import { AuthService } from './auth.service'
import { AuthenticatedUser } from './types'

@Controller()
export class AuthController {
  constructor(public authService: AuthService) {}

  @Get('login/google')
  @UseGuards(UserGoogleGuard)
  googleAuth() {}

  @Get('google/redirect')
  @UseGuards(UserGoogleGuard)
  googleAuthRedirect(@Req() req) {
    return this.authService.login(req.user as AuthenticatedUser)
  }
}
