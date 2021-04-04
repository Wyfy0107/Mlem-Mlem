import { Injectable, ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { JWT_STRATEGY } from './jwt.const'

@Injectable()
export class UserJwtGuard extends AuthGuard(JWT_STRATEGY) {
  constructor(private reflector: Reflector) {
    super()
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const noAuth = this.reflector.get<string[]>('no_auth', context.getHandler())
    if (noAuth) {
      return user
    }
    return super.handleRequest(err, user, info, context)
  }
}
