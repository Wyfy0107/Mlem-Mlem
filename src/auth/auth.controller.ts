import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { UserGoogleGuard } from './google/google.guard'
import { UserJwtGuard } from './jwt/jwt.guard'
import { UserLocalGuard } from './passport-local/local.guard'
import { AuthService } from './auth.service'
import { AuthenticatedUser } from './types'

@Controller('login')
export class AuthController {
  constructor(public authService: AuthService) {}

  @Get('google')
  @UseGuards(UserGoogleGuard)
  googleAuth() {}

  @Get('google/redirect')
  @UseGuards(UserGoogleGuard)
  googleAuthRedirect(@Req() req) {
    return this.authService.login(req.user as AuthenticatedUser)
  }

  @Post('local')
  @UseGuards(UserLocalGuard)
  loginLocal(@Req() req) {
    return this.authService.login(req.user as AuthenticatedUser)
  }
}
