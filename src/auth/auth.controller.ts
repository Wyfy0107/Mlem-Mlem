import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { UserGoogleGuard } from './google/google.guard'
import { UserJwtGuard } from './jwt/jwt.guard'
import { AuthService } from './auth.service'
import { User } from '../user/user.entity'

@Controller('google')
export class AuthController {
  constructor(public authService: AuthService) {}

  @Get()
  @UseGuards(UserGoogleGuard)
  async googleAuth(@Req() req) {}

  @Get('redirect')
  @UseGuards(UserGoogleGuard)
  googleAuthRedirect(@Req() req) {
    const user = req.user as User
    const token = this.authService.sign(user.email)

    return {
      data: user,
      token: token,
    }
  }

  @Get('test')
  @UseGuards(UserJwtGuard)
  test() {
    return 'hello'
  }
}
