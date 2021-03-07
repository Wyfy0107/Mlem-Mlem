import { User } from '../user/user.entity'

export type AuthenticatedUser = Pick<
  User,
  'email' | 'password' | 'firstName' | 'lastName' | 'id' | 'website'
>
