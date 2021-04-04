import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from '../../users/user.entity'
import { AuthenticatedUser } from '../types'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const role = this.reflector.get<Role>('role', context.getHandler())

    if (!role) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const userRole = (request.user as AuthenticatedUser).role

    return role === userRole
  }
}
