import { SetMetadata } from '@nestjs/common'

import { Role } from '../users/user.entity'

export const BypassAuth = () => SetMetadata('no_auth', true)

export const WithRole = (role: Role) => SetMetadata('role', role)
