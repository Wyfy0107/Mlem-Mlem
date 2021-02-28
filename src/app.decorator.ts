import { applyDecorators, UseGuards, Controller } from '@nestjs/common'
import { Crud, CrudOptions } from '@nestjsx/crud'

import { AppFeatures } from './app.types'
import { UserJwtGuard } from './auth/jwt/jwt.guard'

const AppController = (feature: AppFeatures, crudOptions: CrudOptions) => {
  const decorators = [
    UseGuards(UserJwtGuard),
    Controller(feature),
    Crud(crudOptions),
  ]

  return applyDecorators(...decorators)
}

export default AppController
