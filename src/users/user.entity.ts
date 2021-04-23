import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { IsString, IsEmail } from 'class-validator'
import { Websites } from '../web-hosting/website.entity'

export enum Role {
  Admin = 'admin',
  User = 'user',
}

@Entity('users')
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @IsEmail()
  @Column({ unique: true })
  email: string

  @IsString()
  @Column()
  firstName: string

  @IsString()
  @Column()
  lastName: string

  @OneToMany(() => Websites, (website) => website.owner, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  websites: Websites[]

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role
}
