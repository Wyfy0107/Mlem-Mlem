import { UsersService } from './user.service'
import { Role, Users } from './user.entity'
import { BaseCrudController } from '../base.controller'
import AppController from '../app.decorator'
import { AppFeatures } from '../app.types'
import { WithRole } from '../auth/auth.decorator'

@AppController(AppFeatures.Users, {
  model: {
    type: Users,
  },
  query: {
    maxLimit: 20,
    join: {
      websites: {
        eager: true,
      },
    },
  },
})
@WithRole(Role.Admin)
export class UserController extends BaseCrudController<Users> {
  constructor(public service: UsersService) {
    super()
  }
}
