import { applyDecorators, UseGuards, Controller, Inject } from '@nestjs/common'
import { Crud, CrudOptions } from '@nestjsx/crud'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'

import { AppFeatures } from './app.types'
import { UserJwtGuard } from './auth/jwt/jwt.guard'
import { RolesGuard } from './auth/roles/roles.guard'

const AppController = (feature: AppFeatures, crudOptions: CrudOptions) => {
  const decorators = [
    UseGuards(UserJwtGuard),
    UseGuards(RolesGuard),
    Controller(feature),
    Crud(crudOptions),
  ]

  return applyDecorators(...decorators)
}

export const InjectLogger = () => Inject(WINSTON_MODULE_PROVIDER)

export default AppController
