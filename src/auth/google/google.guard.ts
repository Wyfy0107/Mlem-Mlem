import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { GOOGLE_STRATEGY } from './google.const'

@Injectable()
export class UserGoogleGuard extends AuthGuard(GOOGLE_STRATEGY) {}
