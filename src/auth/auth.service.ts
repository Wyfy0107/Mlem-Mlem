import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthenticatedUser } from './types'

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  sign(email: string) {
    return this.jwtService.sign({ email }, { expiresIn: '4h' })
  }

  login(user: AuthenticatedUser) {
    const token = this.sign(user.email)
    return { token }
  }
}
