import { User } from '../user/user.entity'

export type AuthenticatedUser = Pick<
  User,
  'email' | 'firstName' | 'lastName' | 'id'
>
