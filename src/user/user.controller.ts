import { UserService } from './user.service'
import { User } from './user.entity'
import { BaseCrudController } from '../base.controller'
import AppController from 'src/app.decorator'
import { AppFeatures } from 'src/app.types'

@AppController(AppFeatures.Users, {
  model: {
    type: User,
  },
  query: {
    maxLimit: 20,
  },
})
export class UserController extends BaseCrudController<User> {
  constructor(public service: UserService) {
    super()
  }
}
