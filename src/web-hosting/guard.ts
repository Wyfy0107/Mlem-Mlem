import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common'
import { AuthenticatedUser } from 'src/auth/types'

@Injectable()
export class WebsiteLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const user = context.switchToHttp().getRequest().user as AuthenticatedUser
    const count = user.websites.length

    if (count >= 2) {
      throw new BadRequestException('You can not deploy more than 2 websites')
    } else {
      return true
    }
  }
}
