import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { UserGoogleGuard } from './google/google.guard'
import { UserJwtGuard } from './jwt/jwt.guard'
import { AuthService } from './auth.service'
import { AuthenticatedUser } from './types'

@Controller('google')
export class AuthController {
  constructor(public authService: AuthService) {}

  @Get()
  @UseGuards(UserGoogleGuard)
  googleAuth() {}

  @Get('redirect')
  @UseGuards(UserGoogleGuard)
  googleAuthRedirect(@Req() req) {
    return this.authService.login(req.user as AuthenticatedUser)
  }

  @Get('test')
  @UseGuards(UserJwtGuard)
  test() {
    return 'hello'
  }
}
