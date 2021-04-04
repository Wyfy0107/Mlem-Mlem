import { forwardRef, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { GoogleStrategy } from './google/google.strategy'
import { JwtStrategy } from './jwt/jwt.strategy'
import { UserModule } from '../users/user.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
